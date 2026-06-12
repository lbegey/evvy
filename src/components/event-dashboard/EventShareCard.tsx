"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Link2 } from "lucide-react";
import { updateEventSlug } from "@/app/actions/events";
import { useLanguage } from "@/contexts/LanguageContext";
import { CopyButton } from "./CopyButton";
import { LockedNotice } from "./LockedNotice";

interface Props {
  eventId: string;
  plan: string;
  appUrl: string;
  slug: string | null;
  publicUrl: string;
  title: string;
}

export function EventShareCard({ eventId, plan, appUrl, slug, publicUrl, title }: Props) {
  const router = useRouter();
  const { T } = useLanguage();
  const [value, setValue] = useState(slug ?? "");
  const [error, setError] = useState<"invalid" | "taken" | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const host = appUrl.replace(/^https?:\/\//, "");
  const encodedUrl = encodeURIComponent(publicUrl);
  const encodedTitle = encodeURIComponent(title);

  const persistSlug = () => {
    const trimmed = value.trim().toLowerCase();
    setValue(trimmed);
    setError(null);
    setSaved(false);
    if (trimmed === (slug ?? "")) return;
    startTransition(async () => {
      const result = await updateEventSlug(eventId, trimmed || null);
      if (result && "error" in result) {
        if (result.error === "invalid" || result.error === "taken") setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <div data-reveal id="public-link" className="scroll-mt-24 rounded-xl2 border border-line bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-evvy-soft text-evvy"><Link2 className="h-[18px] w-[18px]" /></span>
        <div>
          <h2 className="font-display text-lg font-bold leading-none">{T.eventDashboard.shareTitle}</h2>
          <p className="mt-1 text-xs text-inksoft">{T.eventDashboard.shareSubtitle}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="h-10 min-w-0 flex-1 truncate rounded-lg border border-line bg-paper/60 px-3 text-sm leading-10 text-inksoft">{host}/e/{slug || eventId}</div>
        <CopyButton
          value={publicUrl}
          toast={T.common.copied}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-evvy px-3 text-sm font-medium text-white transition hover:bg-evvy-deep"
        >
          {T.common.copy}
        </CopyButton>
      </div>

      {/* custom url (premium) */}
      <div className="mt-4">
        <label className="text-xs font-medium text-inksoft">{T.eventDetail.slug.title}</label>
        {plan === "premium" ? (
          <>
            <div className="mt-1.5 flex items-center overflow-hidden rounded-lg border border-line focus-within:border-evvy focus-within:ring-2 focus-within:ring-evvy/30">
              <span className="whitespace-nowrap pl-3 pr-1 text-sm text-inksoft/60">{host}/e/</span>
              <input
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(null); setSaved(false); }}
                onBlur={persistSlug}
                disabled={isPending}
                placeholder={eventId}
                className="h-10 min-w-0 flex-1 bg-transparent pr-3 text-sm font-medium focus:outline-none"
              />
            </div>
            {error === "invalid" && <p className="mt-1 text-xs text-coral">{T.eventDetail.slug.errors.invalid}</p>}
            {error === "taken" && <p className="mt-1 text-xs text-coral">{T.eventDetail.slug.errors.taken}</p>}
            {saved && !error && <p className="mt-1 text-xs text-evvy">{T.eventDetail.slug.saved}</p>}
          </>
        ) : (
          <div className="mt-1.5"><LockedNotice message={T.eventDetail.slug.locked} unlock={T.eventDetail.slug.unlock} /></div>
        )}
      </div>

      {/* socials */}
      <div className="mt-4 flex items-center gap-2">
        <span className="mr-1 text-xs text-inksoft">{T.eventDashboard.broadcast}</span>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" title="Facebook"
          className="grid h-9 w-9 place-items-center rounded-lg border border-line transition hover:bg-paper">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#1877F2"><path d="M16 8a8 8 0 1 0-9.25 7.9V10.3H4.7V8h2.05V6.2c0-2 1.2-3.14 3.04-3.14.88 0 1.8.16 1.8.16v1.98h-1.01c-1 0-1.31.62-1.31 1.26V8h2.23l-.36 2.3H9.27v5.6A8 8 0 0 0 16 8z"/></svg>
        </a>
        <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" title="X"
          className="grid h-9 w-9 place-items-center rounded-lg border border-line transition hover:bg-paper">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="#111"><path d="M9.5 6.8 15 .5h-1.3L8.9 6 5.1.5H.5L6.3 9 .5 15.5h1.3L6.9 9.6l3.9 5.9h4.6L9.5 6.8zm-1.8 2 -.6-.9L2.3 1.5h2l3.6 5.2.6.9 4.8 6.9h-2L7.7 8.8z"/></svg>
        </a>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" title="LinkedIn"
          className="grid h-9 w-9 place-items-center rounded-lg border border-line transition hover:bg-paper">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="#0A66C2"><path d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM5 13H3V6h2v7zM4 5a1.2 1.2 0 1 1 0-2.4A1.2 1.2 0 0 1 4 5zm9 8h-2V9.4c0-.9-.3-1.5-1.1-1.5-.6 0-1 .4-1.1.9 0 .2-.05.4-.05.6V13H6.8s.03-6.3 0-7h2v1c.27-.43.75-1 1.85-1 1.35 0 2.35.9 2.35 2.8V13z"/></svg>
        </a>
        <a href="#qr-code" className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium transition hover:bg-paper">QR ▾</a>
      </div>
    </div>
  );
}
