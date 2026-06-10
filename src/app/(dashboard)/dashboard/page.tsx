import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CalendarView } from "@/components/CalendarView";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { year, month } = await searchParams;

  const [rawEvents, calendars, user] = await Promise.all([
    db.event.findMany({
      where: { userId: session!.user.id },
      orderBy: { startAt: "asc" },
    }),
    db.calendar.findMany({
      where: { userId: session!.user.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "asc" },
    }),
    db.user.findUnique({
      where: { id: session!.user.id },
      select: { dashboardView: true, plan: true },
    }),
  ]);

  const events = rawEvents.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    location: e.location,
    startAt: e.startAt.toISOString(),
    endAt: e.endAt.toISOString(),
    timezone: e.timezone,
    calendarId: e.calendarId,
    slug: e.slug,
    published: e.published,
  }));

  const initialYear = year ? parseInt(year) : undefined;
  const initialMonth = month ? parseInt(month) : undefined;

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <CalendarView
        events={events}
        calendars={calendars}
        plan={user?.plan ?? "free"}
        initialYear={initialYear}
        initialMonth={initialMonth}
        initialViewMode={user?.dashboardView ?? null}
      />
    </section>
  );
}
