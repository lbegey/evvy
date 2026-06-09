import type { NextRequest } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { buildRsvpReminderEmail } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY);
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://evvycal.app";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  let sent = 0;

  // ── 24h reminder ──────────────────────────────────────────────────────────
  const target24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const window24hFrom = new Date(target24h.getTime() - 60 * 60 * 1000); // ±1h
  const window24hTo   = new Date(target24h.getTime() + 60 * 60 * 1000);

  const events24h = await db.event.findMany({
    where: {
      rsvpEnabled: true,
      startAt: { gte: window24hFrom, lte: window24hTo },
    },
    include: {
      rsvps: {
        where: { email: { not: null }, reminderSent24h: false },
        select: { id: true, email: true, name: true },
      },
    },
  });

  for (const event of events24h) {
    if (event.rsvps.length === 0) continue;
    const eventUrl = `${APP_URL}/e/${event.slug ?? event.id}`;
    const lang: "fr" | "en" = event.language === "fr" ? "fr" : "en";
    const dateLabel = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
      timeZone: event.timezone, weekday: "short", day: "numeric", month: "short",
      ...(event.allDay ? {} : { hour: "2-digit", minute: "2-digit" }),
    }).format(event.startAt);

    for (const rsvp of event.rsvps) {
      if (!rsvp.email) continue;
      await resend.emails.send({
        from: "Evvy <noreply@evvycal.app>",
        to: rsvp.email,
        subject: lang === "fr" ? `Rappel : ${event.title} — demain` : `Reminder: ${event.title} — tomorrow`,
        html: buildRsvpReminderEmail({
          rsvpName: rsvp.name,
          eventTitle: event.title,
          eventUrl,
          dateLabel,
          location: event.location,
          isOnline: event.isOnline,
          hoursUntil: 24,
          lang,
        }),
      });
      await db.rsvp.update({ where: { id: rsvp.id }, data: { reminderSent24h: true } });
      sent++;
    }
  }

  // ── 7-day reminder ────────────────────────────────────────────────────────
  const target7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const window7dFrom = new Date(target7d.getTime() - 2 * 60 * 60 * 1000); // ±2h
  const window7dTo   = new Date(target7d.getTime() + 2 * 60 * 60 * 1000);

  const events7d = await db.event.findMany({
    where: {
      rsvpEnabled: true,
      startAt: { gte: window7dFrom, lte: window7dTo },
    },
    include: {
      rsvps: {
        where: { email: { not: null }, reminderSent7d: false },
        select: { id: true, email: true, name: true },
      },
    },
  });

  for (const event of events7d) {
    if (event.rsvps.length === 0) continue;
    const eventUrl = `${APP_URL}/e/${event.slug ?? event.id}`;
    const lang: "fr" | "en" = event.language === "fr" ? "fr" : "en";
    const dateLabel = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
      timeZone: event.timezone, weekday: "short", day: "numeric", month: "short",
      ...(event.allDay ? {} : { hour: "2-digit", minute: "2-digit" }),
    }).format(event.startAt);

    for (const rsvp of event.rsvps) {
      if (!rsvp.email) continue;
      await resend.emails.send({
        from: "Evvy <noreply@evvycal.app>",
        to: rsvp.email,
        subject: lang === "fr" ? `Rappel : ${event.title} — dans 7 jours` : `Reminder: ${event.title} — in 7 days`,
        html: buildRsvpReminderEmail({
          rsvpName: rsvp.name,
          eventTitle: event.title,
          eventUrl,
          dateLabel,
          location: event.location,
          isOnline: event.isOnline,
          hoursUntil: 168,
          lang,
        }),
      });
      await db.rsvp.update({ where: { id: rsvp.id }, data: { reminderSent7d: true } });
      sent++;
    }
  }

  return Response.json({ ok: true, sent });
}
