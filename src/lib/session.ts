import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, plan: true, emailVerified: true, legacyUnlimitedRsvps: true },
  });

  return { session, user };
});
