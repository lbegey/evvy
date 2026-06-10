"use client";

import { useState, useTransition, useEffect, useRef, type CSSProperties } from "react";
import { Loader2, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageDropzone } from "@/components/ImageDropzone";
import { BrandingColorField } from "@/components/BrandingColorField";
import { updateBranding, resetBranding } from "@/app/actions/user";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const MIN_LOGO_SIZE = 16;
const MAX_LOGO_SIZE = 300;
const DEFAULT_LOGO_SIZE = 32;
const AUTOSAVE_DELAY_MS = 700;

interface BrandingSettingsProps {
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

export function BrandingSettings({
  brandLogoUrl, brandLogoSize, brandLogoTransparentBg, brandLogoRounded,
  brandColor, brandTextColor, brandCardColor, brandBackgroundColor, brandBackgroundImageUrl,
}: BrandingSettingsProps) {
  const { T } = useLanguage();
  const [logoUrl, setLogoUrl] = useState(brandLogoUrl ?? "");
  const [logoSize, setLogoSize] = useState(brandLogoSize ?? DEFAULT_LOGO_SIZE);
  const [logoTransparentBg, setLogoTransparentBg] = useState(brandLogoTransparentBg);
  const [logoRounded, setLogoRounded] = useState(brandLogoRounded);
  const [color, setColor] = useState(brandColor ?? "");
  const [textColor, setTextColor] = useState(brandTextColor ?? "");
  const [cardColor, setCardColor] = useState(brandCardColor ?? "");
  const [backgroundColor, setBackgroundColor] = useState(brandBackgroundColor ?? "");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(brandBackgroundImageUrl ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isResetting, startReset] = useTransition();
  const isFirstRender = useRef(true);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(false);

  const previewColor = /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : undefined;
  const previewTextColor = /^#[0-9a-fA-F]{3,8}$/.test(textColor) ? textColor : undefined;
  const previewCardColor = /^#[0-9a-fA-F]{3,8}$/.test(cardColor) ? cardColor : undefined;
  const previewBackgroundColor = /^#[0-9a-fA-F]{3,8}$/.test(backgroundColor) ? backgroundColor : undefined;
  const hasCustomBranding = Boolean(logoUrl || color || textColor || cardColor || backgroundColor || backgroundImageUrl);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    setSaved(false);
    const timer = setTimeout(() => {
      startTransition(async () => {
        await updateBranding({
          brandLogoUrl: logoUrl, brandLogoSize: logoSize,
          brandLogoTransparentBg: logoTransparentBg, brandLogoRounded: logoRounded,
          brandColor: color, brandTextColor: textColor, brandCardColor: cardColor,
          brandBackgroundColor: backgroundColor, brandBackgroundImageUrl: backgroundImageUrl,
        });
        setSaved(true);
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
      });
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [logoUrl, logoSize, logoTransparentBg, logoRounded, color, textColor, cardColor, backgroundColor, backgroundImageUrl]);

  useEffect(() => {
    return () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current); };
  }, []);

