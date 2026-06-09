import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAppUrl } from "@/lib/url";
import { CalendarsPageContent } from "@/components/CalendarsPageContent";

export default async function CalendarsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const [user, calendars, appUrl] = await Promise.all([
    db.user.findUnique({ where: { id: session!.user.id } }),
    db.calendar.findMany({
      where: { userId: session!.user.id },
      include: { _count: { select: { events: true } } },
      orderBy: { createdAt: "asc" },
    }),
    getAppUrl(),
  ]);
  const plan = user?.plan ?? "free";

  return (
    <CalendarsPageContent
      plan={plan}
      calendars={calendars.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        color: c.color,
        eventCount: c._count.events,
      }))}
      appUrl={appUrl}
    />
  );
}
