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

  const calendar = await db.calendar.findUnique({ where: { id }, select: { id: true, slug: true } });
  if (!calendar) return new Response("Not found", { status: 404 });

  const publicUrl = `${APP_URL}/c/${calendar.slug || calendar.id}`;

  if (format === "svg") {
    const svg = await QRCode.toString(publicUrl, { type: "svg", margin: 1, width: 512 });
    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="calendar-${id}-qrcode.svg"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const png = await QRCode.toBuffer(publicUrl, { type: "png", margin: 1, width: 512 });
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="calendar-${id}-qrcode.png"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
