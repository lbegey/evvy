import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAppUrl } from "@/lib/url";
import { CalendarDetail } from "@/components/CalendarDetail";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const APP_URL = await getAppUrl();
  const session = await auth.api.getSession({ headers: await headers() });
  const [calendar, user, calendars] = await Promise.all([
    db.calendar.findUnique({
      where: { id },
      include: {
        _count: { select: { events: true } },
        events: { orderBy: { startAt: "asc" }, select: { id: true, title: true, startAt: true, endAt: true, allDay: true, timezone: true } },
      },
    }),
    db.user.findUnique({ where: { id: session!.user.id } }),
    db.calendar.findMany({ where: { userId: session!.user.id }, select: { id: true, name: true }, orderBy: { createdAt: "asc" } }),
  ]);

  if (!calendar || calendar.userId !== session!.user.id) notFound();

  return (
    <CalendarDetail
      calendar={{
        id: calendar.id,
        name: calendar.name,
        description: calendar.description,
        color: calendar.color,
        slug: calendar.slug,
        language: calendar.language,
        brandingEnabled: calendar.brandingEnabled,
        brandLogoUrl: calendar.brandLogoUrl,
        brandLogoSize: calendar.brandLogoSize,
        brandLogoTransparentBg: calendar.brandLogoTransparentBg,
        brandLogoRounded: calendar.brandLogoRounded,
        brandColor: calendar.brandColor,
        brandBackgroundColor: calendar.brandBackgroundColor,
        brandBackgroundImageUrl: calendar.brandBackgroundImageUrl,
        eventCount: calendar._count.events,
      }}
      events={calendar.events.map((e) => ({
        id: e.id,
        title: e.title,
        startAt: e.startAt.toISOString(),
        endAt: e.endAt.toISOString(),
        allDay: e.allDay,
        timezone: e.timezone,
      }))}
      calendars={calendars}
      appUrl={APP_URL}
      plan={user?.plan ?? "free"}
    />
  );
}
