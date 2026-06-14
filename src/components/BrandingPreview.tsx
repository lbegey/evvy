"use client";

import { type CSSProperties } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { brandBackgroundStyle, showBrandBackgroundImage, type BrandBackgroundType } from "@/lib/branding";

interface Props {
  logoUrl: string;
  logoSize: number;
  logoTransparentBg: boolean;
  squareCorners: boolean;
  color: string;
  textColor: string;
  cardColor: string;
  bgType: BrandBackgroundType;
  backgroundColor: string;
  backgroundColor2: string;
  gradientAngle: number;
  backgroundImageUrl: string;
  title: string;
  meta: string;
}

const valid = (s: string) => (/^#[0-9a-fA-F]{3,8}$/.test(s.trim()) ? s.trim() : null);

/**
 * Shared live branding preview — a faithful mini-replica of the public event
 * page. Used identically on the event/calendar branding cards and the account
 * branding page so the editing experience is the same everywhere.
 */
export function BrandingPreview(props: Props) {
  const { T } = useLanguage();
  const { logoUrl, logoSize, logoTransparentBg, squareCorners, color, textColor, cardColor, bgType, backgroundColor, backgroundColor2, gradientAngle, backgroundImageUrl, title, meta } = props;

  const cAccent = valid(color);
  const cText = valid(textColor);
  const cCard = valid(cardColor);
  const previewBg = {
    brandBackgroundType: bgType,
    brandBackgroundColor: backgroundColor,
    brandBackgroundColor2: backgroundColor2,
    brandBackgroundGradientAngle: gradientAngle,
    brandBackgroundImageUrl: backgroundImageUrl,
  };
  const previewStyle = {
    ...(cAccent ? { "--primary": cAccent, "--border": cAccent, "--ring": cAccent } : {}),
    ...(cText ? {
      "--foreground": cText, "--card-foreground": cText, "--muted-foreground": cText,
      "--primary-foreground": cText, "--secondary-foreground": cText, "--accent-foreground": cText,
    } : {}),
    ...(cCard ? { "--card": cCard, "--background": cCard } : {}),
    ...brandBackgroundStyle(previewBg),
  } as CSSProperties;

  return (
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
          <p className="font-display text-base font-bold text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
          <button type="button" className="mt-3 h-9 w-full rounded-lg text-sm font-semibold" style={{ backgroundColor: "var(--foreground)", color: "var(--card)" }}>
            {T.rsvpForm.attending.replace(/^✓\s*/, "")}
          </button>
        </div>
      </div>
    </div>
  );
}
