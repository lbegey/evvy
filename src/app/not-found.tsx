"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NotFound() {
  const { T } = useLanguage();

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-paper px-6 py-12 text-center text-ink"
      style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(91,75,230,0.12), transparent 70%)",
        }}
      />

      <Link href="/" className="mb-10 transition-opacity hover:opacity-80">
        <Logo size="md" />
      </Link>

      <p className="font-display text-7xl font-extrabold tracking-tight text-evvy sm:text-8xl">404</p>
      <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink">
        {T.notFoundPage.title}
      </h1>
      <p className="mt-2 max-w-xs text-sm text-inksoft">
        {T.notFoundPage.subtitle}
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-evvy px-4 py-2.5 text-sm font-medium text-white shadow-card transition hover:bg-evvy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evvy/50 focus-visible:ring-offset-1"
      >
        <ArrowLeft className="h-4 w-4" />
        {T.notFoundPage.backHome}
      </Link>
    </div>
  );
}
