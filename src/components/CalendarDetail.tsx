"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarRange, ExternalLink, Pencil, Trash2, Plus, Info, Palette, Link2,
  CalendarX2, ChevronLeft, ChevronRight, QrCode, Download, Copy,
} from "lucide-react";
import { CalendarDialog, type CalendarDialogValues } from "@/components/CalendarDialog";
import { applyBrandingPresetToCalendar, type BrandingPreset } from "@/app/actions/brandingPresets";
import { CalendarSlugSection } from "@/components/CalendarSlugSection";
import { SocialShareLinks } from "@/components/SocialShareLinks";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { updateCalendar, deleteCalendar, assignEventToCalendar, toggleCalendarPublished, updateCalendarBranding } from "@/app/actions/calendars";
import { createEvent, removeEvent } from "@/app/actions/events";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { DashboardShell } from "@/components/event-dashboard/DashboardShell";
import { type SidebarItem } from "@/components/event-dashboard/DashboardSidebar";
import { EvvySwitch } from "@/components/event-dashboard/EvvySwitch";
import { CopyButton } from "@/components/event-dashboard/CopyButton";
import { BrandingCard } from "@/components/event-dashboard/BrandingCard";

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
  brandIconBackgroundColor: string | null;
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
  isSuperAdmin: boolean;
  brandingPresets: BrandingPreset[];
}

const EVENTS_PER_PAGE = 6;

