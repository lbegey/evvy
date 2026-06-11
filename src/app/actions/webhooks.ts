"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { generateWebhookSecret, fireWebhook } from "@/lib/webhook";

export async function saveWebhook(data: {
  url: string;
  events: string[];
  active?: boolean;
}): Promise<{ secret?: string; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { plan: true } });
  if (user?.plan !== "premium") return { error: "forbidden" };

  if (!data.url.startsWith("http://") && !data.url.startsWith("https://")) {
    return { error: "invalid_url" };
  }
  if (data.events.length === 0) return { error: "no_events" };

  const existing = await db.webhook.findUnique({ where: { userId: session.user.id }, select: { id: true, secret: true } });
  const secret = existing?.secret ?? generateWebhookSecret();

  await db.webhook.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      url: data.url,
      secret,
      events: JSON.stringify(data.events),
      active: data.active ?? true,
    },
    update: {
      url: data.url,
      events: JSON.stringify(data.events),
      active: data.active ?? true,
    },
  });

  revalidatePath("/dashboard/webhooks");
  return existing ? {} : { secret };
}

export async function toggleWebhookActive(active: boolean): Promise<{ error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  await db.webhook.update({ where: { userId: session.user.id }, data: { active } });
  revalidatePath("/dashboard/webhooks");
  return {};
}

export async function deleteWebhook(): Promise<{ error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { plan: true } });
  if (user?.plan !== "premium") return { error: "forbidden" };

  await db.webhook.deleteMany({ where: { userId: session.user.id } });
  revalidatePath("/dashboard/webhooks");
  return {};
}

export async function testWebhook(): Promise<{ ok: boolean; statusCode?: number | null; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const webhook = await db.webhook.findUnique({ where: { userId: session.user.id } });
  if (!webhook) return { ok: false, error: "no_webhook" };

  const now = new Date().toISOString();
  const testPayload = {
    type: "rsvp.created",
    timestamp: now,
    rsvp: {
      id: "test_rsvp_id",
      name: "Jane Doe",
      email: "jane@example.com",
      status: "yes",
      message: "Looking forward to it!",
      createdAt: now,
      answers: [
        { questionId: "test_question_id", label: "Dietary restrictions?", type: "text", value: "Vegetarian" },
      ],
    },
    event: {
      id: "test_event_id",
      title: "Test Event",
      slug: "test-event",
      url: "https://evvycal.app/e/test-event",
      startAt: now,
      endAt: now,
      allDay: false,
      timezone: "Europe/Paris",
      location: "Paris, France",
      isOnline: false,
      calendar: { id: "test_calendar_id", name: "Test Calendar", slug: "test-calendar" },
    },
    test: true,
  };

  // Force-fire regardless of subscribed events list for test
  const body = JSON.stringify(testPayload);
  const { createHmac } = await import("crypto");
  const signature = createHmac("sha256", webhook.secret).update(body).digest("hex");

  let statusCode: number | null = null;
  let error: string | undefined;

  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Evvy-Signature": `sha256=${signature}`,
        "X-Evvy-Event": "rsvp.created",
      },
      body,
      signal: AbortSignal.timeout(5000),
    });
    statusCode = res.status;

    await db.webhookDelivery.create({
      data: { webhookId: webhook.id, eventType: "rsvp.created (test)", payload: body, statusCode, error: null },
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
    await db.webhookDelivery.create({
      data: { webhookId: webhook.id, eventType: "rsvp.created (test)", payload: body, statusCode: null, error },
    });
  }

  // Prune to last 20
  const ids = await db.webhookDelivery.findMany({
    where: { webhookId: webhook.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true },
  });
  await db.webhookDelivery.deleteMany({
    where: { webhookId: webhook.id, id: { notIn: ids.map((r) => r.id) } },
  });

  revalidatePath("/dashboard/webhooks");
  return { ok: !error && statusCode !== null && statusCode < 400, statusCode, error };
}

// Re-export fireWebhook for use in events.ts
export { fireWebhook };
