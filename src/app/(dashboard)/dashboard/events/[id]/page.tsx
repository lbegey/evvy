import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { getAppUrl } from "@/lib/url";
import { EventDetail } from "@/components/EventDetail";

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const APP_URL = await getAppUrl();
  const session = await auth.api.getSession({ headers: await headers() });
  const [event, user] = await Promise.all([
    db.event.findUnique({ where: { id } }),
    db.user.findUnique({ where: { id: session!.user.id } }),
  ]);

  if (!event || event.userId !== session!.user.id) notFound();

  const [clickRows, rsvps, calendars] = await Promise.all([
    db.eventClick.groupBy({
      by: ["service"],
      where: { eventId: id },
      _count: true,
    }),
    db.rsvp.findMany({
      where: { eventId: id },
      orderBy: { createdAt: "desc" },
    }),
    db.calendar.findMany({
      where: { userId: session!.user.id },
      select: { id: true, name: true, color: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const count = (service: string) =>
    clickRows.find((r) => r.service === service)?._count ?? 0;

  const stats = {
    page:      count("page"),
    qr:        count("qr"),
    google:    count("google"),
    apple:     count("apple"),
    outlook:   count("outlook"),
    office365: count("office365"),
    yahoo:     count("yahoo"),
  };

  return (
    <EventDetail
      event={{
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        imageUrl: event.imageUrl,
        organizerEmail: event.organizerEmail,
        startAt: event.startAt.toISOString(),
        endAt: event.endAt.toISOString(),
        allDay: event.allDay,
        isOnline: event.isOnline,
        timezone: event.timezone,
        language: event.language,
        rsvpEnabled: event.rsvpEnabled,
        slug: event.slug,
        brandingEnabled: event.brandingEnabled,
        brandLogoUrl: event.brandLogoUrl,
        brandLogoSize: event.brandLogoSize,
        brandLogoTransparentBg: event.brandLogoTransparentBg,
        brandLogoRounded: event.brandLogoRounded,
        brandColor: event.brandColor,
        brandBackgroundColor: event.brandBackgroundColor,
        brandBackgroundImageUrl: event.brandBackgroundImageUrl,
        calendarId: event.calendarId,
      }}
      appUrl={APP_URL}
      plan={user?.plan ?? "free"}
      calendars={calendars}
      stats={stats}
      rsvps={rsvps.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        status: r.status,
        message: r.message,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}
