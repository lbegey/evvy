"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotFound() {
  const { T } = useLanguage();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.09 0 0 / 0.08), transparent)",
        }}
      />

      <Link
        href="/"
        className="mb-10 flex items-center gap-2.5 transition-opacity hover:opacity-80"
      >
        <Logo size="md" />
      </Link>

      <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
        404
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
        {T.notFoundPage.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        {T.notFoundPage.subtitle}
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {T.notFoundPage.backHome}
      </Link>
    </div>
  );
}