  const onReset = () => {
    if (!confirm(T.branding.resetConfirm)) return;
    setSaved(false);
    skipNextSave.current = true;
    startReset(async () => {
      await resetBranding();
      setLogoUrl(""); setLogoSize(DEFAULT_LOGO_SIZE); setLogoTransparentBg(true); setLogoRounded(false);
      setColor(""); setTextColor(""); setCardColor(""); setBackgroundColor(""); setBackgroundImageUrl("");
    });
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">{T.branding.logo}</h2>

        <div className="space-y-1.5">
          <ImageDropzone
            value={logoUrl}
            onChange={setLogoUrl}
            hint={T.branding.logoHint}
            previewClassName={cn("h-20 w-auto max-w-full rounded-lg object-contain p-3", !logoTransparentBg && "border border-border/60 bg-muted/20")}
          />
        </div>

        {logoUrl && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="bs-logo-size">{T.branding.logoSize}</Label>
              <div className="flex items-center gap-3">
                <input
                  id="bs-logo-size"
                  type="range"
                  min={MIN_LOGO_SIZE}
                  max={MAX_LOGO_SIZE}
                  value={logoSize}
                  onChange={(e) => setLogoSize(Number(e.target.value))}
                  className="h-2 flex-1 cursor-pointer accent-primary"
                />
                <span className="w-14 shrink-0 text-right text-sm tabular-nums text-muted-foreground">{logoSize}px</span>
              </div>
              <p className="text-xs text-muted-foreground">{T.branding.logoSizeHint}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: "bs-logo-transparent", label: T.branding.logoTransparentBg, hint: T.branding.logoTransparentBgHint, checked: logoTransparentBg, toggle: () => setLogoTransparentBg(v => !v) },
                { id: "bs-logo-rounded", label: T.branding.logoRounded, hint: T.branding.logoRoundedHint, checked: logoRounded, toggle: () => setLogoRounded(v => !v) },
              ].map(({ id, label, hint, checked, toggle }) => (
                <div key={id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5">
                  <div>
                    <Label htmlFor={id} className="cursor-pointer">{label}</Label>
                    <p className="text-xs text-muted-foreground">{hint}</p>
                  </div>
                  <button
                    type="button" id={id} role="switch" aria-checked={checked}
                    onClick={toggle} disabled={isPending || isResetting}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                      "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      "disabled:pointer-events-none disabled:opacity-50",
                      checked ? "bg-primary" : "bg-muted-foreground/30"
                    )}
                  >
                    <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-background shadow transition-transform", checked ? "translate-x-4.5" : "translate-x-0.5")} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Colors</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <BrandingColorField id="bs-color" label={T.branding.color} hint={T.branding.colorHint} value={color} placeholder="#6366f1" onChange={setColor} />
          <BrandingColorField id="bs-text" label={T.branding.textColor} hint={T.branding.textColorHint} value={textColor} placeholder="#111111" defaultColor="#111111" onChange={setTextColor} />
          <BrandingColorField id="bs-bg" label={T.branding.backgroundColor} hint={T.branding.backgroundColorHint} value={backgroundColor} placeholder="#f4f4f5" defaultColor="#f4f4f5" onChange={setBackgroundColor} />
          <BrandingColorField id="bs-card" label={T.branding.cardColor} hint={T.branding.cardColorHint} value={cardColor} placeholder="#ffffff" defaultColor="#ffffff" onChange={setCardColor} />
        </div>
      </div>

      {/* Background image */}
      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">{T.branding.backgroundImage}</h2>
        <ImageDropzone
          value={backgroundImageUrl}
          onChange={setBackgroundImageUrl}
          hint={T.branding.backgroundImageHint}
          previewClassName="h-32 w-full rounded-lg object-cover border border-border/60 bg-muted/20"
        />
      </div>

      {/* Preview */}
      {(logoUrl || previewColor || previewTextColor || previewCardColor || previewBackgroundColor || backgroundImageUrl) && (
        <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">{T.branding.preview}</h2>
          <div
            className="rounded-xl border p-4 bg-cover bg-center overflow-hidden"
            style={{
              ...(previewColor ? { "--primary": previewColor, "--border": previewColor, "--ring": previewColor } as CSSProperties : {}),
              ...(previewTextColor ? {
                "--foreground": previewTextColor,
                "--card-foreground": previewTextColor,
                "--popover-foreground": previewTextColor,
                "--muted-foreground": previewTextColor,
                "--primary-foreground": previewTextColor,
                "--secondary-foreground": previewTextColor,
                "--accent-foreground": previewTextColor,
              } as CSSProperties : {}),
              ...(previewCardColor ? { "--card": previewCardColor, "--background": previewCardColor } as CSSProperties : {}),
              ...(previewBackgroundColor ? { backgroundColor: previewBackgroundColor } : {}),
              ...(backgroundImageUrl ? { backgroundImage: `url(${JSON.stringify(backgroundImageUrl)})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
            }}
          >
            <div
              className="rounded-lg border border-border/60 p-3 space-y-2"
              style={previewCardColor ? { backgroundColor: previewCardColor } : undefined}
            >
              {logoUrl && (
                <img src={logoUrl} alt="" style={{ height: logoSize }} className="w-auto max-w-full object-contain mb-1" />
              )}
              <p className="text-sm font-semibold text-foreground">Event title</p>
              <p className="text-xs text-muted-foreground">Mon 9 Jun · 10:00 – 11:00</p>
              <div className="flex items-center gap-2 pt-1">
                <button type="button" className="cursor-default rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
                  Add to calendar
                </button>
                <span className="rounded-md border border-border/60 px-2.5 py-1 text-xs text-foreground">RSVP</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={onReset} disabled={isPending || isResetting || !hasCustomBranding} className="gap-1.5">
          {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          {T.branding.reset}
        </Button>
        {isPending && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />{T.branding.saving}
          </p>
        )}
        {saved && !isPending && (
          <p className="flex items-center gap-1.5 text-xs text-green-600">
            <Check className="h-3 w-3" />{T.branding.saved}
          </p>
        )}
        {isResetting && <p className="text-xs text-muted-foreground">{T.branding.resetDone}</p>}
      </div>
    </div>
  );
}
