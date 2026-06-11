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
  const [event, user, clickRows, rsvps, calendars, questions] = await Promise.all([
    db.event.findUnique({ where: { id } }),
    db.user.findUnique({ where: { id: session!.user.id } }),
    db.eventClick.groupBy({
      by: ["service"],
      where: { eventId: id },
      _count: true,
    }),
    db.rsvp.findMany({
      where: { eventId: id },
      orderBy: { createdAt: "desc" },
      include: { answers: { select: { questionId: true, value: true } } },
    }),
    db.calendar.findMany({
      where: { userId: session!.user.id },
      select: { id: true, name: true, color: true },
      orderBy: { createdAt: "asc" },
    }),
    db.rsvpQuestion.findMany({
      where: { eventId: id },
      orderBy: { order: "asc" },
    }),
  ]);

  if (!event || event.userId !== session!.user.id) notFound();

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
        published: event.published,
        timezone: event.timezone,
        language: event.language,
        rsvpEnabled: event.rsvpEnabled,
        rsvpLimit: event.rsvpLimit,
        rsvpDeadline: event.rsvpDeadline ? event.rsvpDeadline.toISOString() : null,
        slug: event.slug,
        brandingEnabled: event.brandingEnabled,
        brandLogoUrl: event.brandLogoUrl,
        brandLogoSize: event.brandLogoSize,
        brandLogoTransparentBg: event.brandLogoTransparentBg,
        brandLogoRounded: event.brandLogoRounded,
        brandColor: event.brandColor,
        brandTextColor: event.brandTextColor,
        brandCardColor: event.brandCardColor,
        brandIconBackgroundColor: event.brandIconBackgroundColor,
        brandBackgroundColor: event.brandBackgroundColor,
        brandBackgroundImageUrl: event.brandBackgroundImageUrl,
        calendarId: event.calendarId,
      }}
      appUrl={APP_URL}
      plan={user?.plan ?? "free"}
      emailVerified={user?.emailVerified ?? false}
      calendars={calendars}
      stats={stats}
      questions={questions.map((q) => ({
        id: q.id,
        label: q.label,
        type: q.type,
        options: q.options,
        required: q.required,
        order: q.order,
      }))}
      rsvps={rsvps.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        status: r.status,
        message: r.message,
        createdAt: r.createdAt.toISOString(),
        answers: r.answers,
      }))}
    />
  );
}
