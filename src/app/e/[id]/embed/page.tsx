import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { CalendarDays, Clock, Globe, MapPin } from "lucide-react";
import { db } from "@/lib/db";
import { getAppUrl } from "@/lib/url";
import { cn } from "@/lib/utils";
import { resolveEventBranding, BRAND_FIELDS_SELECT } from "@/lib/branding";
import { en } from "@/i18n/en";
import { fr } from "@/i18n/fr";

const CAL_SERVICES = [
  { key: "google",    name: "Google Calendar", logo: "/logos/google-calendar.png" },
  { key: "apple",     name: "Apple Calendar",  logo: "/logos/apple-calendar.png" },
  { key: "outlook",   name: "Outlook.com",     logo: "/logos/outlook.png" },
  { key: "office365", name: "Office 365",      logo: "/logos/office365.png" },
  { key: "yahoo",     name: "Yahoo Calendar",  logo: "/logos/yahoo-calendar.png" },
] as const;

export default async function EventEmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = await params;
  const { mode } = await searchParams;
  const isCard = mode === "card";
  const APP_URL = await getAppUrl();
  const cookieStore = await cookies();
  const cookieLang: "fr" | "en" = cookieStore.get("minical_lang")?.value === "fr" ? "fr" : "en";

  const event = await db.event.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: {
      id: true,
      title: true,
      startAt: true,
      endAt: true,
      allDay: true,
      timezone: true,
      location: true,
      isOnline: true,
      language: true,
      brandingEnabled: true,
      ...BRAND_FIELDS_SELECT,
      user: { select: { plan: true, ...BRAND_FIELDS_SELECT } },
    },
  });
  if (!event) notFound();

  const lang = event.language === "fr" || event.language === "en" ? event.language : cookieLang;
  const T = lang === "fr" ? fr : en;
  const isPast = event.endAt < new Date();
  const isFreeOrganizer = event.user.plan !== "premium";

  const calendarLinks = (
    <div className="flex items-center gap-2 sm:gap-3">
      {CAL_SERVICES.map((s) => (
        <a
          key={s.key}
          href={`${APP_URL}/api/events/${event.id}/track?service=${s.key}`}
          target={s.key !== "apple" ? "_blank" : undefined}
          rel="noopener noreferrer"
          title={s.name}
          className="cursor-pointer rounded-lg p-1"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.logo} alt={s.name} width={isCard ? 32 : 36} height={isCard ? 32 : 36} className="rounded" />
        </a>
      ))}
    </div>
  );

  // ── Simple mode (default): just the "Add to calendar" links, no branding ──
  if (!isCard) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 p-3">
        {isPast ? (
          <p className="text-sm text-muted-foreground">{T.publicEvent.eventEnded}</p>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground shrink-0">{T.publicEvent.addToCalendar}</p>
            {calendarLinks}
          </div>
        )}
        {isFreeOrganizer && (
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/60 hover:underline"
            style={{ fontSize: "11px" }}
          >
            {T.publicEvent.poweredBy} evvycal.app
          </a>
        )}
      </div>
    );
  }

  // ── Card mode: a self-contained branded mini event card ──
  const brand = resolveEventBranding({
    plan: event.user.plan,
    brandingEnabled: event.brandingEnabled,
    event,
    user: event.user,
  });

  const tz = event.timezone;
  const startDate = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: tz,
  }).format(event.startAt);
  const startTime = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    hour: "2-digit", minute: "2-digit", timeZone: tz,
  }).format(event.startAt);
  const endTime = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    hour: "2-digit", minute: "2-digit", timeZone: tz,
  }).format(event.endAt);

  return (
    <div
      className={cn("relative isolate flex min-h-dvh items-center justify-center overflow-hidden p-4", brand.brandSquareCorners && "brand-square")}
      style={brand.brandStyle}
    >
      {brand.showBackgroundImage && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 scale-110 bg-cover bg-center blur-sm"
          style={{ backgroundImage: `url(${JSON.stringify(brand.brandBackgroundImageUrl)})` }}
        />
      )}

      <div className="w-full max-w-sm space-y-3">
        {brand.brandLogoUrl && (
          <div className="flex justify-center">
            <span
              className={cn("inline-flex", brand.brandLogoRounded && "overflow-hidden rounded-lg")}
              style={!brand.brandLogoTransparentBg ? { backgroundColor: brand.brandCardColor ?? "#ffffff" } : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brand.brandLogoUrl}
                alt=""
                style={{ maxWidth: brand.brandLogoSize, width: "100%" }}
                className={cn("h-auto object-contain", brand.brandLogoRounded && "rounded-lg")}
              />
            </span>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-background p-5 shadow-sm">
          <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground">{event.title}</h1>
          <div className="mt-3 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span className="capitalize">{startDate}</span>
              {!event.allDay && (
                <>
                  <Clock className="ml-1 h-3.5 w-3.5 shrink-0" />
                  <span>{startTime} – {endTime}</span>
                </>
              )}
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {event.isOnline ? <Globe className="h-3.5 w-3.5 shrink-0" /> : <MapPin className="h-3.5 w-3.5 shrink-0" />}
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>

          {!isPast && (
            <div className="mt-4 border-t border-border/60 pt-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">{T.publicEvent.addToCalendar}</p>
              {calendarLinks}
            </div>
          )}
        </div>

        {isFreeOrganizer && (
          <p className="text-center">
            <a
              href={APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground/60 hover:underline"
              style={{ fontSize: "11px" }}
            >
              {T.publicEvent.poweredBy} evvycal.app
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
