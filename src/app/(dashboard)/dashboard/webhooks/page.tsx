import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { WebhookManager } from "@/components/WebhookManager";
import type { WebhookData } from "@/components/WebhookManager";

export const dynamic = "force-dynamic";

export default async function WebhooksPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = await db.user.findUnique({ where: { id: session!.user.id }, select: { plan: true } });
  const plan = user?.plan ?? "free";

  let webhookData: WebhookData | null = null;

  if (plan === "premium") {
    const webhook = await db.webhook.findUnique({
      where: { userId: session!.user.id },
      include: {
        deliveries: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, eventType: true, statusCode: true, error: true, createdAt: true },
        },
      },
    });

    if (webhook) {
      webhookData = {
        id: webhook.id,
        url: webhook.url,
        secret: webhook.secret,
        active: webhook.active,
        events: webhook.events,
        deliveries: webhook.deliveries.map((d) => ({
          id: d.id,
          eventType: d.eventType,
          statusCode: d.statusCode,
          error: d.error,
          createdAt: d.createdAt.toISOString(),
        })),
      };
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">
      <WebhookManager plan={plan} webhook={webhookData} />
    </section>
  );
}
