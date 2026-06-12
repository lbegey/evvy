"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarRange, ArrowUpRight } from "lucide-react";
import { assignEventToCalendar } from "@/app/actions/calendars";
import { useLanguage } from "@/contexts/LanguageContext";
import { LockedNotice } from "./LockedNotice";

interface Props {
  eventId: string;
  plan: string;
  calendarId: string | null;
  calendars: { id: string; name: string; color: string | null }[];
}

export function EventCalendarCard({ eventId, plan, calendarId, calendars }: Props) {
  const router = useRouter();
  const { T } = useLanguage();
  const [selected, setSelected] = useState(calendarId ?? "");
  const [, startTransition] = useTransition();

  const handleChange = (value: string) => {
    setSelected(value);
    startTransition(async () => { await assignEventToCalendar(eventId, value || null); router.refresh(); });
  };

  return (
    <div id="calendar" className="scroll-mt-24 rounded-xl2 border border-line bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-evvy-soft text-evvy"><CalendarRange className="h-[18px] w-[18px]" /></span>
        <div>
          <h2 className="font-display text-base font-bold leading-none">{T.eventDetail.calendar.title}</h2>
          <p className="mt-1 text-xs text-inksoft">{T.eventDetail.calendar.subtitle}</p>
        </div>
      </div>

      {plan !== "premium" ? (
        <LockedNotice message={T.eventDetail.calendar.locked} unlock={T.eventDetail.calendar.unlock} />
      ) : calendars.length === 0 ? (
        <p className="text-sm text-inksoft">
          {T.eventDetail.calendar.createHint}{" "}
          <Link href="/dashboard/calendars" className="font-medium text-evvy hover:underline">{T.eventDetail.calendar.createLink}</Link>
        </p>
      ) : (
        <div className="space-y-2">
          <label className="text-xs font-medium text-inksoft">{T.eventDetail.calendar.select}</label>
          <select
            value={selected}
            onChange={(e) => handleChange(e.target.value)}
            className="h-10 w-full cursor-pointer rounded-lg border border-line bg-white px-3 text-sm focus:border-evvy focus:outline-none focus:ring-2 focus:ring-evvy/30"
          >
            <option value="">{T.eventDetail.calendar.none}</option>
            {calendars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {selected && (
            <Link href={`/dashboard/calendars/${selected}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium transition hover:bg-paper">
              <ArrowUpRight className="h-3.5 w-3.5" />{T.eventDetail.calendar.openCalendar}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
