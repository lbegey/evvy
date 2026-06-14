"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Sparkles, Settings2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { type BrandingPreset } from "@/app/actions/brandingPresets";
import { useLanguage } from "@/contexts/LanguageContext";

interface BrandingPresetBarProps {
  presets: BrandingPreset[];
  onApply: (preset: BrandingPreset) => Promise<void> | void;
}

export function BrandingPresetBar({ presets, onApply }: BrandingPresetBarProps) {
  const { T } = useLanguage();
  const [selectedId, setSelectedId] = useState("");
  const [isApplying, startApply] = useTransition();

  const handleApply = () => {
    const preset = presets.find((p) => p.id === selectedId);
    if (!preset) return;
    startApply(async () => { await onApply(preset); });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-card p-2.5 shadow-sm">
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
      <Button type="button" size="sm" variant="ghost" nativeButton={false} render={<Link href="/dashboard/branding/presets" />} className="gap-1.5">
        <Settings2 className="h-3.5 w-3.5" />
        {T.branding.presets.manage}
      </Button>
    </div>
  );
}
