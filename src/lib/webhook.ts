import { db } from "@/lib/db";
import { createHmac, randomBytes } from "crypto";

export function generateWebhookSecret(): string {
  return randomBytes(32).toString("hex");
}

export async function fireWebhook(
  userId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  const webhook = await db.webhook.findUnique({
    where: { userId },
    select: { id: true, url: true, secret: true, events: true, active: true },
  });
  if (!webhook) return;
  if (!webhook.active) return;

  let subscribedEvents: string[] = [];
  try {
    subscribedEvents = JSON.parse(webhook.events) as string[];
  } catch {
    return;
  }
  if (!subscribedEvents.includes(eventType)) return;

  const body = JSON.stringify({ event: eventType, ...payload, timestamp: new Date().toISOString() });
  const signature = createHmac("sha256", webhook.secret).update(body).digest("hex");

  let statusCode: number | null = null;
  let error: string | null = null;

  try {
    const res = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Evvy-Signature": `sha256=${signature}`,
        "X-Evvy-Event": eventType,
      },
      body,
      signal: AbortSignal.timeout(5000),
    });
    statusCode = res.status;
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  // Save delivery log + prune to last 20
  try {
    await db.$transaction([
      db.webhookDelivery.create({
        data: { webhookId: webhook.id, eventType, payload: body, statusCode, error },
      }),
      db.webhookDelivery.deleteMany({
        where: {
          webhookId: webhook.id,
          id: {
            notIn: await db.webhookDelivery
              .findMany({ where: { webhookId: webhook.id }, orderBy: { createdAt: "desc" }, take: 19, select: { id: true } })
              .then((rows) => rows.map((r) => r.id)),
          },
        },
      }),
    ]);
  } catch {
    // logging failure should never break the main flow
  }
}
