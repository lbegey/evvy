import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarOff, Clock, MapPin, Pencil } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Logo } from "@/components/Logo";
import { CalendarLiveRefresh } from "@/components/CalendarLiveRefresh";
import { getAppUrl } from "@/lib/url";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildGoogleSubscribeUrl, buildOutlookSubscribeUrl, buildOffice365SubscribeUrl } from "@/lib/calendar-urls";
import { en } from "@/i18n/en";
import { fr } from "@/i18n/fr";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://evvycal.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const calendar = await db.calendar.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { name: true, description: true, slug: true, _count: { select: { events: true } } },
  });
  if (!calendar) return { title: "Calendar not found" };

  const canonicalId = calendar.slug ?? id;
  const url = `${APP_URL}/c/${canonicalId}`;
  const count = calendar._count.events;
  const desc = calendar.description ?? `${count} event${count === 1 ? "" : "s"}`;

  return {
    title: calendar.name,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title: calendar.name, description: desc, url, type: "website" },
    twitter: { card: "summary_large_image", title: calendar.name, description: desc },
  };
}

const CAL_SERVICES = [
  { key: "google",    name: "Google Calendar", logo: "/logos/google-calendar.png" },
  { key: "apple",     name: "Apple Calendar",  logo: "/logos/apple-calendar.png" },
  { key: "outlook",   name: "Outlook.com",     logo: "/logos/outlook.png" },
  { key: "office365", name: "Office 365",      logo: "/logos/office365.png" },
  { key: "yahoo",     name: "Yahoo Calendar",  logo: "/logos/yahoo-calendar.png" },
] as const;

