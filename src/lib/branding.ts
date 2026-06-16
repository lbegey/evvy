import type { CSSProperties } from "react";

const isColor = (s?: string | null) => (s && /^#[0-9a-fA-F]{3,8}$/.test(s.trim()) ? s.trim() : null);

export type BrandBackgroundType = "color" | "gradient" | "image";

export interface BrandBackground {
  brandBackgroundType?: string | null;
  brandBackgroundColor?: string | null;
  brandBackgroundColor2?: string | null;
  brandBackgroundGradientAngle?: number | null;
  brandBackgroundImageUrl?: string | null;
}

/** Which background to render. Falls back to image (legacy) or color when type is unset. */
export function resolveBrandBackgroundType(b: BrandBackground): BrandBackgroundType {
  if (b.brandBackgroundType === "gradient" || b.brandBackgroundType === "image" || b.brandBackgroundType === "color") {
    return b.brandBackgroundType;
  }
  if (b.brandBackgroundImageUrl) return "image";
  return "color";
}

/** Inline style for the page background (solid color or gradient). Image uses a separate blurred layer. */
export function brandBackgroundStyle(b: BrandBackground): CSSProperties {
  const type = resolveBrandBackgroundType(b);
  if (type === "gradient") {
    const a = isColor(b.brandBackgroundColor) ?? "#f4f4f5";
    const c = isColor(b.brandBackgroundColor2) ?? a;
    const angle = b.brandBackgroundGradientAngle ?? 135;
    return { backgroundImage: `linear-gradient(${angle}deg, ${a}, ${c})` };
  }
  if (type === "color") {
    const a = isColor(b.brandBackgroundColor);
    return a ? { backgroundColor: a } : {};
  }
  return {};
}

export function showBrandBackgroundImage(b: BrandBackground): boolean {
  return resolveBrandBackgroundType(b) === "image" && !!b.brandBackgroundImageUrl;
}

/** All brand-* fields stored on both User and Event. */
export interface BrandFields {
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

/** Prisma `select` covering every brand field — reuse for User and Event queries. */
export const BRAND_FIELDS_SELECT = {
  brandLogoUrl: true,
  brandLogoSize: true,
  brandLogoTransparentBg: true,
  brandLogoRounded: true,
  brandColor: true,
  brandTextColor: true,
  brandCardColor: true,
  brandIconBackgroundColor: true,
  brandBackgroundColor: true,
  brandBackgroundImageUrl: true,
  brandSquareCorners: true,
  brandBackgroundType: true,
  brandBackgroundColor2: true,
  brandBackgroundGradientAngle: true,
} as const;

export interface ResolvedEventBranding {
  isPremiumOrganizer: boolean;
  brandLogoUrl: string | null;
  brandLogoSize: number;
  brandLogoTransparentBg: boolean;
  brandLogoRounded: boolean;
  brandIconBackgroundColor: string | null;
  brandCardColor: string | null;
  brandSquareCorners: boolean;
  brandBackgroundImageUrl: string | null;
  showBackgroundImage: boolean;
  brandStyle: CSSProperties | undefined;
}

/**
 * Resolve the effective branding for a public event view, applying the
 * premium gate and the event-level override over account-wide defaults.
 * Single source of truth shared by the public event page and the iframe embed.
 */
export function resolveEventBranding(opts: {
  plan: string;
  brandingEnabled: boolean;
  event: BrandFields;
  user: BrandFields;
}): ResolvedEventBranding {
  const { plan, brandingEnabled, event, user } = opts;
  const isPremiumOrganizer = plan === "premium";
  const useEventOverride = isPremiumOrganizer && brandingEnabled;
  const pick = <K extends keyof BrandFields>(key: K): BrandFields[K] =>
    useEventOverride ? event[key] : user[key];

  const brandLogoUrl = isPremiumOrganizer ? pick("brandLogoUrl") : null;
  const brandLogoSize = (isPremiumOrganizer ? pick("brandLogoSize") : null) ?? 32;
  const brandLogoTransparentBg = isPremiumOrganizer ? pick("brandLogoTransparentBg") : true;
  const brandLogoRounded = isPremiumOrganizer ? pick("brandLogoRounded") : false;
  const brandColor = isPremiumOrganizer ? pick("brandColor") : null;
  const brandTextColor = isPremiumOrganizer ? pick("brandTextColor") : null;
  const brandCardColor = isPremiumOrganizer ? pick("brandCardColor") : null;
  const brandIconBackgroundColor = isPremiumOrganizer ? pick("brandIconBackgroundColor") : null;
  const brandBackgroundColor = isPremiumOrganizer ? pick("brandBackgroundColor") : null;
  const brandBackgroundImageUrl = isPremiumOrganizer ? pick("brandBackgroundImageUrl") : null;
  const brandSquareCorners = isPremiumOrganizer ? pick("brandSquareCorners") : false;
  const brandBg: BrandBackground = {
    brandBackgroundType: isPremiumOrganizer ? pick("brandBackgroundType") : null,
    brandBackgroundColor,
    brandBackgroundColor2: isPremiumOrganizer ? pick("brandBackgroundColor2") : null,
    brandBackgroundGradientAngle: isPremiumOrganizer ? pick("brandBackgroundGradientAngle") : null,
    brandBackgroundImageUrl,
  };

  const brandStyle: CSSProperties | undefined =
    brandColor || brandBackgroundColor || brandBackgroundImageUrl || brandTextColor || brandCardColor || brandBg.brandBackgroundColor2
      ? {
          ...(brandColor ? ({ "--primary": brandColor, "--border": brandColor, "--ring": brandColor } as CSSProperties) : {}),
          ...(brandTextColor
            ? ({
                "--foreground": brandTextColor,
                "--card-foreground": brandTextColor,
                "--popover-foreground": brandTextColor,
                "--muted-foreground": brandTextColor,
                "--primary-foreground": brandTextColor,
                "--secondary-foreground": brandTextColor,
                "--accent-foreground": brandTextColor,
              } as CSSProperties)
            : {}),
          ...(brandCardColor ? ({ "--card": brandCardColor, "--background": brandCardColor } as CSSProperties) : {}),
          ...brandBackgroundStyle(brandBg),
        }
      : undefined;

  return {
    isPremiumOrganizer,
    brandLogoUrl,
    brandLogoSize,
    brandLogoTransparentBg,
    brandLogoRounded,
    brandIconBackgroundColor,
    brandCardColor,
    brandSquareCorners,
    brandBackgroundImageUrl,
    showBackgroundImage: showBrandBackgroundImage(brandBg),
    brandStyle,
  };
}

export const DEFAULT_GRADIENT_ANGLE = 135;

/** Direction presets offered in the branding UI (angle + i18n key). */
export const GRADIENT_DIRECTIONS = [
  { angle: 180, key: "down" },
  { angle: 135, key: "diagonal" },
  { angle: 90, key: "right" },
  { angle: 45, key: "diagonalUp" },
] as const;
