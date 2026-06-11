"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { BrandingPresetSwatch } from "@/components/BrandingPresetSwatch";
import { deleteBrandingPreset } from "@/app/actions/brandingPresets";
import { useBrandingPresets } from "@/hooks/useBrandingPresets";
import { useLanguage } from "@/contexts/LanguageContext";

export function BrandingPresetsManager() {
  const { T } = useLanguage();
  const { presets, loaded, refresh } = useBrandingPresets();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (!confirm(T.branding.presets.deleteConfirm)) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteBrandingPreset(id);
      await refresh();
      setDeletingId(null);
    });
  };

  if (!loaded) return null;

  if (presets.length === 0) {
    return <p className="text-sm text-muted-foreground">{T.branding.presets.empty}</p>;
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {presets.map((preset) => (
        <li key={preset.id} className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
          <BrandingPresetSwatch
            brandLogoUrl={preset.brandLogoUrl}
            brandColor={preset.brandColor}
            brandCardColor={preset.brandCardColor}
            brandBackgroundColor={preset.brandBackgroundColor}
          />
          <span className="flex-1 truncate text-sm font-medium text-foreground">{preset.name}</span>
          <button
            type="button"
            onClick={() => handleDelete(preset.id)}
            disabled={deletingId === preset.id}
            aria-label={T.branding.presets.delete}
            className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
          >
            {deletingId === preset.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        </li>
      ))}
    </ul>
  );
}
