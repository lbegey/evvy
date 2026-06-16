import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { CalendarRange, Clock } from "lucide-react";
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

const MAX_EVENTS = 4;

export default async function CalendarEmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const APP_URL = await getAppUrl();
  const cookieStore = await cookies();
  const cookieLang: "fr" | "en" = cookieStore.get("minical_lang")?.value === "fr" ? "fr" : "en";

  const calendar = await db.calendar.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: {
      id: true,
      name: true,
      published: true,
      language: true,
      brandingEnabled: true,
      ...BRAND_FIELDS_SELECT,
      user: { select: { plan: true, ...BRAND_FIELDS_SELECT } },
      events: {
        where: { published: true, endAt: { gte: new Date() } },
        orderBy: { startAt: "asc" },
        take: MAX_EVENTS,
        select: { id: true, title: true, startAt: true, allDay: true, timezone: true },
      },
    },
  });
  if (!calendar || !calendar.published) notFound();

  const lang = calendar.language === "fr" || calendar.language === "en" ? calendar.language : cookieLang;
  const T = lang === "fr" ? fr : en;
  const locale = lang === "fr" ? "fr-FR" : "en-US";
  const isFreeOrganizer = calendar.user.plan !== "premium";

  const brand = resolveEventBranding({
    plan: calendar.user.plan,
    brandingEnabled: calendar.brandingEnabled,
    event: calendar,
    user: calendar.user,
  });

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

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
          <div className="border-b border-border/60 p-5">
            <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground">{calendar.name}</h1>
          </div>

          {calendar.events.length > 0 && (
            <ul className="divide-y divide-border/60">
              {calendar.events.map((e) => {
                const day = new Intl.DateTimeFormat(locale, { timeZone: e.timezone, day: "2-digit" }).format(e.startAt);
                const month = new Intl.DateTimeFormat(locale, { timeZone: e.timezone, month: "short" }).format(e.startAt).toUpperCase();
                const time = e.allDay
                  ? new Intl.DateTimeFormat(locale, { timeZone: e.timezone, weekday: "short", day: "numeric", month: "short" }).format(e.startAt)
                  : new Intl.DateTimeFormat(locale, { timeZone: e.timezone, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(e.startAt);
                return (
                  <li key={e.id} className="flex items-center gap-3 p-3">
                    <div className="flex w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-muted/50 py-1.5">
                      <span className="text-[10px] font-medium uppercase text-muted-foreground">{month}</span>
                      <span className="text-base font-bold leading-none text-foreground">{day}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{e.title}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span className="truncate capitalize">{time}</span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-border/60 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <CalendarRange className="h-3.5 w-3.5 shrink-0" />
              {T.publicCalendar.addAllToCalendar.text}
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              {CAL_SERVICES.map((s) => (
                <a
                  key={s.key}
                  href={`${APP_URL}/api/calendars/${calendar.id}/track?service=${s.key}`}
                  target={s.key !== "apple" ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  title={s.name}
                  className="cursor-pointer rounded-lg p-1"
                  style={brand.brandIconBackgroundColor ? { backgroundColor: brand.brandIconBackgroundColor } : undefined}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.logo} alt={s.name} width={32} height={32} className="rounded" />
                </a>
              ))}
            </div>
          </div>
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
