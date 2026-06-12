"use client";

import { CalendarsManager, type CalendarRecord } from "@/components/CalendarsManager";
import { DashboardPageHeader } from "@/components/event-dashboard/DashboardPageHeader";

interface CalendarsPageContentProps {
  plan: string;
  calendars: CalendarRecord[];
  appUrl: string;
}

export function CalendarsPageContent({ plan, calendars, appUrl }: CalendarsPageContentProps) {
  return (
    <>
      <DashboardPageHeader variant="calendars" />
      <section className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8">
        <CalendarsManager calendars={calendars} appUrl={appUrl} plan={plan} />
      </section>
    </>
  );
}
