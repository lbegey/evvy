import type { NextRequest } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { buildWelcomePremiumEmail, buildSubscriptionEndedEmail } from "@/lib/email";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const resend = new Resend(process.env.RESEND_API_KEY);

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

        // Send welcome email
        const user = await db.user.findUnique({ where: { stripeCustomerId: checkoutSession.customer } });
        if (user) {
          const lang = user.language === "fr" ? "fr" : "en";
          const periodEnd = subscription.items.data[0]?.current_period_end;
          await resend.emails.send({
            from: "Evvy <noreply@evvycal.app>",
            to: user.email,
            subject: lang === "fr" ? "Bienvenue dans Evvy Premium !" : "Welcome to Evvy Premium!",
            html: buildWelcomePremiumEmail(user.name, periodEnd ? new Date(periodEnd * 1000) : new Date(), lang),
          });
        }
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
      const wasPremium = event.type === "customer.subscription.deleted";
      await setUserPlanFromSubscription(customerId, wasPremium ? null : subscription);

      // Send ended email only on hard deletion (not on updates like cancellation scheduling)
      if (event.type === "customer.subscription.deleted") {
        const user = await db.user.findUnique({ where: { stripeCustomerId: customerId } });
        if (user) {
          const lang = user.language === "fr" ? "fr" : "en";
          await resend.emails.send({
            from: "Evvy <noreply@evvycal.app>",
            to: user.email,
            subject: lang === "fr" ? "Votre abonnement Evvy a pris fin" : "Your Evvy subscription has ended",
            html: buildSubscriptionEndedEmail(user.name, lang),
          });
        }
      }
      break;
    }
  }

  return new Response("ok", { status: 200 });
}
