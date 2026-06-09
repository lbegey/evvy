// RFC 5545 iCalendar helpers

export function escapeICS(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

/** UTC datetime → 20260101T120000Z */
export function toICSDateTime(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Date in the given timezone → 20260101 (for VALUE=DATE all-day events) */
export function toICSDateOnly(d: Date, tz: string): string {
  // en-CA locale formats as YYYY-MM-DD which we strip the dashes from
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d).replace(/-/g, "");
}

/** Add one calendar day to a YYYYMMDD string (for exclusive all-day DTEND) */
export function nextICSDay(yyyymmdd: string): string {
  const d = new Date(`${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

/**
 * RFC 5545 §3.1: fold lines at 75 octets (excluding CRLF).
 * Continuation lines begin with a single SPACE.
 * Using char-count as a conservative proxy (correct for ASCII; may fold
 * a character or two early for multi-byte UTF-8 — valid per spec).
 */
export function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [line.slice(0, 75)];
  let i = 75;
  while (i < line.length) {
    chunks.push(line.slice(i, i + 74));
    i += 74;
  }
  return chunks.join("\r\n ");
}

export function buildVEvent(event: {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  timezone: string;
}): string {
  const tz = event.timezone || "UTC";

  const dtstart = event.allDay
    ? `DTSTART;VALUE=DATE:${toICSDateOnly(event.startAt, tz)}`
    : `DTSTART:${toICSDateTime(event.startAt)}`;

  // All-day DTEND is exclusive: use the day after endAt's date in the event tz
  const dtend = event.allDay
    ? `DTEND;VALUE=DATE:${nextICSDay(toICSDateOnly(event.endAt, tz))}`
    : `DTEND:${toICSDateTime(event.endAt)}`;

  const rawLines = [
    "BEGIN:VEVENT",
    `UID:${event.id}@evvy`,
    dtstart,
    dtend,
    `SUMMARY:${escapeICS(event.title)}`,
    event.description ? `DESCRIPTION:${escapeICS(event.description)}` : null,
    event.location ? `LOCATION:${escapeICS(event.location)}` : null,
    `DTSTAMP:${toICSDateTime(new Date())}`,
    "END:VEVENT",
  ].filter(Boolean) as string[];

  return rawLines.map(foldLine).join("\r\n");
}

export function wrapVCalendar(calName: string, vevents: string[]): string {
  const header = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Evvy//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    foldLine(`X-WR-CALNAME:${escapeICS(calName)}`),
    "X-WR-TIMEZONE:UTC",
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
    "X-PUBLISHED-TTL:PT12H",
  ].join("\r\n");

  const footer = "END:VCALENDAR";
  return [header, ...vevents, footer].join("\r\n") + "\r\n";
}
