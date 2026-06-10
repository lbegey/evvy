"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CalendarRange,
  MapPin,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Globe,
  Pencil,
  Plus,
  Trash2,
  BarChart2,
  Download,
  Info,
  Users,
  Link2,
  QrCode,
  ListChecks,
  Code2,
  Palette,
  HelpCircle,
  X,
} from "lucide-react";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { EditEventDialog } from "@/components/EditEventDialog";
import { RsvpSection, type RsvpRecord } from "@/components/RsvpSection";
import { EventBrandingSection } from "@/components/EventBrandingSection";
import { EventCalendarSection } from "@/components/EventCalendarSection";
import { EventQuestionsSection, type RsvpQuestion } from "@/components/EventQuestionsSection";
import { EventSlugSection } from "@/components/EventSlugSection";
import { assignEventToCalendar } from "@/app/actions/calendars";
import { createEvent, deleteEvent, toggleEventPublished } from "@/app/actions/events";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { markdownToHtml } from "@/lib/markdown";
import { cn } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  imageUrl: string | null;
  organizerEmail: string | null;
  startAt: string;
  endAt: string;
  allDay: boolean;
  isOnline: boolean;
  published: boolean;
  timezone: string;
  language: string | null;
  rsvpEnabled: boolean;
  slug: string | null;
  brandingEnabled: boolean;
  brandLogoUrl: string | null;
  brandLogoSize: number | null;
  brandLogoTransparentBg: boolean;
  brandLogoRounded: boolean;
  brandColor: string | null;
  brandTextColor: string | null;
  brandCardColor: string | null;
  brandIconBackgroundColor: string | null;
  brandBackgroundColor: string | null;
  brandBackgroundImageUrl: string | null;
  calendarId: string | null;
}

interface Stats {
  page: number;
  qr: number;
  google: number;
  apple: number;
  outlook: number;
  office365: number;
  yahoo: number;
}

interface EventDetailProps {
  event: Event;
  appUrl: string;
  plan: string;
  emailVerified: boolean;
  calendars: { id: string; name: string; color: string | null }[];
  stats: Stats;
  rsvps: RsvpRecord[];
  questions: RsvpQuestion[];
}

function CopyButton({ value, label, copiedLabel }: { value: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("gap-1.5", copied && "border-green-500/40 bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700")}
      onClick={() =>
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
      }
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? copiedLabel : label}
    </Button>
  );
}

const SIDEBAR_SECTIONS = [
  { id: "info", labelKey: "info", icon: Info },
  { id: "public-link", labelKey: "publicLink", icon: Link2 },
  { id: "calendar", labelKey: "calendar", icon: CalendarRange },
  { id: "rsvp", labelKey: "rsvp", icon: Users },
  { id: "branding", labelKey: "branding", icon: Palette },
  { id: "qr-code", labelKey: "qrCode", icon: QrCode },
  { id: "links", labelKey: "links", icon: ListChecks },
  { id: "integration", labelKey: "integration", icon: Code2 },
  { id: "stats", labelKey: "stats", icon: BarChart2 },
] as const;

const CALENDAR_SERVICES = [
  { key: "google",    name: "Google Calendar", logo: "/logos/google-calendar.png" },
  { key: "apple",     name: "Apple Calendar",  logo: "/logos/apple-calendar.png" },
  { key: "outlook",   name: "Outlook.com",     logo: "/logos/outlook.png" },
  { key: "office365", name: "Office 365",      logo: "/logos/office365.png" },
  { key: "yahoo",     name: "Yahoo Calendar",  logo: "/logos/yahoo-calendar.png" },
] as const;

