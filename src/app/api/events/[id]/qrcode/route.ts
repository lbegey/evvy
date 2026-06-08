import { type NextRequest } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { getAppUrl } from "@/lib/url";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const format = req.nextUrl.searchParams.get("format") === "svg" ? "svg" : "png";
  const APP_URL = await getAppUrl();

  const event = await db.event.findUnique({ where: { id }, select: { id: true } });
  if (!event) return new Response("Not found", { status: 404 });

  const trackUrl = `${APP_URL}/api/events/${event.id}/track?service=qr`;

  if (format === "svg") {
    const svg = await QRCode.toString(trackUrl, { type: "svg", margin: 1, width: 512 });
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="event-${id}-qrcode.svg"`,
      },
    });
  }

  const png = await QRCode.toBuffer(trackUrl, { type: "png", margin: 1, width: 512 });
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="event-${id}-qrcode.png"`,
    },
  });
}
