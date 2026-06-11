"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { SaveBrandingPresetDialog } from "@/components/SaveBrandingPresetDialog";
import {
  listBrandingPresets,
  createBrandingPreset,
  type BrandingPreset,
  type BrandingPresetData,
} from "@/app/actions/brandingPresets";
import { useLanguage } from "@/contexts/LanguageContext";

interface BrandingPresetBarProps {
  currentData: BrandingPresetData;
  onApply: (preset: BrandingPreset) => Promise<void> | void;
}

export function BrandingPresetBar({ currentData, onApply }: BrandingPresetBarProps) {
  const { T } = useLanguage();
  const [presets, setPresets] = useState<BrandingPreset[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isApplying, startApply] = useTransition();

  useEffect(() => {
    listBrandingPresets().then(setPresets);
  }, []);

  const handleApply = () => {
    const preset = presets.find((p) => p.id === selectedId);
    if (!preset) return;
    startApply(async () => { await onApply(preset); });
  };

  const handleSave = async (name: string) => {
    await createBrandingPreset(name, currentData);
    setPresets(await listBrandingPresets());
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5">
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      {presets.length > 0 ? (
        <>
          <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="h-8 min-w-0 flex-1 basis-40 text-xs">
            <option value="">{T.branding.presets.applyPlaceholder}</option>
            {presets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Button type="button" size="sm" variant="outline" onClick={handleApply} disabled={!selectedId || isApplying} className="gap-1.5">
            {isApplying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {T.branding.presets.apply}
          </Button>
        </>
      ) : (
        <p className="flex-1 text-xs text-muted-foreground">{T.branding.presets.empty}</p>
      )}
      <Button type="button" size="sm" variant="ghost" onClick={() => setDialogOpen(true)} className="gap-1.5">
        <Plus className="h-3.5 w-3.5" />
        {T.branding.presets.save}
      </Button>

      <SaveBrandingPresetDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={handleSave} />
    </div>
  );
}
