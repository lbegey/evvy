import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { buildGoogleSubscribeUrl, buildOutlookSubscribeUrl, buildOffice365SubscribeUrl } from "@/lib/calendar-urls";
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

  const calendar = await db.calendar.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { id: true, name: true },
  });
  if (!calendar) return new Response("Not found", { status: 404 });

  const cookieName = `mcc_${calendar.id}_${service}`;
  const alreadyTracked = req.cookies.has(cookieName);
  if (!alreadyTracked) {
    await db.calendarClick.create({ data: { calendarId: calendar.id, service } }).catch(() => {});
  }

  // Page views are a fire-and-forget beacon — no redirect.
  if (service === "page") {
    const res = new NextResponse(null, { status: 204 });
    if (!alreadyTracked) res.cookies.set(cookieName, "1", { maxAge: COOKIE_MAX_AGE, path: "/", sameSite: "lax" });
    return res;
  }

  const icsUrl = `${APP_URL}/api/calendars/${calendar.id}/ics`;
  let targetUrl: string;
  switch (service) {
    case "google":    targetUrl = buildGoogleSubscribeUrl(icsUrl); break;
    case "outlook":   targetUrl = buildOutlookSubscribeUrl(icsUrl, calendar.name); break;
    case "office365": targetUrl = buildOffice365SubscribeUrl(icsUrl, calendar.name); break;
    case "apple":
    case "yahoo":     targetUrl = icsUrl; break;
    default:          targetUrl = `${APP_URL}/c/${calendar.id}`;
  }

  const response = NextResponse.redirect(targetUrl, 302);
  if (!alreadyTracked) {
    response.cookies.set(cookieName, "1", { maxAge: COOKIE_MAX_AGE, path: "/", sameSite: "lax" });
  }
  return response;
}
