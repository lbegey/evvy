"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe, STRIPE_PRICE_ID } from "@/lib/stripe";
import { getAppUrl } from "@/lib/url";

export async function createCheckoutSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const APP_URL = await getAppUrl();

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("Unauthorized");

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await db.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${APP_URL}/dashboard/billing?checkout=success`,
    cancel_url: `${APP_URL}/dashboard/billing?checkout=cancelled`,
    metadata: { userId: user.id },
  });

  if (!checkoutSession.url) throw new Error("Could not create checkout session");
  redirect(checkoutSession.url);
}

export async function createPortalSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const APP_URL = await getAppUrl();

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeCustomerId) throw new Error("No Stripe customer found");

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${APP_URL}/dashboard/billing`,
  });

  redirect(portalSession.url);
}

export async function cancelSubscription(): Promise<{ error: "none" } | { ok: true }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeSubscriptionId) return { error: "none" };

  await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: true });
  await db.user.update({ where: { id: user.id }, data: { cancelAtPeriodEnd: true } });

  revalidatePath("/dashboard/billing");
  return { ok: true };
}

export async function resumeSubscription(): Promise<{ error: "none" } | { ok: true }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.stripeSubscriptionId) return { error: "none" };

  await stripe.subscriptions.update(user.stripeSubscriptionId, { cancel_at_period_end: false });
  await db.user.update({ where: { id: user.id }, data: { cancelAtPeriodEnd: false } });

  revalidatePath("/dashboard/billing");
  return { ok: true };
}
