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

export async function updateBranding(data: { brandLogoUrl: string; brandLogoSize: number; brandLogoTransparentBg: boolean; brandLogoRounded: boolean; brandColor: string; brandTextColor: string; brandCardColor: string; brandIconBackgroundColor: string; brandBackgroundColor: string; brandBackgroundImageUrl: string; brandSquareCorners: boolean; brandBackgroundType: string | null; brandBackgroundColor2: string | null; brandBackgroundGradientAngle: number | null }): Promise<void> {
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
      brandIconBackgroundColor: data.brandIconBackgroundColor || null,
      brandBackgroundColor: data.brandBackgroundColor || null,
      brandBackgroundImageUrl: data.brandBackgroundImageUrl || null,
      brandSquareCorners: data.brandSquareCorners,
      brandBackgroundType: data.brandBackgroundType,
      brandBackgroundColor2: data.brandBackgroundColor2 || null,
      brandBackgroundGradientAngle: data.brandBackgroundGradientAngle,
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
    data: { brandLogoUrl: null, brandLogoSize: null, brandLogoTransparentBg: true, brandLogoRounded: false, brandColor: null, brandTextColor: null, brandCardColor: null, brandIconBackgroundColor: null, brandBackgroundColor: null, brandBackgroundImageUrl: null, brandSquareCorners: false, brandBackgroundType: null, brandBackgroundColor2: null, brandBackgroundGradientAngle: null },
  });
}
