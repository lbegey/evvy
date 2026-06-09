"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Mail,
  Link2,
  Loader2,
  CalendarRange,
  X,
  MapPin,
  Globe,
  ArrowUpRight,
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

function MockFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl shadow-black/5", className)}>
      <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function RsvpMock() {
  return (
    <MockFrame>
      <div className="space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-emerald-500/15 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-500/30">
            <span className="text-base leading-none">✓</span> Oui
          </div>
          <div className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 text-xs font-medium text-muted-foreground">
            <span className="text-base leading-none">?</span> Peut-être
          </div>
          <div className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 text-xs font-medium text-muted-foreground">
            <span className="text-base leading-none">✕</span> Non
          </div>
        </div>
        <div className="flex h-9 items-center rounded-lg border border-border/60 bg-muted/30 px-3 text-xs text-muted-foreground">Jane Doe</div>
        <div className="flex h-9 items-center rounded-lg border border-border/60 bg-muted/30 px-3 text-xs text-muted-foreground">jane@example.com</div>
        <div className="flex h-10 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20">
          Confirmer ma présence
        </div>
      </div>
    </MockFrame>
  );
}

const MOCK_CALENDAR_COLOR = "#6366f1";
const MOCK_EVENTS = [
  { month: { fr: "MAI", en: "MAY" }, day: "14", title: "Google I/O 2026", location: "Mountain View, CA" },
  { month: { fr: "JUIN", en: "JUN" }, day: "03", title: "VivaTech Paris 2026", location: "Paris, France" },
  { month: { fr: "SEPT", en: "SEP" }, day: "19", title: "Web Summit 2026", location: "Lisbonne, Portugal" },
] as const;

