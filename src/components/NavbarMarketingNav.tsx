"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function NavbarMarketingNav() {
  const { T } = useLanguage();

  return (
    <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground sm:flex">
      <a href="/#features" className="cursor-pointer transition-colors hover:text-foreground">
        {T.landing.nav.features}
      </a>
      <a href="/#pricing" className="cursor-pointer transition-colors hover:text-foreground">
        {T.landing.nav.pricing}
      </a>
      <a href="/#faq" className="cursor-pointer transition-colors hover:text-foreground">
        {T.landing.nav.faq}
      </a>
    </nav>
  );
}
