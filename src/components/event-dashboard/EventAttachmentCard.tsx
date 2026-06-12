"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Paperclip } from "lucide-react";
import { AttachmentDropzone } from "@/components/AttachmentDropzone";
import { updateEventAttachment } from "@/app/actions/events";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  eventId: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentButtonLabel: string | null;
}

export function EventAttachmentCard({ eventId, attachmentUrl, attachmentName, attachmentButtonLabel }: Props) {
  const router = useRouter();
  const { T } = useLanguage();
  const [url, setUrl] = useState(attachmentUrl ?? "");
  const [name, setName] = useState(attachmentName ?? "");
  const [label, setLabel] = useState(attachmentButtonLabel ?? "");
  const [, startTransition] = useTransition();

  const handleFileChange = (newUrl: string, newName: string) => {
    setUrl(newUrl);
    setName(newName);
    startTransition(async () => {
      await updateEventAttachment(eventId, { attachmentUrl: newUrl || null, attachmentName: newName || null, attachmentButtonLabel: label || null });
      router.refresh();
    });
  };

  const handleLabelBlur = () => {
    startTransition(async () => {
      await updateEventAttachment(eventId, { attachmentUrl: url || null, attachmentName: name || null, attachmentButtonLabel: label || null });
      router.refresh();
    });
  };

  return (
    <div className="rounded-xl2 border border-line bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-evvy-soft text-evvy"><Paperclip className="h-[18px] w-[18px]" /></span>
        <div>
          <h2 className="font-display text-base font-bold leading-none">{T.eventForm.attachment}</h2>
          <p className="mt-1 text-xs text-inksoft">{T.eventDashboard.attachmentSubtitle}</p>
        </div>
      </div>
      <AttachmentDropzone url={url} name={name} onChange={handleFileChange} />
      {url && (
        <div className="mt-3">
          <label className="text-xs font-medium text-inksoft">{T.eventForm.attachmentButtonLabel}</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleLabelBlur}
            placeholder={T.eventForm.attachmentButtonLabelPlaceholder}
            className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm placeholder:text-inksoft/50 focus:border-evvy focus:outline-none focus:ring-2 focus:ring-evvy/30"
          />
        </div>
      )}
    </div>
  );
}
