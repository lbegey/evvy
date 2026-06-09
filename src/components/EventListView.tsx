"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarX2, Copy, Check, Trash2 } from "lucide-react";
import type { CalendarEvent } from "@/components/CalendarView";
import { deleteEvent } from "@/app/actions/events";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface EventListViewProps {
  events: CalendarEvent[];
  emptyMessage: string;
  plan: string;
}

export function EventListView({ events, emptyMessage, plan }: EventListViewProps) {
  const router = useRouter();
  const { lang, T } = useLanguage();
  const locale = lang === "fr" ? "fr-FR" : "en-US";
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startDelete] = useTransition();

  const handleCopy = (ev: CalendarEvent) => {
    const url = `${window.location.origin}/e/${ev.slug ?? ev.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(ev.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDelete = (ev: CalendarEvent) => {
    if (!confirm(T.eventDetail.confirmDelete)) return;
    setDeletingId(ev.id);
    startDelete(async () => {
      await deleteEvent(ev.id);
      setDeletingId(null);
      router.refresh();
    });
  };

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
        const isDeleting = deletingId === ev.id;

        return (
          <div
            key={ev.id}
            className="group relative flex items-center gap-3 rounded-xl border border-border/60 bg-background p-3 transition-colors hover:bg-muted/20"
          >
            <Link
              href={`/dashboard/events/${ev.id}`}
              className="absolute inset-0 z-10 rounded-xl"
              aria-label={ev.title}
            />
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
            <div className="relative z-20 flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleCopy(ev)}
                aria-label={copiedId === ev.id ? T.common.copied : T.common.copyUrl}
                title={copiedId === ev.id ? T.common.copied : T.common.copyUrl}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg border border-border/60 p-2 transition-colors",
                  copiedId === ev.id
                    ? "border-green-500/40 bg-green-50 text-green-700"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {copiedId === ev.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              {plan === "premium" && (
                <button
                  type="button"
                  onClick={() => handleDelete(ev)}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                  aria-label={T.eventDetail.delete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
