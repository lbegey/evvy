import { betterAuth, APIError } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { buildPasswordResetEmail, buildVerificationEmail } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "https://*.trycloudflare.com",
  ],
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const { error } = await resend.emails.send({
        from: "Evvy <noreply@evvycal.app>",
        to: user.email,
        subject: "Reset your Evvy password",
        html: buildPasswordResetEmail(url),
      });
      if (error) console.error("[auth] Failed to send password reset email:", error);
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { language: true } });
      const lang = dbUser?.language === "fr" ? "fr" : "en";
      const isFr = lang === "fr";
      const { error } = await resend.emails.send({
        from: "Evvy <noreply@evvycal.app>",
        to: user.email,
        subject: isFr ? "Vérifiez votre adresse email – Evvy" : "Verify your email address – Evvy",
        html: buildVerificationEmail(url, user.name, lang),
      });
      if (error) console.error("[auth] Failed to send verification email:", error);
    },
  },
  socialProviders: {
    // Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable Google login.
    ...(process.env.GOOGLE_CLIENT_ID
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          },
        }
      : {}),
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const deleted = await db.deletedAccount.findUnique({ where: { email: user.email.toLowerCase() } });
          if (deleted) {
            throw new APIError("FORBIDDEN", {
              code: "ACCOUNT_DELETED",
              message: "This email was used on a deleted account and cannot be used to register again.",
            });
          }
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24,       // refresh if older than 1 day
  },
});
