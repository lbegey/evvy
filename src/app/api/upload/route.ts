import { type NextRequest } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
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

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const bytes = await file.arrayBuffer();
  await writeFile(join(process.cwd(), "public", "uploads", filename), Buffer.from(bytes));

  return Response.json({ url: `/uploads/${filename}` });
}
