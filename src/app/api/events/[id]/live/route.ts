import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const event = await db.event.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { updatedAt: true },
  });
  if (!event) return new Response("Not found", { status: 404 });

  return NextResponse.json({ updatedAt: event.updatedAt.toISOString() });
}
