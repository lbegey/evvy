"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings2, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageDropzone } from "@/components/ImageDropzone";
import { BrandingColorField } from "@/components/BrandingColorField";
import { updateCalendarBranding } from "@/app/actions/calendars";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const MIN_LOGO_SIZE = 16;
const MAX_LOGO_SIZE = 300;
const DEFAULT_LOGO_SIZE = 32;
const COLOR_SAVE_DELAY_MS = 700;

interface CalendarBrandingSectionProps {
  calendarId: string;
  plan: string;
  brandingEnabled: boolean;
  brandLogoUrl: string | null;
  brandLogoSize: number | null;
  brandLogoTransparentBg: boolean;
  brandLogoRounded: boolean;
  brandColor: string | null;
  brandTextColor: string | null;
  brandCardColor: string | null;
  brandBackgroundColor: string | null;
  brandBackgroundImageUrl: string | null;
}

export function CalendarBrandingSection({
  calendarId, plan, brandingEnabled,
  brandLogoUrl, brandLogoSize, brandLogoTransparentBg, brandLogoRounded,
  brandColor, brandTextColor, brandCardColor, brandBackgroundColor, brandBackgroundImageUrl,
}: CalendarBrandingSectionProps) {
  const router = useRouter();
  const { T } = useLanguage();
  const [enabled, setEnabled] = useState(brandingEnabled);
  const [logoUrl, setLogoUrl] = useState(brandLogoUrl ?? "");
  const [logoSize, setLogoSize] = useState(brandLogoSize ?? DEFAULT_LOGO_SIZE);
  const [logoTransparentBg, setLogoTransparentBg] = useState(brandLogoTransparentBg);
  const [logoRounded, setLogoRounded] = useState(brandLogoRounded);
  const [color, setColor] = useState(brandColor ?? "");
  const [textColor, setTextColor] = useState(brandTextColor ?? "");
  const [cardColor, setCardColor] = useState(brandCardColor ?? "");
  const [backgroundColor, setBackgroundColor] = useState(brandBackgroundColor ?? "");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(brandBackgroundImageUrl ?? "");

  const [isPending, startTransition] = useTransition();
  const [, startColorSave] = useTransition();
  const [isResetting, startReset] = useTransition();
  const isFirstRender = useRef(true);

  const hasCustomBranding = Boolean(logoUrl || color || textColor || cardColor || backgroundColor || backgroundImageUrl);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!enabled) return;
    const timer = setTimeout(() => {
      startColorSave(async () => {
        await updateCalendarBranding(calendarId, {
          brandingEnabled: enabled,
          brandLogoUrl: logoUrl || null,
          brandLogoSize: logoSize,
          brandLogoTransparentBg: logoTransparentBg,
          brandLogoRounded: logoRounded,
          brandColor: color || null,
          brandTextColor: textColor || null,
          brandCardColor: cardColor || null,
          brandBackgroundColor: backgroundColor || null,
          brandBackgroundImageUrl: backgroundImageUrl || null,
        });
        router.refresh();
      });
    }, COLOR_SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, textColor, cardColor, backgroundColor]);

  const persist = (overrides: Partial<{
    enabled: boolean; logoUrl: string; logoSize: number;
    logoTransparentBg: boolean; logoRounded: boolean;
    color: string; textColor: string; cardColor: string;
    backgroundColor: string; backgroundImageUrl: string;
  }> = {}) => {
    const next = { enabled, logoUrl, logoSize, logoTransparentBg, logoRounded, color, textColor, cardColor, backgroundColor, backgroundImageUrl, ...overrides };
    startTransition(async () => {
      await updateCalendarBranding(calendarId, {
        brandingEnabled: next.enabled,
        brandLogoUrl: next.enabled ? (next.logoUrl || null) : null,
        brandLogoSize: next.enabled ? next.logoSize : null,
        brandLogoTransparentBg: next.logoTransparentBg,
        brandLogoRounded: next.logoRounded,
        brandColor: next.enabled ? (next.color || null) : null,
        brandTextColor: next.enabled ? (next.textColor || null) : null,
        brandCardColor: next.enabled ? (next.cardColor || null) : null,
        brandBackgroundColor: next.enabled ? (next.backgroundColor || null) : null,
        brandBackgroundImageUrl: next.enabled ? (next.backgroundImageUrl || null) : null,
      });
      router.refresh();
    });
  };

  const onReset = () => {
    if (!confirm(T.branding.resetConfirm)) return;
    setLogoUrl(""); setLogoSize(DEFAULT_LOGO_SIZE); setLogoTransparentBg(true); setLogoRounded(false);
    setColor(""); setTextColor(""); setCardColor(""); setBackgroundColor(""); setBackgroundImageUrl("");
    startReset(async () => {
      await updateCalendarBranding(calendarId, {
        brandingEnabled: enabled,
        brandLogoUrl: null,
        brandLogoSize: null,
        brandLogoTransparentBg: true,
        brandLogoRounded: false,
        brandColor: null,
        brandTextColor: null,
        brandCardColor: null,
        brandBackgroundColor: null,
        brandBackgroundImageUrl: null,
      });
      router.refresh();
    });
  };

  if (plan !== "premium") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
        <p className="text-sm text-muted-foreground">{T.eventDetail.branding.locked}</p>
        <Link href="/dashboard/billing" className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80">
          {T.eventDetail.branding.unlock}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Enable toggle */}
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="cvb-enabled" className="cursor-pointer">{T.eventDetail.branding.enable}</Label>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-medium", enabled ? "text-primary" : "text-muted-foreground")}>
            {enabled ? T.rsvpSection.enabled : T.rsvpSection.disabled}
          </span>
          <button
            type="button" id="cvb-enabled" role="switch" aria-checked={enabled}
            onClick={() => { const next = !enabled; setEnabled(next); persist({ enabled: next }); }}
            disabled={isPending}
            className={cn(
              "relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:pointer-events-none disabled:opacity-50",
              enabled ? "bg-primary" : "bg-muted-foreground/30"
            )}
          >
            <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-background shadow transition-transform", enabled ? "translate-x-4.5" : "translate-x-0.5")} />
          </button>
        </div>
      </div>

      <Button variant="outline" size="sm" className="gap-1.5" nativeButton={false} render={<Link href="/dashboard/branding" />}>
        <Settings2 className="h-3.5 w-3.5" />
        {T.eventDetail.branding.accountBranding}
      </Button>

      {enabled && (
        <div className="space-y-4 border-t border-border/60 pt-4">
          {/* Logo */}
          <div className="space-y-1.5">
            <Label>{T.eventDetail.branding.logo}</Label>
            <ImageDropzone
              value={logoUrl}
              onChange={(v) => { setLogoUrl(v); persist({ logoUrl: v }); }}
              previewClassName={cn("h-16 w-auto max-w-full rounded-lg object-contain p-2", !logoTransparentBg && "border border-border/60 bg-muted/20")}
            />
          </div>

          {logoUrl && (
            <div className="space-y-2">
              <Label htmlFor="cvb-logo-size">{T.eventDetail.branding.logoSize}</Label>
              <div className="flex items-center gap-3">
                <input
                  id="cvb-logo-size" type="range"
                  min={MIN_LOGO_SIZE} max={MAX_LOGO_SIZE} value={logoSize}
                  onChange={(e) => setLogoSize(Number(e.target.value))}
                  onMouseUp={(e) => persist({ logoSize: Number((e.target as HTMLInputElement).value) })}
                  onTouchEnd={(e) => persist({ logoSize: Number((e.target as HTMLInputElement).value) })}
                  className="h-2 flex-1 cursor-pointer accent-primary"
                />
                <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{logoSize}px</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { id: "cvb-logo-transparent", label: T.eventDetail.branding.logoTransparentBg, checked: logoTransparentBg, toggle: () => { const next = !logoTransparentBg; setLogoTransparentBg(next); persist({ logoTransparentBg: next }); } },
                  { id: "cvb-logo-rounded", label: T.eventDetail.branding.logoRounded, checked: logoRounded, toggle: () => { const next = !logoRounded; setLogoRounded(next); persist({ logoRounded: next }); } },
                ].map(({ id, label, checked, toggle }) => (
                  <div key={id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-2.5 py-2">
                    <Label htmlFor={id} className="cursor-pointer text-xs">{label}</Label>
                    <button type="button" id={id} role="switch" aria-checked={checked} onClick={toggle} disabled={isPending}
                      className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50", checked ? "bg-primary" : "bg-muted-foreground/30")}
                    >
                      <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-background shadow transition-transform", checked ? "translate-x-4.5" : "translate-x-0.5")} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Colors 2×2 */}
          <div className="grid gap-3 sm:grid-cols-2">
            <BrandingColorField id="cvb-color" label={T.eventDetail.branding.color} value={color} placeholder="#6366f1" onChange={setColor} onBlur={() => persist({ color })} />
            <BrandingColorField id="cvb-text" label={T.eventDetail.branding.textColor} value={textColor} placeholder="#111111" defaultColor="#111111" onChange={setTextColor} onBlur={() => persist({ textColor })} />
            <BrandingColorField id="cvb-bg" label={T.eventDetail.branding.backgroundColor} value={backgroundColor} placeholder="#f4f4f5" defaultColor="#f4f4f5" onChange={setBackgroundColor} onBlur={() => persist({ backgroundColor })} />
            <BrandingColorField id="cvb-card" label={T.eventDetail.branding.cardColor} value={cardColor} placeholder="#ffffff" defaultColor="#ffffff" onChange={setCardColor} onBlur={() => persist({ cardColor })} />
          </div>

          {/* Background image */}
          <div className="space-y-1.5">
            <Label>{T.eventDetail.branding.backgroundImage}</Label>
            <ImageDropzone
              value={backgroundImageUrl}
              onChange={(v) => { setBackgroundImageUrl(v); persist({ backgroundImageUrl: v }); }}
              previewClassName="h-24 w-full rounded-lg object-cover border border-border/60 bg-muted/20"
            />
          </div>

          <Button type="button" variant="outline" size="sm" onClick={onReset} disabled={isPending || isResetting || !hasCustomBranding} className="gap-1.5">
            {isResetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
            {T.branding.reset}
          </Button>
        </div>
      )}
    </div>
  );
}
