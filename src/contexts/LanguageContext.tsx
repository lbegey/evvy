"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { en } from "@/i18n/en";
import { fr } from "@/i18n/fr";
import type { Translations } from "@/i18n/en";

export type Language = "en" | "fr";

interface LanguageContextType {
  lang: Language;
  T: Translations;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  T: en,
  setLanguage: () => {},
});

interface LanguageProviderProps {
  children: ReactNode;
  /** Seed the initial language (SSR-correct). From the cookie at the root, or the route locale. */
  initialLang?: Language;
  /** Lock to `initialLang` — used on locale-routed pages where the URL is authoritative. */
  lock?: boolean;
}

export function LanguageProvider({ children, initialLang, lock }: LanguageProviderProps) {
  const [lang, setLang] = useState<Language>(initialLang ?? "en");

  // Init: read from localStorage, then auto-detect, then sync from DB if logged in
  // (the server actions below check the session server-side and no-op when signed out).
  // Skipped when `lock` is set so the URL locale stays authoritative.
  useEffect(() => {
    if (lock) return;
    const stored = localStorage.getItem("minical_lang") as Language | null;
    if (stored === "en" || stored === "fr") {
      setLang(stored);
    } else if (navigator.language.toLowerCase().startsWith("fr")) {
      setLang("fr");
      localStorage.setItem("minical_lang", "fr");
    }

    import("@/app/actions/user")
      .then((m) => m.getUserLanguage())
      .then((dbLang) => {
        if (dbLang === "en" || dbLang === "fr") {
          setLang(dbLang);
          localStorage.setItem("minical_lang", dbLang);
        }
      })
      .catch(() => {});
  }, [lock]);

  const setLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("minical_lang", newLang);
    document.cookie = `minical_lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    import("@/app/actions/user")
      .then((m) => m.setUserLanguage(newLang))
      .catch(() => {});
  }, []);

  const T = lang === "fr" ? fr : en;

  return (
    <LanguageContext.Provider value={{ lang, T, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
