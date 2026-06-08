"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Palette } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function NavbarBrandingLink() {
  const pathname = usePathname();
  const { T } = useLanguage();
  const active = pathname?.startsWith("/dashboard/branding") ?? false;

  return (
    <Link
      href="/dashboard/branding"
      aria-label={T.nav.branding}
      title={T.nav.branding}
      className={cn(
        "flex items-center justify-center rounded-lg border border-border/60 p-1.5 transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-primary/10 text-primary" : "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Palette className="h-4 w-4" />
    </Link>
  );
}
