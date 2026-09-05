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

// Localized homepage metadata — the root layout's English defaults would
// otherwise show up in French search results and hurt SERP click-through.
const HOME_META = {
  en: {
    title: "Evvy — Create & share events guests add in one click",
    description:
      "Create a shareable event page in under a minute: RSVPs, add-to-calendar buttons for Google, Apple and Outlook, HTML embeds and custom branding. Free forever.",
  },
  fr: {
    title: "Evvy — Des événements que vos invités ajoutent en un clic",
    description:
      "Créez une page d'événement partageable en moins d'une minute : RSVP, boutons « Ajouter au calendrier » (Google, Apple, Outlook…), embed HTML et branding personnalisé. Gratuit à vie.",
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const meta = HOME_META[lang === "fr" ? "fr" : "en"];
  return {
    title: { absolute: meta.title },
    description: meta.description,
    openGraph: {
      type: "website",
      siteName: "Evvy",
      title: meta.title,
      description: meta.description,
      url: `${APP_URL}/${lang}`,
      locale: lang === "fr" ? "fr_FR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
    },
    alternates: localeAlternates(lang as Locale, ""),
  };
}

export default async function Home() {
  const calendar = await db.calendar.findFirst({
    where: { slug: "demo-tech-conferences-2030" },
    select: {
      slug: true,
      events: {
        orderBy: { startAt: "asc" },
        select: {
          id: true,
          slug: true,
          title: true,
          startAt: true,
          location: true,
          isOnline: true,
          language: true,
          rsvpEnabled: true,
          questions: {
            orderBy: { order: "asc" },
            select: { id: true, label: true, type: true, options: true, required: true, order: true },
          },
        },
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

  // Featured event used to render the real RSVP / branding / embed previews.
  const featured = calendar?.events.find((e) => e.rsvpEnabled) ?? calendar?.events[0];
  const demoEvent =
    featured && calendar
      ? {
          id: featured.id,
          slug: featured.slug ?? featured.id,
          title: featured.title,
          lang: (featured.language === "fr" ? "fr" : "en") as "fr" | "en",
          rsvpEnabled: featured.rsvpEnabled,
          questions: featured.questions,
          calendarSlug: calendar.slug!,
        }
      : null;

  return (
    <div
      className="evvy-theme flex min-h-full flex-col bg-white text-ink"
      style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }} />
      <SiteHeader />
      <LandingContent demoCalendar={demoCalendar} demoEvent={demoEvent} />
      <Footer />
    </div>
  );
}
