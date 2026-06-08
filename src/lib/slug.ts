import { db } from "@/lib/db";

export const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 50;

export function isValidSlug(slug: string): boolean {
  return slug.length >= SLUG_MIN_LENGTH && slug.length <= SLUG_MAX_LENGTH && SLUG_REGEX.test(slug);
}

/**
 * Public slugs for events (/e/[slug]) and calendars (/c/[slug]) share a single
 * namespace so the same link can never resolve to two different entities.
 */
export async function isSlugTaken(slug: string, exclude: { eventId?: string; calendarId?: string }): Promise<boolean> {
  const [event, calendar] = await Promise.all([
    db.event.findUnique({ where: { slug }, select: { id: true } }),
    db.calendar.findUnique({ where: { slug }, select: { id: true } }),
  ]);
  if (event && event.id !== exclude.eventId) return true;
  if (calendar && calendar.id !== exclude.calendarId) return true;
  return false;
}
