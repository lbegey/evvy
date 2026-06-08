import type { NextRequest } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

async function setUserPlanFromSubscription(customerId: string, subscription: Stripe.Subscription | null) {
  const user = await db.user.findUnique({ where: { stripeCustomerId: customerId } });
  if (!user) return;

  if (!subscription || subscription.status === "canceled" || subscription.status === "incomplete_expired") {
    await db.user.update({
      where: { id: user.id },
      data: {
        plan: "free",
        stripeSubscriptionId: null,
        stripeCurrentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      },
    });
    return;
  }

  const isActive = subscription.status === "active" || subscription.status === "trialing";
  const periodEnd = subscription.items.data[0]?.current_period_end;

  await db.user.update({
    where: { id: user.id },
    data: {
      plan: isActive ? "premium" : "free",
      stripeSubscriptionId: subscription.id,
      stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
      cancelAtPeriodEnd: isActive ? subscription.cancel_at_period_end : false,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !WEBHOOK_SECRET) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      if (checkoutSession.mode === "subscription" && typeof checkoutSession.customer === "string" && checkoutSession.subscription) {
        const subscriptionId =
          typeof checkoutSession.subscription === "string"
            ? checkoutSession.subscription
            : checkoutSession.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await setUserPlanFromSubscription(checkoutSession.customer, subscription);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      await setUserPlanFromSubscription(customerId, event.type === "customer.subscription.deleted" ? null : subscription);
      break;
    }
  }

  return new Response("ok", { status: 200 });
}
