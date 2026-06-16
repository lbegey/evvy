"use client";

import { AppWindow } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CopyButton } from "./CopyButton";

interface Props {
  appUrl: string;
  slugOrId: string;
}

export function CalendarEmbedCard({ appUrl, slugOrId }: Props) {
  const { T } = useLanguage();
  const host = appUrl.replace(/^https?:\/\//, "");
  const path = `/c/${slugOrId}/embed`;
  const embedUrl = `${appUrl}${path}`;
  const height = 420;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="${height}" style="border:0;" loading="lazy"></iframe>`;

  return (
    <section data-reveal id="embed" className="scroll-mt-24">
      <div className="rounded-xl2 border border-line bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-evvy-soft text-evvy"><AppWindow className="h-[18px] w-[18px]" /></span>
          <div>
            <h2 className="font-display text-lg font-bold leading-none">{T.calendarDetail.embed.title}</h2>
            <p className="mt-1 text-xs text-inksoft">{T.calendarDetail.embed.subtitle}</p>
          </div>
        </div>

        {/* Live preview */}
        <div className="mt-1">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-inksoft">{T.eventDetail.integration.iframe.preview}</p>
          <div className="overflow-hidden rounded-xl border border-line bg-paper">
            <iframe
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
          <CopyButton value={embedUrl} toast={T.common.copied}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium transition hover:bg-paper">
            {T.common.copy}
          </CopyButton>
        </div>

        <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-paper p-3 text-xs text-inksoft"><code>{iframeCode}</code></pre>
      </div>
    </section>
  );
}
