"use client";

import Link from "next/link";
import { BrandingSettings } from "@/components/BrandingSettings";
import { useLanguage } from "@/contexts/LanguageContext";

interface BrandingPageContentProps {
  unlocked: boolean;
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

export function BrandingPageContent({
  unlocked, brandLogoUrl, brandLogoSize, brandLogoTransparentBg, brandLogoRounded,
  brandColor, brandTextColor, brandCardColor, brandBackgroundColor, brandBackgroundImageUrl,
}: BrandingPageContentProps) {
  const { T } = useLanguage();

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {T.branding.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{T.branding.subtitle}</p>
      </div>

      {unlocked ? (
        <BrandingSettings
          brandLogoUrl={brandLogoUrl}
          brandLogoSize={brandLogoSize}
          brandLogoTransparentBg={brandLogoTransparentBg}
          brandLogoRounded={brandLogoRounded}
          brandColor={brandColor}
          brandTextColor={brandTextColor}
          brandCardColor={brandCardColor}
          brandBackgroundColor={brandBackgroundColor}
          brandBackgroundImageUrl={brandBackgroundImageUrl}
        />
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-5">
          <p className="text-sm text-muted-foreground">{T.branding.locked}</p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            {T.branding.unlock}
          </Link>
        </div>
      )}
    </section>
  );
}
