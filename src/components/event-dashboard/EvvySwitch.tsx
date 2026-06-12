"use client";

import { cn } from "@/lib/utils";

interface EvvySwitchProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  title?: string;
  "aria-label"?: string;
}

/** Toggle switch matching the mockup (42×24). Styling lives in globals.css (.evvy-switch). */
export function EvvySwitch({ checked, onCheckedChange, disabled, className, title, ...rest }: EvvySwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      title={title}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn("evvy-switch", className)}
      {...rest}
    />
  );
}