function buildEmailHTML(event: Event, appUrl: string, addToCalendarText: string, centered: boolean): string {
  const t = `${appUrl}/api/events/${event.id}/track`;
  const logos = CALENDAR_SERVICES.map(
    ({ key, name, logo }) =>
      `      <a href="${t}?service=${key}" style="display:inline-block;margin:0 4px;vertical-align:middle">
        <img src="${appUrl}${logo}" width="40" height="40" alt="${name}" border="0" style="display:block" />
      </a>`
  ).join("\n");
  const align = centered ? "center" : "left";
  const tableStyle = centered ? ' style="margin:0 auto"' : "";
  return `<style>
  @media (max-width: 480px) {
    .atc-email-cell { display: block !important; width: 100% !important; padding: 0 !important; text-align: ${align} !important; white-space: normal !important; }
    .atc-email-label { padding-bottom: 10px !important; }
  }
</style>
<table cellpadding="0" cellspacing="0" border="0" role="presentation" align="${align}"${tableStyle}>
  <tr>
    <td class="atc-email-cell atc-email-label" align="${align}" style="text-align:${align};vertical-align:middle;padding-right:16px;font-size:15px;color:#374151;font-family:Arial,Helvetica,sans-serif;white-space:nowrap">
      ${addToCalendarText}
    </td>
    <td class="atc-email-cell" align="${align}" style="text-align:${align};vertical-align:middle">
${logos}
    </td>
  </tr>
</table>`;
}

function buildWebHTML(event: Event, appUrl: string, addToCalendarText: string, centered: boolean): string {
  const t = `${appUrl}/api/events/${event.id}/track`;
  const links = CALENDAR_SERVICES.map(
    ({ key, name, logo }) =>
      `    <a class="atc-link" href="${t}?service=${key}" target="_blank" rel="noopener noreferrer">
      <img class="atc-icon" src="${appUrl}${logo}" width="40" height="40" alt="${name}" />
    </a>`
  ).join("\n");
  return `<style>
  .atc { display: flex; align-items: center; gap: 12px; font-family: system-ui, -apple-system, sans-serif;${centered ? " width: 100%; justify-content: center;" : ""} }
  .atc-label { font-size: 15px; color: #374151; white-space: nowrap; }
  .atc-links { display: flex; gap: 8px; }
  .atc-link { display: inline-block; }
  .atc-icon { display: block; border-radius: 8px; }
</style>
<div class="atc">
  <span class="atc-label">${addToCalendarText}</span>
  <div class="atc-links">
${links}
  </div>
</div>`;
}

function buildTailwindHTML(event: Event, appUrl: string, addToCalendarText: string, centered: boolean): string {
  const t = `${appUrl}/api/events/${event.id}/track`;
  const links = CALENDAR_SERVICES.map(
    ({ key, name, logo }) =>
      `    <a class="inline-block" href="${t}?service=${key}" target="_blank" rel="noopener noreferrer">
      <img class="block rounded-lg" src="${appUrl}${logo}" width="40" height="40" alt="${name}" />
    </a>`
  ).join("\n");
  return `<div class="flex items-center gap-3 font-sans${centered ? " w-full justify-center" : ""}">
  <span class="text-sm text-gray-700 whitespace-nowrap">${addToCalendarText}</span>
  <div class="flex gap-2">
${links}
  </div>
</div>`;
}

