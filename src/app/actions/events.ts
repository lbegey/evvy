"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidSlug, isSlugTaken } from "@/lib/slug";
import { fireWebhook } from "@/lib/webhook";
import { getAppUrl } from "@/lib/url";

type EventData = {
  title: string;
  description: string;
  location: string;
  organizerEmail: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  isOnline: boolean;
  timezone: string;
  language: string;
  imageUrl?: string;
  rsvpEnabled: boolean;
};

function buildWebhookEventPayload(
  event: {
    id: string;
    title: string;
    slug: string | null;
    startAt: Date;
    endAt: Date;
    allDay: boolean;
    timezone: string;
    location: string | null;
    isOnline: boolean;
    calendar: { id: string; name: string; slug: string | null } | null;
  },
  appUrl: string
) {
  return {
    id: event.id,
    title: event.title,
    slug: event.slug,
    url: `${appUrl}/e/${event.slug ?? event.id}`,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt.toISOString(),
    allDay: event.allDay,
    timezone: event.timezone,
    location: event.location,
    isOnline: event.isOnline,
    calendar: event.calendar
      ? { id: event.calendar.id, name: event.calendar.name, slug: event.calendar.slug }
      : null,
  };
}

type EventBrandingData = {
  brandingEnabled: boolean;
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
  brandSquareCorners: boolean;
  brandBackgroundType: string | null;
  brandBackgroundColor2: string | null;
  brandBackgroundGradientAngle: number | null;
};

export async function createEvent(data: EventData): Promise<{ id: string } | { error: "limit" }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  if (new Date(data.endAt) < new Date(data.startAt)) throw new Error("End date cannot be before start date");

  // Free plan is unlimited on quantity (events/RSVPs/calendars) — only analytics
  // and custom branding are Premium.
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true },
  });

  const event = await db.event.create({
    data: {
      title: data.title,
      description: data.description || null,
      location: data.location || null,
      organizerEmail: data.organizerEmail || null,
      imageUrl: data.imageUrl || null,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      allDay: data.allDay,
      isOnline: data.isOnline,
      published: !!user?.emailVerified,
      timezone: data.timezone,
      language: data.language,
      rsvpEnabled: data.rsvpEnabled,
      brandingEnabled: false,
      userId: session.user.id,
    },
  });

  revalidatePath("/dashboard");
  return { id: event.id };
}

export async function updateEvent(id: string, data: EventData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const event = await db.event.findUnique({ where: { id } });
  if (!event || event.userId !== session.user.id) throw new Error("Forbidden");

  if (new Date(data.endAt) < new Date(data.startAt)) {
    throw new Error("End date cannot be before start date");
  }

  await db.event.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description || null,
      location: data.location || null,
      organizerEmail: data.organizerEmail || null,
      imageUrl: data.imageUrl !== undefined ? (data.imageUrl || null) : undefined,
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      allDay: data.allDay,
      isOnline: data.isOnline,
      timezone: data.timezone,
      language: data.language,
      rsvpEnabled: data.rsvpEnabled,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${id}`);
  revalidatePath(`/e/${id}`);
}

export async function updateEventAttachment(id: string, data: { attachmentUrl: string | null; attachmentName: string | null; attachmentButtonLabel: string | null }): Promise<{ error: "forbidden" } | undefined> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const event = await db.event.findUnique({ where: { id } });
  if (!event || event.userId !== session.user.id) return { error: "forbidden" };

  await db.event.update({
    where: { id },
    data: {
      attachmentUrl: data.attachmentUrl,
      attachmentName: data.attachmentUrl ? data.attachmentName : null,
      attachmentButtonLabel: data.attachmentButtonLabel,
    },
  });

  revalidatePath(`/dashboard/events/${id}`);
  revalidatePath(`/e/${id}`);
  if (event.slug) revalidatePath(`/e/${event.slug}`);
}

export async function updateEventSlug(id: string, slug: string | null): Promise<{ error: "forbidden" | "invalid" | "taken" } | undefined> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const event = await db.event.findUnique({ where: { id }, include: { user: { select: { plan: true } } } });
  if (!event || event.userId !== session.user.id) throw new Error("Forbidden");

  if (event.user.plan !== "premium") return { error: "forbidden" };

  if (slug !== null) {
    if (!isValidSlug(slug)) return { error: "invalid" };
    if (await isSlugTaken(slug, { eventId: id })) return { error: "taken" };
  }

  await db.event.update({ where: { id }, data: { slug } });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${id}`);
  revalidatePath(`/e/${id}`);
  if (event.slug) revalidatePath(`/e/${event.slug}`);
  if (slug) revalidatePath(`/e/${slug}`);
}

