"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveBrandingPresetDialog } from "@/components/SaveBrandingPresetDialog";
import { createBrandingPreset, type BrandingPresetData } from "@/app/actions/brandingPresets";
import { useLanguage } from "@/contexts/LanguageContext";

interface SaveBrandingPresetButtonProps {
  currentData: BrandingPresetData;
  onSaved: () => void;
  size?: "default" | "sm";
}

export function SaveBrandingPresetButton({ currentData, onSaved, size = "default" }: SaveBrandingPresetButtonProps) {
  const { T } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleSubmit = async (name: string) => {
    await createBrandingPreset(name, currentData);
    onSaved();
  };

  return (
    <>
      <Button type="button" variant="outline" size={size} onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="h-4 w-4" />
        {T.branding.presets.save}
      </Button>
      <SaveBrandingPresetDialog open={open} onOpenChange={setOpen} onSubmit={handleSubmit} />
    </>
  );
}
