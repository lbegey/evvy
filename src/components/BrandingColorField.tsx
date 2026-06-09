"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BrandingColorFieldProps {
  id: string;
  label: string;
  hint?: string;
  value: string;
  placeholder?: string;
  defaultColor?: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
}

export function BrandingColorField({
  id, label, hint, value, placeholder = "#000000", defaultColor = "#000000", onChange, onBlur,
}: BrandingColorFieldProps) {
  const hex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : defaultColor;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className="h-8 w-10 shrink-0 cursor-pointer rounded border border-input bg-transparent p-0.5"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className="flex-1 font-mono text-sm"
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