export async function updateEventBranding(id: string, data: EventBrandingData): Promise<{ error: "forbidden" } | undefined> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const event = await db.event.findUnique({ where: { id }, include: { user: { select: { plan: true } } } });
  if (!event || event.userId !== session.user.id) throw new Error("Forbidden");

  if (event.user.plan !== "premium") return { error: "forbidden" };

  await db.event.update({
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
      brandIconBackgroundColor: data.brandIconBackgroundColor,
      brandBackgroundColor: data.brandBackgroundColor,
      brandBackgroundImageUrl: data.brandBackgroundImageUrl,
      brandSquareCorners: data.brandSquareCorners,
      brandBackgroundType: data.brandBackgroundType,
      brandBackgroundColor2: data.brandBackgroundColor2,
      brandBackgroundGradientAngle: data.brandBackgroundGradientAngle,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${id}`);
  revalidatePath(`/e/${id}`);
}

export async function deleteEvent(id: string): Promise<{ error: "forbidden" } | undefined> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const event = await db.event.findUnique({ where: { id }, include: { user: { select: { plan: true } } } });
  if (!event || event.userId !== session.user.id) throw new Error("Forbidden");

  if (event.user.plan !== "premium") return { error: "forbidden" };

  await db.event.delete({ where: { id } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function removeEvent(id: string): Promise<{ error: "forbidden" } | { ok: true }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const event = await db.event.findUnique({ where: { id }, include: { user: { select: { plan: true } } } });
  if (!event || event.userId !== session.user.id) throw new Error("Forbidden");

  if (event.user.plan !== "premium") return { error: "forbidden" };

  await db.event.delete({ where: { id } });
  revalidatePath("/dashboard");
  if (event.calendarId) {
    revalidatePath(`/dashboard/calendars/${event.calendarId}`);
    revalidatePath(`/c/${event.calendarId}`);
  }
  return { ok: true };
}

export async function toggleEventPublished(id: string, published: boolean): Promise<{ error: "emailNotVerified" } | undefined> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const event = await db.event.findUnique({ where: { id } });
  if (!event || event.userId !== session.user.id) throw new Error("Forbidden");

  if (published) {
    const user = await db.user.findUnique({ where: { id: session.user.id }, select: { emailVerified: true } });
    if (!user?.emailVerified) return { error: "emailNotVerified" };
  }

  await db.event.update({ where: { id }, data: { published } });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/events/${id}`);
  revalidatePath(`/e/${id}`);
  if (event.slug) revalidatePath(`/e/${event.slug}`);
  if (event.calendarId) {
    revalidatePath(`/dashboard/calendars/${event.calendarId}`);
    revalidatePath(`/c/${event.calendarId}`);
  }
}

export async function toggleRsvp(id: string, enabled: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const event = await db.event.findUnique({ where: { id } });
  if (!event || event.userId !== session.user.id) throw new Error("Forbidden");

  await db.event.update({ where: { id }, data: { rsvpEnabled: enabled } });
  revalidatePath(`/dashboard/events/${id}`);
  revalidatePath(`/e/${id}`);
}

export async function updateRsvpSettings(id: string, data: { rsvpLimit: number | null; rsvpDeadline: string | null }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const event = await db.event.findUnique({ where: { id } });
  if (!event || event.userId !== session.user.id) throw new Error("Forbidden");

  await db.event.update({
    where: { id },
    data: {
      rsvpLimit: data.rsvpLimit,
      rsvpDeadline: data.rsvpDeadline ? new Date(data.rsvpDeadline) : null,
    },
  });

  revalidatePath(`/dashboard/events/${id}`);
  revalidatePath(`/e/${id}`);
  if (event.slug) revalidatePath(`/e/${event.slug}`);
}

