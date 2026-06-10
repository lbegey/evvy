"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarRange,
  Copy,
  Check,
  ExternalLink,
  Pencil,
  Trash2,
  Plus,
  Info,
  Palette,
  Link2,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDialog, type CalendarDialogValues } from "@/components/CalendarDialog";
import { CalendarBrandingSection } from "@/components/CalendarBrandingSection";
import { CalendarSlugSection } from "@/components/CalendarSlugSection";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { updateCalendar, deleteCalendar, assignEventToCalendar, toggleCalendarPublished } from "@/app/actions/calendars";
import { createEvent, removeEvent } from "@/app/actions/events";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface CalendarRecord {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  slug: string | null;
  language: string;
  published: boolean;
  brandingEnabled: boolean;
  brandLogoUrl: string | null;
  brandLogoSize: number | null;
  brandLogoTransparentBg: boolean;
  brandLogoRounded: boolean;
  brandColor: string | null;
  brandTextColor: string | null;
  brandCardColor: string | null;
  brandBackgroundColor: string | null;
  brandBackgroundImageUrl: string | null;
  eventCount: number;
}

interface CalendarEventSummary {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  timezone: string;
  published: boolean;
}

interface CalendarDetailProps {
  calendar: CalendarRecord;
  events: CalendarEventSummary[];
  calendars: { id: string; name: string }[];
  appUrl: string;
  plan: string;
  emailVerified: boolean;
}

const SIDEBAR_SECTIONS = [
  { id: "info", labelKey: "info", icon: Info },
  { id: "public-link", labelKey: "publicLink", icon: Link2 },
  { id: "qr-code", labelKey: "qrCode", icon: QrCode },
  { id: "branding", labelKey: "branding", icon: Palette },
  { id: "events", labelKey: "events", icon: CalendarRange },
] as const;

const EVENTS_PER_PAGE = 10;

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

