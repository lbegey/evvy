"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export interface CalendarDialogValues {
  name: string;
  description: string;
  color: string;
}

interface CalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: CalendarDialogValues | null;
  onSubmit: (data: CalendarDialogValues) => Promise<void>;
  isPending: boolean;
  error?: string | null;
}

const EMPTY: CalendarDialogValues = { name: "", description: "", color: "" };

export function CalendarDialog({ open, onOpenChange, editing, onSubmit, isPending, error }: CalendarDialogProps) {
  const { T } = useLanguage();
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [color, setColor] = useState(editing?.color ?? "");
  const [nameError, setNameError] = useState(false);

  const previewColor = /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : undefined;

  useEffect(() => {
    if (open) {
      const values = editing ?? EMPTY;
      setName(values.name);
      setDescription(values.description);
      setColor(values.color);
      setNameError(false);
    }
  }, [open, editing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(true);
      return;
    }
    await onSubmit({ name: name.trim(), description: description.trim(), color: color.trim() });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200",
          "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
        )} />
        <Dialog.Popup className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
          "border border-border/60 bg-background p-6 shadow-xl",
          "transition-all duration-200 overflow-y-auto max-h-[88vh]",
          "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
          "data-[ending-style]:opacity-0 data-[ending-style]:scale-95"
        )}>
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {editing ? T.calendars.edit : T.calendars.create}
            </Dialog.Title>
            <Dialog.Close className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cal-name">{T.calendars.name} *</Label>
              <Input
                id="cal-name"
                placeholder={T.calendars.namePlaceholder}
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(false); }}
              />
              {nameError && <p className="text-xs text-destructive">{T.calendars.errors.nameRequired}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cal-description">{T.calendars.description}</Label>
              <Textarea
                id="cal-description"
                rows={3}
                placeholder={T.calendars.descriptionPlaceholder}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cal-color">{T.calendars.color}</Label>
              <div className="flex items-center gap-2">
                <input
                  id="cal-color"
                  type="color"
                  value={previewColor ?? "#6366f1"}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-10 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#6366f1"
                  className="flex-1"
                />
              </div>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                {T.common.cancel}
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? T.common.save : T.calendars.create}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
