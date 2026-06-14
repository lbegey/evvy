"use client";

import { useEffect, useRef, useState, useTransition, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Palette, RotateCcw, Loader2, ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { ImageDropzone } from "@/components/ImageDropzone";
import { SaveBrandingPresetButton } from "@/components/SaveBrandingPresetButton";
import { useBrandingPresets } from "@/hooks/useBrandingPresets";
import { type BrandingPreset } from "@/app/actions/brandingPresets";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { brandBackgroundStyle, resolveBrandBackgroundType, showBrandBackgroundImage, DEFAULT_GRADIENT_ANGLE, type BrandBackgroundType } from "@/lib/branding";
import { EvvySwitch } from "./EvvySwitch";
import { LockedNotice } from "./LockedNotice";

const DEFAULT_LOGO_SIZE = 32;
const MIN_LOGO_SIZE = 16;
const MAX_LOGO_SIZE = 300;
const COLOR_SAVE_DELAY_MS = 700;

interface BrandingData {
  brandingEnabled: boolean;
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

interface Props {
  targetId: string;
  plan: string;
  brandingEnabled: boolean;
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
  initialPresets: BrandingPreset[];
  previewTitle: string;
  previewMeta: string;
  updateBranding: (id: string, data: BrandingData) => Promise<{ error: "forbidden" } | undefined>;
  applyPreset: (id: string, presetId: string) => Promise<{ error: "forbidden" } | undefined>;
}

function ColorField({ label, value, placeholder, onChange, onCommit }: {
  label: string; value: string; placeholder: string; onChange: (v: string) => void; onCommit: () => void;
}) {
  const hex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : placeholder;
  return (
    <div>
      <label className="text-xs font-medium text-inksoft">{label}</label>
      <div className="mt-1.5 flex items-center overflow-hidden rounded-lg border border-line focus-within:border-evvy focus-within:ring-2 focus-within:ring-evvy/30">
        <input type="color" value={hex} onChange={(e) => { onChange(e.target.value); }} onBlur={onCommit}
          className="h-10 w-10 cursor-pointer border-0 bg-transparent p-1" />
        <input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onCommit} placeholder={placeholder}
          className="h-10 min-w-0 flex-1 bg-transparent px-2 font-mono text-sm focus:outline-none" />
      </div>
    </div>
  );
}

const DIRECTIONS = [
  { angle: 180, Icon: ArrowDown },
  { angle: 135, Icon: ArrowDownRight },
  { angle: 90, Icon: ArrowRight },
  { angle: 45, Icon: ArrowUpRight },
] as const;

export function BrandingCard(props: Props) {
  const { targetId, plan, previewTitle, previewMeta, initialPresets, updateBranding, applyPreset } = props;
  const router = useRouter();
  const { T } = useLanguage();
  const { presets, refresh: refreshPresets } = useBrandingPresets(initialPresets);

  const [enabled, setEnabled] = useState(props.brandingEnabled);
  const [logoUrl, setLogoUrl] = useState(props.brandLogoUrl ?? "");
  const [logoSize, setLogoSize] = useState(props.brandLogoSize ?? DEFAULT_LOGO_SIZE);
  const [logoTransparentBg, setLogoTransparentBg] = useState(props.brandLogoTransparentBg);
  const [squareCorners, setSquareCorners] = useState(props.brandSquareCorners);
  const [color, setColor] = useState(props.brandColor ?? "");
  const [textColor, setTextColor] = useState(props.brandTextColor ?? "");
  const [cardColor, setCardColor] = useState(props.brandCardColor ?? "");
  const [backgroundColor, setBackgroundColor] = useState(props.brandBackgroundColor ?? "");
  const [backgroundColor2, setBackgroundColor2] = useState(props.brandBackgroundColor2 ?? "");
  const [gradientAngle, setGradientAngle] = useState(props.brandBackgroundGradientAngle ?? DEFAULT_GRADIENT_ANGLE);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(props.brandBackgroundImageUrl ?? "");
  const [bgType, setBgType] = useState<BrandBackgroundType>(resolveBrandBackgroundType(props));
  // kept (configurable on the account branding page) but not edited here — persisted as-is
  const iconBg = props.brandIconBackgroundColor;

  const [isPending, startTransition] = useTransition();
  const [, startColorSave] = useTransition();
  const [isResetting, startReset] = useTransition();
  const [applyId, setApplyId] = useState("");
  const [isApplying, startApply] = useTransition();
  const isFirstRender = useRef(true);

  const hasCustom = Boolean(logoUrl || color || textColor || cardColor || backgroundColor || backgroundColor2 || backgroundImageUrl || squareCorners);

  const buildData = (overrides: Partial<Record<string, unknown>> = {}): BrandingData => {
    const next = {
      enabled, logoUrl, logoSize, logoTransparentBg, squareCorners, color, textColor, cardColor,
      backgroundColor, backgroundColor2, gradientAngle, backgroundImageUrl, bgType, ...overrides,
    } as {
      enabled: boolean; logoUrl: string; logoSize: number; logoTransparentBg: boolean; squareCorners: boolean;
      color: string; textColor: string; cardColor: string; backgroundColor: string; backgroundColor2: string;
      gradientAngle: number; backgroundImageUrl: string; bgType: BrandBackgroundType;
    };
    return {
      brandingEnabled: next.enabled,
      brandLogoUrl: next.enabled ? (next.logoUrl || null) : null,
      brandLogoSize: next.enabled ? next.logoSize : null,
      brandLogoTransparentBg: next.logoTransparentBg,
      brandLogoRounded: !next.squareCorners, // logo follows the global corner setting
      brandColor: next.enabled ? (next.color || null) : null,
      brandTextColor: next.enabled ? (next.textColor || null) : null,
      brandCardColor: next.enabled ? (next.cardColor || null) : null,
      brandIconBackgroundColor: next.enabled ? iconBg : null,
      brandBackgroundColor: next.enabled ? (next.backgroundColor || null) : null,
      brandBackgroundImageUrl: next.enabled ? (next.backgroundImageUrl || null) : null,
      brandSquareCorners: next.squareCorners,
      brandBackgroundType: next.enabled ? next.bgType : null,
      brandBackgroundColor2: next.enabled ? (next.backgroundColor2 || null) : null,
      brandBackgroundGradientAngle: next.enabled ? next.gradientAngle : null,
    };
  };

  const persist = (overrides: Partial<Record<string, unknown>> = {}) => {
    startTransition(async () => { await updateBranding(targetId, buildData(overrides)); router.refresh(); });
  };

  // debounced auto-save for color/gradient fields
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!enabled) return;
    const timer = setTimeout(() => {
      startColorSave(async () => { await updateBranding(targetId, buildData()); router.refresh(); });
    }, COLOR_SAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, textColor, cardColor, backgroundColor, backgroundColor2]);

  const onApplyPreset = () => {
    const preset = presets.find((p) => p.id === applyId);
    if (!preset) return;
    setEnabled(true);
    setLogoUrl(preset.brandLogoUrl ?? "");
    setLogoSize(preset.brandLogoSize ?? DEFAULT_LOGO_SIZE);
    setLogoTransparentBg(preset.brandLogoTransparentBg);
    setSquareCorners(preset.brandSquareCorners);
    setColor(preset.brandColor ?? "");
    setTextColor(preset.brandTextColor ?? "");
    setCardColor(preset.brandCardColor ?? "");
    setBackgroundColor(preset.brandBackgroundColor ?? "");
    setBackgroundColor2(preset.brandBackgroundColor2 ?? "");
    setGradientAngle(preset.brandBackgroundGradientAngle ?? DEFAULT_GRADIENT_ANGLE);
    setBackgroundImageUrl(preset.brandBackgroundImageUrl ?? "");
    setBgType(resolveBrandBackgroundType(preset));
    startApply(async () => { await applyPreset(targetId, preset.id); router.refresh(); });
  };

  const onReset = () => {
    if (!confirm(T.branding.resetConfirm)) return;
    setLogoUrl(""); setLogoSize(DEFAULT_LOGO_SIZE); setLogoTransparentBg(true); setSquareCorners(false);
    setColor(""); setTextColor(""); setCardColor(""); setBackgroundColor(""); setBackgroundColor2(""); setGradientAngle(DEFAULT_GRADIENT_ANGLE);
    setBackgroundImageUrl(""); setBgType("color");
    startReset(async () => {
      await updateBranding(targetId, {
        brandingEnabled: enabled, brandLogoUrl: null, brandLogoSize: null, brandLogoTransparentBg: true, brandLogoRounded: true,
        brandColor: null, brandTextColor: null, brandCardColor: null, brandIconBackgroundColor: null, brandBackgroundColor: null, brandBackgroundImageUrl: null,
        brandSquareCorners: false, brandBackgroundType: null, brandBackgroundColor2: null, brandBackgroundGradientAngle: null,
      });
      router.refresh();
    });
  };

  const currentPresetData = {
    brandLogoUrl: logoUrl || null, brandLogoSize: logoSize, brandLogoTransparentBg: logoTransparentBg, brandLogoRounded: !squareCorners,
    brandColor: color || null, brandTextColor: textColor || null, brandCardColor: cardColor || null, brandIconBackgroundColor: iconBg,
    brandBackgroundColor: backgroundColor || null, brandBackgroundImageUrl: backgroundImageUrl || null,
    brandSquareCorners: squareCorners, brandBackgroundType: bgType, brandBackgroundColor2: backgroundColor2 || null, brandBackgroundGradientAngle: gradientAngle,
  };

  // Mirror the real public page.
  const valid = (s: string) => (/^#[0-9a-fA-F]{3,8}$/.test(s.trim()) ? s.trim() : null);
  const cAccent = valid(color);
  const cText = valid(textColor);
  const cCard = valid(cardColor);
  const previewBg = { brandBackgroundType: bgType, brandBackgroundColor: backgroundColor, brandBackgroundColor2: backgroundColor2, brandBackgroundGradientAngle: gradientAngle, brandBackgroundImageUrl: backgroundImageUrl };
  const previewStyle = {
    ...(cAccent ? { "--primary": cAccent, "--border": cAccent, "--ring": cAccent } : {}),
    ...(cText ? {
      "--foreground": cText, "--card-foreground": cText, "--muted-foreground": cText,
      "--primary-foreground": cText, "--secondary-foreground": cText, "--accent-foreground": cText,
    } : {}),
    ...(cCard ? { "--card": cCard, "--background": cCard } : {}),
    ...brandBackgroundStyle(previewBg),
  } as CSSProperties;

  const setType = (t: BrandBackgroundType) => { setBgType(t); persist({ bgType: t }); };

  return (
    <section data-reveal id="branding" className="scroll-mt-24">
      <div className="rounded-xl2 border border-line bg-white shadow-card">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-evvy-soft text-evvy"><Palette className="h-[18px] w-[18px]" /></span>
          <div>
            <h2 className="font-display text-lg font-bold leading-none">{T.eventDetail.branding.title}</h2>
            <p className="mt-1 text-xs text-inksoft">{T.eventDashboard.brandingSubtitle}</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/dashboard/branding/presets" className="hidden h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium transition hover:bg-paper sm:inline-flex">
              {T.branding.presets.manage}
            </Link>
            <label className="flex items-center gap-2 text-sm text-inksoft">
              <span>{enabled ? T.rsvpSection.enabled : T.rsvpSection.disabled}</span>
              <EvvySwitch checked={enabled} disabled={isPending} onCheckedChange={(next) => { setEnabled(next); persist({ enabled: next }); }} />
            </label>
          </div>
        </div>

        {plan !== "premium" ? (
          <div className="p-5"><LockedNotice message={T.eventDetail.branding.locked} unlock={T.eventDetail.branding.unlock} /></div>
        ) : (
          <div className="grid gap-6 p-5 lg:grid-cols-5">
            {/* controls */}
            <div className="space-y-5 lg:col-span-3">
              {presets.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-line bg-paper/60 p-2.5">
                  <select value={applyId} onChange={(e) => setApplyId(e.target.value)} className="h-8 min-w-0 flex-1 basis-40 rounded-md border border-line bg-white px-2 text-xs focus:border-evvy focus:outline-none">
                    <option value="">{T.branding.presets.applyPlaceholder}</option>
                    {presets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <button type="button" onClick={onApplyPreset} disabled={!applyId || isApplying}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-medium transition hover:bg-paper disabled:opacity-40">
                    {isApplying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}{T.branding.presets.apply}
                  </button>
                </div>
              )}

              {/* Logo + its size directly underneath */}
              <div>
                <label className="text-xs font-medium text-inksoft">{T.eventDetail.branding.logo}</label>
                <div className="mt-1.5">
                  <ImageDropzone value={logoUrl} onChange={(v) => { setLogoUrl(v); persist({ logoUrl: v }); }} maxSize={3 * 1024 * 1024}
                    previewClassName="mx-auto block h-24 w-auto max-w-full rounded-lg border border-line bg-paper object-contain p-2" />
                </div>
                {logoUrl && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-inksoft">{T.eventDetail.branding.logoSize}</label>
                        <span className="text-xs tabular-nums text-inksoft">{logoSize}px</span>
                      </div>
                      <input type="range" min={MIN_LOGO_SIZE} max={MAX_LOGO_SIZE} value={logoSize}
                        onChange={(e) => setLogoSize(Number(e.target.value))}
                        onMouseUp={(e) => persist({ logoSize: Number((e.target as HTMLInputElement).value) })}
                        onTouchEnd={(e) => persist({ logoSize: Number((e.target as HTMLInputElement).value) })}
                        className="mt-1.5 h-2 w-full cursor-pointer accent-evvy" />
                    </div>
                    <label className="flex items-center justify-between gap-2 rounded-lg border border-line px-2.5 py-2 text-xs">
                      {T.eventDetail.branding.logoTransparentBg}
                      <EvvySwitch checked={logoTransparentBg} onCheckedChange={(n) => { setLogoTransparentBg(n); persist({ logoTransparentBg: n }); }} />
                    </label>
                  </div>
                )}
              </div>

              {/* Global rounded corners */}
              <label className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2.5 text-sm">
                <span className="font-medium text-ink">{T.eventDetail.branding.roundedCorners}</span>
                <EvvySwitch checked={!squareCorners} onCheckedChange={(n) => { const sq = !n; setSquareCorners(sq); persist({ squareCorners: sq }); }} />
              </label>

              {/* Accent / text / card — side by side */}
              <div className="grid gap-x-3 gap-y-3 sm:grid-cols-3">
                <ColorField label={T.eventDetail.branding.color} value={color} placeholder="#6366f1" onChange={setColor} onCommit={() => persist({ color })} />
                <ColorField label={T.eventDetail.branding.textColor} value={textColor} placeholder="#111111" onChange={setTextColor} onCommit={() => persist({ textColor })} />
                <ColorField label={T.eventDetail.branding.cardColor} value={cardColor} placeholder="#ffffff" onChange={setCardColor} onCommit={() => persist({ cardColor })} />
              </div>

              {/* Background group: color / gradient / image */}
              <div>
                <label className="text-xs font-medium text-inksoft">{T.eventDetail.branding.background}</label>
                <div className="mt-1.5 inline-flex rounded-lg border border-line bg-paper p-0.5">
                  {([["color", T.eventDetail.branding.bgTypeSolid], ["gradient", T.eventDetail.branding.bgTypeGradient], ["image", T.eventDetail.branding.bgTypeImage]] as const).map(([t, label]) => (
                    <button key={t} type="button" onClick={() => setType(t)}
                      className={cn("rounded-md px-3 py-1.5 text-xs font-medium transition", bgType === t ? "bg-white text-evvy shadow-card" : "text-inksoft hover:text-ink")}>
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  {bgType === "color" && (
                    <ColorField label={T.eventDetail.branding.backgroundColor} value={backgroundColor} placeholder="#f4f4f5" onChange={setBackgroundColor} onCommit={() => persist({ backgroundColor })} />
                  )}
                  {bgType === "gradient" && (
                    <div className="space-y-3">
                      <div className="grid gap-x-3 gap-y-3 sm:grid-cols-2">
                        <ColorField label={T.eventDetail.branding.gradientFrom} value={backgroundColor} placeholder="#6366f1" onChange={setBackgroundColor} onCommit={() => persist({ backgroundColor })} />
                        <ColorField label={T.eventDetail.branding.gradientTo} value={backgroundColor2} placeholder="#ec4899" onChange={setBackgroundColor2} onCommit={() => persist({ backgroundColor2 })} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-inksoft">{T.eventDetail.branding.gradientDirection}</label>
                        <div className="mt-1.5 flex gap-1.5">
                          {DIRECTIONS.map(({ angle, Icon }) => (
                            <button key={angle} type="button" onClick={() => { setGradientAngle(angle); persist({ gradientAngle: angle }); }}
                              className={cn("grid h-9 w-9 place-items-center rounded-lg border transition", gradientAngle === angle ? "border-evvy bg-evvy-soft text-evvy" : "border-line text-inksoft hover:bg-paper")}>
                              <Icon className="h-4 w-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {bgType === "image" && (
                    <ImageDropzone value={backgroundImageUrl} onChange={(v) => { setBackgroundImageUrl(v); persist({ backgroundImageUrl: v }); }}
                      previewClassName="h-24 w-full rounded-lg border border-line object-cover" />
                  )}
                </div>
              </div>
            </div>

            {/* live preview — faithful mini-replica of the public event page */}
            <div className="lg:col-span-2">
              <p className="mb-1.5 text-xs font-medium text-inksoft">{T.eventDashboard.livePreview}</p>
              <div className={cn("relative isolate overflow-hidden rounded-xl2 border border-line bg-muted/20 p-4", squareCorners && "brand-square")} style={previewStyle}>
                {showBrandBackgroundImage(previewBg) && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 scale-110 bg-cover bg-center blur-sm"
                    style={{ backgroundImage: `url(${JSON.stringify(backgroundImageUrl)})` }}
                  />
                )}
                {logoUrl && (
                  <div className="mb-2 flex justify-center">
                    <span className="inline-flex overflow-hidden rounded-lg" style={!logoTransparentBg ? { backgroundColor: cCard ?? "#ffffff" } : undefined}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoUrl} alt="" style={{ maxWidth: logoSize, width: "100%" }} className="h-auto rounded-lg object-contain" />
                    </span>
                  </div>
                )}
                <div className="overflow-hidden rounded-xl border border-border/60 bg-background shadow-card">
                  <div className="p-4">
                    <p className="font-display text-base font-bold text-foreground">{previewTitle}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{previewMeta}</p>
                    <button type="button" className="mt-3 h-9 w-full rounded-lg text-sm font-semibold" style={{ backgroundColor: "var(--foreground)", color: "var(--card)" }}>
                      {T.rsvpForm.attending.replace(/^✓\s*/, "")}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={onReset} disabled={isResetting || !hasCustom}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium transition hover:bg-paper disabled:opacity-40">
                  {isResetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}{T.branding.reset}
                </button>
                <SaveBrandingPresetButton currentData={currentPresetData} onSaved={refreshPresets} size="sm" className="h-9 border-line hover:bg-paper" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
