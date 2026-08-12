import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { rsvpVisibilityLimit } from "@/lib/rsvp-limits";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const [event, user] = await Promise.all([
    db.event.findUnique({ where: { id } }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, role: true, legacyUnlimitedRsvps: true },
    }),
  ]);
  if (!event || event.userId !== session.user.id)
    return new Response("Not found", { status: 404 });

  // Free organizers export only their first N responses — same window the
  // dashboard shows. Guests' responses are all still recorded.
  const visibilityLimit = rsvpVisibilityLimit(user);

  const [rsvps, questions] = await Promise.all([
    db.rsvp.findMany({
      where: { eventId: id },
      orderBy: { createdAt: "asc" },
      ...(visibilityLimit == null ? {} : { take: visibilityLimit }),
      include: { answers: { select: { questionId: true, value: true } } },
    }),
    db.rsvpQuestion.findMany({
      where: { eventId: id },
      orderBy: { order: "asc" },
      select: { id: true, label: true, type: true },
    }),
  ]);

  const statusLabel: Record<string, string> = {
    yes: "Oui",
    no: "Non",
    maybe: "Peut-être",
  };

  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;

  const questionHeaders = questions.map((q) => escape(q.label));
  const headerRow = ["Nom", "Email", "Statut", "Message", "Date", ...questionHeaders].join(",");

  const rows = [
    headerRow,
    ...rsvps.map((r) => {
      const base = [
        escape(r.name),
        escape(r.email ?? ""),
        escape(statusLabel[r.status] ?? r.status),
        escape(r.message ?? ""),
        escape(r.createdAt.toISOString()),
      ];
      const answerCols = questions.map((q) => {
        const ans = r.answers.find((a) => a.questionId === q.id);
        if (!ans) return escape("");
        let val = ans.value;
        if (val === "true") val = "Oui";
        else if (val === "false") val = "Non";
        else if (q.type === "checkbox") {
          try {
            const arr = JSON.parse(val);
            if (Array.isArray(arr)) val = arr.join("; ");
          } catch { /* ignore */ }
        }
        return escape(val);
      });
      return [...base, ...answerCols].join(",");
    }),
  ].join("\r\n");

  return new Response("﻿" + rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rsvp-${id}.csv"`,
    },
  });
}
