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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  // Init: read from localStorage, then auto-detect, then sync from DB if logged in
  // (the server actions below check the session server-side and no-op when signed out)
  useEffect(() => {
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
  }, []);

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
