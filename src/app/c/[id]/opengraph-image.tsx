import { ImageResponse } from "next/og";
import { db } from "@/lib/db";

export const alt = "Evvy calendar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const calendar = await db.calendar
    .findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { name: true, description: true, color: true, _count: { select: { events: true } } },
    })
    .catch(() => null);

  const name = calendar?.name ?? "Calendar";
  const count = calendar?._count.events ?? 0;
  const accent = /^#[0-9a-fA-F]{3,8}$/.test(calendar?.color ?? "") ? calendar!.color! : "#5b4be6";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #1a1838 0%, #4636c9 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 16, height: 16, borderRadius: 999, background: accent }} />
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>
            Ev<span style={{ color: "#9d90ff" }}>vy.</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: -1 }}>{name}</div>
          {calendar?.description ? (
            <div style={{ fontSize: 30, color: "rgba(255,255,255,0.78)", maxWidth: 900 }}>
              {calendar.description.slice(0, 120)}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, color: "rgba(255,255,255,0.85)" }}>
          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {count} {count === 1 ? "event" : "events"} · Add to your calendar
          </div>
        </div>
      </div>
    ),
    size
  );
}
