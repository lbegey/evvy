"use client";

import { useState, useTransition, type CSSProperties } from "react";
import { Loader2, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageDropzone } from "@/components/ImageDropzone";
import { updateBranding, resetBranding } from "@/app/actions/user";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const MIN_LOGO_SIZE = 16;
const MAX_LOGO_SIZE = 300;
const DEFAULT_LOGO_SIZE = 32;

interface BrandingSettingsProps {
  brandLogoUrl: string | null;
  brandLogoSize: number | null;
  brandLogoTransparentBg: boolean;
  brandLogoRounded: boolean;
  brandColor: string | null;
  brandBackgroundColor: string | null;
  brandBackgroundImageUrl: string | null;
}

export function BrandingSettings({ brandLogoUrl, brandLogoSize, brandLogoTransparentBg, brandLogoRounded, brandColor, brandBackgroundColor, brandBackgroundImageUrl }: BrandingSettingsProps) {
  const { T } = useLanguage();
  const [logoUrl, setLogoUrl] = useState(brandLogoUrl ?? "");
  const [logoSize, setLogoSize] = useState(brandLogoSize ?? DEFAULT_LOGO_SIZE);
  const [logoTransparentBg, setLogoTransparentBg] = useState(brandLogoTransparentBg);
  const [logoRounded, setLogoRounded] = useState(brandLogoRounded);
  const [color, setColor] = useState(brandColor ?? "");
  const [backgroundColor, setBackgroundColor] = useState(brandBackgroundColor ?? "");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(brandBackgroundImageUrl ?? "");
  const [saved, setSaved] = useState<"saved" | "reset" | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isResetting, startReset] = useTransition();

  const previewColor = /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : undefined;
  const previewBackgroundColor = /^#[0-9a-fA-F]{3,8}$/.test(backgroundColor) ? backgroundColor : undefined;
  const hasCustomBranding = Boolean(brandLogoUrl || brandColor || brandBackgroundColor || brandBackgroundImageUrl);

  const onSave = () => {
    setSaved(null);
    startTransition(async () => {
      await updateBranding({ brandLogoUrl: logoUrl, brandLogoSize: logoSize, brandLogoTransparentBg: logoTransparentBg, brandLogoRounded: logoRounded, brandColor: color, brandBackgroundColor: backgroundColor, brandBackgroundImageUrl: backgroundImageUrl });
      setSaved("saved");
    });
  };

  const onReset = () => {
    if (!confirm(T.branding.resetConfirm)) return;
    setSaved(null);
    startReset(async () => {
      await resetBranding();
      setLogoUrl("");
      setLogoSize(DEFAULT_LOGO_SIZE);
      setLogoTransparentBg(true);
      setLogoRounded(false);
      setColor("");
      setBackgroundColor("");
      setBackgroundImageUrl("");
      setSaved("reset");
    });
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">{T.branding.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{T.branding.subtitle}</p>
      </div>

      <div className="space-y-1.5">
        <Label>{T.branding.logo}</Label>
        <ImageDropzone
          value={logoUrl}
          onChange={setLogoUrl}
          hint={T.branding.logoHint}
          previewClassName="h-20 w-auto max-w-full rounded-lg object-contain border border-border/60 bg-muted/20 p-3"
        />
      </div>

      {logoUrl && (
        <div className="space-y-1.5">
          <Label htmlFor="brand-logo-size">{T.branding.logoSize}</Label>
          <div className="flex items-center gap-3">
            <input
              id="brand-logo-size"
              type="range"
              min={MIN_LOGO_SIZE}
              max={MAX_LOGO_SIZE}
              value={logoSize}
              onChange={(e) => setLogoSize(Number(e.target.value))}
              className="h-2 flex-1 cursor-pointer accent-primary"
            />
            <span className="w-14 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
              {logoSize}px
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{T.branding.logoSizeHint}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5">
              <div>
                <Label htmlFor="brand-logo-transparent" className="cursor-pointer">{T.branding.logoTransparentBg}</Label>
                <p className="text-xs text-muted-foreground">{T.branding.logoTransparentBgHint}</p>
              </div>
              <button
                type="button"
                id="brand-logo-transparent"
                role="switch"
                aria-checked={logoTransparentBg}
                onClick={() => setLogoTransparentBg((v) => !v)}
                disabled={isPending || isResetting}
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
                <Label htmlFor="brand-logo-rounded" className="cursor-pointer">{T.branding.logoRounded}</Label>
                <p className="text-xs text-muted-foreground">{T.branding.logoRoundedHint}</p>
              </div>
              <button
                type="button"
                id="brand-logo-rounded"
                role="switch"
                aria-checked={logoRounded}
                onClick={() => setLogoRounded((v) => !v)}
                disabled={isPending || isResetting}
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

      <div className="space-y-1.5">
        <Label htmlFor="brand-color">{T.branding.color}</Label>
        <div className="flex items-center gap-2">
          <input
            id="brand-color"
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : "#000000"}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-10 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
          />
          <Input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#6366f1"
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground">{T.branding.colorHint}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="brand-bg-color">{T.branding.backgroundColor}</Label>
        <div className="flex items-center gap-2">
          <input
            id="brand-bg-color"
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(backgroundColor) ? backgroundColor : "#f4f4f5"}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="h-8 w-10 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
          />
          <Input
            value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            placeholder="#f4f4f5"
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground">{T.branding.backgroundColorHint}</p>
      </div>

      <div className="space-y-1.5">
        <Label>{T.branding.backgroundImage}</Label>
        <ImageDropzone
          value={backgroundImageUrl}
          onChange={setBackgroundImageUrl}
          hint={T.branding.backgroundImageHint}
          previewClassName="h-32 w-full rounded-lg object-cover border border-border/60 bg-muted/20"
        />
        <p className="text-xs text-muted-foreground">{T.branding.backgroundImageHint}</p>
      </div>

      {(logoUrl || previewColor || previewBackgroundColor || backgroundImageUrl) && (
        <div className="space-y-1.5">
          <Label>{T.branding.preview}</Label>
          <div
            className="flex flex-wrap items-center gap-3 rounded-xl border p-4 bg-cover bg-center"
            style={{
              ...(previewColor ? ({ "--primary": previewColor, "--border": previewColor } as CSSProperties) : {}),
              ...(previewBackgroundColor ? { backgroundColor: previewBackgroundColor } : {}),
              ...(backgroundImageUrl ? { backgroundImage: `url(${JSON.stringify(backgroundImageUrl)})` } : {}),
            }}
          >
            {logoUrl && (
              <img src={logoUrl} alt="" style={{ height: logoSize }} className="w-auto object-contain" />
            )}
            <button
              type="button"
              className="cursor-default rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              {T.eventForm.create}
            </button>
            <span className="rounded-lg border border-border/60 px-3 py-1.5 text-xs text-muted-foreground">
              {T.common.open}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onSave} disabled={isPending || isResetting} className="gap-1.5">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {isPending ? T.billing.loading : T.branding.save}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          disabled={isPending || isResetting || !hasCustomBranding}
          className="gap-1.5"
        >
          {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          {T.branding.reset}
        </Button>
        {saved && !isPending && !isResetting && (
          <p className="text-xs text-green-600">
            {saved === "saved" ? T.branding.saved : T.branding.resetDone}
          </p>
        )}
      </div>
    </div>
  );
}