export async function deleteRsvp(id: string): Promise<{ error: "forbidden" } | undefined> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const rsvp = await db.rsvp.findUnique({
    where: { id },
    include: {
      event: {
        select: {
          id: true, userId: true, slug: true, title: true,
          startAt: true, endAt: true, allDay: true, timezone: true, location: true, isOnline: true,
          calendar: { select: { id: true, name: true, slug: true } },
        },
      },
      answers: { include: { question: { select: { label: true, type: true } } } },
    },
  });
  if (!rsvp || rsvp.event.userId !== session.user.id) return { error: "forbidden" };

  await db.rsvp.delete({ where: { id } });

  revalidatePath(`/dashboard/events/${rsvp.eventId}`);
  revalidatePath(`/e/${rsvp.eventId}`);
  if (rsvp.event.slug) revalidatePath(`/e/${rsvp.event.slug}`);

  const appUrl = await getAppUrl();
  fireWebhook(rsvp.event.userId, "rsvp.deleted", {
    rsvp: {
      id: rsvp.id,
      name: rsvp.name,
      email: rsvp.email,
      status: rsvp.status,
      message: rsvp.message,
      createdAt: rsvp.createdAt.toISOString(),
      answers: rsvp.answers.map((a) => ({ questionId: a.questionId, label: a.question.label, type: a.question.type, value: a.value })),
    },
    event: buildWebhookEventPayload(rsvp.event, appUrl),
  }).catch(() => {});
}

export async function submitRsvp(data: {
  eventId: string;
  name: string;
  email: string;
  status: string;
  message: string;
  answers?: { questionId: string; value: string }[];
}): Promise<{ error: "full" | "closed" | "already" } | undefined> {
  const event = await db.event.findFirst({
    where: { OR: [{ id: data.eventId }, { slug: data.eventId }] },
    include: {
      user: { select: { plan: true, id: true } },
      calendar: { select: { id: true, name: true, slug: true } },
      questions: { select: { id: true, label: true, type: true } },
    },
  });
  if (!event || !event.rsvpEnabled || event.endAt < new Date()) return { error: "closed" };
  if (event.rsvpDeadline && event.rsvpDeadline < new Date()) return { error: "closed" };

  const email = data.email.trim().toLowerCase();
  if (!email) return { error: "closed" };

  const cookieStore = await cookies();
  const cookieName = `minical_rsvp_${event.id}`;
  if (cookieStore.get(cookieName)?.value) return { error: "already" };

  const existing = await db.rsvp.findFirst({ where: { eventId: event.id, email } });

  if (event.rsvpLimit != null && data.status === "yes" && existing?.status !== "yes") {
    const yesCount = await db.rsvp.count({ where: { eventId: event.id, status: "yes" } });
    if (yesCount >= event.rsvpLimit) return { error: "full" };
  }

  const answers = data.answers ?? [];

  let rsvpId: string;
  if (existing) {
    await db.rsvp.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        status: data.status,
        message: data.message || null,
      },
    });
    if (answers.length > 0) {
      await db.rsvpAnswer.deleteMany({ where: { rsvpId: existing.id } });
      await db.rsvpAnswer.createMany({
        data: answers.map((a) => ({ rsvpId: existing.id, questionId: a.questionId, value: a.value })),
      });
    }
    rsvpId = existing.id;
  } else {
    const created = await db.rsvp.create({
      data: {
        eventId: event.id,
        name: data.name,
        email,
        status: data.status,
        message: data.message || null,
        ...(answers.length > 0 ? {
          answers: { createMany: { data: answers.map((a) => ({ questionId: a.questionId, value: a.value })) } },
        } : {}),
      },
    });
    rsvpId = created.id;
  }

  cookieStore.set(cookieName, "1", { maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "lax" });

  revalidatePath(`/e/${data.eventId}`);
  if (event.slug) revalidatePath(`/e/${event.slug}`);

  // Fire webhook (fire-and-forget)
  const appUrl = await getAppUrl();
  fireWebhook(event.user.id, existing ? "rsvp.updated" : "rsvp.created", {
    rsvp: {
      id: rsvpId,
      name: data.name,
      email,
      status: data.status,
      message: data.message || null,
      createdAt: new Date().toISOString(),
      answers: answers.map((a) => {
        const q = event.questions.find((q) => q.id === a.questionId);
        return { questionId: a.questionId, label: q?.label ?? null, type: q?.type ?? null, value: a.value };
      }),
    },
    event: buildWebhookEventPayload(event, appUrl),
  }).catch(() => {});
}
