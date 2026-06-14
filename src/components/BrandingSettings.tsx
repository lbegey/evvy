"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Loader2, Check, RotateCcw, ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImageDropzone } from "@/components/ImageDropzone";
import { BrandingColorField } from "@/components/BrandingColorField";
import { BrandingPresetBar } from "@/components/BrandingPresetBar";
import { SaveBrandingPresetButton } from "@/components/SaveBrandingPresetButton";
import { updateBranding, resetBranding } from "@/app/actions/user";
import { applyBrandingPresetToUser, type BrandingPreset } from "@/app/actions/brandingPresets";
import { useBrandingPresets } from "@/hooks/useBrandingPresets";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { BrandingPreview } from "@/components/BrandingPreview";
import { resolveBrandBackgroundType, DEFAULT_GRADIENT_ANGLE, type BrandBackgroundType } from "@/lib/branding";

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
  brandIconBackgroundColor: string | null;
  brandBackgroundColor: string | null;
  brandBackgroundImageUrl: string | null;
  brandSquareCorners: boolean;
  brandBackgroundType: string | null;
  brandBackgroundColor2: string | null;
  brandBackgroundGradientAngle: number | null;
}

const DIRECTIONS = [
  { angle: 180, Icon: ArrowDown },
  { angle: 135, Icon: ArrowDownRight },
  { angle: 90, Icon: ArrowRight },
  { angle: 45, Icon: ArrowUpRight },
] as const;

