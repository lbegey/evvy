"use client";

import { useLanguage } from "@/contexts/LanguageContext";

export function NavbarMarketingNav() {
  const { T, lang } = useLanguage();

  return (
    <nav className="hidden items-center gap-5 text-sm font-medium text-inksoft sm:flex">
      <a href={`/${lang}#features`} className="cursor-pointer transition-colors hover:text-ink">
        {T.landing.nav.features}
      </a>
      <a href={`/${lang}#pricing`} className="cursor-pointer transition-colors hover:text-ink">
        {T.landing.nav.pricing}
      </a>
      <a href={`/${lang}#faq`} className="cursor-pointer transition-colors hover:text-ink">
        {T.landing.nav.faq}
      </a>
    </nav>
  );
}
