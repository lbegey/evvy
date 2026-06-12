"use client";

import { CalendarDays, CalendarRange } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Evvy header band (white, grid texture, gradient icon, title + subtitle) used
 * at the top of the list dashboard pages, matching the detail-page headers.
 */
export function DashboardPageHeader({ variant }: { variant: "events" | "calendars" }) {
  const { T } = useLanguage();

  const { Icon, title, subtitle } =
    variant === "events"
      ? { Icon: CalendarDays, title: T.eventDashboard.homeTitle, subtitle: T.eventDashboard.homeSubtitle }
      : { Icon: CalendarRange, title: T.calendars.title, subtitle: T.calendars.subtitle };

  return (
    <div className="relative overflow-hidden border-b border-line bg-white">
      <div className="grid-texture pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-6 sm:px-8 lg:py-8">
        <div className="hidden h-14 w-14 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-evvy to-coral text-white shadow-pop sm:grid">
          <Icon className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-inksoft">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
