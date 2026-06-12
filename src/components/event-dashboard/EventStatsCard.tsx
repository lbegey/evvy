"use client";

import { useEffect, useState } from "react";
import { BarChart2, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LockedNotice } from "./LockedNotice";

interface Stats {
  page: number;
  qr: number;
  google: number;
  apple: number;
  outlook: number;
  office365: number;
  yahoo: number;
}

interface Props {
  eventId: string;
  plan: string;
  stats: Stats;
}

const SERVICE_BARS = [
  { key: "google",    name: "Google Calendar", color: "#4285F4" },
  { key: "apple",     name: "Apple Calendar",  color: "#1A1838" },
  { key: "outlook",   name: "Outlook.com",     color: "#0078D4" },
  { key: "office365", name: "Office 365",      color: "#D83B01" },
  { key: "yahoo",     name: "Yahoo Calendar",  color: "#6001D2" },
] as const;

export function EventStatsCard({ eventId, plan, stats }: Props) {
  const { T } = useLanguage();
  const [animate, setAnimate] = useState(false);
  const totalClicks = stats.google + stats.apple + stats.outlook + stats.office365 + stats.yahoo;
  const max = Math.max(1, ...SERVICE_BARS.map((s) => stats[s.key]));

  useEffect(() => {
    const id = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(id);
  }, []);

  return (
    <section data-reveal id="stats" className="scroll-mt-24">
      <div className="rounded-xl2 border border-line bg-white shadow-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-evvy-soft text-evvy"><BarChart2 className="h-[18px] w-[18px]" /></span>
          <div>
            <h2 className="font-display text-lg font-bold leading-none">{T.eventDetail.stats.title}</h2>
            <p className="mt-1 text-xs text-inksoft">{T.eventDashboard.statsSubtitle}</p>
          </div>
          {plan === "premium" && (
            <a href={`/api/events/${eventId}/stats/export`} download
              className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium transition hover:bg-paper">
              <Download className="h-3.5 w-3.5" />{T.eventDetail.stats.exportCsv}
            </a>
          )}
        </div>

        {plan !== "premium" ? (
          <div className="p-5"><LockedNotice message={T.eventDetail.stats.locked} unlock={T.eventDetail.stats.unlock} /></div>
        ) : (
          <div className="grid gap-6 p-5 lg:grid-cols-3">
            <div className="grid grid-cols-3 gap-3 lg:col-span-1 lg:grid-cols-1">
              <div className="rounded-xl2 border border-line p-4"><p className="text-xs text-inksoft">{T.eventDetail.stats.pageViews}</p><p className="mt-1 font-display text-3xl font-bold">{stats.page}</p></div>
              <div className="rounded-xl2 border border-line p-4"><p className="text-xs text-inksoft">{T.eventDetail.stats.calendarClicks}</p><p className="mt-1 font-display text-3xl font-bold text-evvy">{totalClicks}</p></div>
              <div className="rounded-xl2 border border-line p-4"><p className="text-xs text-inksoft">{T.eventDetail.stats.qrScans}</p><p className="mt-1 font-display text-3xl font-bold">{stats.qr}</p></div>
            </div>

            <div className="lg:col-span-2">
              <p className="mb-3 text-xs font-medium text-inksoft">{T.eventDashboard.statsBreakdown(totalClicks)}</p>
              <div className="space-y-3">
                {SERVICE_BARS.map((s) => {
                  const n = stats[s.key];
                  return (
                    <div key={s.key} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-sm text-inksoft">{s.name}</span>
                      <div className="h-7 flex-1 overflow-hidden rounded-lg bg-paper">
                        <div className="h-full rounded-lg transition-all duration-700 ease-out" style={{ width: animate ? `${(n / max) * 100}%` : "0%", background: s.color }} />
                      </div>
                      <span className="w-6 text-right text-sm font-semibold tabular-nums">{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
