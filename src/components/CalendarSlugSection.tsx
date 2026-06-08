"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateCalendarSlug } from "@/app/actions/calendars";
import { useLanguage } from "@/contexts/LanguageContext";

interface CalendarSlugSectionProps {
  calendarId: string;
  plan: string;
  appUrl: string;
  slug: string | null;
}

export function CalendarSlugSection({ calendarId, plan, appUrl, slug }: CalendarSlugSectionProps) {
  const router = useRouter();
  const { T } = useLanguage();
  const [value, setValue] = useState(slug ?? "");
  const [error, setError] = useState<"invalid" | "taken" | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (plan !== "premium") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
        <p className="text-sm text-muted-foreground">{T.eventDetail.slug.locked}</p>
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          {T.eventDetail.slug.unlock}
        </Link>
      </div>
    );
  }

  const persist = () => {
    const trimmed = value.trim().toLowerCase();
    setValue(trimmed);
    setError(null);
    setSaved(false);
    if (trimmed === (slug ?? "")) return;
    startTransition(async () => {
      const result = await updateCalendarSlug(calendarId, trimmed || null);
      if (result && "error" in result) {
        if (result.error === "invalid" || result.error === "taken") setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  };

  return (
    <div className="space-y-1.5 border-t border-border/60 pt-3">
      <Label htmlFor="calendar-slug">{T.eventDetail.slug.title}</Label>
      <p className="text-xs text-muted-foreground">{T.eventDetail.slug.subtitle}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="break-all text-xs text-muted-foreground">{appUrl}/c/</span>
        <Input
          id="calendar-slug"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); setSaved(false); }}
          onBlur={persist}
          placeholder={calendarId}
          disabled={isPending}
          className="min-w-[10rem] flex-1"
        />
      </div>
      {error === "invalid" && <p className="text-xs text-destructive">{T.eventDetail.slug.errors.invalid}</p>}
      {error === "taken" && <p className="text-xs text-destructive">{T.eventDetail.slug.errors.taken}</p>}
      {saved && !error && <p className="text-xs text-primary">{T.eventDetail.slug.saved}</p>}
    </div>
  );
}
