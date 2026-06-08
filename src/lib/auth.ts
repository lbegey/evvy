import { betterAuth, APIError } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "https://*.trycloudflare.com",
  ],
  database: prismaAdapter(db, { provider: "sqlite" }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // Configure an email provider (Resend, Nodemailer…) to send this in production.
      console.log(`[Evvy] Password reset for ${user.email}:\n${url}`);
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
