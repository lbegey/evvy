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

  const event = await db.event.findUnique({ where: { id } });
  if (!event || event.userId !== session.user.id)
    return new Response("Not found", { status: 404 });

  const rsvps = await db.rsvp.findMany({
    where: { eventId: id },
    orderBy: { createdAt: "asc" },
  });

  const statusLabel: Record<string, string> = {
    yes: "Oui",
    no: "Non",
    maybe: "Peut-être",
  };

  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;

  const rows = [
    "Nom,Email,Statut,Message,Date",
    ...rsvps.map((r) =>
      [
        escape(r.name),
        escape(r.email ?? ""),
        escape(statusLabel[r.status] ?? r.status),
        escape(r.message ?? ""),
        escape(r.createdAt.toISOString()),
      ].join(",")
    ),
  ].join("\r\n");

  return new Response("﻿" + rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rsvp-${id}.csv"`,
    },
  });
}