export function BrandingSettings(props: BrandingSettingsProps) {
  const { T } = useLanguage();
  const [logoUrl, setLogoUrl] = useState(props.brandLogoUrl ?? "");
  const [logoSize, setLogoSize] = useState(props.brandLogoSize ?? DEFAULT_LOGO_SIZE);
  const [logoTransparentBg, setLogoTransparentBg] = useState(props.brandLogoTransparentBg);
  const [squareCorners, setSquareCorners] = useState(props.brandSquareCorners);
  const [color, setColor] = useState(props.brandColor ?? "");
  const [textColor, setTextColor] = useState(props.brandTextColor ?? "");
  const [cardColor, setCardColor] = useState(props.brandCardColor ?? "");
  const [iconBackgroundColor, setIconBackgroundColor] = useState(props.brandIconBackgroundColor ?? "");
  const [backgroundColor, setBackgroundColor] = useState(props.brandBackgroundColor ?? "");
  const [backgroundColor2, setBackgroundColor2] = useState(props.brandBackgroundColor2 ?? "");
  const [gradientAngle, setGradientAngle] = useState(props.brandBackgroundGradientAngle ?? DEFAULT_GRADIENT_ANGLE);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(props.brandBackgroundImageUrl ?? "");
  const [bgType, setBgType] = useState<BrandBackgroundType>(resolveBrandBackgroundType(props));
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isResetting, startReset] = useTransition();
  const isFirstRender = useRef(true);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(false);
  const { presets, refresh: refreshPresets } = useBrandingPresets();

  const hasCustomBranding = Boolean(logoUrl || color || textColor || cardColor || iconBackgroundColor || backgroundColor || backgroundColor2 || backgroundImageUrl || squareCorners);

  const currentPresetData = {
    brandLogoUrl: logoUrl || null,
    brandLogoSize: logoSize,
    brandLogoTransparentBg: logoTransparentBg,
    brandLogoRounded: !squareCorners,
    brandColor: color || null,
    brandTextColor: textColor || null,
    brandCardColor: cardColor || null,
    brandIconBackgroundColor: iconBackgroundColor || null,
    brandBackgroundColor: backgroundColor || null,
    brandBackgroundImageUrl: backgroundImageUrl || null,
    brandSquareCorners: squareCorners,
    brandBackgroundType: bgType,
    brandBackgroundColor2: backgroundColor2 || null,
    brandBackgroundGradientAngle: gradientAngle,
  };

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    setSaved(false);
    const timer = setTimeout(() => {
      startTransition(async () => {
        await updateBranding({
          brandLogoUrl: logoUrl, brandLogoSize: logoSize,
          brandLogoTransparentBg: logoTransparentBg, brandLogoRounded: !squareCorners,
          brandColor: color, brandTextColor: textColor, brandCardColor: cardColor,
          brandIconBackgroundColor: iconBackgroundColor,
          brandBackgroundColor: backgroundColor, brandBackgroundImageUrl: backgroundImageUrl,
          brandSquareCorners: squareCorners, brandBackgroundType: bgType,
          brandBackgroundColor2: backgroundColor2 || null, brandBackgroundGradientAngle: gradientAngle,
        });
        setSaved(true);
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
        savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
      });
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [logoUrl, logoSize, logoTransparentBg, squareCorners, color, textColor, cardColor, iconBackgroundColor, backgroundColor, backgroundColor2, gradientAngle, backgroundImageUrl, bgType]);

  useEffect(() => {
    return () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current); };
  }, []);

  const onReset = () => {
    if (!confirm(T.branding.resetConfirm)) return;
    setSaved(false);
    skipNextSave.current = true;
    startReset(async () => {
      await resetBranding();
      setLogoUrl(""); setLogoSize(DEFAULT_LOGO_SIZE); setLogoTransparentBg(true); setSquareCorners(false);
      setColor(""); setTextColor(""); setCardColor(""); setIconBackgroundColor("");
      setBackgroundColor(""); setBackgroundColor2(""); setGradientAngle(DEFAULT_GRADIENT_ANGLE);
      setBackgroundImageUrl(""); setBgType("color");
    });
  };

  const onApplyPreset = (preset: BrandingPreset) => {
    setSaved(false);
    skipNextSave.current = true;
    setLogoUrl(preset.brandLogoUrl ?? "");
    setLogoSize(preset.brandLogoSize ?? DEFAULT_LOGO_SIZE);
    setLogoTransparentBg(preset.brandLogoTransparentBg);
    setSquareCorners(preset.brandSquareCorners);
    setColor(preset.brandColor ?? "");
    setTextColor(preset.brandTextColor ?? "");
    setCardColor(preset.brandCardColor ?? "");
    setIconBackgroundColor(preset.brandIconBackgroundColor ?? "");
    setBackgroundColor(preset.brandBackgroundColor ?? "");
    setBackgroundColor2(preset.brandBackgroundColor2 ?? "");
    setGradientAngle(preset.brandBackgroundGradientAngle ?? DEFAULT_GRADIENT_ANGLE);
    setBackgroundImageUrl(preset.brandBackgroundImageUrl ?? "");
    setBgType(resolveBrandBackgroundType(preset));
    startTransition(async () => {
      await applyBrandingPresetToUser(preset.id);
      setSaved(true);
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <BrandingPresetBar presets={presets} onApply={onApplyPreset} />

      <div className="grid gap-6 lg:grid-cols-5">
       <div className="space-y-6 lg:col-span-3">
      {/* Logo */}
      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">{T.branding.logo}</h2>
        <ImageDropzone
          value={logoUrl}
          onChange={setLogoUrl}
          hint={T.branding.logoHint}
          maxSize={3 * 1024 * 1024}
          previewClassName={cn("h-20 w-auto max-w-full rounded-lg object-contain p-3", !logoTransparentBg && "border border-border/60 bg-muted/20")}
        />
        {logoUrl && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="bs-logo-size">{T.branding.logoSize}</Label>
                <span className="text-sm tabular-nums text-muted-foreground">{logoSize}px</span>
              </div>
              <input
                id="bs-logo-size" type="range" min={MIN_LOGO_SIZE} max={MAX_LOGO_SIZE} value={logoSize}
                onChange={(e) => setLogoSize(Number(e.target.value))}
                className="h-2 w-full cursor-pointer accent-primary"
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5">
              <Label htmlFor="bs-logo-transparent" className="cursor-pointer">{T.branding.logoTransparentBg}</Label>
              <button type="button" id="bs-logo-transparent" role="switch" aria-checked={logoTransparentBg}
                onClick={() => setLogoTransparentBg(v => !v)} disabled={isPending || isResetting}
                className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50", logoTransparentBg ? "bg-primary" : "bg-muted-foreground/30")}>
                <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-background shadow transition-transform", logoTransparentBg ? "translate-x-4.5" : "translate-x-0.5")} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Appearance: rounded + colors */}
      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">{T.branding.colors}</h2>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5">
          <Label htmlFor="bs-rounded" className="cursor-pointer">{T.eventDetail.branding.roundedCorners}</Label>
          <button type="button" id="bs-rounded" role="switch" aria-checked={!squareCorners}
            onClick={() => setSquareCorners(v => !v)} disabled={isPending || isResetting}
            className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50", !squareCorners ? "bg-primary" : "bg-muted-foreground/30")}>
            <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-background shadow transition-transform", !squareCorners ? "translate-x-4.5" : "translate-x-0.5")} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <BrandingColorField id="bs-color" label={T.branding.color} value={color} placeholder="#6366f1" onChange={setColor} />
          <BrandingColorField id="bs-text" label={T.branding.textColor} value={textColor} placeholder="#111111" defaultColor="#111111" onChange={setTextColor} />
          <BrandingColorField id="bs-card" label={T.branding.cardColor} value={cardColor} placeholder="#ffffff" defaultColor="#ffffff" onChange={setCardColor} />
        </div>
        <div className="sm:max-w-[33%]">
          <BrandingColorField id="bs-icon-bg" label={T.branding.iconBackgroundColor} value={iconBackgroundColor} placeholder="#ffffff" defaultColor="#ffffff" onChange={setIconBackgroundColor} />
        </div>
      </div>

      {/* Background: color / gradient / image */}
      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">{T.eventDetail.branding.background}</h2>
        <div className="inline-flex rounded-lg border border-border/60 bg-muted/30 p-0.5">
          {([["color", T.eventDetail.branding.bgTypeSolid], ["gradient", T.eventDetail.branding.bgTypeGradient], ["image", T.eventDetail.branding.bgTypeImage]] as const).map(([t, label]) => (
            <button key={t} type="button" onClick={() => setBgType(t)}
              className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition", bgType === t ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {label}
            </button>
          ))}
        </div>

        {bgType === "color" && (
          <div className="sm:max-w-[50%]">
            <BrandingColorField id="bs-bg" label={T.branding.backgroundColor} value={backgroundColor} placeholder="#f4f4f5" defaultColor="#f4f4f5" onChange={setBackgroundColor} />
          </div>
        )}
        {bgType === "gradient" && (
          <div className="space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <BrandingColorField id="bs-grad-from" label={T.eventDetail.branding.gradientFrom} value={backgroundColor} placeholder="#6366f1" defaultColor="#6366f1" onChange={setBackgroundColor} />
              <BrandingColorField id="bs-grad-to" label={T.eventDetail.branding.gradientTo} value={backgroundColor2} placeholder="#ec4899" defaultColor="#ec4899" onChange={setBackgroundColor2} />
            </div>
            <div>
              <Label>{T.eventDetail.branding.gradientDirection}</Label>
              <div className="mt-1.5 flex gap-1.5">
                {DIRECTIONS.map(({ angle, Icon }) => (
                  <button key={angle} type="button" onClick={() => setGradientAngle(angle)}
                    className={cn("grid h-9 w-9 place-items-center rounded-lg border transition", gradientAngle === angle ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted/40")}>
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {bgType === "image" && (
          <ImageDropzone
            value={backgroundImageUrl}
            onChange={setBackgroundImageUrl}
            hint={T.branding.backgroundImageHint}
            previewClassName="h-32 w-full rounded-lg object-cover border border-border/60 bg-muted/20"
          />
        )}
      </div>
       </div>

       <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-4">
      {/* Preview — always visible, on the right like the event/calendar branding cards */}
      <div className="rounded-xl border border-border/60 bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">{T.branding.preview}</h2>
          <BrandingPreview
            logoUrl={logoUrl} logoSize={logoSize} logoTransparentBg={logoTransparentBg} squareCorners={squareCorners}
            color={color} textColor={textColor} cardColor={cardColor}
            bgType={bgType} backgroundColor={backgroundColor} backgroundColor2={backgroundColor2} gradientAngle={gradientAngle} backgroundImageUrl={backgroundImageUrl}
            title="Event title" meta="Mon 9 Jun · 10:00 – 11:00"
          />
      </div>
        </div>
       </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={onReset} disabled={isPending || isResetting || !hasCustomBranding} className="gap-1.5">
          {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
          {T.branding.reset}
        </Button>
        <SaveBrandingPresetButton currentData={currentPresetData} onSaved={refreshPresets} />
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
