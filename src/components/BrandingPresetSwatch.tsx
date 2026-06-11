const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/;

interface BrandingPresetSwatchProps {
  brandLogoUrl: string | null;
  brandColor: string | null;
  brandCardColor: string | null;
  brandBackgroundColor: string | null;
}

export function BrandingPresetSwatch({ brandLogoUrl, brandColor, brandCardColor, brandBackgroundColor }: BrandingPresetSwatchProps) {
  const bg = brandBackgroundColor && HEX_COLOR_RE.test(brandBackgroundColor) ? brandBackgroundColor : undefined;
  const accent = brandColor && HEX_COLOR_RE.test(brandColor) ? brandColor : undefined;
  const card = brandCardColor && HEX_COLOR_RE.test(brandCardColor) ? brandCardColor : undefined;

  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40"
      style={bg ? { backgroundColor: bg } : undefined}
    >
      {brandLogoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={brandLogoUrl} alt="" className="h-full w-full object-contain p-1" />
      ) : (
        <span
          className="h-4 w-4 rounded-full border border-border/40"
          style={{ backgroundColor: accent ?? card ?? "var(--muted-foreground)" }}
        />
      )}
    </div>
  );
}
