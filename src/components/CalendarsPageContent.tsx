"use client";

import { CalendarsManager, type CalendarRecord } from "@/components/CalendarsManager";
import { useLanguage } from "@/contexts/LanguageContext";

interface CalendarsPageContentProps {
  plan: string;
  calendars: CalendarRecord[];
  appUrl: string;
}

export function CalendarsPageContent({ plan, calendars, appUrl }: CalendarsPageContentProps) {
  const { T } = useLanguage();

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {T.calendars.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{T.calendars.subtitle}</p>
      </div>
      <CalendarsManager calendars={calendars} appUrl={appUrl} plan={plan} />
    </section>
  );
}
