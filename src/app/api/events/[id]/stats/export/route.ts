import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const [event, user] = await Promise.all([
    db.event.findUnique({ where: { id } }),
    db.user.findUnique({ where: { id: session.user.id } }),
  ]);
  if (!event || event.userId !== session.user.id)
    return new Response("Not found", { status: 404 });
  if (user?.plan !== "premium")
    return new Response("Forbidden", { status: 403 });

  const clickRows = await db.eventClick.groupBy({
    by: ["service"],
    where: { eventId: id },
    _count: true,
  });

  const count = (service: string) =>
    clickRows.find((r) => r.service === service)?._count ?? 0;

  const serviceLabel: Record<string, string> = {
    google: "Google Calendar",
    apple: "Apple Calendar",
    outlook: "Outlook.com",
    office365: "Office 365",
    yahoo: "Yahoo Calendar",
  };

  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;

  const rows = [
    "Métrique,Valeur",
    [escape("Vues de la page"), count("page")].join(","),
    [escape("Scans QR code"), count("qr")].join(","),
    ...Object.entries(serviceLabel).map(([key, label]) =>
      [escape(`Clics — ${label}`), count(key)].join(",")
    ),
  ].join("\r\n");

  return new Response("﻿" + rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="stats-${id}.csv"`,
    },
  });
}
