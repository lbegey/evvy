"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandingPresetsManager } from "@/components/BrandingPresetsManager";
import { useLanguage } from "@/contexts/LanguageContext";

export function BrandingPresetsPageContent() {
  const { T } = useLanguage();

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">
      <div>
        <Link
          href="/dashboard/branding"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {T.branding.presets.backToBranding}
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {T.branding.presets.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{T.branding.presets.manageSubtitle}</p>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-5">
        <BrandingPresetsManager />
      </div>
    </section>
  );
}
