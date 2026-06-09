"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { isValidSlug, isSlugTaken } from "@/lib/slug";

type CalendarData = {
  name: string;
  description: string;
  color: string;
  language: string;
};

type CalendarBrandingData = {
  brandingEnabled: boolean;
  brandLogoUrl: string | null;
  brandLogoSize: number | null;
  brandLogoTransparentBg: boolean;
  brandLogoRounded: boolean;
  brandColor: string | null;
  brandTextColor: string | null;
  brandCardColor: string | null;
  brandBackgroundColor: string | null;
  brandBackgroundImageUrl: string | null;
};

async function requirePremiumSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (user?.plan !== "premium") return { session, isPremium: false as const };
  return { session, isPremium: true as const };
}

export async function createCalendar(data: CalendarData): Promise<{ id: string } | { error: "forbidden" }> {
  const { session, isPremium } = await requirePremiumSession();
  if (!isPremium) return { error: "forbidden" };

  const calendar = await db.calendar.create({
    data: {
      name: data.name,
      description: data.description || null,
      color: data.color || null,
      language: data.language || "en",
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendars");
  return { id: calendar.id };
}

export async function updateCalendar(id: string, data: CalendarData): Promise<{ error: "forbidden" } | undefined> {
  const { session, isPremium } = await requirePremiumSession();
  if (!isPremium) return { error: "forbidden" };

  const calendar = await db.calendar.findUnique({ where: { id } });
  if (!calendar || calendar.userId !== session.user.id) throw new Error("Forbidden");

  await db.calendar.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || null,
      color: data.color || null,
      language: data.language || "en",
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendars");
  revalidatePath(`/c/${id}`);
}

export async function updateCalendarSlug(id: string, slug: string | null): Promise<{ error: "forbidden" | "invalid" | "taken" } | undefined> {
  const { session, isPremium } = await requirePremiumSession();
  if (!isPremium) return { error: "forbidden" };

  const calendar = await db.calendar.findUnique({ where: { id } });
  if (!calendar || calendar.userId !== session.user.id) throw new Error("Forbidden");

  if (slug !== null) {
    if (!isValidSlug(slug)) return { error: "invalid" };
    if (await isSlugTaken(slug, { calendarId: id })) return { error: "taken" };
  }

  await db.calendar.update({ where: { id }, data: { slug } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendars");
  revalidatePath(`/dashboard/calendars/${id}`);
  revalidatePath(`/c/${id}`);
  if (calendar.slug) revalidatePath(`/c/${calendar.slug}`);
  if (slug) revalidatePath(`/c/${slug}`);
}

export async function updateCalendarBranding(id: string, data: CalendarBrandingData): Promise<{ error: "forbidden" } | undefined> {
  const { session, isPremium } = await requirePremiumSession();
  if (!isPremium) return { error: "forbidden" };

  const calendar = await db.calendar.findUnique({ where: { id } });
  if (!calendar || calendar.userId !== session.user.id) throw new Error("Forbidden");

  await db.calendar.update({
    where: { id },
    data: {
      brandingEnabled: data.brandingEnabled,
      brandLogoUrl: data.brandLogoUrl,
      brandLogoSize: data.brandLogoSize,
      brandLogoTransparentBg: data.brandLogoTransparentBg,
      brandLogoRounded: data.brandLogoRounded,
      brandColor: data.brandColor,
      brandTextColor: data.brandTextColor,
      brandCardColor: data.brandCardColor,
      brandBackgroundColor: data.brandBackgroundColor,
      brandBackgroundImageUrl: data.brandBackgroundImageUrl,
    },
  });

  revalidatePath("/dashboard/calendars");
  revalidatePath(`/dashboard/calendars/${id}`);
  revalidatePath(`/c/${id}`);
  if (calendar.slug) revalidatePath(`/c/${calendar.slug}`);
}

export async function deleteCalendar(id: string): Promise<{ error: "forbidden" } | undefined> {
  const { session, isPremium } = await requirePremiumSession();
  if (!isPremium) return { error: "forbidden" };

  const calendar = await db.calendar.findUnique({ where: { id } });
  if (!calendar || calendar.userId !== session.user.id) throw new Error("Forbidden");

  await db.calendar.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendars");
}

export async function assignEventToCalendar(eventId: string, calendarId: string | null): Promise<{ error: "forbidden" } | undefined> {
  const { session, isPremium } = await requirePremiumSession();
  if (!isPremium) return { error: "forbidden" };

  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event || event.userId !== session.user.id) throw new Error("Forbidden");

  if (calendarId) {
    const calendar = await db.calendar.findUnique({ where: { id: calendarId } });
    if (!calendar || calendar.userId !== session.user.id) throw new Error("Forbidden");
  }

  await db.event.update({ where: { id: eventId }, data: { calendarId } });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/e/${eventId}`);
  if (calendarId) revalidatePath(`/c/${calendarId}`);
}
