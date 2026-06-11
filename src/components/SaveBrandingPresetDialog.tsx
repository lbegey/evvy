"use client";

import { useState, type FormEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface SaveBrandingPresetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => Promise<void>;
}

export function SaveBrandingPresetDialog({ open, onOpenChange, onSubmit }: SaveBrandingPresetDialogProps) {
  const { T } = useLanguage();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200",
          "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
        )} />
        <Dialog.Popup className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2",
          "border border-border/60 bg-background p-6 shadow-xl",
          "transition-[transform,opacity] duration-200",
          "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
          "data-[ending-style]:opacity-0 data-[ending-style]:scale-95"
        )}>
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {T.branding.presets.saveDialogTitle}
            </Dialog.Title>
            <Dialog.Close className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {open && <SaveBrandingPresetForm onSubmit={onSubmit} onClose={() => onOpenChange(false)} />}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SaveBrandingPresetForm({ onSubmit, onClose }: { onSubmit: (name: string) => Promise<void>; onClose: () => void }) {
  const { T } = useLanguage();
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(true);
      return;
    }
    setIsPending(true);
    try {
      await onSubmit(name.trim());
      onClose();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="branding-preset-name">{T.branding.presets.name}</Label>
        <Input
          id="branding-preset-name"
          autoFocus
          value={name}
          onChange={(e) => { setName(e.target.value); setError(false); }}
          placeholder={T.branding.presets.namePlaceholder}
        />
        {error && <p className="text-xs text-destructive">{T.branding.presets.nameRequired}</p>}
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          {T.common.cancel}
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {T.common.save}
        </Button>
      </div>
    </form>
  );
}
