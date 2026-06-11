"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AttachmentDropzone } from "@/components/AttachmentDropzone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateEventAttachment } from "@/app/actions/events";
import { useLanguage } from "@/contexts/LanguageContext";

interface EventAttachmentSectionProps {
  eventId: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentButtonLabel: string | null;
}

export function EventAttachmentSection({ eventId, attachmentUrl, attachmentName, attachmentButtonLabel }: EventAttachmentSectionProps) {
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
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{T.eventForm.attachmentHint}</p>
      <AttachmentDropzone url={url} name={name} onChange={handleFileChange} />

      {url && (
        <div className="space-y-1.5">
          <Label htmlFor="attachment-label">{T.eventForm.attachmentButtonLabel}</Label>
          <Input
            id="attachment-label"
            placeholder={T.eventForm.attachmentButtonLabelPlaceholder}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={handleLabelBlur}
          />
        </div>
      )}
    </div>
  );
}
