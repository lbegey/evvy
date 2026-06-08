"use client";

import Link from "next/link";
import { CalendarX2 } from "lucide-react";
import type { CalendarEvent } from "@/components/CalendarView";
import { useLanguage } from "@/contexts/LanguageContext";

interface EventListViewProps {
  events: CalendarEvent[];
  emptyMessage: string;
}

export function EventListView({ events, emptyMessage }: EventListViewProps) {
  const { lang } = useLanguage();
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-14 text-center">
        <CalendarX2 className="h-6 w-6 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((ev) => {
        const start = new Date(ev.startAt);
        const end = new Date(ev.endAt);
        const day = new Intl.DateTimeFormat(locale, { timeZone: ev.timezone, day: "2-digit" }).format(start);
        const month = new Intl.DateTimeFormat(locale, { timeZone: ev.timezone, month: "short" }).format(start).toUpperCase();
        const time = new Intl.DateTimeFormat(locale, {
          timeZone: ev.timezone, hour: "2-digit", minute: "2-digit",
        }).format(start);
        const dateLabel = new Intl.DateTimeFormat(locale, {
          timeZone: ev.timezone, weekday: "short", day: "numeric", month: "short", year: "numeric",
        }).format(start);
        const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: ev.timezone, year: "numeric", month: "2-digit", day: "2-digit" });
        const isMultiDay = dayKeyFmt.format(start) !== dayKeyFmt.format(end);
        const fullDateTimeFmt = new Intl.DateTimeFormat(locale, {
          timeZone: ev.timezone, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        });
        const rangeLabel = isMultiDay
          ? `${fullDateTimeFmt.format(start)} → ${fullDateTimeFmt.format(end)}`
          : `${dateLabel} · ${time}`;

        return (
          <Link
            key={ev.id}
            href={`/dashboard/events/${ev.id}`}
            className="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-3 transition-colors hover:bg-muted/20"
          >
            <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-muted/50 py-1.5">
              <span className="text-[10px] font-medium uppercase text-muted-foreground">{month}</span>
              <span className="text-base font-bold leading-none text-foreground">{day}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{ev.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {rangeLabel}
                {ev.location ? ` · ${ev.location}` : ""}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
