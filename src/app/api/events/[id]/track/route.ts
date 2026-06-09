import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildGoogleUrl, buildOutlookUrl, buildOffice365Url, buildYahooUrl } from "@/lib/calendar-urls";
import { getAppUrl } from "@/lib/url";

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const service = searchParams.get("service") ?? "unknown";
  const APP_URL = await getAppUrl();

  const event = await db.event.findFirst({ where: { OR: [{ id }, { slug: id }] }, select: { id: true, slug: true, title: true, description: true, location: true, startAt: true, endAt: true } });
  if (!event) return new Response("Not found", { status: 404 });

  const cookieName = `mc_${event.id}_${service}`;
  const alreadyTracked = req.cookies.has(cookieName);

  if (!alreadyTracked) {
    await db.eventClick.create({ data: { eventId: event.id, service } }).catch(() => {});
  }

  const eventData = {
    title: event.title,
    description: event.description,
    location: event.location,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
  };

  const canonicalSlug = event.slug || event.id;
  let targetUrl: string;
  switch (service) {
    case "google":    targetUrl = buildGoogleUrl(eventData); break;
    case "apple":     targetUrl = `${APP_URL}/api/events/${event.id}/ics`; break;
    case "outlook":   targetUrl = buildOutlookUrl(eventData); break;
    case "office365": targetUrl = buildOffice365Url(eventData); break;
    case "yahoo":     targetUrl = buildYahooUrl(eventData); break;
    default:          targetUrl = `${APP_URL}/e/${canonicalSlug}`;
  }

  const response = NextResponse.redirect(targetUrl, 302);
  if (!alreadyTracked) {
    response.cookies.set(cookieName, "1", {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
  }
  return response;
}
