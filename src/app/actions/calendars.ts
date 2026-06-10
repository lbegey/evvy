"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { isValidSlug, isSlugTaken } from "@/lib/slug";

const FREE_CALENDAR_LIMIT = 1;

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

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function createCalendar(data: CalendarData): Promise<{ id: string } | { error: "forbidden" | "limit" }> {
  const session = await getSession();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, role: true, emailVerified: true, _count: { select: { calendars: true } } },
  });
  const isPremium = user?.plan === "premium" || user?.role === "super_admin";

  if (!isPremium && (user?._count.calendars ?? 0) >= FREE_CALENDAR_LIMIT) return { error: "limit" };

  const calendar = await db.calendar.create({
    data: {
      name: data.name,
      description: data.description || null,
      color: data.color || null,
      language: data.language || "en",
      published: !!user?.emailVerified,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendars");
  return { id: calendar.id };
}

export async function updateCalendar(id: string, data: CalendarData): Promise<{ error: "forbidden" } | undefined> {
  const session = await getSession();

  const calendar = await db.calendar.findUnique({ where: { id } });
  if (!calendar || calendar.userId !== session.user.id) return { error: "forbidden" };

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
  const session = await getSession();

  const calendar = await db.calendar.findUnique({ where: { id }, include: { user: { select: { plan: true, role: true } } } });
  if (!calendar || calendar.userId !== session.user.id) return { error: "forbidden" };
  if (!(calendar.user.plan === "premium" || calendar.user.role === "super_admin")) return { error: "forbidden" };

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
  const session = await getSession();

  const calendar = await db.calendar.findUnique({ where: { id }, include: { user: { select: { plan: true, role: true } } } });
  if (!calendar || calendar.userId !== session.user.id) return { error: "forbidden" };
  if (!(calendar.user.plan === "premium" || calendar.user.role === "super_admin")) return { error: "forbidden" };

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

export async function toggleCalendarPublished(id: string, published: boolean): Promise<{ error: "forbidden" | "emailNotVerified" } | undefined> {
  const session = await getSession();

  const calendar = await db.calendar.findUnique({ where: { id } });
  if (!calendar || calendar.userId !== session.user.id) return { error: "forbidden" };

  if (published) {
    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { emailVerified: true } });
    if (!user?.emailVerified) return { error: "emailNotVerified" };
  }

  await db.calendar.update({ where: { id }, data: { published } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendars");
  revalidatePath(`/dashboard/calendars/${id}`);
  revalidatePath(`/c/${id}`);
  if (calendar.slug) revalidatePath(`/c/${calendar.slug}`);
}

export async function deleteCalendar(id: string): Promise<{ error: "forbidden" } | undefined> {
  const session = await getSession();

  const calendar = await db.calendar.findUnique({ where: { id } });
  if (!calendar || calendar.userId !== session.user.id) return { error: "forbidden" };

  await db.calendar.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendars");
}

export async function assignEventToCalendar(eventId: string, calendarId: string | null): Promise<{ error: "forbidden" } | undefined> {
  const session = await getSession();

  const [event, calendar] = await Promise.all([
    db.event.findUnique({ where: { id: eventId }, include: { user: { select: { plan: true, role: true } } } }),
    calendarId ? db.calendar.findUnique({ where: { id: calendarId } }) : Promise.resolve(null),
  ]);
  if (!event || event.userId !== session.user.id) throw new Error("Forbidden");
  if (!(event.user.plan === "premium" || event.user.role === "super_admin")) return { error: "forbidden" };

  if (calendarId) {
    if (!calendar || calendar.userId !== session.user.id) throw new Error("Forbidden");
  }

  await db.event.update({ where: { id: eventId }, data: { calendarId } });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/e/${eventId}`);
  if (calendarId) revalidatePath(`/c/${calendarId}`);
}