export function EventDetail({ event, appUrl, plan, emailVerified, calendars, stats, rsvps, questions }: EventDetailProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"email" | "web" | "tailwind">("email");
  const [exportCentered, setExportCentered] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(SIDEBAR_SECTIONS[0].id);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [createEventError, setCreateEventError] = useState<string | null>(null);
  const [isCreatingEvent, startCreateEvent] = useTransition();
  const [published, setPublished] = useState(event.published);
  const [, startTogglePublished] = useTransition();
  const { T, lang } = useLanguage();
  const searchParams = useSearchParams();
  const fromCalendarId = searchParams.get("calendar");
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    const sections = SIDEBAR_SECTIONS
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
          else visible.delete(entry.target.id);
        }
        if (visible.size > 0) {
          const topId = SIDEBAR_SECTIONS.find(({ id }) => visible.has(id))?.id;
          if (topId) setActiveSection(topId);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: [0, 1] }
    );
    sections.forEach((el) => observer.observe(el));

    const handleScroll = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) setActiveSection(SIDEBAR_SECTIONS[SIDEBAR_SECTIONS.length - 1].id);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const tz = event.timezone;
  const eventDate = new Date(event.startAt);
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const tzParts = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "numeric" })
    .formatToParts(eventDate);
  const backYear = tzParts.find((p) => p.type === "year")?.value ?? "";
  const backMonth = String(Number(tzParts.find((p) => p.type === "month")?.value ?? "1") - 1);
  const backUrl = fromCalendarId
    ? `/dashboard/calendars/${fromCalendarId}`
    : `/dashboard?year=${backYear}&month=${backMonth}`;

  const startDate = new Intl.DateTimeFormat(locale, {
    timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(eventDate);

  const startTime = new Intl.DateTimeFormat(locale, {
    timeZone: tz, hour: "2-digit", minute: "2-digit",
  }).format(new Date(event.startAt));

  const endTime = new Intl.DateTimeFormat(locale, {
    timeZone: tz, hour: "2-digit", minute: "2-digit",
  }).format(new Date(event.endAt));

  const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const isMultiDay = dayKeyFmt.format(new Date(event.startAt)) !== dayKeyFmt.format(new Date(event.endAt));
  const fullDateTimeFmt = new Intl.DateTimeFormat(locale, {
    timeZone: tz, weekday: "short", day: "numeric", month: "short", year: "numeric",
    ...(event.allDay ? {} : { hour: "2-digit", minute: "2-digit" }),
  });
  const startDateTime = fullDateTimeFmt.format(new Date(event.startAt));
  const endDateTime = fullDateTimeFmt.format(new Date(event.endAt));

  const publicUrl = `${appUrl}/e/${event.slug || event.id}`;
  const trackBase = `${appUrl}/api/events/${event.id}/track`;
  const addToCalendarText = T.eventDetail.integration.addToCalendar;
  const exportSources = {
    email: buildEmailHTML(event, appUrl, addToCalendarText, exportCentered),
    web: buildWebHTML(event, appUrl, addToCalendarText, exportCentered),
    tailwind: buildTailwindHTML(event, appUrl, addToCalendarText, exportCentered),
  } as const;
  const exportCode = exportSources[exportFormat];
  const totalCalendarClicks = stats.google + stats.apple + stats.outlook + stats.office365 + stats.yahoo;

  const handleDelete = () => {
    if (!confirm(T.eventDetail.confirmDelete)) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteEvent(event.id);
      if (result?.error === "forbidden") setDeleteError(T.eventDetail.deleteForbidden);
    });
  };

  const handleTogglePublished = (checked: boolean) => {
    if (checked && !emailVerified) return;
    setPublished(checked);
    startTogglePublished(async () => {
      const result = await toggleEventPublished(event.id, checked);
      if (result?.error === "emailNotVerified") setPublished(!checked);
      router.refresh();
    });
  };

  const handleCreateEvent = async (data: {
    title: string;
    description: string;
    location: string;
    organizerEmail: string;
    startAt: string;
    endAt: string;
    allDay: boolean;
    isOnline: boolean;
    rsvpEnabled: boolean;
    timezone: string;
    language: string;
    imageUrl: string;
    calendarId: string | null;
  }) => {
    setCreateEventError(null);
    startCreateEvent(async () => {
      const result = await createEvent(data);
      if ("error" in result) {
        setCreateEventError(T.eventForm.errors.limitReached);
        return;
      }
      if (data.calendarId) {
        await assignEventToCalendar(result.id, data.calendarId);
      }
      router.push(`/dashboard/events/${result.id}${data.calendarId ? `?calendar=${data.calendarId}` : ""}`);
    });
  };

  return (
    <>
      {/* Fixed action bar */}
      <div className="sticky top-16 z-40 border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{T.eventDetail.backToCalendar}</span>
          </Link>
          <div className="flex items-center gap-2">
            {plan === "premium" && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isDeleting ? T.eventDetail.deleting : T.eventDetail.delete}</span>
              </Button>
            )}
            <label
              className={cn(
                "flex items-center gap-1.5 rounded-lg border border-border/60 px-2 py-1 text-xs font-medium",
                !published && !emailVerified && "opacity-60"
              )}
              title={
                !published && !emailVerified
                  ? T.eventDetail.published.verifyEmailRequired
                  : published
                    ? T.eventDetail.published.onlineHint
                    : T.eventDetail.published.offlineHint
              }
            >
              <Switch
                checked={published}
                onCheckedChange={handleTogglePublished}
                disabled={!published && !emailVerified}
              />
              <span className={cn(published ? "text-foreground" : "text-muted-foreground")}>
                {published ? T.eventDetail.published.online : T.eventDetail.published.offline}
              </span>
            </label>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              nativeButton={false}
              render={<a href={publicUrl} target="_blank" rel="noopener noreferrer" />}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{T.common.open}</span>
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setEditOpen(true)}>
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{T.eventDetail.edit}</span>
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => { setCreateEventError(null); setCreateEventOpen(true); }}
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{T.calendar.newEvent}</span>
            </Button>
          </div>
        </div>
      </div>

    <div className="mx-auto max-w-6xl px-4 pt-4 pb-6 sm:px-6 sm:pt-6 sm:pb-8 lg:flex lg:items-start lg:gap-8">
      {/* Sidebar navigation */}
      <aside className="hidden shrink-0 lg:sticky lg:top-28 lg:block lg:w-44">
        <nav className="space-y-0.5">
          {SIDEBAR_SECTIONS.map(({ id, labelKey, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                activeSection === id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {T.eventDetail.sidebar[labelKey]}
            </a>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 max-w-4xl flex-1 space-y-6 sm:space-y-8">
      {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}

      {/* Event info */}
      <div id="info" className="scroll-mt-24">
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="mb-5 h-48 w-full rounded-xl object-cover sm:h-52"
          />
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{event.title}</h1>
        <dl className="mt-4 space-y-2">
          {isMultiDay ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span className="capitalize">{startDateTime} → {endDateTime}</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="capitalize">{startDate}</span>
              </div>
              {!event.allDay && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{startTime} – {endTime}</span>
                </div>
              )}
            </>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4 shrink-0" />
            <span>{tz}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
        </dl>
        {event.description && (
          <div
            className={cn(
              "mt-4 text-sm leading-relaxed text-foreground/80",
              "[&_p]:mb-1.5 last:[&_p]:mb-0 [&_a]:underline [&_a]:underline-offset-4",
              "[&_a]:decoration-foreground/30 hover:[&_a]:decoration-foreground [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-1.5"
            )}
            dangerouslySetInnerHTML={{ __html: markdownToHtml(event.description) }}
          />
        )}
      </div>

      {/* Public link */}
      <section id="public-link" className="scroll-mt-24 space-y-3 rounded-xl border border-border/60 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-foreground">{T.eventDetail.publicLink.title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <code className="flex-1 min-w-0 truncate rounded-md border border-border/60 bg-muted/40 px-3 py-1.5 text-xs">
            {publicUrl}
          </code>
          <div className="flex items-center gap-1.5 shrink-0">
            <CopyButton value={publicUrl} label={T.common.copy} copiedLabel={T.common.copied} />
            <Button
              size="sm"
              className="gap-1.5"
              nativeButton={false}
              render={<a href={publicUrl} target="_blank" rel="noopener noreferrer" />}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {T.common.open}
            </Button>
          </div>
        </div>

        <EventSlugSection eventId={event.id} plan={plan} appUrl={appUrl} slug={event.slug} />
      </section>

      {/* Calendar */}
      <section id="calendar" className="scroll-mt-24 space-y-3 rounded-xl border border-border/60 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{T.eventDetail.calendar.title}</h2>
        </div>
        <p className="text-xs text-muted-foreground">{T.eventDetail.calendar.subtitle}</p>
        <EventCalendarSection
          eventId={event.id}
          plan={plan}
          calendarId={event.calendarId}
          calendars={calendars}
        />
      </section>

      {/* RSVP + Questions */}
      <div id="rsvp" className="scroll-mt-24 space-y-4">
        <RsvpSection
          eventId={event.id}
          rsvpEnabled={event.rsvpEnabled}
          rsvps={rsvps}
          questions={questions}
          onExpand={() => setRsvpModalOpen(true)}
        />

        {event.rsvpEnabled && (
          <section className="space-y-3 rounded-xl border border-border/60 p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">{T.eventDetail.sidebar.questions}</h2>
            </div>
            <EventQuestionsSection eventId={event.id} plan={plan} questions={questions} />
          </section>
        )}
      </div>

      <Dialog.Root open={rsvpModalOpen} onOpenChange={setRsvpModalOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className={cn(
            "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
          )} />
          <Dialog.Popup className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-4xl -translate-x-1/2 -translate-y-1/2",
            "border border-border/60 bg-background p-6 shadow-xl",
            "transition-[transform,opacity] duration-200 overflow-y-auto max-h-[88vh]",
            "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
            "data-[ending-style]:opacity-0 data-[ending-style]:scale-95"
          )}>
            <div className="mb-5 flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-foreground">
                {T.rsvpSection.expandedTitle}
              </Dialog.Title>
              <Dialog.Close className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <X className="h-4 w-4" />
              </Dialog.Close>
            </div>
            <RsvpSection eventId={event.id} rsvpEnabled={event.rsvpEnabled} rsvps={rsvps} questions={questions} expanded />
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Branding */}
      <section id="branding" className="scroll-mt-24 space-y-3 rounded-xl border border-border/60 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{T.eventDetail.branding.title}</h2>
        </div>
        <EventBrandingSection
          eventId={event.id}
          plan={plan}
          brandingEnabled={event.brandingEnabled}
          brandLogoUrl={event.brandLogoUrl}
          brandLogoSize={event.brandLogoSize}
          brandLogoTransparentBg={event.brandLogoTransparentBg}
          brandLogoRounded={event.brandLogoRounded}
          brandColor={event.brandColor}
          brandTextColor={event.brandTextColor}
          brandCardColor={event.brandCardColor}
          brandIconBackgroundColor={event.brandIconBackgroundColor}
          brandBackgroundColor={event.brandBackgroundColor}
          brandBackgroundImageUrl={event.brandBackgroundImageUrl}
        />
      </section>

      {/* QR code */}
      <section id="qr-code" className="scroll-mt-24 space-y-3 rounded-xl border border-border/60 p-4 sm:p-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{T.eventDetail.qrCode.title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{T.eventDetail.qrCode.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={`${appUrl}/api/events/${event.id}/qrcode?format=png`}
            alt={T.eventDetail.qrCode.title}
            width={120}
            height={120}
            className="shrink-0 rounded-lg border border-border/60 bg-white p-2"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              nativeButton={false}
              render={<a href={`${appUrl}/api/events/${event.id}/qrcode?format=png`} download />}
            >
              <Download className="h-3.5 w-3.5" />
              {T.eventDetail.qrCode.downloadPng}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              nativeButton={false}
              render={<a href={`${appUrl}/api/events/${event.id}/qrcode?format=svg`} download />}
            >
              <Download className="h-3.5 w-3.5" />
              {T.eventDetail.qrCode.downloadSvg}
            </Button>
          </div>
        </div>
      </section>

      {/* Individual calendar links */}
      <section id="links" className="scroll-mt-24 space-y-3 rounded-xl border border-border/60 p-4 sm:p-5">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{T.eventDetail.individualLinks.title}</h2>
          <p className="text-xs text-muted-foreground">{T.eventDetail.individualLinks.subtitle}</p>
        </div>
        <div className="space-y-2">
          {CALENDAR_SERVICES.map((s) => {
            const trackUrl = `${trackBase}?service=${s.key}`;
            return (
              <div
                key={s.key}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5 sm:px-4 sm:py-3"
              >
                <img src={s.logo} alt={s.name} width={32} height={32} className="shrink-0 rounded" />
                <span className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{trackUrl}</p>
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <CopyButton value={trackUrl} label={T.common.copy} copiedLabel={T.common.copied} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    nativeButton={false}
                    render={<a href={trackUrl} target="_blank" rel="noopener noreferrer" />}
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="hidden sm:inline">{T.eventDetail.individualLinks.open}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Integration / export */}
      <section id="integration" className="scroll-mt-24 space-y-3 rounded-xl border border-border/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{T.eventDetail.integration.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {T.eventDetail.integration.subtitle}
            </p>
          </div>
          <CopyButton value={exportCode} label={T.eventDetail.integration.copy} copiedLabel={T.common.copied} />
        </div>

        <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/20 p-0.5">
          {(["email", "web", "tailwind"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setExportFormat(id)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3",
                exportFormat === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {T.eventDetail.integration.formats[id]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/10 px-3 py-2.5">
          <div>
            <p className="text-xs font-medium text-foreground">{T.eventDetail.integration.centered}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{T.eventDetail.integration.centeredHint}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={exportCentered}
            onClick={() => setExportCentered((c) => !c)}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              exportCentered ? "bg-primary" : "bg-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "inline-block h-3.5 w-3.5 rounded-full bg-background shadow transition-transform",
                exportCentered ? "translate-x-4.5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>

        <div className="overflow-auto rounded-lg border border-border/40 bg-white p-4 pointer-events-none">
          <div dangerouslySetInnerHTML={{ __html: exportCode }} />
        </div>

        <div className="relative">
          <pre className="max-h-72 overflow-auto rounded-lg border border-border/40 bg-muted/30 p-4 pr-24 text-xs leading-relaxed text-foreground/80">
            <code>{exportCode}</code>
          </pre>
          <div className="absolute right-2 top-2">
            <CopyButton value={exportCode} label={T.common.copy} copiedLabel={T.common.copied} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="scroll-mt-24 space-y-3 rounded-xl border border-border/60 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">{T.eventDetail.stats.title}</h2>
          </div>
          {plan === "premium" && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              nativeButton={false}
              render={<a href={`/api/events/${event.id}/stats/export`} download />}
            >
              <Download className="h-3.5 w-3.5" />
              {T.eventDetail.stats.exportCsv}
            </Button>
          )}
        </div>
        {plan === "premium" ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">{T.eventDetail.stats.pageViews}</p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">{stats.page}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">{T.eventDetail.stats.calendarClicks}</p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">{totalCalendarClicks}</p>
            </div>
            <div className="rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">{T.eventDetail.stats.qrScans}</p>
              <p className="mt-0.5 text-2xl font-bold text-foreground">{stats.qr}</p>
            </div>
            <div className="col-span-2 sm:col-span-1 rounded-lg bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground mb-1.5">{T.eventDetail.stats.details}</p>
              <div className="space-y-1">
                {CALENDAR_SERVICES.map((s) => (
                  <div key={s.key} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{s.name}</span>
                    <span className="font-semibold text-foreground">{stats[s.key]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
            <p className="text-sm text-muted-foreground">{T.eventDetail.stats.locked}</p>
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              {T.eventDetail.stats.unlock}
            </Link>
          </div>
        )}
      </section>

      <EditEventDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        plan={plan}
        event={{
          id: event.id,
          title: event.title,
          description: event.description,
          location: event.location,
          imageUrl: event.imageUrl,
          organizerEmail: event.organizerEmail,
          startAt: event.startAt,
          endAt: event.endAt,
          allDay: event.allDay,
          isOnline: event.isOnline,
          rsvpEnabled: event.rsvpEnabled,
          timezone: event.timezone,
          language: event.language,
        }}
      />

      <CreateEventDialog
        open={createEventOpen}
        onOpenChange={setCreateEventOpen}
        defaultDate={new Date()}
        defaultTimezone={browserTz}
        calendars={calendars}
        defaultCalendarId={event.calendarId}
        onSubmit={handleCreateEvent}
        isPending={isCreatingEvent}
        error={createEventError}
      />
      </div>
    </div>
    </>
  );
}
