"use client";

import { useState } from "react";
import { Code2, Copy, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { CALENDAR_SERVICES, buildEmailHTML, buildWebHTML, buildTailwindHTML } from "@/lib/eventIntegration";
import { CopyButton } from "./CopyButton";
import { EvvySwitch } from "./EvvySwitch";

type Format = "email" | "web" | "tailwind" | "links";

interface Props {
  eventId: string;
  appUrl: string;
}

export function EventIntegrationCard({ eventId, appUrl }: Props) {
  const { T } = useLanguage();
  const [format, setFormat] = useState<Format>("email");
  const [centered, setCentered] = useState(false);

  const addToCalendarText = T.eventDetail.integration.addToCalendar;
  const trackBase = `${appUrl}/api/events/${eventId}/track`;
  const sources = {
    email: buildEmailHTML(eventId, appUrl, addToCalendarText, centered),
    web: buildWebHTML(eventId, appUrl, addToCalendarText, centered),
    tailwind: buildTailwindHTML(eventId, appUrl, addToCalendarText, centered),
  } as const;
  const code = format === "links" ? "" : sources[format];

  return (
    <section data-reveal id="integration" className="scroll-mt-24">
      <div className="rounded-xl2 border border-line bg-white shadow-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-evvy-soft text-evvy"><Code2 className="h-[18px] w-[18px]" /></span>
          <div>
            <h2 className="font-display text-lg font-bold leading-none">{T.eventDetail.integration.title}</h2>
            <p className="mt-1 text-xs text-inksoft">{T.eventDetail.integration.subtitle}</p>
          </div>
          {format !== "links" && (
            <CopyButton value={code} toast={T.common.copied}
              className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg bg-evvy px-3 text-sm font-medium text-white transition hover:bg-evvy-deep">
              <Copy className="h-3.5 w-3.5" />{T.eventDetail.integration.copy}
            </CopyButton>
          )}
        </div>

        <div className="p-5">
          {/* tabs */}
          <div className="inline-flex rounded-lg border border-line bg-paper p-1 text-sm">
            {(["email", "web", "tailwind", "links"] as const).map((id) => (
              <button key={id} type="button" onClick={() => setFormat(id)}
                className={cn("rounded-md px-3 py-1.5 transition", format === id ? "bg-white font-medium text-ink shadow-card" : "text-inksoft hover:text-ink")}>
                {T.eventDetail.integration.formats[id]}
              </button>
            ))}
          </div>

          {format !== "links" ? (
            <>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span className="text-sm text-inksoft">{addToCalendarText}</span>
                <div className="flex items-center gap-2">
                  {CALENDAR_SERVICES.map((s) => (
                    <span key={s.key} className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.logo} alt={s.name} width={20} height={20} className="rounded" />
                    </span>
                  ))}
                </div>
                <label className="ml-auto flex items-center gap-2 text-sm text-inksoft">
                  <span>{T.eventDetail.integration.centered}</span>
                  <EvvySwitch checked={centered} onCheckedChange={setCentered} />
                </label>
              </div>

              <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-4 text-xs leading-relaxed text-[#c7c3ee]"><code>{code}</code></pre>
            </>
          ) : (
            <div className="mt-4 space-y-2">
              {CALENDAR_SERVICES.map((s) => {
                const trackUrl = `${trackBase}?service=${s.key}`;
                return (
                  <div key={s.key} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-paper/40 px-3 py-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.logo} alt={s.name} width={28} height={28} className="shrink-0 rounded" />
                    <span className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{s.name}</p>
                      <p className="truncate text-xs text-inksoft">{trackUrl}</p>
                    </span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <CopyButton value={trackUrl} toast={T.common.copied} title={T.common.copy}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-medium transition hover:bg-paper">
                        <Copy className="h-3 w-3" />{T.common.copy}
                      </CopyButton>
                      <a href={trackUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-2.5 text-xs font-medium transition hover:bg-paper">
                        <ExternalLink className="h-3 w-3" /><span className="hidden sm:inline">{T.eventDetail.individualLinks.open}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
