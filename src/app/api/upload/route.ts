import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
// Raster formats we re-encode; SVG (vector) and GIF (often animated) pass through untouched.
const COMPRESSIBLE = ["image/jpeg", "image/png", "image/webp"];
const MAX_DIMENSION = 1600; // px — cap the largest side
const WEBP_QUALITY = 80;

/**
 * Downscale + re-encode a raster image to WebP to shrink stored assets.
 * Falls back to the original bytes if sharp is unavailable or fails.
 */
async function compressToWebp(file: File): Promise<{ buffer: Buffer; ext: string; contentType: string }> {
  const input = Buffer.from(await file.arrayBuffer());
  try {
    const sharp = (await import("sharp")).default;
    const output = await sharp(input)
      .rotate() // honour EXIF orientation
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    // Only keep the re-encode if it actually helps.
    if (output.length < input.length) return { buffer: output, ext: "webp", contentType: "image/webp" };
  } catch (e) {
    console.error("[Evvy] sharp compression skipped:", e);
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  return { buffer: input, ext, contentType: file.type };
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return Response.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_SIZE) return Response.json({ error: "File too large (max 5 MB)" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return Response.json({ error: "Invalid file type" }, { status: 400 });

  const processed = COMPRESSIBLE.includes(file.type)
    ? await compressToWebp(file)
    : { buffer: Buffer.from(await file.arrayBuffer()), ext: file.name.split(".").pop()?.toLowerCase() ?? "bin", contentType: file.type };

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const { randomUUID } = await import("crypto");
      const blob = await put(`uploads/${randomUUID()}.${processed.ext}`, processed.buffer, {
        access: "public",
        contentType: processed.contentType,
      });
      return Response.json({ url: blob.url });
    } catch (e) {
      console.error("[Evvy] Vercel Blob upload error:", e);
      return Response.json({ error: "Upload failed" }, { status: 500 });
    }
  }

  // Fallback: base64 data URL (works on any host, no external service needed)
  try {
    const base64 = processed.buffer.toString("base64");
    const url = `data:${processed.contentType};base64,${base64}`;
    return Response.json({ url });
  } catch (e) {
    console.error("[Evvy] Base64 upload error:", e);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
