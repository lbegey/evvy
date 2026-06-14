import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAppUrl } from "@/lib/url";
import { getCurrentUser } from "@/lib/session";
import { listBrandingPresets } from "@/app/actions/brandingPresets";
import { CalendarDetail } from "@/components/CalendarDetail";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const APP_URL = await getAppUrl();
  const current = await getCurrentUser();
  const session = current!.session;
  const [calendar, calendars, brandingPresets] = await Promise.all([
    db.calendar.findUnique({
      where: { id },
      include: {
        _count: { select: { events: true } },
        events: { orderBy: { startAt: "asc" }, select: { id: true, title: true, startAt: true, endAt: true, allDay: true, timezone: true, published: true } },
        user: { select: { plan: true, emailVerified: true } },
      },
    }),
    db.calendar.findMany({ where: { userId: session!.user.id }, select: { id: true, name: true }, orderBy: { createdAt: "asc" } }),
    listBrandingPresets(),
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
        published: calendar.published,
        brandingEnabled: calendar.brandingEnabled,
        brandLogoUrl: calendar.brandLogoUrl,
        brandLogoSize: calendar.brandLogoSize,
        brandLogoTransparentBg: calendar.brandLogoTransparentBg,
        brandLogoRounded: calendar.brandLogoRounded,
        brandColor: calendar.brandColor,
        brandTextColor: calendar.brandTextColor,
        brandCardColor: calendar.brandCardColor,
        brandIconBackgroundColor: calendar.brandIconBackgroundColor,
        brandBackgroundColor: calendar.brandBackgroundColor,
        brandBackgroundImageUrl: calendar.brandBackgroundImageUrl,
        brandSquareCorners: calendar.brandSquareCorners,
        brandBackgroundType: calendar.brandBackgroundType,
        brandBackgroundColor2: calendar.brandBackgroundColor2,
        brandBackgroundGradientAngle: calendar.brandBackgroundGradientAngle,
        eventCount: calendar._count.events,
      }}
      events={calendar.events.map((e) => ({
        id: e.id,
        title: e.title,
        startAt: e.startAt.toISOString(),
        endAt: e.endAt.toISOString(),
        allDay: e.allDay,
        timezone: e.timezone,
        published: e.published,
      }))}
      calendars={calendars}
      appUrl={APP_URL}
      plan={calendar.user.plan}
      emailVerified={calendar.user.emailVerified}
      isSuperAdmin={current?.user?.role === "super_admin"}
      brandingPresets={brandingPresets}
    />
  );
}
