import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { TermsContent } from "@/components/TermsContent";
import { localeAlternates, type Locale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { alternates: localeAlternates(lang as Locale, "/terms") };
}

export default function TermsPage() {
  return (
    <div
      className="evvy-theme flex min-h-full flex-col bg-white text-ink"
      style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
    >
      <SiteHeader />
      <main className="flex-1 px-4 py-16 sm:px-6">
        <TermsContent />
      </main>
      <Footer />
    </div>
  );
}