export function CalendarDetail({ calendar, events, calendars, appUrl, plan, emailVerified, isSuperAdmin, brandingPresets }: CalendarDetailProps) {
  const router = useRouter();
  const { T, lang } = useLanguage();
  const locale = lang === "fr" ? "fr-FR" : "en-US";
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [createEventError, setCreateEventError] = useState<string | null>(null);
  const [isCreatingEvent, startCreateEvent] = useTransition();
  const [eventsPage, setEventsPage] = useState(1);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [deleteEventError, setDeleteEventError] = useState<string | null>(null);
  const [isDeletingEvent, startDeleteEvent] = useTransition();
  const [published, setPublished] = useState(calendar.published);
  const [isTogglingPublished, startTogglePublished] = useTransition();
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const eventsPageCount = Math.max(1, Math.ceil(events.length / EVENTS_PER_PAGE));
  const currentPage = Math.min(eventsPage, eventsPageCount);
  const pagedEvents = events.slice((currentPage - 1) * EVENTS_PER_PAGE, currentPage * EVENTS_PER_PAGE);
  const publishedCount = events.filter((e) => e.published).length;
  const draftCount = events.length - publishedCount;

  const publicUrl = `${appUrl}/c/${calendar.slug || calendar.id}`;
  const host = appUrl.replace(/^https?:\/\//, "");

  const SECTIONS: SidebarItem[] = [
    { id: "overview", label: T.dashboardDetail.sidebar.info, Icon: Info },
    { id: "public-link", label: T.dashboardDetail.sidebar.publicLink, Icon: Link2 },
    { id: "qr-code", label: T.dashboardDetail.sidebar.qrCode, Icon: QrCode },
    { id: "branding", label: T.dashboardDetail.sidebar.branding, Icon: Palette },
    { id: "events", label: T.dashboardDetail.sidebar.events, Icon: CalendarRange, badge: events.length },
  ];

  const handleEditSubmit = async (data: CalendarDialogValues) => {
    setEditError(null);
    startSave(async () => {
      const result = await updateCalendar(calendar.id, data);
      if (result?.error === "forbidden") { setEditError(T.calendars.locked); return; }
      setEditOpen(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm(T.calendars.confirmDelete)) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteCalendar(calendar.id);
      if (result?.error === "forbidden") { setDeleteError(T.calendars.locked); return; }
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
      if ("error" in result) { setDeleteEventError(T.calendarDetail.deleteEventForbidden); setDeletingEventId(null); return; }
      setDeletingEventId(null);
      router.refresh();
    });
  };

  const handleCreateEvent = async (data: {
    title: string; description: string; location: string; organizerEmail: string;
    startAt: string; endAt: string; allDay: boolean; isOnline: boolean; rsvpEnabled: boolean;
    timezone: string; language: string; imageUrl: string; calendarId: string | null;
  }) => {
    setCreateEventError(null);
    startCreateEvent(async () => {
      const result = await createEvent(data);
      if ("error" in result) { setCreateEventError(T.eventForm.errors.limitReached); return; }
      const assignedCalendarId = data.calendarId ?? calendar.id;
      await assignEventToCalendar(result.id, assignedCalendarId);
      router.push(`/dashboard/events/${result.id}?calendar=${assignedCalendarId}`);
    });
  };

  const publishTitle = !published && !emailVerified
    ? T.calendarDetail.published.verifyEmailRequired
    : published ? T.calendarDetail.published.onlineHint : T.calendarDetail.published.offlineHint;

  return (
    <>
      <DashboardShell
        sidebarItems={SECTIONS}
        manageLabel={T.eventDashboard.manageCalendar}
        backUrl="/dashboard/calendars"
        backLabel={T.calendarDetail.back}
        isSuperAdmin={isSuperAdmin}
        calendars={calendars}
      >
        {/* ── HEADER ── */}
        <div id="overview" className="relative overflow-hidden border-b border-line bg-white">
          <div className="grid-texture pointer-events-none absolute inset-0" />
          <div className="relative mx-auto max-w-[1400px] px-4 py-6 sm:px-8 lg:py-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
              <div className="flex min-w-0 flex-1 gap-4">
                <div
                  className="hidden h-16 w-16 shrink-0 place-items-center rounded-2xl text-white shadow-pop sm:grid"
                  style={{ background: calendar.color ?? undefined }}
                >
                  <span className={cn("grid h-full w-full place-items-center rounded-2xl", !calendar.color && "bg-linear-to-br from-evvy to-coral")}>
                    <CalendarRange className="h-7 w-7" strokeWidth={1.8} />
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{calendar.name}</h1>
                    {published ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/15 px-2.5 py-1 text-xs font-semibold text-mint">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />{T.calendarDetail.published.online}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-inksoft">
                        <span className="h-1.5 w-1.5 rounded-full bg-inksoft/50" />{T.calendarDetail.published.offline}
                      </span>
                    )}
                  </div>
                  {calendar.description && <p className="mt-2 text-sm text-inksoft/90">{calendar.description}</p>}
                  {deleteError && <p className="mt-2 text-sm text-coral">{deleteError}</p>}
                </div>
              </div>

              {/* actions */}
              <div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
                <label className="flex h-9 cursor-pointer select-none items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-medium" title={publishTitle}>
                  {isTogglingPublished && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-evvy border-t-transparent" />}
                  <span className="text-inksoft">{T.common.online}</span>
                  <EvvySwitch checked={published} disabled={(!published && !emailVerified) || isTogglingPublished} onCheckedChange={handleTogglePublished} />
                </label>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-sm font-medium transition hover:bg-paper">
                  <ExternalLink className="h-[15px] w-[15px]" />{T.common.open}
                </a>
                <button onClick={() => setEditOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-evvy px-3.5 text-sm font-semibold text-white shadow-card transition hover:bg-evvy-deep">
                  <Pencil className="h-[15px] w-[15px]" />{T.calendars.edit}
                </button>
                <button onClick={handleDelete} disabled={isDeleting} title={T.calendars.delete}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-coral transition hover:bg-coral/5 disabled:opacity-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* KPI strip */}
            <div className="mt-7 grid grid-cols-3 gap-3">
              <div data-reveal className="rounded-xl2 border border-line bg-paper/70 p-4">
                <p className="text-xs font-medium text-inksoft">{T.dashboardDetail.sidebar.events}</p>
                <p className="mt-1 font-display text-2xl font-bold">{events.length}</p>
              </div>
              <div data-reveal className="rounded-xl2 border border-line bg-paper/70 p-4">
                <p className="text-xs font-medium text-inksoft">{T.eventDashboard.kpiPublished}</p>
                <p className="mt-1 font-display text-2xl font-bold text-mint">{publishedCount}</p>
              </div>
              <div data-reveal className="rounded-xl2 border border-line bg-paper/70 p-4">
                <p className="text-xs font-medium text-inksoft">{T.eventDashboard.kpiDrafts}</p>
                <p className="mt-1 font-display text-2xl font-bold text-inksoft/60">{draftCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-8 sm:px-8">
          {/* Public link */}
          <section data-reveal id="public-link" className="scroll-mt-24 rounded-xl2 border border-line bg-white p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-evvy-soft text-evvy"><Link2 className="h-[18px] w-[18px]" /></span>
              <div>
                <h2 className="font-display text-lg font-bold leading-none">{T.eventDashboard.shareTitle}</h2>
                <p className="mt-1 text-xs text-inksoft">{T.eventDetail.publicLink.title}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-10 min-w-0 flex-1 truncate rounded-lg border border-line bg-paper/60 px-3 text-sm leading-10 text-inksoft">{host}/c/{calendar.slug || calendar.id}</div>
              <CopyButton value={publicUrl} toast={T.common.copied} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-evvy px-3 text-sm font-medium text-white transition hover:bg-evvy-deep">
                <Copy className="h-3.5 w-3.5" />{T.common.copy}
              </CopyButton>
            </div>
            <div className="evvy-theme mt-4 flex items-center gap-2">
              <span className="mr-1 text-xs text-inksoft">{T.eventDetail.publicLink.share}</span>
              <SocialShareLinks url={publicUrl} title={calendar.name} />
            </div>
            <div className="evvy-theme mt-2">
              <CalendarSlugSection calendarId={calendar.id} plan={plan} appUrl={appUrl} slug={calendar.slug} />
            </div>
          </section>

          {/* QR code */}
          <section data-reveal id="qr-code" className="scroll-mt-24 rounded-xl2 border border-line bg-white p-5 shadow-card">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-evvy-soft text-evvy"><QrCode className="h-[18px] w-[18px]" /></span>
              <div>
                <h2 className="font-display text-lg font-bold leading-none">{T.eventDetail.qrCode.title}</h2>
                <p className="mt-1 text-xs text-inksoft">{T.calendarDetail.qrCode.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${appUrl}/api/calendars/${calendar.id}/qrcode?format=png`} alt={T.eventDetail.qrCode.title} width={96} height={96} className="shrink-0 rounded-xl border border-line bg-white p-2" />
              <div className="flex flex-col gap-2">
                <a href={`${appUrl}/api/calendars/${calendar.id}/qrcode?format=png`} download className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-medium transition hover:bg-paper sm:h-9 sm:px-3 sm:text-sm">
                  <Download className="h-3.5 w-3.5 shrink-0" />{T.eventDetail.qrCode.downloadPng}
                </a>
                <a href={`${appUrl}/api/calendars/${calendar.id}/qrcode?format=svg`} download className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-medium transition hover:bg-paper sm:h-9 sm:px-3 sm:text-sm">
                  <Download className="h-3.5 w-3.5 shrink-0" />{T.eventDetail.qrCode.downloadSvg}
                </a>
              </div>
            </div>
          </section>

          {/* Branding */}
          <BrandingCard
            targetId={calendar.id}
            updateBranding={updateCalendarBranding}
            applyPreset={applyBrandingPresetToCalendar}
            plan={plan}
            brandingEnabled={calendar.brandingEnabled}
            brandLogoUrl={calendar.brandLogoUrl}
            brandLogoSize={calendar.brandLogoSize}
            brandLogoTransparentBg={calendar.brandLogoTransparentBg}
            brandLogoRounded={calendar.brandLogoRounded}
            brandColor={calendar.brandColor}
            brandTextColor={calendar.brandTextColor}
            brandCardColor={calendar.brandCardColor}
            brandIconBackgroundColor={calendar.brandIconBackgroundColor}
            brandBackgroundColor={calendar.brandBackgroundColor}
            brandBackgroundImageUrl={calendar.brandBackgroundImageUrl}
            initialPresets={brandingPresets}
            previewTitle={calendar.name}
            previewMeta={T.dashboardDetail.sidebar.events + " · " + events.length}
          />

          {/* Events */}
          <section data-reveal id="events" className="scroll-mt-24 rounded-xl2 border border-line bg-white p-5 shadow-card">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-evvy-soft text-evvy"><CalendarRange className="h-[18px] w-[18px]" /></span>
              <div>
                <h2 className="font-display text-lg font-bold leading-none">{T.dashboardDetail.sidebar.events}</h2>
                <p className="mt-1 text-xs text-inksoft">{calendar.name}</p>
              </div>
              <button onClick={() => { setCreateEventError(null); setCreateEventOpen(true); }}
                className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-evvy px-3 text-sm font-medium text-white shadow-card transition hover:bg-evvy-deep">
                <Plus className="h-4 w-4" />{T.calendar.newEvent}
              </button>
            </div>
            {deleteEventError && <p className="mb-3 text-sm text-coral">{deleteEventError}</p>}
            {events.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line py-12 text-center">
                <CalendarX2 className="h-6 w-6 text-inksoft/50" />
                <p className="text-sm text-inksoft">{T.calendarDetail.noEvents}</p>
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
                      <div key={ev.id} className="flex items-center gap-3 rounded-xl border border-line bg-white p-3 transition hover:bg-paper/60">
                        <Link href={`/dashboard/events/${ev.id}?calendar=${calendar.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                          <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-paper py-1.5">
                            <span className="text-[10px] font-medium uppercase text-inksoft">{month}</span>
                            <span className="font-display text-base font-bold leading-none text-ink">{day}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate text-sm font-medium text-ink">{ev.title}</p>
                              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold", ev.published ? "bg-mint/15 text-mint" : "border border-line bg-paper text-inksoft")}>
                                {ev.published ? T.common.online : T.common.offline}
                              </span>
                            </div>
                            <p className="truncate text-xs text-inksoft">{dateLabel}</p>
                          </div>
                        </Link>
                        {plan === "premium" && (
                          <button onClick={() => handleDeleteEvent(ev.id)} disabled={isDeletingEvent && deletingEventId === ev.id}
                            aria-label={T.calendars.delete} className="shrink-0 rounded-lg p-1.5 text-inksoft/50 transition hover:text-coral disabled:opacity-40">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {eventsPageCount > 1 && (
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <button type="button" disabled={currentPage <= 1} onClick={() => setEventsPage((p) => Math.max(1, p - 1))}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-3 text-xs font-medium transition hover:bg-paper disabled:opacity-40">
                      <ChevronLeft className="h-3.5 w-3.5" />{T.calendarDetail.pagination.previous}
                    </button>
                    <p className="text-xs text-inksoft">{T.calendarDetail.pagination.pageInfo(currentPage, eventsPageCount)}</p>
                    <button type="button" disabled={currentPage >= eventsPageCount} onClick={() => setEventsPage((p) => Math.min(eventsPageCount, p + 1))}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-3 text-xs font-medium transition hover:bg-paper disabled:opacity-40">
                      {T.calendarDetail.pagination.next}<ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          <div className="h-2" />
        </div>
      </DashboardShell>

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
    </>
  );
}
