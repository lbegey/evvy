"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageDropzone } from "@/components/ImageDropzone";
import { BrandingColorField } from "@/components/BrandingColorField";
import { updateEventBranding } from "@/app/actions/events";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const MIN_LOGO_SIZE = 16;
const MAX_LOGO_SIZE = 300;
const DEFAULT_LOGO_SIZE = 32;
const COLOR_SAVE_DELAY_MS = 700;

interface EventBrandingSectionProps {
  eventId: string;
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

export function EventBrandingSection({
  eventId, plan, brandingEnabled,
  brandLogoUrl, brandLogoSize, brandLogoTransparentBg, brandLogoRounded,
  brandColor, brandTextColor, brandCardColor, brandBackgroundColor, brandBackgroundImageUrl,
}: EventBrandingSectionProps) {
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

  // isPending blocks toggle/logo buttons during immediate saves only
  const [isPending, startTransition] = useTransition();
  // separate transition for colors — does NOT set isPending, so buttons stay enabled
  const [, startColorSave] = useTransition();
  const isFirstRender = useRef(true);

  // Debounced auto-save for color fields
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!enabled) return;
    const timer = setTimeout(() => {
      startColorSave(async () => {
        await updateEventBranding(eventId, {
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
      await updateEventBranding(eventId, {
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
        <div>
          <Label htmlFor="evb-enabled" className="cursor-pointer">{T.eventDetail.branding.enable}</Label>
          <p className="text-xs text-muted-foreground">{T.eventDetail.branding.enableHint}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-medium", enabled ? "text-primary" : "text-muted-foreground")}>
            {enabled ? T.rsvpSection.enabled : T.rsvpSection.disabled}
          </span>
          <button
            type="button" id="evb-enabled" role="switch" aria-checked={enabled}
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
          <p className="text-xs text-muted-foreground">{T.eventDetail.branding.overrideHint}</p>

          {/* Logo */}
          <div className="space-y-1.5">
            <Label>{T.eventDetail.branding.logo}</Label>
            <ImageDropzone
              value={logoUrl}
              onChange={(v) => { setLogoUrl(v); persist({ logoUrl: v }); }}
              previewClassName="h-16 w-auto max-w-full rounded-lg object-contain border border-border/60 bg-muted/20 p-2"
            />
          </div>

          {logoUrl && (
            <div className="space-y-2">
              <Label htmlFor="evb-logo-size">{T.eventDetail.branding.logoSize}</Label>
              <div className="flex items-center gap-3">
                <input
                  id="evb-logo-size" type="range"
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
                  { id: "evb-logo-transparent", label: T.eventDetail.branding.logoTransparentBg, hint: T.eventDetail.branding.logoTransparentBgHint, checked: logoTransparentBg, toggle: () => { const next = !logoTransparentBg; setLogoTransparentBg(next); persist({ logoTransparentBg: next }); } },
                  { id: "evb-logo-rounded", label: T.eventDetail.branding.logoRounded, hint: T.eventDetail.branding.logoRoundedHint, checked: logoRounded, toggle: () => { const next = !logoRounded; setLogoRounded(next); persist({ logoRounded: next }); } },
                ].map(({ id, label, hint, checked, toggle }) => (
                  <div key={id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-2.5 py-2">
                    <div>
                      <Label htmlFor={id} className="cursor-pointer text-xs">{label}</Label>
                      <p className="text-[11px] text-muted-foreground">{hint}</p>
                    </div>
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
            <BrandingColorField id="evb-color" label={T.eventDetail.branding.color} value={color} placeholder="#6366f1" onChange={setColor} onBlur={() => persist({ color })} />
            <BrandingColorField id="evb-text" label={T.eventDetail.branding.textColor} value={textColor} placeholder="#111111" defaultColor="#111111" onChange={setTextColor} onBlur={() => persist({ textColor })} />
            <BrandingColorField id="evb-bg" label={T.eventDetail.branding.backgroundColor} value={backgroundColor} placeholder="#f4f4f5" defaultColor="#f4f4f5" onChange={setBackgroundColor} onBlur={() => persist({ backgroundColor })} />
            <BrandingColorField id="evb-card" label={T.eventDetail.branding.cardColor} value={cardColor} placeholder="#ffffff" defaultColor="#ffffff" onChange={setCardColor} onBlur={() => persist({ cardColor })} />
          </div>

          {/* Background image */}
          <div className="space-y-1.5">
            <Label>{T.eventDetail.branding.backgroundImage}</Label>
            <ImageDropzone
              value={backgroundImageUrl}
              onChange={(v) => { setBackgroundImageUrl(v); persist({ backgroundImageUrl: v }); }}
              hint={T.eventDetail.branding.backgroundImageHint}
              previewClassName="h-24 w-full rounded-lg object-cover border border-border/60 bg-muted/20"
            />
          </div>
        </div>
      )}
    </div>
  );
}
