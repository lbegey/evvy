"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveBrandingPresetDialog } from "@/components/SaveBrandingPresetDialog";
import { createBrandingPreset, type BrandingPresetData } from "@/app/actions/brandingPresets";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface SaveBrandingPresetButtonProps {
  currentData: BrandingPresetData;
  onSaved: () => void;
  size?: "default" | "sm";
  className?: string;
}

export function SaveBrandingPresetButton({ currentData, onSaved, size = "default", className }: SaveBrandingPresetButtonProps) {
  const { T } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleSubmit = async (name: string) => {
    await createBrandingPreset(name, currentData);
    onSaved();
  };

  return (
    <>
      <Button type="button" variant="outline" size={size} onClick={() => setOpen(true)} className={cn("gap-1.5", className)}>
        <Plus className="h-4 w-4" />
        {T.branding.presets.save}
      </Button>
      <SaveBrandingPresetDialog open={open} onOpenChange={setOpen} onSubmit={handleSubmit} />
    </>
  );
}
