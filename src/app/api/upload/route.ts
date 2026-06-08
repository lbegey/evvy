import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return Response.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_SIZE) return Response.json({ error: "File too large (max 5 MB)" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return Response.json({ error: "Invalid file type" }, { status: 400 });

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const { randomUUID } = await import("crypto");
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const blob = await put(`uploads/${randomUUID()}.${ext}`, file, { access: "public" });
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
    const url = `data:${file.type};base64,${base64}`;
    return Response.json({ url });
  } catch (e) {
    console.error("[Evvy] Base64 upload error:", e);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
