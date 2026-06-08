import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const calendar = await db.calendar.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: {
      updatedAt: true,
      _count: { select: { events: true } },
      events: { orderBy: { updatedAt: "desc" }, take: 1, select: { updatedAt: true } },
    },
  });
  if (!calendar) return new Response("Not found", { status: 404 });

  const latestEventUpdatedAt = calendar.events[0]?.updatedAt.toISOString() ?? "";
  const signature = `${calendar.updatedAt.toISOString()}|${latestEventUpdatedAt}|${calendar._count.events}`;

  return NextResponse.json({ signature });
}
