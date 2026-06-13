import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { LandingContent } from "@/components/LandingContent";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

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
      <SiteHeader />
      <LandingContent demoCalendar={demoCalendar} />
      <Footer />
    </div>
  );
}
