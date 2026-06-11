import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return Response.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_SIZE) return Response.json({ error: "File too large (max 8 MB)" }, { status: 400 });

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const { randomUUID } = await import("crypto");
      const ext = file.name.split(".").pop()?.toLowerCase();
      const filename = ext ? `${randomUUID()}.${ext}` : randomUUID();
      const blob = await put(`attachments/${filename}`, file, { access: "public" });
      return Response.json({ url: blob.url });
    } catch (e) {
      console.error("[Evvy] Vercel Blob upload error:", e);
      return Response.json({ error: "Upload failed" }, { status: 500 });
    }
  }

  // Fallback: base64 data URL (works on any host, no external service needed)
  try {
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const url = `data:${file.type || "application/octet-stream"};base64,${base64}`;
    return Response.json({ url });
  } catch (e) {
    console.error("[Evvy] Base64 upload error:", e);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
