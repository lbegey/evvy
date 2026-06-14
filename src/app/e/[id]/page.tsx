import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, CalendarOff, Clock, Globe, MapPin, Mail, Pencil } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Logo } from "@/components/Logo";
import { RsvpForm } from "@/components/RsvpForm";
import { PageViewTracker } from "@/components/PageViewTracker";
import { EventLiveRefresh } from "@/components/EventLiveRefresh";
import { markdownToHtml } from "@/lib/markdown";
import { getAppUrl } from "@/lib/url";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { brandBackgroundStyle, showBrandBackgroundImage } from "@/lib/branding";
import { en } from "@/i18n/en";
import { fr } from "@/i18n/fr";

import Image from "next/image";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://evvycal.app";

/** Truncate on a word boundary with an ellipsis (avoids cutting mid-word). */
function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).replace(/\s+\S*$/, "").trimEnd() + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await db.event.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { title: true, description: true, imageUrl: true, slug: true, startAt: true, location: true, isOnline: true },
  });
  if (!event) return { title: "Event not found" };

  const canonicalId = event.slug ?? id;
  const url = `${APP_URL}/e/${canonicalId}`;
  const desc = event.description
    ? truncate(event.description.replace(/[#*_`[\]]/g, "").trim(), 160)
    : [
        event.startAt.toLocaleDateString("en-US", { dateStyle: "long" }),
        event.isOnline ? "Online" : event.location,
      ].filter(Boolean).join(" · ");

  return {
    title: event.title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: event.title,
      description: desc,
      url,
      type: "website",
      ...(event.imageUrl ? { images: [{ url: event.imageUrl, alt: event.title }] } : {}),
    },
    twitter: {
      card: event.imageUrl ? "summary_large_image" : "summary",
      title: event.title,
      description: desc,
      ...(event.imageUrl ? { images: [event.imageUrl] } : {}),
    },
  };
}

const CAL_SERVICES = [
  { key: "google",    name: "Google Calendar", logo: "/logos/google-calendar.png" },
  { key: "apple",     name: "Apple Calendar",  logo: "/logos/apple-calendar.png" },
  { key: "outlook",   name: "Outlook.com",     logo: "/logos/outlook.png" },
  { key: "office365", name: "Office 365",      logo: "/logos/office365.png" },
  { key: "yahoo",     name: "Yahoo Calendar",  logo: "/logos/yahoo-calendar.png" },
] as const;

export default async function PublicEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const APP_URL = await getAppUrl();
  const cookieStore = await cookies();
  const cookieLang: "fr" | "en" = cookieStore.get("minical_lang")?.value === "fr" ? "fr" : "en";
  let T = cookieLang === "fr" ? fr : en;

  const [event, session] = await Promise.all([
    db.event.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
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
            brandSquareCorners: true,
            brandBackgroundType: true,
            brandBackgroundColor2: true,
            brandBackgroundGradientAngle: true,
          },
        },
        questions: { orderBy: { order: "asc" } },
        calendar: { select: { id: true, slug: true, published: true } },
      },
    }),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (event?.slug && id !== event.slug) redirect(`/e/${event.slug}`);

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
        <div className="mx-auto max-w-sm rounded-2xl border border-border/60 bg-background p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <CalendarOff className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">{T.publicEvent.notFound.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {T.publicEvent.notFound.subtitle}
          </p>
          <Link href="/" className={cn(buttonVariants(), "mt-6")}>
            {T.publicEvent.notFound.backHome}
          </Link>
        </div>
      </div>
    );
  }

  const lang = event.language === "fr" || event.language === "en" ? event.language : cookieLang;
  T = lang === "fr" ? fr : en;

  const isPremiumOrganizer = event.user.plan === "premium";
  const useEventOverride = isPremiumOrganizer && event.brandingEnabled;
  const brandLogoUrl = isPremiumOrganizer
    ? (useEventOverride ? event.brandLogoUrl : event.user.brandLogoUrl)
    : null;
  const brandLogoSize = (isPremiumOrganizer
    ? (useEventOverride ? event.brandLogoSize : event.user.brandLogoSize)
    : null) ?? 32;
  const brandLogoTransparentBg = isPremiumOrganizer
    ? (useEventOverride ? event.brandLogoTransparentBg : event.user.brandLogoTransparentBg)
    : true;
  const brandLogoRounded = isPremiumOrganizer
    ? (useEventOverride ? event.brandLogoRounded : event.user.brandLogoRounded)
    : false;
  const brandColor = isPremiumOrganizer
    ? (useEventOverride ? event.brandColor : event.user.brandColor)
    : null;
  const brandBackgroundColor = isPremiumOrganizer
    ? (useEventOverride ? event.brandBackgroundColor : event.user.brandBackgroundColor)
    : null;
  const brandBackgroundImageUrl = isPremiumOrganizer
    ? (useEventOverride ? event.brandBackgroundImageUrl : event.user.brandBackgroundImageUrl)
    : null;
  const brandTextColor = isPremiumOrganizer
    ? (useEventOverride ? event.brandTextColor : event.user.brandTextColor)
    : null;
  const brandCardColor = isPremiumOrganizer
    ? (useEventOverride ? event.brandCardColor : event.user.brandCardColor)
    : null;
  const brandIconBackgroundColor = isPremiumOrganizer
    ? (useEventOverride ? event.brandIconBackgroundColor : event.user.brandIconBackgroundColor)
    : null;
  const brandSquareCorners = isPremiumOrganizer ? (useEventOverride ? event.brandSquareCorners : event.user.brandSquareCorners) : false;
  const brandBg = {
    brandBackgroundType: isPremiumOrganizer ? (useEventOverride ? event.brandBackgroundType : event.user.brandBackgroundType) : null,
    brandBackgroundColor,
    brandBackgroundColor2: isPremiumOrganizer ? (useEventOverride ? event.brandBackgroundColor2 : event.user.brandBackgroundColor2) : null,
    brandBackgroundGradientAngle: isPremiumOrganizer ? (useEventOverride ? event.brandBackgroundGradientAngle : event.user.brandBackgroundGradientAngle) : null,
    brandBackgroundImageUrl,
  };
  const brandStyle: CSSProperties | undefined = (brandColor || brandBackgroundColor || brandBackgroundImageUrl || brandTextColor || brandCardColor || brandBg.brandBackgroundColor2)
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
        ...brandBackgroundStyle(brandBg),
      }
    : undefined;

  const isCreator = session?.user.id === event.userId;

  if (!event.published && !isCreator) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
        <div className="mx-auto max-w-sm rounded-2xl border border-border/60 bg-background p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">{T.publicEvent.unavailable.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {T.publicEvent.unavailable.subtitle}
          </p>
        </div>
      </div>
    );
  }

  const tz = event.timezone;
  const now = new Date();
  const isPast = event.endAt < now;

  const startDate = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: tz,
  }).format(event.startAt);

  const startTime = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    hour: "2-digit", minute: "2-digit", timeZone: tz,
  }).format(event.startAt);

  const endTime = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    hour: "2-digit", minute: "2-digit", timeZone: tz,
  }).format(event.endAt);

  const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const isMultiDay = dayKeyFmt.format(event.startAt) !== dayKeyFmt.format(event.endAt);
  const fullDateTimeFmt = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    timeZone: tz, weekday: "short", day: "numeric", month: "short", year: "numeric",
    ...(event.allDay ? {} : { hour: "2-digit", minute: "2-digit" }),
  });
  const startDateTime = fullDateTimeFmt.format(event.startAt);
  const endDateTime = fullDateTimeFmt.format(event.endAt);

  const yesCount = event.rsvpEnabled
    ? await db.rsvp.count({ where: { eventId: event.id, status: "yes" } })
    : 0;

  const spotsRemaining = event.rsvpLimit != null ? Math.max(0, event.rsvpLimit - yesCount) : null;
  const rsvpFull = spotsRemaining !== null && spotsRemaining <= 0;
  const rsvpDeadlinePassed = !!event.rsvpDeadline && event.rsvpDeadline < now;
  const rsvpDeadlineDate = event.rsvpDeadline
    ? new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
        timeZone: tz, day: "numeric", month: "short", year: "numeric",
      }).format(event.rsvpDeadline)
    : null;

  const mapsUrl = event.location
    ? `https://maps.google.com/?q=${encodeURIComponent(event.location)}`
    : null;

  const canonicalEventId = event.slug ?? event.id;
  const eventUrl = `${APP_URL}/e/${canonicalEventId}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    ...(event.description ? { description: event.description.replace(/[#*_`[\]]/g, "").slice(0, 300) } : {}),
    startDate: event.startAt.toISOString(),
    endDate: event.endAt.toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: event.isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    ...(event.location
      ? event.isOnline
        ? { location: { "@type": "VirtualLocation", url: event.location } }
        : { location: { "@type": "Place", name: event.location, address: event.location } }
      : {}),
    ...(event.imageUrl ? { image: event.imageUrl } : {}),
    url: eventUrl,
    organizer: { "@type": "Organization", name: "Evvy", url: APP_URL },
  };

  return (
    <>
      {isCreator && (
        <div
          className={cn(
            "sticky top-0 z-50 flex w-full items-center justify-between gap-3 border-b px-4 py-2.5 text-xs font-medium sm:px-6",
            event.published
              ? "border-border/60 bg-background text-muted-foreground shadow-sm"
              : "border-amber-300/60 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-400"
          )}
        >
          <span>{event.published ? T.publicEvent.adminBar : T.publicEvent.previewBanner}</span>
          <Link
            href={`/dashboard/events/${event.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 gap-1.5")}
          >
            <Pencil className="h-3 w-3" />
            {T.publicEvent.edit}
          </Link>
        </div>
      )}
      <div className={cn("relative isolate flex min-h-screen flex-col justify-center overflow-hidden bg-muted/20 py-6 px-4 sm:py-8", brandSquareCorners && "brand-square")} style={brandStyle}>
      {showBrandBackgroundImage(brandBg) && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 scale-110 bg-cover bg-center blur-sm"
          style={{ backgroundImage: `url(${JSON.stringify(brandBackgroundImageUrl)})` }}
        />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageViewTracker id={event.id} />
      <EventLiveRefresh id={event.id} updatedAt={event.updatedAt.toISOString()} />

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

        {/* Main card */}
        <div className="rounded-2xl border border-border/60 bg-background shadow-sm overflow-hidden">
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-44 w-full object-cover"
            />
          )}
          <div className="p-5">
            <h1 className="text-xl font-bold tracking-tight text-foreground leading-tight">
              {event.title}
            </h1>

            {event.calendar && (event.calendar.published || isCreator) && (
              <Link
                href={`/c/${event.calendar.slug ?? event.calendar.id}`}
                className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
                {T.publicEvent.backToCalendar}
              </Link>
            )}

            <div className="mt-3 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                {isMultiDay ? (
                  <>
                    <span className="capitalize">{startDateTime} → {endDateTime}</span>
                    {event.allDay && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {T.publicEvent.allDay}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <span className="capitalize">{startDate}</span>
                    {event.allDay ? (
                      <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {T.publicEvent.allDay}
                      </span>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5 shrink-0 ml-2" />
                        <span>{startTime} – {endTime}</span>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span>{T.publicEvent.timezone} {tz}</span>
              </div>

              {event.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {event.isOnline ? <Globe className="h-3.5 w-3.5 shrink-0" /> : <MapPin className="h-3.5 w-3.5 shrink-0" />}
                  {event.isOnline ? (
                    <a
                      href={event.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer underline underline-offset-4 decoration-muted-foreground/50 truncate"
                    >
                      {event.location}
                    </a>
                  ) : mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer underline underline-offset-4 decoration-muted-foreground/50"
                    >
                      {event.location}
                    </a>
                  ) : (
                    <span>{event.location}</span>
                  )}
                </div>
              )}

              {event.organizerEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <a
                    href={`mailto:${event.organizerEmail}`}
                    className="cursor-pointer underline underline-offset-4 decoration-muted-foreground/50 hover:text-foreground hover:decoration-foreground transition-colors"
                  >
                    {event.organizerEmail}
                  </a>
                </div>
              )}
            </div>

            {event.description && (
              <div
                className={cn(
                  "mt-3 text-sm leading-relaxed text-foreground/70",
                  "[&_p]:mb-1.5 last:[&_p]:mb-0 [&_a]:underline [&_a]:underline-offset-4",
                  "[&_a]:decoration-foreground/30 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-1.5"
                )}
                dangerouslySetInnerHTML={{ __html: markdownToHtml(event.description) }}
              />
            )}

            {event.attachmentUrl && (
              <a
                href={event.attachmentUrl}
                download={event.attachmentName ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants(), "mt-3 w-full", !!brandStyle && "hover:opacity-90")}
                style={brandStyle ? { backgroundColor: "var(--foreground)", color: "var(--background)" } : undefined}
              >
                {event.attachmentButtonLabel || T.publicEvent.attachmentDefaultLabel}
              </a>
            )}
          </div>
        </div>

        {/* Add to calendar */}
        {isPast ? (
          <div className="rounded-xl border border-border/60 bg-background px-5 py-4 shadow-sm">
            <p className="text-sm text-muted-foreground text-center">
              {T.publicEvent.eventEnded}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-background px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <p className="text-sm text-muted-foreground shrink-0">{T.publicEvent.addToCalendar}</p>
              <div className="flex items-center gap-2 sm:gap-3">
                {CAL_SERVICES.map((s) => (
                  <a
                    key={s.key}
                    href={`${APP_URL}/api/events/${event.id}/track?service=${s.key}`}
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
        )}

        {/* RSVP */}
        {event.rsvpEnabled && (
          <div className="rounded-xl border border-border/60 bg-background px-5 py-4 shadow-sm">
            <div className="flex flex-col items-center gap-1.5 mb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <h2 className="text-sm font-semibold text-foreground">RSVP</h2>
              <div className="flex flex-nowrap items-center gap-2">
                {rsvpDeadlineDate && !isPast && !rsvpDeadlinePassed && (
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {T.publicEvent.rsvpDeadlineUntil(rsvpDeadlineDate)}
                  </span>
                )}
                {spotsRemaining !== null ? (
                  <span className={cn("text-xs font-medium whitespace-nowrap", rsvpFull ? "text-destructive" : "text-green-600")}>
                    {rsvpFull ? T.publicEvent.noSpotsLeft : T.publicEvent.spotsLeft(spotsRemaining)}
                  </span>
                ) : (
                  yesCount > 0 && (
                    <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                      {yesCount}{" "}
                      {yesCount > 1 ? T.publicEvent.participantsPlural : T.publicEvent.participants}
                    </span>
                  )
                )}
              </div>
            </div>
            {isPast ? (
              <p className="py-2 text-center text-sm text-muted-foreground">{T.publicEvent.rsvpClosed}</p>
            ) : rsvpDeadlinePassed ? (
              <p className="py-2 text-center text-sm text-muted-foreground">{T.publicEvent.rsvpDeadlinePassed}</p>
            ) : rsvpFull ? (
              <p className="py-2 text-center text-sm text-muted-foreground">{T.rsvpForm.full}</p>
            ) : (
              <RsvpForm eventId={event.id} lang={lang} questions={event.questions} branded={!!brandStyle} />
            )}
          </div>
        )}

        {!brandLogoUrl && !isPremiumOrganizer && (
          <p className="text-center text-xs text-muted-foreground/60 pb-4">
            {T.publicEvent.organizedWith}{" "}
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
