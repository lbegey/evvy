import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { localeAlternates, type Locale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { alternates: localeAlternates(lang as Locale, "/contact") };
}

export default function ContactPage() {
  return (
    <div
      className="evvy-theme flex min-h-full flex-col bg-white"
      style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
    >
      <SiteHeader />
      <ContactForm />
      <Footer />
    </div>
  );
}
