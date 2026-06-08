"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageDropzone } from "@/components/ImageDropzone";
import { updateEventBranding } from "@/app/actions/events";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const MIN_LOGO_SIZE = 16;
const MAX_LOGO_SIZE = 300;
const DEFAULT_LOGO_SIZE = 32;

interface EventBrandingSectionProps {
  eventId: string;
  plan: string;
  brandingEnabled: boolean;
  brandLogoUrl: string | null;
  brandLogoSize: number | null;
  brandLogoTransparentBg: boolean;
  brandLogoRounded: boolean;
  brandColor: string | null;
  brandBackgroundColor: string | null;
  brandBackgroundImageUrl: string | null;
}

export function EventBrandingSection({
  eventId, plan, brandingEnabled, brandLogoUrl, brandLogoSize, brandLogoTransparentBg, brandLogoRounded, brandColor, brandBackgroundColor, brandBackgroundImageUrl,
}: EventBrandingSectionProps) {
  const router = useRouter();
  const { T } = useLanguage();
  const [enabled, setEnabled] = useState(brandingEnabled);
  const [logoUrl, setLogoUrl] = useState(brandLogoUrl ?? "");
  const [logoSize, setLogoSize] = useState(brandLogoSize ?? DEFAULT_LOGO_SIZE);
  const [logoTransparentBg, setLogoTransparentBg] = useState(brandLogoTransparentBg);
  const [logoRounded, setLogoRounded] = useState(brandLogoRounded);
  const [color, setColor] = useState(brandColor ?? "");
  const [backgroundColor, setBackgroundColor] = useState(brandBackgroundColor ?? "");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(brandBackgroundImageUrl ?? "");
  const [isPending, startTransition] = useTransition();

  const persist = (overrides: {
    enabled?: boolean;
    logoUrl?: string;
    logoSize?: number;
    logoTransparentBg?: boolean;
    logoRounded?: boolean;
    color?: string;
    backgroundColor?: string;
    backgroundImageUrl?: string;
  } = {}) => {
    const next = {
      enabled, logoUrl, logoSize, logoTransparentBg, logoRounded, color, backgroundColor, backgroundImageUrl,
      ...overrides,
    };
    startTransition(async () => {
      await updateEventBranding(eventId, {
        brandingEnabled: next.enabled,
        brandLogoUrl: next.enabled ? (next.logoUrl || null) : null,
        brandLogoSize: next.enabled ? next.logoSize : null,
        brandLogoTransparentBg: next.logoTransparentBg,
        brandLogoRounded: next.logoRounded,
        brandColor: next.enabled ? (next.color || null) : null,
        brandBackgroundColor: next.enabled ? (next.backgroundColor || null) : null,
        brandBackgroundImageUrl: next.enabled ? (next.backgroundImageUrl || null) : null,
      });
      router.refresh();
    });
  };

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);
    persist({ enabled: next });
  };

  if (plan !== "premium") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
        <p className="text-sm text-muted-foreground">{T.eventDetail.branding.locked}</p>
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          {T.eventDetail.branding.unlock}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="evb-enabled" className="cursor-pointer">{T.eventDetail.branding.enable}</Label>
          <p className="text-xs text-muted-foreground">{T.eventDetail.branding.enableHint}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("text-xs font-medium", enabled ? "text-primary" : "text-muted-foreground")}>
            {enabled ? T.rsvpSection.enabled : T.rsvpSection.disabled}
          </span>
          <button
            type="button"
            id="evb-enabled"
            role="switch"
            aria-checked={enabled}
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
              "relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:pointer-events-none disabled:opacity-50",
              enabled ? "bg-primary" : "bg-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "inline-block h-3.5 w-3.5 rounded-full bg-background shadow transition-transform",
                enabled ? "translate-x-4.5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
      </div>

      <Link
        href="/dashboard/branding"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <Settings2 className="h-3.5 w-3.5" />
        {T.eventDetail.branding.accountBranding}
      </Link>

      {enabled && (
        <div className="space-y-4 border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">{T.eventDetail.branding.overrideHint}</p>

          <div className="space-y-1.5">
            <Label>{T.eventDetail.branding.logo}</Label>
            <ImageDropzone
              value={logoUrl}
              onChange={(v) => { setLogoUrl(v); persist({ logoUrl: v }); }}
              previewClassName="h-20 w-auto max-w-full rounded-lg object-contain border border-border/60 bg-muted/20 p-3"
            />
          </div>

          {logoUrl && (
            <div className="space-y-1.5">
              <Label htmlFor="evb-logo-size">{T.eventDetail.branding.logoSize}</Label>
              <div className="flex items-center gap-3">
                <input
                  id="evb-logo-size"
                  type="range"
                  min={MIN_LOGO_SIZE}
                  max={MAX_LOGO_SIZE}
                  value={logoSize}
                  onChange={(e) => setLogoSize(Number(e.target.value))}
                  onMouseUp={(e) => persist({ logoSize: Number((e.target as HTMLInputElement).value) })}
                  onTouchEnd={(e) => persist({ logoSize: Number((e.target as HTMLInputElement).value) })}
                  className="h-2 flex-1 cursor-pointer accent-primary"
                />
                <span className="w-14 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
                  {logoSize}px
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                  <div>
                    <Label htmlFor="evb-logo-transparent" className="cursor-pointer">{T.eventDetail.branding.logoTransparentBg}</Label>
                    <p className="text-xs text-muted-foreground">{T.eventDetail.branding.logoTransparentBgHint}</p>
                  </div>
                  <button
                    type="button"
                    id="evb-logo-transparent"
                    role="switch"
                    aria-checked={logoTransparentBg}
                    onClick={() => { const next = !logoTransparentBg; setLogoTransparentBg(next); persist({ logoTransparentBg: next }); }}
                    disabled={isPending}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                      "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      "disabled:pointer-events-none disabled:opacity-50",
                      logoTransparentBg ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  >
                    <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-background shadow transition-transform", logoTransparentBg ? "translate-x-4.5" : "translate-x-0.5")} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                  <div>
                    <Label htmlFor="evb-logo-rounded" className="cursor-pointer">{T.eventDetail.branding.logoRounded}</Label>
                    <p className="text-xs text-muted-foreground">{T.eventDetail.branding.logoRoundedHint}</p>
                  </div>
                  <button
                    type="button"
                    id="evb-logo-rounded"
                    role="switch"
                    aria-checked={logoRounded}
                    onClick={() => { const next = !logoRounded; setLogoRounded(next); persist({ logoRounded: next }); }}
                    disabled={isPending}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                      "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      "disabled:pointer-events-none disabled:opacity-50",
                      logoRounded ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  >
                    <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-background shadow transition-transform", logoRounded ? "translate-x-4.5" : "translate-x-0.5")} />
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="evb-color">{T.eventDetail.branding.color}</Label>
              <div className="flex items-center gap-2">
                <input
                  id="evb-color"
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#000000"}
                  onChange={(e) => { setColor(e.target.value); persist({ color: e.target.value }); }}
                  className="h-8 w-10 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  onBlur={() => persist({ color })}
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="evb-bg">{T.eventDetail.branding.backgroundColor}</Label>
              <div className="flex items-center gap-2">
                <input
                  id="evb-bg"
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(backgroundColor) ? backgroundColor : "#f4f4f5"}
                  onChange={(e) => { setBackgroundColor(e.target.value); persist({ backgroundColor: e.target.value }); }}
                  className="h-8 w-10 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
                />
                <Input
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  onBlur={() => persist({ backgroundColor })}
                  placeholder="#f4f4f5"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{T.eventDetail.branding.backgroundImage}</Label>
            <ImageDropzone
              value={backgroundImageUrl}
              onChange={(v) => { setBackgroundImageUrl(v); persist({ backgroundImageUrl: v }); }}
              hint={T.eventDetail.branding.backgroundImageHint}
              previewClassName="h-28 w-full rounded-lg object-cover border border-border/60 bg-muted/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
