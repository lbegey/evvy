"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { assignEventToCalendar } from "@/app/actions/calendars";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EventCalendarSectionProps {
  eventId: string;
  plan: string;
  calendarId: string | null;
  calendars: { id: string; name: string; color: string | null }[];
}

export function EventCalendarSection({ eventId, plan, calendarId, calendars }: EventCalendarSectionProps) {
  const router = useRouter();
  const { T } = useLanguage();
  const [selected, setSelected] = useState(calendarId ?? "");
  const [, startTransition] = useTransition();

  if (plan !== "premium") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
        <p className="text-sm text-muted-foreground">{T.eventDetail.calendar.locked}</p>
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          {T.eventDetail.calendar.unlock}
        </Link>
      </div>
    );
  }

  const handleChange = (value: string) => {
    setSelected(value);
    startTransition(async () => {
      await assignEventToCalendar(eventId, value || null);
      router.refresh();
    });
  };

  if (calendars.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {T.eventDetail.calendar.createHint}{" "}
        <Link href="/dashboard/calendars" className="font-medium text-primary hover:underline">
          {T.eventDetail.calendar.createLink}
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className={cn(
          "w-full cursor-pointer rounded-lg border border-input bg-background px-3 py-2 text-sm",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      >
        <option value="">{T.eventDetail.calendar.none}</option>
        {calendars.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {selected && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          nativeButton={false}
          render={<Link href={`/dashboard/calendars/${selected}`} />}
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          {T.eventDetail.calendar.openCalendar}
        </Button>
      )}
    </div>
  );
}
