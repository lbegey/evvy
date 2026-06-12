"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Palette, RotateCcw, Loader2 } from "lucide-react";
import { ImageDropzone } from "@/components/ImageDropzone";
import { SaveBrandingPresetButton } from "@/components/SaveBrandingPresetButton";
import { useBrandingPresets } from "@/hooks/useBrandingPresets";
import { updateEventBranding } from "@/app/actions/events";
import { applyBrandingPresetToEvent, type BrandingPreset } from "@/app/actions/brandingPresets";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { EvvySwitch } from "./EvvySwitch";
import { LockedNotice } from "./LockedNotice";

const DEFAULT_LOGO_SIZE = 32;
const MIN_LOGO_SIZE = 16;
const MAX_LOGO_SIZE = 300;
const COLOR_SAVE_DELAY_MS = 700;

interface Props {
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
  brandIconBackgroundColor: string | null;
  brandBackgroundColor: string | null;
  brandBackgroundImageUrl: string | null;
  initialPresets: BrandingPreset[];
  previewTitle: string;
  previewMeta: string;
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

export function EventBrandingCard(props: Props) {
  const { eventId, plan, previewTitle, previewMeta, initialPresets } = props;
  const router = useRouter();
  const { T } = useLanguage();
  const { presets, refresh: refreshPresets } = useBrandingPresets(initialPresets);

  const [enabled, setEnabled] = useState(props.brandingEnabled);
  const [logoUrl, setLogoUrl] = useState(props.brandLogoUrl ?? "");
  const [logoSize, setLogoSize] = useState(props.brandLogoSize ?? DEFAULT_LOGO_SIZE);
  const [logoTransparentBg, setLogoTransparentBg] = useState(props.brandLogoTransparentBg);
  const [logoRounded, setLogoRounded] = useState(props.brandLogoRounded);
  const [color, setColor] = useState(props.brandColor ?? "");
  const [textColor, setTextColor] = useState(props.brandTextColor ?? "");
  const [cardColor, setCardColor] = useState(props.brandCardColor ?? "");
  const [backgroundColor, setBackgroundColor] = useState(props.brandBackgroundColor ?? "");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(props.brandBackgroundImageUrl ?? "");
  // kept (configurable on the account branding page) but not edited here — persisted as-is
  const iconBg = props.brandIconBackgroundColor;

  const [isPending, startTransition] = useTransition();
  const [, startColorSave] = useTransition();
  const [isResetting, startReset] = useTransition();
  const [applyId, setApplyId] = useState("");
  const [isApplying, startApply] = useTransition();
  const isFirstRender = useRef(true);

  const hasCustom = Boolean(logoUrl || color || textColor || cardColor || backgroundColor || backgroundImageUrl);

  const buildData = (overrides: Partial<Record<string, unknown>> = {}) => {
    const next = { enabled, logoUrl, logoSize, logoTransparentBg, logoRounded, color, textColor, cardColor, backgroundColor, backgroundImageUrl, ...overrides } as {
      enabled: boolean; logoUrl: string; logoSize: number; logoTransparentBg: boolean; logoRounded: boolean;
      color: string; textColor: string; cardColor: string; backgroundColor: string; backgroundImageUrl: string;
    };
    return {
      brandingEnabled: next.enabled,
      brandLogoUrl: next.enabled ? (next.logoUrl || null) : null,
      brandLogoSize: next.enabled ? next.logoSize : null,
      brandLogoTransparentBg: next.logoTransparentBg,
      brandLogoRounded: next.logoRounded,
      brandColor: next.enabled ? (next.color || null) : null,
      brandTextColor: next.enabled ? (next.textColor || null) : null,
      brandCardColor: next.enabled ? (next.cardColor || null) : null,
      brandIconBackgroundColor: next.enabled ? iconBg : null,
      brandBackgroundColor: next.enabled ? (next.backgroundColor || null) : null,
      brandBackgroundImageUrl: next.enabled ? (next.backgroundImageUrl || null) : null,
    };
  };

  const persist = (overrides: Partial<Record<string, unknown>> = {}) => {
    startTransition(async () => { await updateEventBranding(eventId, buildData(overrides)); router.refresh(); });
  };

  // debounced auto-save for color fields
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    if (!enabled) return;
    const timer = setTimeout(() => {
      startColorSave(async () => { await updateEventBranding(eventId, buildData()); router.refresh(); });
    }, COLOR_SAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, textColor, cardColor, backgroundColor]);

  const onApplyPreset = () => {
    const preset = presets.find((p) => p.id === applyId);
    if (!preset) return;
    setEnabled(true);
    setLogoUrl(preset.brandLogoUrl ?? "");
    setLogoSize(preset.brandLogoSize ?? DEFAULT_LOGO_SIZE);
    setLogoTransparentBg(preset.brandLogoTransparentBg);
    setLogoRounded(preset.brandLogoRounded);
    setColor(preset.brandColor ?? "");
    setTextColor(preset.brandTextColor ?? "");
    setCardColor(preset.brandCardColor ?? "");
    setBackgroundColor(preset.brandBackgroundColor ?? "");
    setBackgroundImageUrl(preset.brandBackgroundImageUrl ?? "");
    startApply(async () => { await applyBrandingPresetToEvent(eventId, preset.id); router.refresh(); });
  };

