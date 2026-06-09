"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getUserLanguage(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { language: true },
  });
  return user?.language ?? null;
}

export async function setUserLanguage(language: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return;
  await db.user.update({
    where: { id: session.user.id },
    data: { language },
  });
}

export async function getUserDashboardView(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { dashboardView: true },
  });
  return user?.dashboardView ?? null;
}

export async function setUserDashboardView(view: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return;
  await db.user.update({
    where: { id: session.user.id },
    data: { dashboardView: view },
  });
}

export async function updateBranding(data: { brandLogoUrl: string; brandLogoSize: number; brandLogoTransparentBg: boolean; brandLogoRounded: boolean; brandColor: string; brandTextColor: string; brandCardColor: string; brandBackgroundColor: string; brandBackgroundImageUrl: string }): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (user?.plan !== "premium" && user?.role !== "super_admin") throw new Error("Forbidden");

  await db.user.update({
    where: { id: session.user.id },
    data: {
      brandLogoUrl: data.brandLogoUrl || null,
      brandLogoSize: data.brandLogoSize || null,
      brandLogoTransparentBg: data.brandLogoTransparentBg,
      brandLogoRounded: data.brandLogoRounded,
      brandColor: data.brandColor || null,
      brandTextColor: data.brandTextColor || null,
      brandCardColor: data.brandCardColor || null,
      brandBackgroundColor: data.brandBackgroundColor || null,
      brandBackgroundImageUrl: data.brandBackgroundImageUrl || null,
    },
  });
}

export async function resetBranding(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (user?.plan !== "premium" && user?.role !== "super_admin") throw new Error("Forbidden");

  await db.user.update({
    where: { id: session.user.id },
    data: { brandLogoUrl: null, brandLogoSize: null, brandLogoTransparentBg: true, brandLogoRounded: false, brandColor: null, brandTextColor: null, brandCardColor: null, brandBackgroundColor: null, brandBackgroundImageUrl: null },
  });
}
