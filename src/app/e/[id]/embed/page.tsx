import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getAppUrl } from "@/lib/url";
import { en } from "@/i18n/en";
import { fr } from "@/i18n/fr";

const CAL_SERVICES = [
  { key: "google",    name: "Google Calendar", logo: "/logos/google-calendar.png" },
  { key: "apple",     name: "Apple Calendar",  logo: "/logos/apple-calendar.png" },
  { key: "outlook",   name: "Outlook.com",     logo: "/logos/outlook.png" },
  { key: "office365", name: "Office 365",      logo: "/logos/office365.png" },
  { key: "yahoo",     name: "Yahoo Calendar",  logo: "/logos/yahoo-calendar.png" },
] as const;

export default async function EventEmbedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const APP_URL = await getAppUrl();
  const cookieStore = await cookies();
  const cookieLang: "fr" | "en" = cookieStore.get("minical_lang")?.value === "fr" ? "fr" : "en";

  const event = await db.event.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    select: { id: true, endAt: true, language: true },
  });
  if (!event) notFound();

  const lang = event.language === "fr" || event.language === "en" ? event.language : cookieLang;
  const T = lang === "fr" ? fr : en;
  const isPast = event.endAt < new Date();

  return (
    <div className="flex items-center justify-center p-3">
      {isPast ? (
        <p className="text-sm text-muted-foreground">{T.publicEvent.eventEnded}</p>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <p className="text-sm text-muted-foreground shrink-0">{T.publicEvent.addToCalendar}</p>
          <div className="flex items-center gap-2 sm:gap-3">
            {CAL_SERVICES.map((s) => (
              <a
                key={s.key}
                href={`${APP_URL}/api/events/${event.id}/track?service=${s.key}`}
                target={s.key !== "apple" ? "_blank" : undefined}
                rel="noopener noreferrer"
                title={s.name}
                className="cursor-pointer rounded-lg p-1"
              >
                <img src={s.logo} alt={s.name} width={36} height={36} className="rounded" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
