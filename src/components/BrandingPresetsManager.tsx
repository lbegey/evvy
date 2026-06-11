"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandingPresetSwatch } from "@/components/BrandingPresetSwatch";
import { SaveBrandingPresetDialog } from "@/components/SaveBrandingPresetDialog";
import {
  listBrandingPresets,
  createBrandingPreset,
  deleteBrandingPreset,
  type BrandingPreset,
  type BrandingPresetData,
} from "@/app/actions/brandingPresets";
import { useLanguage } from "@/contexts/LanguageContext";

interface BrandingPresetsManagerProps {
  currentData: BrandingPresetData;
}

export function BrandingPresetsManager({ currentData }: BrandingPresetsManagerProps) {
  const { T } = useLanguage();
  const [presets, setPresets] = useState<BrandingPreset[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    listBrandingPresets().then((p) => { setPresets(p); setLoaded(true); });
  }, []);

  const handleSave = async (name: string) => {
    await createBrandingPreset(name, currentData);
    setPresets(await listBrandingPresets());
  };

  const handleDelete = (id: string) => {
    if (!confirm(T.branding.presets.deleteConfirm)) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteBrandingPreset(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
      setDeletingId(null);
    });
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{T.branding.presets.title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{T.branding.presets.subtitle}</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => setDialogOpen(true)} className="shrink-0 gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          {T.branding.presets.save}
        </Button>
      </div>

      {loaded && (
        presets.length === 0 ? (
          <p className="text-xs text-muted-foreground">{T.branding.presets.empty}</p>
        ) : (
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
        )
      )}

      <SaveBrandingPresetDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleSave} />
    </div>
  );
}
