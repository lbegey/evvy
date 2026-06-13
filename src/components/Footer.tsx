"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { T } = useLanguage();

  return (
    <footer className="mt-auto border-t border-line bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <Logo size="sm" />

          <nav className="flex flex-wrap items-center gap-6 text-sm text-inksoft">
            <Link href="/privacy" className="transition-colors hover:text-evvy">
              {T.footer.privacy}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-evvy">
              {T.footer.terms}
            </Link>
            <Link href="/contact" className="transition-colors hover:text-evvy">
              {T.footer.contact}
            </Link>
          </nav>
        </div>

        <Separator className="my-8" />

        <p className="text-center text-sm text-inksoft">
          © {new Date().getFullYear()} Evvy. {T.footer.allRightsReserved}
        </p>
      </div>
    </footer>
  );
}
