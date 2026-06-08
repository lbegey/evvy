"use client";

import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const LANGS: { value: Language; label: string; flagCode: string }[] = [
  { value: "en", label: "EN", flagCode: "gb" },
  { value: "fr", label: "FR", flagCode: "fr" },
];

export function LanguageSelector() {
  const { lang, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/30 p-0.5">
      {LANGS.map(({ value, label, flagCode }) => (
        <button
          key={value}
          type="button"
          onClick={() => setLanguage(value)}
          className={cn(
            "flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            lang === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={value === "en" ? "English" : "Français"}
        >
          <span className={`fi fi-${flagCode} text-base`} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