  const onReset = () => {
    if (!confirm(T.branding.resetConfirm)) return;
    setLogoUrl(""); setLogoSize(DEFAULT_LOGO_SIZE); setLogoTransparentBg(true); setLogoRounded(false);
    setColor(""); setTextColor(""); setCardColor(""); setBackgroundColor(""); setBackgroundImageUrl("");
    startReset(async () => {
      await updateEventBranding(eventId, {
        brandingEnabled: enabled, brandLogoUrl: null, brandLogoSize: null, brandLogoTransparentBg: true, brandLogoRounded: false,
        brandColor: null, brandTextColor: null, brandCardColor: null, brandIconBackgroundColor: null, brandBackgroundColor: null, brandBackgroundImageUrl: null,
      });
      router.refresh();
    });
  };

  const currentPresetData = {
    brandLogoUrl: logoUrl || null, brandLogoSize: logoSize, brandLogoTransparentBg: logoTransparentBg, brandLogoRounded: logoRounded,
    brandColor: color || null, brandTextColor: textColor || null, brandCardColor: cardColor || null, brandIconBackgroundColor: iconBg,
    brandBackgroundColor: backgroundColor || null, brandBackgroundImageUrl: backgroundImageUrl || null,
  };

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

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-inksoft">{T.eventDetail.branding.logo}</label>
                  <div className="mt-1.5">
                    <ImageDropzone value={logoUrl} onChange={(v) => { setLogoUrl(v); persist({ logoUrl: v }); }}
                      previewClassName={cn("h-24 w-auto max-w-full rounded-lg object-contain p-2", !logoTransparentBg && "border border-line bg-paper")} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-inksoft">{T.eventDetail.branding.backgroundImage}</label>
                  <div className="mt-1.5">
                    <ImageDropzone value={backgroundImageUrl} onChange={(v) => { setBackgroundImageUrl(v); persist({ backgroundImageUrl: v }); }}
                      previewClassName="h-24 w-full rounded-lg border border-line object-cover" />
                  </div>
                </div>
              </div>

              {logoUrl && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-inksoft">{T.eventDetail.branding.logoSize}</label>
                    <div className="mt-1.5 flex items-center gap-3">
                      <input type="range" min={MIN_LOGO_SIZE} max={MAX_LOGO_SIZE} value={logoSize}
                        onChange={(e) => setLogoSize(Number(e.target.value))}
                        onMouseUp={(e) => persist({ logoSize: Number((e.target as HTMLInputElement).value) })}
                        onTouchEnd={(e) => persist({ logoSize: Number((e.target as HTMLInputElement).value) })}
                        className="h-2 flex-1 cursor-pointer accent-evvy" />
                      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-inksoft">{logoSize}px</span>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="flex items-center justify-between gap-2 rounded-lg border border-line px-2.5 py-2 text-xs">
                      {T.eventDetail.branding.logoTransparentBg}
                      <EvvySwitch checked={logoTransparentBg} onCheckedChange={(n) => { setLogoTransparentBg(n); persist({ logoTransparentBg: n }); }} />
                    </label>
                    <label className="flex items-center justify-between gap-2 rounded-lg border border-line px-2.5 py-2 text-xs">
                      {T.eventDetail.branding.logoRounded}
                      <EvvySwitch checked={logoRounded} onCheckedChange={(n) => { setLogoRounded(n); persist({ logoRounded: n }); }} />
                    </label>
                  </div>
                </div>
              )}

              <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                <ColorField label={T.eventDetail.branding.color} value={color} placeholder="#6366f1" onChange={setColor} onCommit={() => persist({ color })} />
                <ColorField label={T.eventDetail.branding.textColor} value={textColor} placeholder="#111111" onChange={setTextColor} onCommit={() => persist({ textColor })} />
                <ColorField label={T.eventDetail.branding.backgroundColor} value={backgroundColor} placeholder="#f4f4f5" onChange={setBackgroundColor} onCommit={() => persist({ backgroundColor })} />
                <ColorField label={T.eventDetail.branding.cardColor} value={cardColor} placeholder="#ffffff" onChange={setCardColor} onCommit={() => persist({ cardColor })} />
              </div>
            </div>

            {/* live preview */}
            <div className="lg:col-span-2">
              <p className="mb-1.5 text-xs font-medium text-inksoft">{T.eventDashboard.livePreview}</p>
              <div className="overflow-hidden rounded-xl2 border border-line" style={{ background: backgroundColor || "#f4f4f5" }}>
                <div className="h-16 bg-linear-to-br from-evvy to-coral" />
                <div className="-mt-7 mx-4 rounded-xl border border-line p-4 shadow-card" style={{ background: cardColor || "#ffffff" }}>
                  <p className="font-display text-base font-bold" style={{ color: textColor || "#111111" }}>{previewTitle}</p>
                  <p className="mt-1 text-xs text-inksoft">{previewMeta}</p>
                  <button type="button" className="mt-3 h-9 w-full rounded-lg text-sm font-semibold text-white" style={{ background: color || "#6366f1" }}>
                    {T.rsvpForm.attending.replace(/^✓\s*/, "")}
                  </button>
                </div>
                <div className="p-4 pt-3 text-[11px] text-inksoft">{T.eventDashboard.poweredBy}</div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button type="button" onClick={onReset} disabled={isResetting || !hasCustom}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium transition hover:bg-paper disabled:opacity-40">
                  {isResetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}{T.branding.reset}
                </button>
                <SaveBrandingPresetButton currentData={currentPresetData} onSaved={refreshPresets} size="sm" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
