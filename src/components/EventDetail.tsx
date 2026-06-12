"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CalendarDays, Calendar, Clock, Globe, MapPin, ExternalLink, Pencil, Trash2,
  LayoutGrid, Link2, CalendarRange, QrCode, Palette, Users, Paperclip, Code2, AppWindow, BarChart2,
} from "lucide-react";
import { EditEventDialog } from "@/components/EditEventDialog";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { type RsvpQuestion } from "@/components/EventQuestionsSection";
import { type BrandingPreset } from "@/app/actions/brandingPresets";
import { assignEventToCalendar } from "@/app/actions/calendars";
import { createEvent, deleteEvent, toggleEventPublished } from "@/app/actions/events";
import { useLanguage } from "@/contexts/LanguageContext";
import { markdownToHtml } from "@/lib/markdown";
import { EvvySwitch } from "@/components/event-dashboard/EvvySwitch";
import { DashboardShell } from "@/components/event-dashboard/DashboardShell";
import { type SidebarItem } from "@/components/event-dashboard/DashboardSidebar";
import { EventRsvpCard, type RsvpRecord } from "@/components/event-dashboard/EventRsvpCard";
import { EventShareCard } from "@/components/event-dashboard/EventShareCard";
import { EventQrCard } from "@/components/event-dashboard/EventQrCard";
import { EventBrandingCard } from "@/components/event-dashboard/EventBrandingCard";
import { EventAttachmentCard } from "@/components/event-dashboard/EventAttachmentCard";
import { EventCalendarCard } from "@/components/event-dashboard/EventCalendarCard";
import { EventIntegrationCard } from "@/components/event-dashboard/EventIntegrationCard";
import { EventEmbedCard } from "@/components/event-dashboard/EventEmbedCard";
import { EventStatsCard } from "@/components/event-dashboard/EventStatsCard";

export type { RsvpRecord };

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
  rsvpLimit: number | null;
  rsvpDeadline: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentButtonLabel: string | null;
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
  isSuperAdmin: boolean;
  calendars: { id: string; name: string; color: string | null }[];
  brandingPresets: BrandingPreset[];
  stats: Stats;
  rsvps: RsvpRecord[];
  questions: RsvpQuestion[];
}

