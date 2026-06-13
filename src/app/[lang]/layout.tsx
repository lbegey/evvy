import { notFound } from "next/navigation";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LOCALES, isLocale } from "@/lib/i18n";

// Only /en and /fr are valid; anything else 404s.
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  // The URL locale is authoritative on these marketing pages.
  return (
    <LanguageProvider initialLang={lang} lock>
      {children}
    </LanguageProvider>
  );
}
