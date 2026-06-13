export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://evvycal.app";

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "fr";
}

/**
 * Build canonical + hreflang alternates for a locale-routed marketing page.
 * `path` is the part after the locale segment (e.g. "" for home, "/contact").
 */
export function localeAlternates(lang: Locale, path = "") {
  return {
    canonical: `${APP_URL}/${lang}${path}`,
    languages: {
      en: `${APP_URL}/en${path}`,
      fr: `${APP_URL}/fr${path}`,
      "x-default": `${APP_URL}/en${path}`,
    },
  };
}
