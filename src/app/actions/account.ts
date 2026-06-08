"use server";

import { headers } from "next/headers";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { getAppUrl } from "@/lib/url";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_CHANGE_LINK_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function changeEmail(newEmail: string): Promise<{ error: "invalid" | "taken" } | { ok: true }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const email = newEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "invalid" };

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("Unauthorized");
  if (email === user.email) return { error: "invalid" };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing && existing.id !== user.id) return { error: "taken" };

  const token = randomBytes(32).toString("hex");
  await db.emailChangeRequest.deleteMany({ where: { userId: user.id } });
  await db.emailChangeRequest.create({
    data: {
      userId: user.id,
      oldEmail: user.email,
      newEmail: email,
      token,
      expiresAt: new Date(Date.now() + EMAIL_CHANGE_LINK_TTL_MS),
    },
  });

  const appUrl = await getAppUrl();
  const confirmUrl = `${appUrl}/api/account/confirm-email-change?token=${token}`;
  await resend.emails.send({
    from: "Evvy <noreply@evvycal.app>",
    to: user.email,
    subject: "Confirm your email change",
    html: `<p>You requested to change your Evvy email address to <strong>${email}</strong>.</p><p>Click the link below to confirm. It expires in 1 hour.</p><p><a href="${confirmUrl}">${confirmUrl}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
  });

  return { ok: true };
}

export async function deleteAccount(): Promise<{ error: "stripe" } | { ok: true }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("Unauthorized");

  if (user.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);
    } catch {
      return { error: "stripe" };
    }
  }

  await db.deletedAccount.upsert({
    where: { email: user.email },
    create: { email: user.email, name: user.name, plan: user.plan },
    update: { name: user.name, plan: user.plan, createdAt: new Date() },
  });

  await db.user.delete({ where: { id: user.id } });
  return { ok: true };
}
