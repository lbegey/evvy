"use server";

import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(1),
});

export async function submitContact(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: "Invalid data" };
  }

  try {
    await db.contact.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        subject: parsed.data.subject ?? null,
        message: parsed.data.message,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Database error" };
  }
}
