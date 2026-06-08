import { db } from "@/lib/db";
import type { NextRequest } from "next/server";

function toICSDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeICS(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

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

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Evvy//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeICS(calendar.name)}`,
    ...calendar.events.flatMap((event) => [
      "BEGIN:VEVENT",
      `UID:${event.id}@evvy`,
      `DTSTART:${toICSDate(event.startAt)}`,
      `DTEND:${toICSDate(event.endAt)}`,
      `SUMMARY:${escapeICS(event.title)}`,
      event.description ? `DESCRIPTION:${escapeICS(event.description)}` : null,
      event.location ? `LOCATION:${escapeICS(event.location)}` : null,
      `DTSTAMP:${toICSDate(new Date())}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  const slug = calendar.name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  return new Response(lines, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ics"`,
    },
  });
}
