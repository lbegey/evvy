"use client";

import { QrCode, Download } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  eventId: string;
  appUrl: string;
}

export function EventQrCard({ eventId, appUrl }: Props) {
  const { T } = useLanguage();
  const pngUrl = `${appUrl}/api/events/${eventId}/qrcode?format=png`;
  const svgUrl = `${appUrl}/api/events/${eventId}/qrcode?format=svg`;

  return (
    <div data-reveal id="qr-code" className="scroll-mt-24 rounded-xl2 border border-line bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-evvy-soft text-evvy"><QrCode className="h-[18px] w-[18px]" /></span>
        <div>
          <h2 className="font-display text-lg font-bold leading-none">{T.eventDetail.qrCode.title}</h2>
          <p className="mt-1 text-xs text-inksoft">{T.eventDetail.qrCode.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pngUrl}
          alt={T.eventDetail.qrCode.title}
          width={96}
          height={96}
          className="shrink-0 rounded-xl border border-line bg-white p-2"
        />
        <div className="flex flex-col gap-2">
          <a href={pngUrl} download className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-medium transition hover:bg-paper sm:h-9 sm:px-3 sm:text-sm">
            <Download className="h-3.5 w-3.5 shrink-0" />{T.eventDetail.qrCode.downloadPng}
          </a>
          <a href={svgUrl} download className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-medium transition hover:bg-paper sm:h-9 sm:px-3 sm:text-sm">
            <Download className="h-3.5 w-3.5 shrink-0" />{T.eventDetail.qrCode.downloadSvg}
          </a>
        </div>
      </div>
    </div>
  );
}
