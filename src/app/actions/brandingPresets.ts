"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type BrandingPresetData = {
  brandLogoUrl: string | null;
  brandLogoSize: number | null;
  brandLogoTransparentBg: boolean;
  brandLogoRounded: boolean;
  brandColor: string | null;
  brandTextColor: string | null;
  brandCardColor: string | null;
  brandIconBackgroundColor: string | null;
  brandBackgroundColor: string | null;
  brandBackgroundImageUrl: string | null;
};

export type BrandingPreset = BrandingPresetData & {
  id: string;
  name: string;
};

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.plan !== "premium" && user.role !== "super_admin")) throw new Error("Forbidden");
  return user;
}

export async function listBrandingPresets(): Promise<BrandingPreset[]> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return [];

  return db.brandingPreset.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      brandLogoUrl: true,
      brandLogoSize: true,
      brandLogoTransparentBg: true,
      brandLogoRounded: true,
      brandColor: true,
      brandTextColor: true,
      brandCardColor: true,
      brandIconBackgroundColor: true,
      brandBackgroundColor: true,
      brandBackgroundImageUrl: true,
    },
  });
}

export async function createBrandingPreset(name: string, data: BrandingPresetData): Promise<void> {
  const user = await requireUser();
  const trimmed = name.trim().slice(0, 60);
  if (!trimmed) throw new Error("Name is required");

  await db.brandingPreset.create({
    data: { userId: user.id, name: trimmed, ...data },
  });

  revalidatePath("/dashboard/branding");
}

export async function deleteBrandingPreset(id: string): Promise<{ error: "forbidden" } | undefined> {
  const user = await requireUser();

  const preset = await db.brandingPreset.findUnique({ where: { id } });
  if (!preset || preset.userId !== user.id) return { error: "forbidden" };

  await db.brandingPreset.delete({ where: { id } });

  revalidatePath("/dashboard/branding");
}

export async function applyBrandingPresetToEvent(eventId: string, presetId: string): Promise<{ error: "forbidden" } | undefined> {
  const user = await requireUser();

  const [event, preset] = await Promise.all([
    db.event.findUnique({ where: { id: eventId } }),
    db.brandingPreset.findUnique({ where: { id: presetId } }),
  ]);
  if (!event || event.userId !== user.id) return { error: "forbidden" };
  if (!preset || preset.userId !== user.id) return { error: "forbidden" };

  await db.event.update({
    where: { id: eventId },
    data: {
      brandingEnabled: true,
      brandLogoUrl: preset.brandLogoUrl,
      brandLogoSize: preset.brandLogoSize,
      brandLogoTransparentBg: preset.brandLogoTransparentBg,
      brandLogoRounded: preset.brandLogoRounded,
      brandColor: preset.brandColor,
      brandTextColor: preset.brandTextColor,
      brandCardColor: preset.brandCardColor,
      brandIconBackgroundColor: preset.brandIconBackgroundColor,
      brandBackgroundColor: preset.brandBackgroundColor,
      brandBackgroundImageUrl: preset.brandBackgroundImageUrl,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/e/${eventId}`);
  if (event.slug) revalidatePath(`/e/${event.slug}`);
}

export async function applyBrandingPresetToCalendar(calendarId: string, presetId: string): Promise<{ error: "forbidden" } | undefined> {
  const user = await requireUser();

  const [calendar, preset] = await Promise.all([
    db.calendar.findUnique({ where: { id: calendarId } }),
    db.brandingPreset.findUnique({ where: { id: presetId } }),
  ]);
  if (!calendar || calendar.userId !== user.id) return { error: "forbidden" };
  if (!preset || preset.userId !== user.id) return { error: "forbidden" };

  await db.calendar.update({
    where: { id: calendarId },
    data: {
      brandingEnabled: true,
      brandLogoUrl: preset.brandLogoUrl,
      brandLogoSize: preset.brandLogoSize,
      brandLogoTransparentBg: preset.brandLogoTransparentBg,
      brandLogoRounded: preset.brandLogoRounded,
      brandColor: preset.brandColor,
      brandTextColor: preset.brandTextColor,
      brandCardColor: preset.brandCardColor,
      brandIconBackgroundColor: preset.brandIconBackgroundColor,
      brandBackgroundColor: preset.brandBackgroundColor,
      brandBackgroundImageUrl: preset.brandBackgroundImageUrl,
    },
  });

  revalidatePath("/dashboard/calendars");
  revalidatePath(`/dashboard/calendars/${calendarId}`);
  revalidatePath(`/c/${calendarId}`);
  if (calendar.slug) revalidatePath(`/c/${calendar.slug}`);
}
