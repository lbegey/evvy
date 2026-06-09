import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://evvycal.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, calendars] = await Promise.all([
    db.event.findMany({ select: { id: true, slug: true, updatedAt: true } }),
    db.calendar.findMany({ select: { id: true, slug: true, updatedAt: true } }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL,                   lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${APP_URL}/contact`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${APP_URL}/privacy`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
    { url: `${APP_URL}/terms`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.2 },
  ];

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
