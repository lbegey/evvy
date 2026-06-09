import { db } from "@/lib/db";
import type { NextRequest } from "next/server";
import { buildVEvent, wrapVCalendar } from "@/lib/ics";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const calendar = await db.calendar.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { events: { orderBy: { startAt: "asc" } } },
  });
  if (!calendar) return new Response("Not found", { status: 404 });

  const vevents = calendar.events.map((event) =>
    buildVEvent({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      startAt: event.startAt,
      endAt: event.endAt,
      allDay: event.allDay,
      timezone: event.timezone,
    })
  );

  const ics = wrapVCalendar(calendar.name, vevents);
  const slug = calendar.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ics"`,
    },
  });
}
