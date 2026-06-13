import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://evvycal.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, calendars] = await Promise.all([
    db.event.findMany({ select: { id: true, slug: true, updatedAt: true } }),
    db.calendar.findMany({ select: { id: true, slug: true, updatedAt: true } }),
  ]);

  // Marketing pages are locale-routed (/en, /fr) — emit both with hreflang alternates.
  const marketing: { path: string; changeFrequency: "weekly" | "monthly"; priority: number }[] = [
    { path: "",         changeFrequency: "weekly",  priority: 1.0 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.3 },
    { path: "/privacy", changeFrequency: "monthly", priority: 0.2 },
    { path: "/terms",   changeFrequency: "monthly", priority: 0.2 },
  ];
  const staticPages: MetadataRoute.Sitemap = marketing.flatMap(({ path, changeFrequency, priority }) =>
    (["en", "fr"] as const).map((lang) => ({
      url: `${APP_URL}/${lang}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages: {
          en: `${APP_URL}/en${path}`,
          fr: `${APP_URL}/fr${path}`,
        },
      },
    }))
  );

  const eventPages: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${APP_URL}/e/${e.slug ?? e.id}`,
    lastModified: e.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const calendarPages: MetadataRoute.Sitemap = calendars.map((c) => ({
    url: `${APP_URL}/c/${c.slug ?? c.id}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...eventPages, ...calendarPages];
}
