"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const COOKIE_KEY = "minical_cookies_accepted";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const { T } = useLanguage();

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 inset-x-4 z-50 sm:left-4 sm:right-auto sm:w-full sm:max-w-sm",
        "rounded-xl border border-border/60 bg-background shadow-xl",
        "p-4 animate-fade-in-up"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Cookie className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-snug">
            {T.cookies.message}
          </p>
          <Link
            href="/privacy"
            className="text-xs text-primary underline-offset-3 hover:underline mt-0.5 inline-block"
          >
            {T.cookies.learnMore}
          </Link>
        </div>
        <button
          onClick={decline}
          className="shrink-0 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={decline}
          className="flex-1 cursor-pointer rounded-lg border border-border/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {T.cookies.decline}
        </button>
        <button
          onClick={accept}
          className="flex-1 cursor-pointer rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {T.cookies.accept}
        </button>
      </div>
    </div>
  );
}