export function EventDetail({
  event, appUrl, plan, emailVerified, isSuperAdmin, calendars, brandingPresets, stats, rsvps, questions,
}: EventDetailProps) {
  const router = useRouter();
  const { T, lang } = useLanguage();
  const searchParams = useSearchParams();
  const fromCalendarId = searchParams.get("calendar");
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [editOpen, setEditOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [createEventError, setCreateEventError] = useState<string | null>(null);
  const [isCreatingEvent, startCreateEvent] = useTransition();
  const [published, setPublished] = useState(event.published);
  const [, startTogglePublished] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  // ── meta (timezone-aware, reused from the previous implementation) ──
  const tz = event.timezone;
  const locale = lang === "fr" ? "fr-FR" : "en-US";
  const eventDate = new Date(event.startAt);

  const tzParts = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "numeric" }).formatToParts(eventDate);
  const backYear = tzParts.find((p) => p.type === "year")?.value ?? "";
  const backMonth = String(Number(tzParts.find((p) => p.type === "month")?.value ?? "1") - 1);
  const backUrl = fromCalendarId ? `/dashboard/calendars/${fromCalendarId}` : `/dashboard?year=${backYear}&month=${backMonth}`;

  const startDate = new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(eventDate);
  const startTime = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(event.startAt));
  const endTime = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date(event.endAt));
  const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
  const isMultiDay = dayKeyFmt.format(new Date(event.startAt)) !== dayKeyFmt.format(new Date(event.endAt));
  const fullDateTimeFmt = new Intl.DateTimeFormat(locale, {
    timeZone: tz, weekday: "short", day: "numeric", month: "short", year: "numeric",
    ...(event.allDay ? {} : { hour: "2-digit", minute: "2-digit" }),
  });
  const startDateTime = fullDateTimeFmt.format(new Date(event.startAt));
  const endDateTime = fullDateTimeFmt.format(new Date(event.endAt));
  const shortDate = new Intl.DateTimeFormat(locale, { timeZone: tz, weekday: "short", day: "numeric", month: "short" }).format(eventDate);
  const previewMeta = `${shortDate}${event.allDay ? "" : ` · ${startTime}`}${event.location ? ` — ${event.location}` : ""}`;

  const slugOrId = event.slug || event.id;
  const publicUrl = `${appUrl}/e/${slugOrId}`;

  // ── KPIs ──
  const yes = rsvps.filter((r) => r.status === "yes").length;
  const maybe = rsvps.filter((r) => r.status === "maybe").length;
  const serviceCounts = [stats.google, stats.apple, stats.outlook, stats.office365, stats.yahoo];
  const totalCalendarClicks = serviceCounts.reduce((a, b) => a + b, 0);
  const servicesWithClicks = serviceCounts.filter((n) => n > 0).length;

  // ── sidebar sections ──
  const SECTIONS: SidebarItem[] = [
    { id: "overview", label: T.dashboardDetail.sidebar.info, Icon: LayoutGrid },
    { id: "public-link", label: T.dashboardDetail.sidebar.publicLink, Icon: Link2 },
    { id: "calendar", label: T.dashboardDetail.sidebar.calendar, Icon: CalendarRange },
    { id: "qr-code", label: T.dashboardDetail.sidebar.qrCode, Icon: QrCode },
    { id: "branding", label: T.dashboardDetail.sidebar.branding, Icon: Palette },
    { id: "rsvp", label: T.dashboardDetail.sidebar.rsvp, Icon: Users, badge: rsvps.length },
    { id: "attachment", label: T.dashboardDetail.sidebar.attachment, Icon: Paperclip },
    { id: "integration", label: T.dashboardDetail.sidebar.integration, Icon: Code2 },
    { id: "embed", label: T.dashboardDetail.sidebar.embed, Icon: AppWindow },
    { id: "stats", label: T.dashboardDetail.sidebar.stats, Icon: BarChart2 },
  ];

  // ── actions ──
  const handleTogglePublished = (checked: boolean) => {
    if (checked && !emailVerified) return;
    setPublished(checked);
    startTogglePublished(async () => {
      const result = await toggleEventPublished(event.id, checked);
      if (result?.error === "emailNotVerified") setPublished(!checked);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm(T.eventDetail.confirmDelete)) return;
    startDelete(async () => { await deleteEvent(event.id); });
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
      if (data.calendarId) await assignEventToCalendar(result.id, data.calendarId);
      router.push(`/dashboard/events/${result.id}${data.calendarId ? `?calendar=${data.calendarId}` : ""}`);
    });
  };

  const publishTitle = !published && !emailVerified
    ? T.eventDetail.published.verifyEmailRequired
    : published ? T.eventDetail.published.onlineHint : T.eventDetail.published.offlineHint;

  return (
    <>
      <DashboardShell
        sidebarItems={SECTIONS}
        manageLabel={T.eventDashboard.manageEvent}
        backUrl={backUrl}
        backLabel={T.eventDetail.backToCalendar}
        isSuperAdmin={isSuperAdmin}
        onNewEvent={() => { setCreateEventError(null); setCreateEventOpen(true); }}
      >
            {/* ── EVENT HEADER ── */}
            <div className="relative overflow-hidden border-b border-line bg-white">
              <div className="grid-texture pointer-events-none absolute inset-0" />
              <div className="relative mx-auto max-w-[1400px] px-4 py-6 sm:px-8 lg:py-8">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
                  <div className="flex min-w-0 flex-1 gap-4">
                    <div className="hidden h-16 w-16 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-evvy to-coral text-white shadow-pop sm:grid">
                      <CalendarDays className="h-7 w-7" strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="truncate font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{event.title}</h1>
                        {published ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/15 px-2.5 py-1 text-xs font-semibold text-mint">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mint" />{T.eventDetail.published.online}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-inksoft">
                            <span className="h-1.5 w-1.5 rounded-full bg-inksoft/50" />{T.eventDetail.published.offline}
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-inksoft">
                        {isMultiDay ? (
                          <span className="inline-flex items-center gap-1.5"><Calendar className="h-[15px] w-[15px] shrink-0" /><span className="capitalize">{startDateTime} → {endDateTime}</span></span>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1.5"><Calendar className="h-[15px] w-[15px] shrink-0" /><span className="capitalize">{startDate}</span></span>
                            {!event.allDay && (
                              <span className="inline-flex items-center gap-1.5"><Clock className="h-[15px] w-[15px] shrink-0" />{startTime} – {endTime} · {tz}</span>
                            )}
                          </>
                        )}
                        {event.allDay && (
                          <span className="inline-flex items-center gap-1.5"><Globe className="h-[15px] w-[15px] shrink-0" />{tz}</span>
                        )}
                        {event.location && (
                          <span className="inline-flex max-w-full items-center gap-1.5"><MapPin className="h-[15px] w-[15px] shrink-0" /><span className="truncate">{event.location}</span></span>
                        )}
                      </div>
                      {event.description && (
                        <div
                          className="mt-2 text-sm italic text-inksoft/90 [&_a]:underline [&_p]:mb-1.5 last:[&_p]:mb-0"
                          dangerouslySetInnerHTML={{ __html: markdownToHtml(event.description) }}
                        />
                      )}
                    </div>
                  </div>

                  {/* actions */}
                  <div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
                    <label className="flex h-9 cursor-pointer select-none items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm font-medium" title={publishTitle}>
                      <span className="text-inksoft">{T.common.online}</span>
                      <EvvySwitch checked={published} disabled={!published && !emailVerified} onCheckedChange={handleTogglePublished} />
                    </label>
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-sm font-medium transition hover:bg-paper">
                      <ExternalLink className="h-[15px] w-[15px]" />{T.common.open}
                    </a>
                    <button onClick={() => setEditOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-evvy px-3.5 text-sm font-semibold text-white shadow-card transition hover:bg-evvy-deep">
                      <Pencil className="h-[15px] w-[15px]" />{T.eventDetail.edit}
                    </button>
                    {plan === "premium" && (
                      <button onClick={handleDelete} disabled={isDeleting} title={T.eventDetail.delete}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-coral transition hover:bg-coral/5 disabled:opacity-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* KPI strip */}
                <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div data-reveal className="rounded-xl2 border border-line bg-paper/70 p-4">
                    <p className="text-xs font-medium text-inksoft">{T.eventDashboard.kpiRsvp}</p>
                    <p className="mt-1 font-display text-2xl font-bold">{rsvps.length}</p>
                    <p className="mt-0.5 text-xs font-medium text-mint">{T.eventDashboard.kpiRsvpBreakdown(yes, maybe)}</p>
                  </div>
                  <div data-reveal className="rounded-xl2 border border-line bg-paper/70 p-4">
                    <p className="text-xs font-medium text-inksoft">{T.eventDashboard.kpiViews}</p>
                    <p className="mt-1 font-display text-2xl font-bold">{stats.page}</p>
                    <p className="mt-0.5 text-xs text-inksoft/70">{T.eventDashboard.kpiSinceCreation}</p>
                  </div>
                  <div data-reveal className="rounded-xl2 border border-line bg-paper/70 p-4">
                    <p className="text-xs font-medium text-inksoft">{T.eventDashboard.kpiCalendarAdds}</p>
                    <p className="mt-1 font-display text-2xl font-bold">{totalCalendarClicks}</p>
                    <p className="mt-0.5 text-xs text-inksoft/70">{T.eventDashboard.kpiServices(servicesWithClicks)}</p>
                  </div>
                  <div data-reveal className="rounded-xl2 border border-line bg-paper/70 p-4">
                    <p className="text-xs font-medium text-inksoft">{T.eventDashboard.kpiQrScans}</p>
                    <p className="mt-1 font-display text-2xl font-bold">{stats.qr}</p>
                    <p className="mt-0.5 text-xs text-inksoft/70">{T.eventDashboard.kpiInPerson}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="mx-auto max-w-[1400px] space-y-8 px-4 py-8 sm:px-8">
              <section id="overview" className="grid scroll-mt-24 grid-cols-1 gap-6 xl:grid-cols-3">
                <EventRsvpCard
                  eventId={event.id}
                  plan={plan}
                  rsvpEnabled={event.rsvpEnabled}
                  rsvpLimit={event.rsvpLimit}
                  rsvpDeadline={event.rsvpDeadline}
                  timezone={event.timezone}
                  rsvps={rsvps}
                  questions={questions}
                />
                <div className="space-y-6">
                  <EventShareCard eventId={event.id} plan={plan} appUrl={appUrl} slug={event.slug} publicUrl={publicUrl} title={event.title} />
                  <EventQrCard eventId={event.id} appUrl={appUrl} />
                </div>
              </section>

              <EventBrandingCard
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
                initialPresets={brandingPresets}
                previewTitle={event.title}
                previewMeta={previewMeta}
              />

              <section id="attachment" data-reveal className="grid scroll-mt-24 grid-cols-1 gap-6 lg:grid-cols-2">
                <EventAttachmentCard
                  eventId={event.id}
                  attachmentUrl={event.attachmentUrl}
                  attachmentName={event.attachmentName}
                  attachmentButtonLabel={event.attachmentButtonLabel}
                />
                <EventCalendarCard eventId={event.id} plan={plan} calendarId={event.calendarId} calendars={calendars} />
              </section>

              <EventIntegrationCard eventId={event.id} appUrl={appUrl} />
              <EventEmbedCard appUrl={appUrl} slugOrId={slugOrId} />
              <EventStatsCard eventId={event.id} plan={plan} stats={stats} />

              <div className="h-2" />
            </div>
      </DashboardShell>

      <EditEventDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        plan={plan}
        event={{
          id: event.id, title: event.title, description: event.description, location: event.location,
          imageUrl: event.imageUrl, organizerEmail: event.organizerEmail, startAt: event.startAt, endAt: event.endAt,
          allDay: event.allDay, isOnline: event.isOnline, rsvpEnabled: event.rsvpEnabled, timezone: event.timezone, language: event.language,
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
    </>
  );
}
