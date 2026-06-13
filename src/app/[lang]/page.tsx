import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { LandingContent } from "@/components/LandingContent";
import { db } from "@/lib/db";
import { localeAlternates, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://evvycal.app";

const SITE_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Evvy",
    url: APP_URL,
    logo: `${APP_URL}/icon.svg`,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Evvy",
    url: APP_URL,
  },
];

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { alternates: localeAlternates(lang as Locale, "") };
}

export default async function Home() {
  const calendar = await db.calendar.findFirst({
    where: { slug: "demo-tech-conferences-2030" },
    select: {
      slug: true,
      events: {
        orderBy: { startAt: "asc" },
        select: { id: true, slug: true, title: true, startAt: true, location: true, isOnline: true },
      },
    },
  }).catch(() => null);

  const demoCalendar = calendar
    ? {
        slug: calendar.slug!,
        events: calendar.events.map((e) => ({
          id: e.id,
          slug: e.slug,
          title: e.title,
          startAt: e.startAt.toISOString(),
          location: e.location,
          isOnline: e.isOnline,
        })),
      }
    : null;

  return (
    <div
      className="evvy-theme flex min-h-full flex-col bg-white text-ink"
      style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }} />
      <SiteHeader />
      <LandingContent demoCalendar={demoCalendar} />
      <Footer />
    </div>
  );
}
