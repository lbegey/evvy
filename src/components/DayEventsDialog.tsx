"use client";

import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { X, Clock, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/components/CalendarView";

interface DayEventsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  events: CalendarEvent[];
}

export function DayEventsDialog({ open, onOpenChange, date, events }: DayEventsDialogProps) {
  const { T, lang } = useLanguage();

  const title = date
    ? new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date)
    : "";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
            "border border-border/60 bg-background p-6 shadow-xl",
            "transition-[transform,opacity] duration-200 overflow-y-auto max-h-[85vh]",
            "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
            "data-[ending-style]:opacity-0 data-[ending-style]:scale-95"
          )}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <Dialog.Title className="text-base font-semibold capitalize text-foreground">
              {title}
            </Dialog.Title>
            <Dialog.Close className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {events.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{T.calendar.noEvents}</p>
          ) : (
            <div className="space-y-2">
              {events.map((ev) => {
                const start = new Date(ev.startAt);
                const end = new Date(ev.endAt);
                const locale = lang === "fr" ? "fr-FR" : "en-US";
                const time = new Intl.DateTimeFormat(locale, {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: ev.timezone,
                }).format(start);
                const endTime = new Intl.DateTimeFormat(locale, {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: ev.timezone,
                }).format(end);
                const dayKeyFmt = new Intl.DateTimeFormat("en-CA", {
                  timeZone: ev.timezone, year: "numeric", month: "2-digit", day: "2-digit",
                });
                const isMultiDay = dayKeyFmt.format(start) !== dayKeyFmt.format(end);
                const fullDateTimeFmt = new Intl.DateTimeFormat(locale, {
                  timeZone: ev.timezone, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                });

                return (
                  <Link
                    key={ev.id}
                    href={`/dashboard/events/${ev.id}`}
                    className="block rounded-lg border border-border/60 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-muted/30"
                  >
                    <p className="truncate text-sm font-medium text-foreground">{ev.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" />
                        {isMultiDay
                          ? `${fullDateTimeFmt.format(start)} → ${fullDateTimeFmt.format(end)}`
                          : `${time} – ${endTime}`}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
