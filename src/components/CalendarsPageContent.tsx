"use client";

import Link from "next/link";
import { CalendarsManager, type CalendarRecord } from "@/components/CalendarsManager";
import { useLanguage } from "@/contexts/LanguageContext";

interface CalendarsPageContentProps {
  unlocked: boolean;
  calendars: CalendarRecord[];
  appUrl: string;
}

export function CalendarsPageContent({ unlocked, calendars, appUrl }: CalendarsPageContentProps) {
  const { T } = useLanguage();

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {T.calendars.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{T.calendars.subtitle}</p>
      </div>

      {unlocked ? (
        <CalendarsManager calendars={calendars} appUrl={appUrl} />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-5">
          <p className="text-sm text-muted-foreground">{T.calendars.locked}</p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            {T.calendars.unlock}
          </Link>
        </div>
      )}
    </section>
  );
}
