"use client";

import { useState } from "react";
import { AppWindow } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { CopyButton } from "./CopyButton";

interface Props {
  appUrl: string;
  slugOrId: string;
}

type Mode = "simple" | "card";

export function EventEmbedCard({ appUrl, slugOrId }: Props) {
  const { T } = useLanguage();
  const [mode, setMode] = useState<Mode>("simple");
  const host = appUrl.replace(/^https?:\/\//, "");

  const isCard = mode === "card";
  const path = isCard ? `/e/${slugOrId}/embed?mode=card` : `/e/${slugOrId}/embed`;
  const embedUrl = `${appUrl}${path}`;
  const height = isCard ? 360 : 80;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="${height}" style="border:0;" loading="lazy"></iframe>`;

  const modes: { value: Mode; label: string; hint: string }[] = [
    { value: "simple", label: T.eventDetail.integration.iframe.modeSimple, hint: T.eventDetail.integration.iframe.modeSimpleHint },
    { value: "card", label: T.eventDetail.integration.iframe.modeCard, hint: T.eventDetail.integration.iframe.modeCardHint },
  ];
  const activeHint = modes.find((m) => m.value === mode)?.hint;

  return (
    <section data-reveal id="embed" className="scroll-mt-24">
      <div className="rounded-xl2 border border-line bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-evvy-soft text-evvy"><AppWindow className="h-[18px] w-[18px]" /></span>
          <div>
            <h2 className="font-display text-lg font-bold leading-none">{T.eventDetail.integration.iframe.title}</h2>
            <p className="mt-1 text-xs text-inksoft">{T.eventDetail.integration.iframe.subtitle}</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="inline-flex rounded-lg border border-line bg-paper/60 p-0.5">
          {modes.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              aria-pressed={mode === m.value}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                mode === m.value ? "bg-white text-ink shadow-card" : "text-inksoft hover:text-ink"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        {activeHint && <p className="mt-2 text-xs text-inksoft">{activeHint}</p>}

        {/* Live preview */}
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-inksoft">{T.eventDetail.integration.iframe.preview}</p>
          <div className="overflow-hidden rounded-xl border border-line bg-paper">
            <iframe
              key={mode}
              src={path}
              title={T.eventDetail.integration.iframe.preview}
              className="w-full"
              style={{ height, border: 0 }}
              loading="lazy"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="h-10 min-w-0 flex-1 truncate rounded-lg border border-line bg-paper/60 px-3 text-sm leading-10 text-inksoft">{host}{path}</div>
          <CopyButton value={iframeCode} toast={T.common.copied}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium transition hover:bg-paper">
            {T.common.copy}
          </CopyButton>
        </div>

        <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-paper p-3 text-xs text-inksoft"><code>{iframeCode}</code></pre>
      </div>
    </section>
  );
}
