"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function requireSuperAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (user?.role !== "super_admin") throw new Error("Forbidden");
  return { session, user };
}

export async function removeSuperAdmin(userId: string): Promise<{ error: "self" } | { ok: true }> {
  const { user } = await requireSuperAdmin();
  if (userId === user.id) return { error: "self" };

  await db.user.update({ where: { id: userId }, data: { role: "user" } });
  revalidatePath("/dashboard/admin");
  return { ok: true };
}

export async function setUserPlan(userId: string, plan: "free" | "premium"): Promise<{ error: "superAdmin" } | { ok: true }> {
  await requireSuperAdmin();

  if (plan === "free") {
    const target = await db.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (target?.role === "super_admin") return { error: "superAdmin" };
  }

  await db.user.update({ where: { id: userId }, data: { plan } });
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/billing");
  return { ok: true };
}

export async function archiveContact(id: string): Promise<{ ok: true }> {
  await requireSuperAdmin();

  await db.contact.update({ where: { id }, data: { archived: true } });
  revalidatePath("/dashboard/admin");
  return { ok: true };
}

export async function deleteContact(id: string): Promise<{ ok: true }> {
  await requireSuperAdmin();

  await db.contact.delete({ where: { id } });
  revalidatePath("/dashboard/admin");
  return { ok: true };
}

export async function sendPasswordResetEmail(userId: string): Promise<{ error: "not_found" } | { ok: true }> {
  await requireSuperAdmin();

  const target = await db.user.findUnique({ where: { id: userId }, select: { email: true } });
  if (!target) return { error: "not_found" };

  await auth.api.requestPasswordReset({ body: { email: target.email, redirectTo: "/reset-password" } });
  return { ok: true };
}
