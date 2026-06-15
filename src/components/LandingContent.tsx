"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  Mail,
  Link2,
  Loader2,
  CalendarRange,
  Clock,
  Check,
  X,
  MapPin,
  Globe,
  ArrowUpRight,
  ListChecks,
  Code2,
  Palette,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { signIn } from "@/lib/auth-client";

interface DemoCalendarEvent {
  id: string;
  slug: string | null;
  title: string;
  startAt: string;
  location: string | null;
  isOnline: boolean;
}

interface DemoCalendarData {
  slug: string;
  events: DemoCalendarEvent[];
}

interface LandingContentProps {
  demoCalendar: DemoCalendarData | null;
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

const SHARE_LOGOS = [
  { key: "google", name: "Google Calendar", logo: "/logos/google-calendar.png" },
  { key: "apple", name: "Apple Calendar", logo: "/logos/apple-calendar.png" },
  { key: "outlook", name: "Outlook.com", logo: "/logos/outlook.png" },
  { key: "office365", name: "Office 365", logo: "/logos/office365.png" },
  { key: "yahoo", name: "Yahoo Calendar", logo: "/logos/yahoo-calendar.png" },
] as const;

interface HeroMockupCopy {
  tag: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  addToCalendar: string;
  rsvpQuestion: string;
  yes: string;
  maybe: string;
  no: string;
  going: string;
  startsIn: string;
}

const RSVP_AVATAR_COLORS = ["#5b4be6", "#1fb877", "#ff7a59", "#ec4899"];

function HeroEventCardMock({ m }: { m: HeroMockupCopy }) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-5 shadow-pop sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-evvy">{m.tag}</p>
      <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">{m.eventTitle}</h3>
      <div className="mt-3 space-y-1.5">
        <p className="flex items-center gap-2 text-sm text-inksoft">
          <CalendarRange className="h-4 w-4 shrink-0 text-evvy" />
          {m.eventDate}
        </p>
        <p className="flex items-center gap-2 text-sm text-inksoft">
          <MapPin className="h-4 w-4 shrink-0 text-evvy" />
          {m.eventLocation}
        </p>
      </div>
      <div className="mt-4 border-t border-line pt-4">
        <p className="text-xs font-medium text-inksoft">{m.addToCalendar}</p>
        <div className="mt-2 flex items-center gap-2">
          {SHARE_LOGOS.map((s) => (
            <span key={s.key} className="rounded-lg p-0.5">
              <Image src={s.logo} alt={s.name} width={28} height={28} className="rounded" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroRsvpCardMock({ m }: { m: HeroMockupCopy }) {
  return (
    <div className="w-[210px] rounded-2xl border border-line bg-white p-4 shadow-pop">
      <p className="text-sm font-semibold text-ink">{m.rsvpQuestion}</p>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <div className="flex h-9 flex-col items-center justify-center gap-0.5 rounded-lg bg-mint/15 text-[10px] font-semibold text-mint-ink ring-1 ring-mint/30">
          <Check className="h-3.5 w-3.5" />
          {m.yes}
        </div>
        <div className="flex h-9 flex-col items-center justify-center gap-0.5 rounded-lg border border-line bg-paper text-[10px] font-medium text-inksoft">
          <span className="text-xs leading-none">?</span>
          {m.maybe}
        </div>
        <div className="flex h-9 flex-col items-center justify-center gap-0.5 rounded-lg border border-line bg-paper text-[10px] font-medium text-inksoft">
          <X className="h-3.5 w-3.5" />
          {m.no}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex -space-x-2">
          {RSVP_AVATAR_COLORS.map((c) => (
            <span key={c} className="h-6 w-6 rounded-full border-2 border-white" style={{ backgroundColor: c }} />
          ))}
        </div>
        <span className="text-xs text-inksoft">{m.going}</span>
      </div>
    </div>
  );
}

function HeroStartsInBadge({ m }: { m: HeroMockupCopy }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-medium text-white shadow-pop">
      <Clock className="h-3.5 w-3.5" />
      {m.startsIn}
    </div>
  );
}

function HeroMockupComposition({ m }: { m: HeroMockupCopy }) {
  return (
    <div className="relative mx-auto max-w-sm lg:mx-0 lg:ml-auto">
      <div className="absolute -top-12 right-6 z-20 animate-float-card-delayed">
        <HeroStartsInBadge m={m} />
      </div>
      <div className="relative z-10 animate-float-card">
        <HeroEventCardMock m={m} />
      </div>
      <div className="absolute -bottom-12 -left-10 z-20 animate-float-card-delayed">
        <HeroRsvpCardMock m={m} />
      </div>
    </div>
  );
}

function HeroCalendarBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <CalendarRange
        strokeWidth={1.5}
        className="absolute bottom-0 left-[24%] h-[28rem] w-[28rem] -translate-x-1/2 translate-y-1/4 -rotate-[10deg] text-evvy/[0.05] sm:h-[37rem] sm:w-[37rem] sm:text-evvy/[0.07] lg:h-[43rem] lg:w-[43rem]"
      />
    </div>
  );
}

function HighlightedTitle({ title, highlight }: { title: string; highlight: string }) {
  const idx = title.indexOf(highlight);
  if (idx === -1) return <>{title}</>;
  return (
    <>
      {title.slice(0, idx)}
      <span className="text-evvy">{highlight}</span>
      {title.slice(idx + highlight.length)}
    </>
  );
}

interface FeatureCardData {
  Icon: LucideIcon;
  title: string;
  titleHighlight: string;
  description: string;
  bullets: readonly string[];
  tier: string;
  premium?: boolean;
}

function FeatureCard({ Icon, title, titleHighlight, description, bullets, tier, premium }: FeatureCardData) {
  return (
    <div className="flex flex-col rounded-xl2 border border-line bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pop sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-evvy to-coral text-white shadow-pop">
          <Icon className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <span className={cn(
          "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
          premium ? "border-evvy/30 bg-evvy-soft text-evvy-deep" : "border-line bg-paper text-inksoft"
        )}>
          {tier}
        </span>
      </div>
      <h3 className="mt-4 font-display text-xl font-bold tracking-tight text-ink">
        <HighlightedTitle title={title} highlight={titleHighlight} />
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-inksoft">{description}</p>
      <ul className="mt-4 space-y-2">
        {bullets.slice(0, 3).map((b) => (
          <li key={b} className="flex items-start gap-2 text-sm text-ink">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-evvy" />
            <span className="leading-snug">{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqItem({ question, answer, defaultOpen }: { question: string; answer: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl2 border border-line bg-white shadow-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-ink"
      >
        {question}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-inksoft transition-transform duration-300", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-all duration-300 ease-in-out", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm leading-relaxed text-inksoft">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function LandingContent({ demoCalendar }: LandingContentProps) {
  const { T, lang } = useLanguage();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn.social({ provider: "google", callbackURL: "/dashboard" });
    setGoogleLoading(false);
  };

  const features: FeatureCardData[] = [
    { Icon: ListChecks, ...T.landing.features.rsvp, tier: T.landing.pricing.free.name },
    { Icon: CalendarRange, ...T.landing.features.calendars, tier: T.landing.pricing.free.name },
    { Icon: Code2, ...T.landing.features.sharing, tier: T.landing.pricing.free.name },
    { Icon: Palette, ...T.landing.branding, tier: T.landing.pricing.premium.name, premium: true },
  ];

  const demoDateFmt = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative isolate overflow-hidden px-4 py-16 sm:px-6 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20"
          style={{
            background:
              "radial-gradient(circle at 18% 22%, rgba(91,75,230,0.10), transparent 42%), radial-gradient(circle at 82% 18%, rgba(255,122,89,0.08), transparent 46%), radial-gradient(circle at 50% 92%, rgba(91,75,230,0.06), transparent 52%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(26,24,56,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(26,24,56,0.05) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black 50%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black 50%, transparent 100%)",
          }}
        />
        <HeroCalendarBackdrop />
        <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2 lg:gap-12">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-4 py-1.5 text-xs font-medium text-inksoft shadow-card backdrop-blur-sm animate-fade-in-up">
              <span className="h-2 w-2 shrink-0 rounded-full bg-mint" />
              {T.landing.hero.badge}
            </div>

            <h1
              className="mt-5 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-6xl lg:text-6xl animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="block">{T.landing.hero.titleStart}</span>
              <span className="block bg-gradient-to-r from-evvy to-coral bg-clip-text text-transparent">
                {T.landing.hero.titleHighlight}
              </span>
            </h1>

            <p
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-inksoft animate-fade-in-up lg:mx-0"
              style={{ animationDelay: "0.2s" }}
            >
              {T.landing.hero.subtitle}
            </p>

            <div
              className="mt-10 flex flex-col items-center justify-center gap-3 animate-fade-in-up sm:flex-row lg:justify-start"
              style={{ animationDelay: "0.3s" }}
            >
              <Button
                variant="outline"
                size="lg"
                disabled={googleLoading}
                onClick={handleGoogle}
                className="w-full gap-2.5 rounded-[10px] border-line bg-white px-7 py-6 text-sm text-ink shadow-card transition-all hover:-translate-y-0.5 hover:bg-paper sm:w-auto"
              >
                {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleGlyph />}
                {T.landing.hero.ctaGoogle}
              </Button>
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/register" />}
                className="w-full gap-2.5 rounded-[10px] bg-evvy px-7 py-6 text-sm text-white shadow-pop transition-all hover:-translate-y-0.5 hover:bg-evvy-deep sm:w-auto"
              >
                <Mail className="h-4 w-4" />
                {T.landing.hero.ctaEmail}
              </Button>
            </div>

            <p
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-mint-ink animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              {T.landing.hero.microText}
            </p>
          </div>

          {/* Right-side mockup — desktop only */}
          <div className="hidden animate-fade-in-up lg:block" style={{ animationDelay: "0.3s" }}>
            <HeroMockupComposition m={T.landing.hero.mockup} />
          </div>
        </div>
      </section>

      {/* ─── Works-with strip ─── */}
      <section className="border-y border-line bg-paper px-4 py-12 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6">
          <p className="text-sm font-medium text-inksoft">{T.landing.hero.compatibleWith}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:gap-x-12">
            {SHARE_LOGOS.map((s) => (
              <span key={s.key} className="inline-flex items-center gap-2">
                <Image src={s.logo} alt={s.name} width={28} height={28} className="rounded" />
                <span className="text-sm font-medium text-ink">{s.name}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{T.landing.features.heading}</h2>
            <p className="mt-3 leading-relaxed text-inksoft">{T.landing.features.subheading}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Live demo ─── */}
      {demoCalendar && demoCalendar.events.length > 0 && (
        <section className="border-t border-line bg-paper px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{T.landing.demo.title}</h2>
              <p className="mt-3 leading-relaxed text-inksoft">{T.landing.demo.description}</p>
            </div>

            <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-xl2 border border-line bg-white shadow-card">
              <Link
                href={`/c/${demoCalendar.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block border-b border-line bg-white px-6 py-5 transition-colors hover:bg-evvy-soft/40"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-ink">{T.landing.demo.calendarName}</p>
                    <p className="mt-0.5 text-sm text-inksoft">{T.landing.demo.calendarDescription}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-evvy">
                    {T.landing.demo.viewCalendar.replace(" →", "")}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>

              <div className="px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-inksoft">
                  {T.landing.demo.eventsLabel}
                </p>
                <ul className="mt-3 space-y-1">
                  {demoCalendar.events.map((event) => (
                    <li key={event.id}>
                      <Link
                        href={`/e/${event.slug ?? event.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-paper"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{event.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-inksoft">
                            <span className="inline-flex items-center gap-1">
                              <CalendarRange className="h-3.5 w-3.5" />
                              {demoDateFmt.format(new Date(event.startAt))}
                            </span>
                            {event.isOnline ? (
                              <span className="inline-flex items-center gap-1">
                                <Globe className="h-3.5 w-3.5" />
                                {T.landing.demo.online}
                              </span>
                            ) : event.location ? (
                              <span className="inline-flex items-center gap-1 truncate">
                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{event.location}</span>
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-inksoft transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-evvy" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Pricing ─── */}
      <section id="pricing" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{T.landing.pricing.title}</h2>
            <p className="mt-3 leading-relaxed text-inksoft">{T.landing.pricing.subtitle}</p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl items-stretch gap-6 sm:grid-cols-2">
            <div className="flex flex-col rounded-xl2 border border-line bg-white p-6 shadow-card">
              <h3 className="font-display text-base font-semibold text-ink">{T.landing.pricing.free.name}</h3>
              <p className="mt-1 text-xs text-inksoft">{T.landing.pricing.free.tagline}</p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-ink">{T.landing.pricing.free.price}</span>
                <span className="text-sm text-inksoft">{T.landing.pricing.free.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {T.landing.pricing.free.bullets.map((b) => (
                  <li key={b.text} className="flex items-start gap-2.5 text-sm text-ink">
                    {b.included ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-inksoft" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
                    )}
                    {b.text}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/register" />}
                className="mt-6 w-full cursor-pointer border-line bg-white text-ink hover:bg-paper"
              >
                {T.landing.pricing.free.cta}
              </Button>
            </div>

            <div className="relative flex flex-col rounded-xl2 border-2 border-evvy bg-white p-6 shadow-pop">
              <span className="absolute -top-3 right-6 rounded-full bg-evvy px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-card">
                {T.landing.pricing.popular}
              </span>
              <h3 className="font-display text-base font-semibold text-ink">{T.landing.pricing.premium.name}</h3>
              <p className="mt-1 text-xs text-inksoft">{T.landing.pricing.premium.tagline}</p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-evvy">{T.landing.pricing.premium.price}</span>
                <span className="text-sm text-inksoft">{T.landing.pricing.premium.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {T.landing.pricing.premium.bullets.map((b) => (
                  <li key={b.text} className="flex items-start gap-2.5 text-sm text-ink">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-evvy" />
                    {b.text}
                  </li>
                ))}
              </ul>
              <Button
                nativeButton={false}
                render={<Link href="/register" />}
                className="mt-6 w-full cursor-pointer bg-evvy text-white shadow-card hover:bg-evvy-deep"
              >
                {T.landing.pricing.premium.cta}
              </Button>
              <p className="mt-3 inline-flex items-center justify-center gap-1.5 text-center text-xs font-medium text-mint-ink">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                {T.landing.hero.microText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="border-t border-line bg-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-[800px]">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{T.landing.faq.title}</h2>
            <p className="mt-3 leading-relaxed text-inksoft">{T.landing.faq.subtitle}</p>
          </div>
          <div className="mt-10 space-y-3">
            {T.landing.faq.items.map((item, i) => (
              <FaqItem key={item.q} question={item.q} answer={item.a} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="px-4 py-20 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <div
            className="relative overflow-hidden rounded-xl2 px-6 py-14 text-center text-white shadow-pop sm:px-10 sm:py-16"
            style={{ background: "linear-gradient(135deg, #1a1838 0%, #4636c9 100%)" }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,122,89,0.30), transparent 70%)" }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)" }}
            />

            <h2 className="relative font-display text-3xl font-bold tracking-tight sm:text-4xl">{T.landing.finalCta.title}</h2>
            <p className="relative mx-auto mt-3 max-w-lg text-sm text-white/80">{T.landing.finalCta.subtitle}</p>

            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/register" />}
                className="whitespace-nowrap bg-white px-8 text-ink shadow-card hover:bg-white/90"
              >
                {T.landing.finalCta.ctaPrimary}
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/register" />}
                className="whitespace-nowrap border-white/40 bg-transparent text-white hover:bg-white/10"
              >
                {T.landing.finalCta.ctaSecondary}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
