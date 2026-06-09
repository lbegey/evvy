"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus,
  Search, Grid3x3, List, CalendarClock, History, CalendarPlus, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { CalendarDialog, type CalendarDialogValues } from "@/components/CalendarDialog";
import { DayEventsDialog } from "@/components/DayEventsDialog";
import { EventListView } from "@/components/EventListView";
import { createEvent } from "@/app/actions/events";
import { createCalendar, assignEventToCalendar } from "@/app/actions/calendars";
import { setUserDashboardView } from "@/app/actions/user";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type ViewMode = "calendar" | "all" | "upcoming" | "past";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: string;
  endAt: string;
  timezone: string;
  calendarId: string | null;
  slug: string | null;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  calendars: { id: string; name: string }[];
  plan: string;
  initialYear?: number;
  initialMonth?: number;
  initialViewMode?: string | null;
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const days: { date: Date; isCurrentMonth: boolean }[] = [];
  for (let i = startOffset; i > 0; i--)
    days.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false });
  for (let d = 1; d <= daysInMonth; d++)
    days.push({ date: new Date(year, month, d), isCurrentMonth: true });
  while (days.length < 42)
    days.push({
      date: new Date(year, month + 1, days.length - startOffset - daysInMonth + 1),
      isCurrentMonth: false,
    });
  return days;
}

function dateStrInTz(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
}

function cellDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function eventSpansDate(e: CalendarEvent, cellStr: string): boolean {
  const startStr = dateStrInTz(new Date(e.startAt), e.timezone);
  const endStr = dateStrInTz(new Date(e.endAt), e.timezone);
  return cellStr >= startStr && cellStr <= endStr;
}

const VIEW_MODE_IDS: ViewMode[] = ["calendar", "all", "upcoming", "past"];

