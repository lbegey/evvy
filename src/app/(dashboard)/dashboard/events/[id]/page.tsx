import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAppUrl } from "@/lib/url";
import { getCurrentUser } from "@/lib/session";
import { listBrandingPresets } from "@/app/actions/brandingPresets";
import { rsvpVisibilityLimit } from "@/lib/rsvp-limits";
import { EventDetail } from "@/components/EventDetail";

const RSVP_QUERY_LIMIT = 500;

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const APP_URL = await getAppUrl();
  const current = await getCurrentUser();
  const session = current!.session;
  const user = current!.user;
  // Free organizers only see their first N responses; the rest stay behind Premium.
  // Guests are unaffected — every RSVP is still recorded and counted here.
  const visibilityLimit = rsvpVisibilityLimit(user);

  const [event, clickRows, rsvpRows, rsvpTotal, calendars, questions, brandingPresets] = await Promise.all([
    db.event.findUnique({ where: { id } }),
    db.eventClick.groupBy({
      by: ["service"],
      where: { eventId: id },
      _count: true,
    }),
    db.rsvp.findMany({
      where: { eventId: id },
      // Capped organizers get the *oldest* N (a stable window that never drops
      // an already-visible response); everyone else the most recent ones.
      orderBy: { createdAt: visibilityLimit == null ? "desc" : "asc" },
      take: visibilityLimit ?? RSVP_QUERY_LIMIT,
      include: { answers: { select: { questionId: true, value: true } } },
    }),
    db.rsvp.count({ where: { eventId: id } }),
    db.calendar.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, color: true },
      orderBy: { createdAt: "asc" },
    }),
    db.rsvpQuestion.findMany({
      where: { eventId: id },
      orderBy: { order: "asc" },
    }),
    listBrandingPresets(),
  ]);

  if (!event || event.userId !== session.user.id) notFound();

  // Always newest-first in the UI, whichever end of the list we queried.
  const rsvps = visibilityLimit == null ? rsvpRows : [...rsvpRows].reverse();
  const hiddenRsvps = visibilityLimit == null ? 0 : Math.max(0, rsvpTotal - visibilityLimit);

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
    <div
      className="evvy-app fixed inset-0 overflow-hidden"
      style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
    >
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
        attachmentUrl: event.attachmentUrl,
        attachmentName: event.attachmentName,
        attachmentButtonLabel: event.attachmentButtonLabel,
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
        brandSquareCorners: event.brandSquareCorners,
        brandBackgroundType: event.brandBackgroundType,
        brandBackgroundColor2: event.brandBackgroundColor2,
        brandBackgroundGradientAngle: event.brandBackgroundGradientAngle,
        calendarId: event.calendarId,
      }}
      appUrl={APP_URL}
      plan={user?.plan ?? "free"}
      emailVerified={user?.emailVerified ?? false}
      isSuperAdmin={user?.role === "super_admin"}
      calendars={calendars}
      brandingPresets={brandingPresets}
      stats={stats}
      questions={questions.map((q) => ({
        id: q.id,
        label: q.label,
        type: q.type,
        options: q.options,
        required: q.required,
        order: q.order,
      }))}
      hiddenRsvps={hiddenRsvps}
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
    </div>
  );
}
