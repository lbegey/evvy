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

export const DEFAULT_GRADIENT_ANGLE = 135;

/** Direction presets offered in the branding UI (angle + i18n key). */
export const GRADIENT_DIRECTIONS = [
  { angle: 180, key: "down" },
  { angle: 135, key: "diagonal" },
  { angle: 90, key: "right" },
  { angle: 45, key: "diagonalUp" },
] as const;