export default async function PublicCalendarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const APP_URL = await getAppUrl();
  const cookieStore = await cookies();
  const lang: "fr" | "en" = cookieStore.get("minical_lang")?.value === "fr" ? "fr" : "en";
  const T = lang === "fr" ? fr : en;

  const [calendar, session] = await Promise.all([
    db.calendar.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        events: { orderBy: { startAt: "asc" } },
        user: {
          select: {
            plan: true,
            brandLogoUrl: true,
            brandLogoSize: true,
            brandLogoTransparentBg: true,
            brandLogoRounded: true,
            brandColor: true,
            brandTextColor: true,
            brandCardColor: true,
            brandIconBackgroundColor: true,
            brandBackgroundColor: true,
            brandBackgroundImageUrl: true,
          },
        },
      },
    }),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (calendar?.slug && id !== calendar.slug) redirect(`/c/${calendar.slug}`);

  if (!calendar) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
        <div className="mx-auto max-w-sm rounded-2xl border border-border/60 bg-background p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <CalendarOff className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">{T.publicCalendar.notFound.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {T.publicCalendar.notFound.subtitle}
          </p>
          <Link href="/" className={cn(buttonVariants(), "mt-6")}>
            {T.publicCalendar.notFound.backHome}
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = session?.user.id === calendar.userId;

  if (!calendar.published && !isCreator) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
        <div className="mx-auto max-w-sm rounded-2xl border border-border/60 bg-background p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">{T.publicCalendar.unavailable.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {T.publicCalendar.unavailable.subtitle}
          </p>
        </div>
      </div>
    );
  }

  const isPremiumOrganizer = calendar.user.plan === "premium";
  const useCalendarOverride = isPremiumOrganizer && calendar.brandingEnabled;
  const brandLogoUrl = isPremiumOrganizer
    ? (useCalendarOverride ? calendar.brandLogoUrl : calendar.user.brandLogoUrl)
    : null;
  const brandLogoSize = (isPremiumOrganizer
    ? (useCalendarOverride ? calendar.brandLogoSize : calendar.user.brandLogoSize)
    : null) ?? 32;
  const brandLogoTransparentBg = isPremiumOrganizer
    ? (useCalendarOverride ? calendar.brandLogoTransparentBg : calendar.user.brandLogoTransparentBg)
    : true;
  const brandLogoRounded = isPremiumOrganizer
    ? (useCalendarOverride ? calendar.brandLogoRounded : calendar.user.brandLogoRounded)
    : false;
  const brandColor = isPremiumOrganizer
    ? (useCalendarOverride ? calendar.brandColor : calendar.user.brandColor)
    : null;
  const brandBackgroundColor = isPremiumOrganizer
    ? (useCalendarOverride ? calendar.brandBackgroundColor : calendar.user.brandBackgroundColor)
    : null;
  const brandBackgroundImageUrl = isPremiumOrganizer
    ? (useCalendarOverride ? calendar.brandBackgroundImageUrl : calendar.user.brandBackgroundImageUrl)
    : null;
  const brandTextColor = isPremiumOrganizer
    ? (useCalendarOverride ? calendar.brandTextColor : calendar.user.brandTextColor)
    : null;
  const brandCardColor = isPremiumOrganizer
    ? (useCalendarOverride ? calendar.brandCardColor : calendar.user.brandCardColor)
    : null;
  const brandIconBackgroundColor = isPremiumOrganizer
    ? (useCalendarOverride ? calendar.brandIconBackgroundColor : calendar.user.brandIconBackgroundColor)
    : null;
  const brandStyle: CSSProperties | undefined = (brandColor || brandBackgroundColor || brandBackgroundImageUrl || brandTextColor || brandCardColor)
    ? {
        ...(brandColor ? { "--primary": brandColor, "--border": brandColor, "--ring": brandColor } as CSSProperties : {}),
        ...(brandTextColor ? {
          "--foreground": brandTextColor,
          "--card-foreground": brandTextColor,
          "--popover-foreground": brandTextColor,
          "--muted-foreground": brandTextColor,
          "--primary-foreground": brandTextColor,
          "--secondary-foreground": brandTextColor,
          "--accent-foreground": brandTextColor,
        } as CSSProperties : {}),
        ...(brandCardColor ? { "--card": brandCardColor, "--background": brandCardColor } as CSSProperties : {}),
        ...(brandBackgroundColor ? { backgroundColor: brandBackgroundColor } : {}),
      }
    : undefined;

  const icsUrl = `${APP_URL}/api/calendars/${calendar.id}/ics`;
  const subscribeUrls: Record<(typeof CAL_SERVICES)[number]["key"], string> = {
    google: buildGoogleSubscribeUrl(icsUrl),
    apple: icsUrl,
    outlook: buildOutlookSubscribeUrl(icsUrl, calendar.name),
    office365: buildOffice365SubscribeUrl(icsUrl, calendar.name),
    yahoo: icsUrl,
  };

  const formatEventDate = (startAt: Date, endAt: Date, allDay: boolean, tz: string) => {
    const dateFmt = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
      weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: tz,
    });
    const timeFmt = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
      hour: "2-digit", minute: "2-digit", timeZone: tz,
    });
    const date = dateFmt.format(startAt);
    if (allDay) return `${date} · ${tz}`;
    return `${date} · ${timeFmt.format(startAt)} – ${timeFmt.format(endAt)} · ${tz}`;
  };

  const renderEventCard = (event: (typeof calendar.events)[number]) => {
    const locale = lang === "fr" ? "fr-FR" : "en-US";
    const day = new Intl.DateTimeFormat(locale, { timeZone: event.timezone, day: "2-digit" }).format(event.startAt);
    const month = new Intl.DateTimeFormat(locale, { timeZone: event.timezone, month: "short" }).format(event.startAt).toUpperCase();

    return (
      <Link
        key={event.id}
        href={`/e/${event.id}`}
        className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/40"
      >
        <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-muted/50 py-1.5">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">{month}</span>
          <span className="text-base font-bold leading-none text-foreground">{day}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">{event.title}</h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate capitalize">{formatEventDate(event.startAt, event.endAt, event.allDay, event.timezone)}</span>
          </div>
          {event.location && (
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </Link>
    );
  };

  const latestEventUpdatedAt = calendar.events.reduce<Date | null>(
    (latest, e) => (!latest || e.updatedAt > latest ? e.updatedAt : latest),
    null
  );
  const liveSignature = `${calendar.updatedAt.toISOString()}|${latestEventUpdatedAt?.toISOString() ?? ""}|${calendar.events.length}`;

  const calendarJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: calendar.name,
    ...(calendar.description ? { description: calendar.description } : {}),
    url: `${APP_URL}/c/${calendar.slug ?? calendar.id}`,
    numberOfItems: calendar.events.length,
    itemListElement: calendar.events.slice(0, 50).map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${APP_URL}/e/${e.slug ?? e.id}`,
      name: e.title,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calendarJsonLd) }} />
      {isCreator && (
        <div
          className={cn(
            "sticky top-0 z-50 flex w-full items-center justify-between gap-3 border-b px-4 py-2.5 text-xs font-medium sm:px-6",
            calendar.published
              ? "border-border/60 bg-background text-muted-foreground shadow-sm"
              : "border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-400"
          )}
        >
          <span>{calendar.published ? T.publicCalendar.adminBar : T.publicCalendar.previewBanner}</span>
          <Link
            href={`/dashboard/calendars/${calendar.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 gap-1.5")}
          >
            <Pencil className="h-3 w-3" />
            {T.publicCalendar.edit}
          </Link>
        </div>
      )}
      <div className="relative isolate flex min-h-screen flex-col justify-center overflow-hidden bg-muted/20 py-6 px-4 sm:py-8" style={brandStyle}>
      {brandBackgroundImageUrl && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 scale-110 bg-cover bg-center blur-sm"
          style={{ backgroundImage: `url(${JSON.stringify(brandBackgroundImageUrl)})` }}
        />
      )}
      <CalendarLiveRefresh id={calendar.id} signature={liveSignature} />
      <div className="mx-auto w-full max-w-xl space-y-3">
        {brandLogoUrl ? (
          <div className="flex justify-center pb-1">
            <span
              className={cn("inline-flex", brandLogoRounded && "rounded-lg overflow-hidden")}
              style={!brandLogoTransparentBg ? { backgroundColor: brandCardColor ?? "#ffffff" } : undefined}
            >
              <img
                src={brandLogoUrl}
                alt=""
                style={{ maxWidth: brandLogoSize, width: "100%" }}
                className={cn("h-auto object-contain", brandLogoRounded && "rounded-lg")}
              />
            </span>
          </div>
        ) : (
          !isPremiumOrganizer && (
            <div className="flex justify-center pb-1">
              <Logo size="sm" className="opacity-90" />
            </div>
          )
        )}

        <div className="rounded-2xl border border-border/60 bg-background shadow-sm overflow-hidden">
          <div className="border-b border-border/60 p-5">
            <h1 className="text-xl font-bold tracking-tight text-foreground leading-tight">
              {calendar.name}
            </h1>
            {calendar.description && (
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">{calendar.description}</p>
            )}
          </div>

          {calendar.events.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">{T.publicCalendar.noEvents}</p>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "divide-y divide-border/60",
                  calendar.events.length > 5 && "max-h-[27rem] overflow-y-auto"
                )}
              >
                {calendar.events.map(renderEventCard)}
              </div>

              <div className="border-t border-border/60 px-5 py-4">
                <div className="space-y-3">
                  <p className="text-xs leading-relaxed text-muted-foreground">{T.publicCalendar.addAllToCalendar.text}</p>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {CAL_SERVICES.map((s) => (
                      <a
                        key={s.key}
                        href={subscribeUrls[s.key]}
                        target={s.key !== "apple" ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        title={s.name}
                        className="cursor-pointer rounded-lg p-1"
                        style={brandIconBackgroundColor ? { backgroundColor: brandIconBackgroundColor } : undefined}
                      >
                        <Image src={s.logo} alt={s.name} width={36} height={36} className="rounded" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {!brandLogoUrl && !isPremiumOrganizer && (
          <p className="text-center text-xs text-muted-foreground/60 pb-4">
            {T.publicCalendar.organizedWith}{" "}
            <Link href="/" className="underline-offset-4 hover:underline cursor-pointer">
              Evvy
            </Link>
          </p>
        )}
      </div>
      </div>
    </>
  );
}