export function CalendarView({ events, calendars, plan, initialYear, initialMonth, initialViewMode }: CalendarViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { T } = useLanguage();
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date();

  const eventTimezones = [...new Set(events.map((e) => e.timezone))].sort();
  const [filterTz, setFilterTz] = useState<string>("all");

  const [current, setCurrent] = useState(
    new Date(initialYear ?? today.getFullYear(), initialMonth ?? today.getMonth(), 1)
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [isPending, startTransition] = useTransition();
  const [dayEventsOpen, setDayEventsOpen] = useState(false);
  const [dayEventsDate, setDayEventsDate] = useState<Date | null>(null);
  const [dayEventsList, setDayEventsList] = useState<CalendarEvent[]>([]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
  const [calendarCreateError, setCalendarCreateError] = useState<string | null>(null);
  const [isCreatingCalendar, startCreateCalendar] = useTransition();

  const savedViewMode: ViewMode = (VIEW_MODE_IDS as string[]).includes(initialViewMode ?? "")
    ? (initialViewMode as ViewMode)
    : "calendar";

  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    const viewParam = searchParams.get("view");
    return (VIEW_MODE_IDS as string[]).includes(viewParam ?? "")
      ? (viewParam as ViewMode)
      : savedViewMode;
  });

  const [calendarFilter, setCalendarFilterState] = useState<string>(() => {
    const calendarParam = searchParams.get("calendar");
    return calendarParam === "none" || calendars.some((c) => c.id === calendarParam)
      ? calendarParam!
      : "all";
  });

  const setViewMode = (mode: ViewMode) => {
    if (mode === viewMode) return;
    setViewModeState(mode);
    const params = new URLSearchParams(window.location.search);
    if (mode === "calendar") params.delete("view");
    else params.set("view", mode);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/dashboard?${qs}` : "/dashboard");
    if (mode !== savedViewMode) setUserDashboardView(mode).catch(() => {});
  };

  const setCalendarFilter = (value: string) => {
    setCalendarFilterState(value);
    const params = new URLSearchParams(window.location.search);
    if (value === "all") params.delete("calendar");
    else params.set("calendar", value);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/dashboard?${qs}` : "/dashboard");
  };

  const year = current.getFullYear();
  const month = current.getMonth();
  const days = getCalendarDays(year, month);
  const todayStr = dateStrInTz(today, browserTz);
  const isCurrentPeriod =
    year === today.getFullYear() && month === today.getMonth();

  const calendarFilteredEvents =
    calendarFilter === "all"
      ? events
      : calendarFilter === "none"
        ? events.filter((e) => !e.calendarId)
        : events.filter((e) => e.calendarId === calendarFilter);

  const visibleEvents =
    filterTz === "all" ? calendarFilteredEvents : calendarFilteredEvents.filter((e) => e.timezone === filterTz);

  const searchedEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visibleEvents;
    return visibleEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.location?.toLowerCase().includes(q) ?? false)
    );
  }, [visibleEvents, search]);

  const nowMs = today.getTime();
  const sortedAll = useMemo(
    () =>
      [...searchedEvents].sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      ),
    [searchedEvents]
  );
  const upcomingEvents = useMemo(
    () =>
      sortedAll.filter((e) => new Date(e.endAt).getTime() >= nowMs),
    [sortedAll, nowMs]
  );
  const pastEvents = useMemo(
    () =>
      [...searchedEvents]
        .filter((e) => new Date(e.endAt).getTime() < nowMs)
        .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()),
    [searchedEvents, nowMs]
  );

  const VIEW_MODES: { id: ViewMode; label: string; icon: typeof Grid3x3 }[] = [
    { id: "calendar", label: T.calendar.viewModes.calendar, icon: Grid3x3 },
    { id: "all", label: T.calendar.viewModes.all, icon: List },
    { id: "upcoming", label: T.calendar.viewModes.upcoming, icon: CalendarClock },
    { id: "past", label: T.calendar.viewModes.past, icon: History },
  ];

  const openDialog = (date: Date) => {
    setSelectedDate(date);
    setCreateError(null);
    setDialogOpen(true);
  };

  const openDayEvents = (date: Date, dayEvents: CalendarEvent[]) => {
    setDayEventsDate(date);
    setDayEventsList(dayEvents);
    setDayEventsOpen(true);
  };

  const handleCreate = async (data: {
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
    setCreateError(null);
    startTransition(async () => {
      const result = await createEvent(data);
      if ("error" in result) {
        setCreateError(T.eventForm.errors.limitReached);
        return;
      }
      if (data.calendarId) {
        await assignEventToCalendar(result.id, data.calendarId);
      }
      setDialogOpen(false);
      router.push(`/dashboard/events/${result.id}`);
    });
  };

  const handleCreateCalendar = async (data: CalendarDialogValues) => {
    setCalendarCreateError(null);
    startCreateCalendar(async () => {
      const result = await createCalendar(data);
      if ("error" in result) {
        setCalendarCreateError(T.calendars.locked);
        return;
      }
      setCalendarDialogOpen(false);
      router.push(`/dashboard/calendars/${result.id}`);
    });
  };

  const resetFilters = () => {
    setSearch("");
    setFilterTz("all");
    setCalendarFilterState("all");
    window.history.replaceState(null, "", "/dashboard");
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Row 1: tabs + action buttons */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/20 p-0.5">
          {VIEW_MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setViewMode(id)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors sm:px-3",
                viewMode === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {plan === "premium" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs sm:text-sm"
              onClick={() => { setCalendarCreateError(null); setCalendarDialogOpen(true); }}
            >
              <CalendarPlus className="h-4 w-4" />
              <span className="hidden sm:inline">{T.calendar.newCalendar}</span>
            </Button>
          )}
          <Button size="sm" className="gap-1.5 text-xs sm:text-sm" onClick={() => openDialog(today)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{T.calendar.newEvent}</span>
          </Button>
        </div>
      </div>

      {/* Row 2: title/nav (left) + search+reset (right) */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: title + calendar nav */}
        <div className="flex min-w-0 items-center gap-1">
          {viewMode === "calendar" ? (
            <>
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon-sm" onClick={() => setCurrent(new Date(year - 1, month, 1))} aria-label={T.calendar.prevYear}>
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setCurrent(new Date(year, month - 1, 1))} aria-label={T.calendar.prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              <h1 className="min-w-[112px] text-center text-sm font-semibold tracking-tight sm:min-w-[128px] sm:text-base">
                {T.calendar.months[month]}{" "}
                <span className="text-muted-foreground">{year}</span>
              </h1>
              <div className="flex items-center gap-0.5">
                <Button variant="ghost" size="icon-sm" onClick={() => setCurrent(new Date(year, month + 1, 1))} aria-label={T.calendar.nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setCurrent(new Date(year + 1, month, 1))} aria-label={T.calendar.nextYear}>
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
              {!isCurrentPeriod && (
                <Button variant="outline" size="sm" onClick={() => setCurrent(new Date(today.getFullYear(), today.getMonth(), 1))} className="ml-1 text-xs">
                  {T.calendar.today}
                </Button>
              )}
            </>
          ) : (
            <h1 className="text-sm font-semibold tracking-tight sm:text-base">
              {T.calendar.viewModes[viewMode]}
            </h1>
          )}
        </div>

        {/* Right: search + reset */}
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={T.calendar.searchPlaceholder}
              className="w-28 pl-8 text-xs sm:w-40"
            />
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={resetFilters}
            aria-label={T.calendar.resetFilters}
            title={T.calendar.resetFilters}
            className="shrink-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Row 3: filters (only when relevant) */}
      {(calendars.length > 0 || eventTimezones.length > 0) && (
        <div className="flex flex-wrap items-center gap-1.5">
          {calendars.length > 0 && (
            <select
              value={calendarFilter}
              onChange={(e) => setCalendarFilter(e.target.value)}
              className={cn(
                "cursor-pointer rounded-lg border border-border/60 bg-muted/30 px-2 py-1",
                "text-xs text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
                calendarFilter !== "all" && "border-primary/40 bg-primary/5 text-primary"
              )}
            >
              <option value="all">{T.calendar.calendarFilter.all}</option>
              <option value="none">{T.calendar.calendarFilter.none}</option>
              {calendars.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {eventTimezones.length > 0 && (
            <select
              value={filterTz}
              onChange={(e) => setFilterTz(e.target.value)}
              className={cn(
                "cursor-pointer rounded-lg border border-border/60 bg-muted/30 px-2 py-1",
                "text-xs text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
                filterTz !== "all" && "border-primary/40 bg-primary/5 text-primary"
              )}
            >
              <option value="all">{T.calendar.allTimezones}</option>
              {eventTimezones.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {viewMode !== "calendar" && (
        <EventListView
          events={
            viewMode === "all"
              ? sortedAll
              : viewMode === "upcoming"
              ? upcomingEvents
              : pastEvents
          }
          emptyMessage={
            viewMode === "all"
              ? T.calendar.noEventsAll
              : viewMode === "upcoming"
              ? T.calendar.noEventsUpcoming
              : T.calendar.noEventsPast
          }
          plan={plan}
        />
      )}

      {viewMode === "calendar" && (
        <>
      {/* Grid (desktop) */}
      <div className="hidden overflow-hidden rounded-xl border border-border/60 sm:block">
        <div className="grid grid-cols-7 border-b border-border/60 bg-muted/30">
          {T.calendar.weekdays.map((d) => (
            <div
              key={d}
              className="py-2.5 text-center text-xs font-medium text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map(({ date, isCurrentMonth }, i) => {
            const cellStr = cellDateStr(date);
            const dayEvents = searchedEvents.filter((e) => eventSpansDate(e, cellStr));
            const isToday = cellStr === todayStr;
            const isLastRow = i >= 35;
            const isLastCol = (i + 1) % 7 === 0;

            return (
              <div
                key={i}
                onClick={() => openDialog(date)}
                className={cn(
                  "group min-h-[90px] cursor-pointer p-2 transition-colors",
                  "border-b border-r border-border/60",
                  isLastRow && "border-b-0",
                  isLastCol && "border-r-0",
                  isCurrentMonth
                    ? "bg-background hover:bg-muted/20"
                    : "bg-muted/10"
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                    isToday
                      ? "bg-primary font-bold text-primary-foreground"
                      : isCurrentMonth
                      ? "font-medium text-foreground"
                      : "text-muted-foreground/40"
                  )}
                >
                  {date.getDate()}
                </span>

                <div className="mt-0.5 space-y-0.5">
                  {dayEvents.slice(0, 2).map((ev) => {
                    const evStartStr = dateStrInTz(new Date(ev.startAt), ev.timezone);
                    const evEndStr = dateStrInTz(new Date(ev.endAt), ev.timezone);
                    const isMultiDay = evStartStr !== evEndStr;
                    const isStart = cellStr === evStartStr;
                    const isEnd = cellStr === evEndStr;
                    return (
                      <Link
                        key={ev.id}
                        href={`/dashboard/events/${ev.id}`}
                        onClick={(e) => e.stopPropagation()}
                        title={ev.title}
                        className={cn(
                          "block truncate px-1 py-0.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
                          isMultiDay
                            ? cn(
                                "-mx-2 px-2",
                                isStart ? "rounded-l" : "rounded-l-none",
                                isEnd ? "rounded-r" : "rounded-r-none"
                              )
                            : "rounded"
                        )}
                      >
                        {isMultiDay && !isStart ? "··· " : ""}
                        {ev.title}
                      </Link>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDayEvents(date, dayEvents);
                      }}
                      className="block w-full cursor-pointer rounded px-1 py-0.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    >
                      +{dayEvents.length - 2} {T.calendar.moreEvents}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agenda / column view (mobile) */}
      <div className="space-y-2 sm:hidden">
        {days
          .filter((d) => d.isCurrentMonth)
          .map(({ date }) => {
            const cellStr = cellDateStr(date);
            const dayEvents = searchedEvents.filter((e) => eventSpansDate(e, cellStr));
            const isToday = cellStr === todayStr;
            const weekdayLabel = T.calendar.weekdays[(date.getDay() + 6) % 7];

            return (
              <div
                key={cellStr}
                onClick={() => openDialog(date)}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors",
                  isToday
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/60 bg-background hover:bg-muted/20"
                )}
              >
                <div className="flex w-11 shrink-0 flex-col items-center justify-center">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    )}
                  >
                    {date.getDate()}
                  </span>
                  <span className="mt-0.5 text-[10px] uppercase text-muted-foreground">
                    {weekdayLabel}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-1 border-l border-border/60 pl-3">
                  {dayEvents.length === 0 ? (
                    <p className="py-1.5 text-xs text-muted-foreground/50">
                      {T.calendar.noEvents}
                    </p>
                  ) : (
                    <>
                      {dayEvents.slice(0, 3).map((ev) => {
                        const evStartStr = dateStrInTz(new Date(ev.startAt), ev.timezone);
                        const isContinuation = cellStr !== evStartStr;
                        return (
                          <Link
                            key={ev.id}
                            href={`/dashboard/events/${ev.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="block truncate rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                          >
                            {isContinuation ? "··· " : ""}
                            {ev.title}
                          </Link>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDayEvents(date, dayEvents);
                          }}
                          className="cursor-pointer px-2 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        >
                          +{dayEvents.length - 3} {T.calendar.moreEvents}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
      </div>
        </>
      )}

      <CreateEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultDate={selectedDate}
        defaultTimezone={browserTz}
        calendars={calendars}
        defaultCalendarId={calendarFilter !== "all" && calendarFilter !== "none" ? calendarFilter : null}
        onSubmit={handleCreate}
        isPending={isPending}
        error={createError}
      />

      <DayEventsDialog
        open={dayEventsOpen}
        onOpenChange={setDayEventsOpen}
        date={dayEventsDate}
        events={dayEventsList}
      />

      <CalendarDialog
        open={calendarDialogOpen}
        onOpenChange={setCalendarDialogOpen}
        onSubmit={handleCreateCalendar}
        isPending={isCreatingCalendar}
        error={calendarCreateError}
      />
    </div>
  );
}