function PublicCalendarMock({ lang }: { lang: "fr" | "en" }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20 shadow-xl shadow-black/5">
      <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="ml-2 truncate text-[10px] text-muted-foreground/60">evvycal.app/c/tech-conferences-2026</span>
      </div>
      <div className="p-4 space-y-2.5">
        <div className="rounded-2xl border border-border/60 bg-background px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${MOCK_CALENDAR_COLOR}26` }}
            >
              <CalendarRange className="h-3.5 w-3.5" style={{ color: MOCK_CALENDAR_COLOR }} />
            </span>
            <h4 className="text-sm font-bold tracking-tight text-foreground">
              {lang === "fr" ? "Conférences Tech 2026" : "Tech Conferences 2026"}
            </h4>
          </div>
        </div>

        <div className="space-y-1.5">
          {MOCK_EVENTS.map((ev) => (
            <div
              key={ev.title}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-background px-3 py-2.5 shadow-sm"
            >
              <div className="flex w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-muted/50 py-1">
                <span className="text-[9px] font-medium uppercase text-muted-foreground">{ev.month[lang]}</span>
                <span className="text-sm font-bold leading-none text-foreground">{ev.day}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{ev.title}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                  <MapPin className="h-2.5 w-2.5 shrink-0" />
                  {ev.location}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border/60 bg-background px-3 py-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            {SHARE_LOGOS.map((s) => (
              <span key={s.key} className="rounded-md p-0.5">
                <img src={s.logo} alt={s.name} width={26} height={26} className="rounded" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const SHARE_LOGOS = [
  { key: "google", name: "Google Calendar", logo: "/logos/google-calendar.png" },
  { key: "apple", name: "Apple Calendar", logo: "/logos/apple-calendar.png" },
  { key: "outlook", name: "Outlook.com", logo: "/logos/outlook.png" },
  { key: "office365", name: "Office 365", logo: "/logos/office365.png" },
  { key: "yahoo", name: "Yahoo Calendar", logo: "/logos/yahoo-calendar.png" },
] as const;

function SharingMock() {
  return (
    <MockFrame>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <p className="shrink-0 text-sm text-muted-foreground">Ajouter au calendrier</p>
        <div className="flex items-center gap-2 sm:gap-3">
          {SHARE_LOGOS.map((s) => (
            <span key={s.key} className="rounded-lg p-1">
              <img src={s.logo} alt={s.name} width={36} height={36} className="rounded" />
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
        <Link2 className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">evvy.app/e/conf-2026</span>
      </div>
    </MockFrame>
  );
}

function AmazonSmile() {
  return (
    <svg viewBox="0 0 60 18" width="46" height="14" aria-hidden>
      <path
        d="M2 2c10 9 46 9 56 0"
        fill="none"
        stroke="#FF9900"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M52 1.5 L58.5 0 L57 6.5 Z" fill="#FF9900" />
    </svg>
  );
}

function BrandingMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 shadow-xl shadow-black/5" style={{ backgroundColor: "#0F1111" }}>
      <div className="flex items-center gap-3 px-5 py-4 text-white" style={{ backgroundColor: "#131921" }}>
        <span className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight text-white">amazon</span>
          <AmazonSmile />
        </span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/80">
          <CheckCircle2 className="h-3 w-3" style={{ color: "#FF9900" }} />
          Marque personnalisée
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="space-y-1.5">
          <h4 className="text-base font-semibold text-white">Amazon Web Summit 2026</h4>
          <p className="text-xs text-white/50">Mer. 18 nov · 09:00 – 18:00 · Seattle, WA</p>
        </div>
        <div
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg px-6 text-xs font-semibold shadow-sm"
          style={{ backgroundColor: "#FF9900", color: "#0F1111" }}
        >
          Confirmer ma présence
        </div>
      </div>
    </div>
  );
}

function HeroCalendarBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <CalendarRange
        strokeWidth={1.5}
        className="absolute bottom-0 left-[24%] h-[28rem] w-[28rem] -translate-x-1/2 translate-y-1/4 -rotate-[10deg] text-primary/[0.04] sm:h-[37rem] sm:w-[37rem] sm:text-primary/[0.07] lg:h-[43rem] lg:w-[43rem]"
      />
    </div>
  );
}

function FaqItem({ question, answer, defaultOpen }: { question: string; answer: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-border/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-foreground"
      >
        {question}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-all duration-300 ease-in-out", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{answer}</p>
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

  const featureSections = [
    { ...T.landing.features.rsvp, mockup: <RsvpMock />, reverse: false },
    { ...T.landing.features.calendars, mockup: <PublicCalendarMock lang={lang} />, reverse: true },
    { ...T.landing.features.sharing, mockup: <SharingMock />, reverse: false },
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
        {/* Mesh gradient background */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 animate-gradient-bg" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20"
          style={{
            background:
              "radial-gradient(circle at 18% 22%, oklch(0.09 0 0 / 0.07), transparent 42%), radial-gradient(circle at 82% 18%, oklch(0.3 0 0 / 0.06), transparent 46%), radial-gradient(circle at 50% 92%, oklch(0.09 0 0 / 0.05), transparent 52%)",
          }}
        />
        {/* Calendar backdrop */}
        <HeroCalendarBackdrop />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary animate-fade-in-up">
            <Sparkles className="h-3 w-3" />
            {T.landing.hero.badge}
          </div>

          <h1
            className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="block">{T.landing.hero.titleStart}</span>
            <span className="block text-blue-600">{T.landing.hero.titleHighlight}</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            {T.landing.hero.subtitle}
          </p>

          <div
            className="mt-10 flex flex-col items-center justify-center gap-3 animate-fade-in-up sm:flex-row"
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              variant="outline"
              size="lg"
              disabled={googleLoading}
              onClick={handleGoogle}
              className="w-full gap-2.5 rounded-[10px] border-border bg-background px-7 py-6 text-sm shadow-md shadow-black/5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 sm:w-auto"
            >
              {googleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleGlyph />}
              {T.landing.hero.ctaGoogle}
            </Button>
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/register" />}
              className="w-full gap-2.5 rounded-[10px] px-7 py-6 text-sm shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 sm:w-auto"
            >
              <Mail className="h-4 w-4" />
              {T.landing.hero.ctaEmail}
            </Button>
          </div>

          <p
            className="mt-5 text-xs text-muted-foreground animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            {T.landing.hero.microText}
          </p>
        </div>
      </section>

      {/* ─── Features (alternating) ─── */}
      <section id="features" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto flex max-w-5xl flex-col gap-20 sm:gap-28">
          {featureSections.map((f, i) => (
            <div key={f.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={cn("animate-fade-in-up", f.reverse && "lg:order-2")} style={{ animationDelay: `${0.05 * i}s` }}>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {f.badge}
                </span>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  {f.title}
                </h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">{f.description}</p>
                <ul className="mt-6 space-y-2.5">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  {f.cta}
                </Link>
              </div>
              <div className={cn("animate-fade-in-up", f.reverse && "lg:order-1")} style={{ animationDelay: `${0.05 * i + 0.1}s` }}>
                {f.mockup}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Branding / White-label ─── */}
      <section className="bg-muted/20 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="lg:order-1">
            <BrandingMock />
          </div>
          <div className="lg:order-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {T.landing.branding.badge}
            </span>
            <h3 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {T.landing.branding.title}
            </h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">{T.landing.branding.description}</p>
            <ul className="mt-6 space-y-2.5">
              {T.landing.branding.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              {T.landing.branding.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Live demo ─── */}
      {demoCalendar && demoCalendar.events.length > 0 && (
        <section className="px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <div className="mx-auto max-w-xl text-center">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {T.landing.demo.badge}
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{T.landing.demo.title}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{T.landing.demo.description}</p>
            </div>

            <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
              <Link
                href={`/c/${demoCalendar.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block border-b border-border/60 bg-muted/30 px-6 py-5 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-foreground">{T.landing.demo.calendarName}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{T.landing.demo.calendarDescription}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
                    {T.landing.demo.viewCalendar.replace(" →", "")}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>

              <div className="px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {T.landing.demo.eventsLabel}
                </p>
                <ul className="mt-3 space-y-1">
                  {demoCalendar.events.map((event) => (
                    <li key={event.id}>
                      <Link
                        href={`/e/${event.slug ?? event.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{event.title}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
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
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
              >
                {T.landing.demo.cta}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Pricing ─── */}
      <section id="pricing" className="bg-muted/20 px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {T.landing.pricing.badge}
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{T.landing.pricing.title}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{T.landing.pricing.subtitle}</p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
            <div className="flex flex-col rounded-2xl border border-border/60 bg-background p-6 shadow-sm">
              <h3 className="text-base font-semibold text-foreground">{T.landing.pricing.free.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{T.landing.pricing.free.tagline}</p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{T.landing.pricing.free.price}</span>
                <span className="text-sm text-muted-foreground">{T.landing.pricing.free.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {T.landing.pricing.free.bullets.map((b) => (
                  <li key={b.text} className="flex items-start gap-2.5 text-sm text-foreground">
                    {b.included ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    )}
                    {b.text}
                  </li>
                ))}
              </ul>
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/register" />}
                className="mt-6 w-full cursor-pointer"
              >
                {T.landing.pricing.free.cta}
              </Button>
            </div>

            <div className="relative flex flex-col rounded-2xl border border-primary/40 bg-background p-6 shadow-lg shadow-primary/10 ring-1 ring-primary/20">
              <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                {T.landing.pricing.popular}
              </span>
              <h3 className="text-base font-semibold text-foreground">{T.landing.pricing.premium.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{T.landing.pricing.premium.tagline}</p>
              <p className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{T.landing.pricing.premium.price}</span>
                <span className="text-sm text-muted-foreground">{T.landing.pricing.premium.period}</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {T.landing.pricing.premium.bullets.map((b) => (
                  <li key={b.text} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {b.text}
                  </li>
                ))}
              </ul>
              <Button
                nativeButton={false}
                render={<Link href="/register" />}
                className="mt-6 w-full cursor-pointer shadow-md shadow-primary/20"
              >
                {T.landing.pricing.premium.cta}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-[800px]">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{T.landing.faq.title}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{T.landing.faq.subtitle}</p>
          </div>
          <div className="mt-10">
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
            className="relative overflow-hidden rounded-2xl px-6 py-14 text-center text-white shadow-xl sm:px-10 sm:py-16"
            style={{ background: "linear-gradient(135deg, #000000 0%, #18181b 100%)" }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.16), transparent 70%)" }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)" }}
            />

            <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">{T.landing.finalCta.title}</h2>

            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                render={<Link href="/register" />}
                className="whitespace-nowrap bg-white px-8 text-foreground shadow-lg shadow-black/10 hover:bg-white/90"
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