export function CalendarDetail({ calendar, events, calendars, appUrl, plan, emailVerified }: CalendarDetailProps) {
  const router = useRouter();
  const { T, lang } = useLanguage();
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>(SIDEBAR_SECTIONS[0].id);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [createEventError, setCreateEventError] = useState<string | null>(null);
  const [isCreatingEvent, startCreateEvent] = useTransition();
  const [eventsPage, setEventsPage] = useState(1);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [deleteEventError, setDeleteEventError] = useState<string | null>(null);
  const [isDeletingEvent, startDeleteEvent] = useTransition();
  const [published, setPublished] = useState(calendar.published);
  const [, startTogglePublished] = useTransition();
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const eventsPageCount = Math.max(1, Math.ceil(events.length / EVENTS_PER_PAGE));
  const pagedEvents = events.slice((eventsPage - 1) * EVENTS_PER_PAGE, eventsPage * EVENTS_PER_PAGE);

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

    return () => observer.disconnect();
  }, []);

  const publicUrl = `${appUrl}/c/${calendar.slug || calendar.id}`;

  const handleEditSubmit = async (data: CalendarDialogValues) => {
    setEditError(null);
    startSave(async () => {
      const result = await updateCalendar(calendar.id, data);
      if (result?.error === "forbidden") {
        setEditError(T.calendars.locked);
        return;
      }
      setEditOpen(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm(T.calendars.confirmDelete)) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteCalendar(calendar.id);
      if (result?.error === "forbidden") {
        setDeleteError(T.calendars.locked);
        return;
      }
      router.push("/dashboard/calendars");
      router.refresh();
    });
  };

  const handleTogglePublished = (checked: boolean) => {
    if (checked && !emailVerified) return;
    setPublished(checked);
    startTogglePublished(async () => {
      const result = await toggleCalendarPublished(calendar.id, checked);
      if (result?.error === "emailNotVerified") setPublished(!checked);
      router.refresh();
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!confirm(T.calendarDetail.confirmDeleteEvent)) return;
    setDeleteEventError(null);
    setDeletingEventId(eventId);
    startDeleteEvent(async () => {
      const result = await removeEvent(eventId);
      if ("error" in result) {
        setDeleteEventError(T.calendarDetail.deleteEventForbidden);
        setDeletingEventId(null);
        return;
      }
      setDeletingEventId(null);
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
      const assignedCalendarId = data.calendarId ?? calendar.id;
      await assignEventToCalendar(result.id, assignedCalendarId);
      router.push(`/dashboard/events/${result.id}?calendar=${assignedCalendarId}`);
    });
  };

  return (
    <>
      {/* Fixed action bar */}
      <div className={cn("fixed left-0 right-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-sm", emailVerified ? "top-16" : "top-[6.75rem]")}>
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/dashboard/calendars"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{T.calendarDetail.back}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{T.calendars.delete}</span>
            </Button>
            <label
              className={cn(
                "flex items-center gap-1.5 rounded-lg border border-border/60 px-2 py-1 text-xs font-medium",
                !published && !emailVerified && "opacity-60"
              )}
              title={
                !published && !emailVerified
                  ? T.calendarDetail.published.verifyEmailRequired
                  : published
                    ? T.calendarDetail.published.onlineHint
                    : T.calendarDetail.published.offlineHint
              }
            >
              <Switch
                checked={published}
                onCheckedChange={handleTogglePublished}
                disabled={!published && !emailVerified}
              />
              <span className={cn(published ? "text-foreground" : "text-muted-foreground")}>
                {published ? T.calendarDetail.published.online : T.calendarDetail.published.offline}
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
              <span className="hidden sm:inline">{T.calendars.edit}</span>
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

    <div className={cn("mx-auto max-w-6xl px-4 pb-6 sm:px-6 sm:pb-8 lg:flex lg:items-start lg:gap-8", emailVerified ? "pt-20 sm:pt-24" : "pt-[8.75rem] sm:pt-[9.75rem]")}>
      {/* Sidebar navigation */}
      <aside className={cn("hidden shrink-0 lg:sticky lg:block lg:w-44", emailVerified ? "lg:top-28" : "lg:top-[9.75rem]")}>
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

        {!published && !emailVerified && (
          <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-400">
            {T.calendarDetail.published.verifyEmailRequired}
          </div>
        )}

        {/* Info */}
        <div id="info" className="scroll-mt-24">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{calendar.name}</h1>
          {calendar.description && (
            <p className="mt-3 text-sm leading-relaxed text-foreground/70">{calendar.description}</p>
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

          <CalendarSlugSection calendarId={calendar.id} plan={plan} appUrl={appUrl} slug={calendar.slug} />
        </section>

        {/* QR code */}
        <section id="qr-code" className="scroll-mt-24 space-y-3 rounded-xl border border-border/60 p-4 sm:p-5">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{T.eventDetail.qrCode.title}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{T.calendarDetail.qrCode.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <img
              src={`${appUrl}/api/calendars/${calendar.id}/qrcode?format=png`}
              alt={T.eventDetail.qrCode.title}
              width={120}
              height={120}
              className="shrink-0 rounded-lg border border-border/60 bg-white p-2"
            />
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                nativeButton={false}
                render={<a href={`${appUrl}/api/calendars/${calendar.id}/qrcode?format=png`} download />}
              >
                <Download className="h-3.5 w-3.5" />
                {T.eventDetail.qrCode.downloadPng}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                nativeButton={false}
                render={<a href={`${appUrl}/api/calendars/${calendar.id}/qrcode?format=svg`} download />}
              >
                <Download className="h-3.5 w-3.5" />
                {T.eventDetail.qrCode.downloadSvg}
              </Button>
            </div>
          </div>
        </section>

        {/* Branding */}
        <section id="branding" className="scroll-mt-24 space-y-3 rounded-xl border border-border/60 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">{T.eventDetail.branding.title}</h2>
          </div>
          <CalendarBrandingSection
            calendarId={calendar.id}
            plan={plan}
            brandingEnabled={calendar.brandingEnabled}
            brandLogoUrl={calendar.brandLogoUrl}
            brandLogoSize={calendar.brandLogoSize}
            brandLogoTransparentBg={calendar.brandLogoTransparentBg}
            brandLogoRounded={calendar.brandLogoRounded}
            brandColor={calendar.brandColor}
            brandTextColor={calendar.brandTextColor}
            brandCardColor={calendar.brandCardColor}
            brandBackgroundColor={calendar.brandBackgroundColor}
            brandBackgroundImageUrl={calendar.brandBackgroundImageUrl}
          />
        </section>

        {/* Events */}
        <section id="events" className="scroll-mt-24 space-y-3 rounded-xl border border-border/60 p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">{T.eventDetail.sidebar.events}</h2>
          </div>
          {deleteEventError && <p className="text-sm text-destructive">{deleteEventError}</p>}
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-12 text-center">
              <CalendarX2 className="h-6 w-6 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{T.calendarDetail.noEvents}</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {pagedEvents.map((ev) => {
                  const start = new Date(ev.startAt);
                  const day = new Intl.DateTimeFormat(locale, { timeZone: ev.timezone, day: "2-digit" }).format(start);
                  const month = new Intl.DateTimeFormat(locale, { timeZone: ev.timezone, month: "short" }).format(start).toUpperCase();
                  const dateLabel = ev.allDay
                    ? new Intl.DateTimeFormat(locale, { timeZone: ev.timezone, weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(start)
                    : `${new Intl.DateTimeFormat(locale, { timeZone: ev.timezone, weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(start)} · ${new Intl.DateTimeFormat(locale, { timeZone: ev.timezone, hour: "2-digit", minute: "2-digit" }).format(start)}`;

                  return (
                    <div
                      key={ev.id}
                      className="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-3 transition-colors hover:bg-muted/20"
                    >
                      <Link href={`/dashboard/events/${ev.id}?calendar=${calendar.id}`} className="grid min-w-0 flex-1 grid-cols-2 items-center gap-2 sm:flex sm:gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-muted/50 py-1.5">
                            <span className="text-[10px] font-medium uppercase text-muted-foreground">{month}</span>
                            <span className="text-base font-bold leading-none text-foreground">{day}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-sm font-medium text-foreground">{ev.title}</p>
                              <Badge
                                variant={ev.published ? "secondary" : "outline"}
                                className={cn("shrink-0", !ev.published && "text-muted-foreground")}
                              >
                                {ev.published ? T.common.online : T.common.offline}
                              </Badge>
                            </div>
                            <p className="hidden truncate text-xs text-muted-foreground sm:block">{dateLabel}</p>
                          </div>
                        </div>
                        <div className="min-w-0 sm:hidden">
                          <p className="truncate text-xs text-muted-foreground">{dateLabel}</p>
                          <p className="truncate text-xs text-muted-foreground">{ev.timezone}</p>
                        </div>
                      </Link>
                      {plan === "premium" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeleteEvent(ev.id)}
                          disabled={isDeletingEvent && deletingEventId === ev.id}
                          aria-label={T.calendars.delete}
                          className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {eventsPageCount > 1 && (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={eventsPage <= 1}
                    onClick={() => setEventsPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    {T.calendarDetail.pagination.previous}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {T.calendarDetail.pagination.pageInfo(eventsPage, eventsPageCount)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={eventsPage >= eventsPageCount}
                    onClick={() => setEventsPage((p) => Math.min(eventsPageCount, p + 1))}
                  >
                    {T.calendarDetail.pagination.next}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <CalendarDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editing={{ name: calendar.name, description: calendar.description ?? "", color: calendar.color ?? "", language: calendar.language }}
        onSubmit={handleEditSubmit}
        isPending={isSaving}
        error={editError}
      />

      <CreateEventDialog
        open={createEventOpen}
        onOpenChange={setCreateEventOpen}
        defaultDate={new Date()}
        defaultTimezone={browserTz}
        calendars={calendars}
        defaultCalendarId={calendar.id}
        onSubmit={handleCreateEvent}
        isPending={isCreatingEvent}
        error={createEventError}
      />
    </div>
    </>
  );
}
