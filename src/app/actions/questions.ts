"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

type QuestionData = {
  label: string;
  type: string;
  options?: string | null;
  required: boolean;
  order: number;
};

async function getSessionAndEvent(eventId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  const event = await db.event.findUnique({ where: { id: eventId }, select: { id: true, userId: true, slug: true } });
  if (!event || event.userId !== session.user.id) return { session, event: null };
  return { session, event };
}

function revalidateEvent(eventId: string, slug?: string | null) {
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath(`/e/${eventId}`);
  if (slug) revalidatePath(`/e/${slug}`);
}

export async function createRsvpQuestion(
  eventId: string,
  data: QuestionData
): Promise<{ id: string } | { error: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { plan: true } });
  if (user?.plan !== "premium") return { error: "forbidden" };

  const event = await db.event.findUnique({ where: { id: eventId }, select: { id: true, userId: true, slug: true } });
  if (!event || event.userId !== session.user.id) return { error: "forbidden" };

  const question = await db.rsvpQuestion.create({
    data: {
      eventId: event.id,
      label: data.label.trim(),
      type: data.type,
      options: data.options ?? null,
      required: data.required,
      order: data.order,
    },
  });

  revalidateEvent(event.id, event.slug);
  return { id: question.id };
}

export async function updateRsvpQuestion(
  questionId: string,
  data: Partial<QuestionData>
): Promise<{ error: string } | undefined> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const question = await db.rsvpQuestion.findUnique({
    where: { id: questionId },
    include: { event: { select: { id: true, userId: true, slug: true } } },
  });
  if (!question || question.event.userId !== session.user.id) return { error: "forbidden" };

  await db.rsvpQuestion.update({
    where: { id: questionId },
    data: {
      ...(data.label !== undefined ? { label: data.label.trim() } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.options !== undefined ? { options: data.options ?? null } : {}),
      ...(data.required !== undefined ? { required: data.required } : {}),
      ...(data.order !== undefined ? { order: data.order } : {}),
    },
  });

  revalidateEvent(question.event.id, question.event.slug);
}

export async function deleteRsvpQuestion(
  questionId: string
): Promise<{ error: string } | undefined> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const question = await db.rsvpQuestion.findUnique({
    where: { id: questionId },
    include: { event: { select: { id: true, userId: true, slug: true } } },
  });
  if (!question || question.event.userId !== session.user.id) return { error: "forbidden" };

  await db.rsvpQuestion.delete({ where: { id: questionId } });

  revalidateEvent(question.event.id, question.event.slug);
}

export async function reorderRsvpQuestions(
  eventId: string,
  orderedIds: string[]
): Promise<{ error: string } | undefined> {
  const { event } = await getSessionAndEvent(eventId);
  if (!event) return { error: "forbidden" };

  await db.$transaction(
    orderedIds.map((id, index) =>
      db.rsvpQuestion.update({ where: { id }, data: { order: index } })
    )
  );

  revalidateEvent(event.id, event.slug);
}
