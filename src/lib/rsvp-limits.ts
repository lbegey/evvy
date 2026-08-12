/**
 * Free plan RSVP visibility cap.
 *
 * Guests are never affected: every response is always recorded in full. The cap
 * is purely on what the *organizer* can see — the dashboard list and the CSV
 * export show the first N responses, the rest are withheld behind Premium.
 */
export const FREE_PLAN_RSVP_LIMIT = 40;

export interface RsvpLimitSubject {
  plan: string;
  legacyUnlimitedRsvps: boolean;
  role?: string | null;
}

/** How many RSVPs this organizer may see, or `null` for unlimited. */
export function rsvpVisibilityLimit(user: RsvpLimitSubject | null | undefined): number | null {
  if (!user) return FREE_PLAN_RSVP_LIMIT;
  if (user.plan === "premium") return null;
  if (user.legacyUnlimitedRsvps) return null;
  if (user.role === "super_admin") return null;
  return FREE_PLAN_RSVP_LIMIT;
}

/** How many of `total` responses are withheld from this organizer. */
export function hiddenRsvpCount(user: RsvpLimitSubject | null | undefined, total: number): number {
  const limit = rsvpVisibilityLimit(user);
  return limit == null ? 0 : Math.max(0, total - limit);
}
