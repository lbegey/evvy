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
  CalendarPlus,
  Clock,
  Check,
  X,
  MapPin,
  Globe,
  ArrowUpRight,
  ListChecks,
  Download,
  BellRing,
  HelpCircle,
  Webhook,
  Palette,
  Code2,
  ImageUp,
  EyeOff,
  PanelTop,
  Copy,
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

function MockFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-line bg-white shadow-card", className)}>
      <div className="flex items-center gap-1.5 border-b border-line bg-paper px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function RsvpMock({ m }: { m: { yes: string; maybe: string; no: string; confirm: string } }) {
  return (
    <MockFrame>
      <div className="space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-mint/15 text-xs font-semibold text-mint ring-1 ring-mint/30">
            <span className="text-base leading-none">✓</span> {m.yes}
          </div>
          <div className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-paper text-xs font-medium text-inksoft">
            <span className="text-base leading-none">?</span> {m.maybe}
          </div>
          <div className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-paper text-xs font-medium text-inksoft">
            <span className="text-base leading-none">✕</span> {m.no}
          </div>
        </div>
        <div className="flex h-9 items-center rounded-lg border border-line bg-paper px-3 text-xs text-inksoft">Jane Doe</div>
        <div className="flex h-9 items-center rounded-lg border border-line bg-paper px-3 text-xs text-inksoft">jane@example.com</div>
        <div className="flex h-10 items-center justify-center rounded-lg bg-evvy text-sm font-medium text-white shadow-card">
          {m.confirm}
        </div>
      </div>
    </MockFrame>
  );
}

const MOCK_CALENDAR_COLOR = "#5b4be6";
const MOCK_EVENTS = [
  { month: { fr: "MAI", en: "MAY" }, day: "14", title: "Google I/O 2026", location: "Mountain View, CA" },
  { month: { fr: "JUIN", en: "JUN" }, day: "03", title: "VivaTech Paris 2026", location: "Paris, France" },
  { month: { fr: "SEPT", en: "SEP" }, day: "19", title: "Web Summit 2026", location: "Lisbonne, Portugal" },
] as const;

function PublicCalendarMock({ lang }: { lang: "fr" | "en" }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-card">
      <div className="flex items-center gap-1.5 border-b border-line bg-paper px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
      </div>
      <div className="p-4 space-y-2.5">
        <div className="rounded-2xl border border-line bg-white px-4 py-3 shadow-card">
          <div className="flex items-center gap-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${MOCK_CALENDAR_COLOR}26` }}
            >
              <CalendarRange className="h-3.5 w-3.5" style={{ color: MOCK_CALENDAR_COLOR }} />
            </span>
            <h4 className="text-sm font-bold tracking-tight text-ink">
              {lang === "fr" ? "Conférences Tech 2026" : "Tech Conferences 2026"}
            </h4>
          </div>
        </div>

        <div className="space-y-1.5">
          {MOCK_EVENTS.map((ev) => (
            <div
              key={ev.title}
              className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5 shadow-card"
            >
              <div className="flex w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-paper py-1">
                <span className="text-[9px] font-medium uppercase text-inksoft">{ev.month[lang]}</span>
                <span className="text-sm font-bold leading-none text-ink">{ev.day}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-ink">{ev.title}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-inksoft">
                  <MapPin className="h-2.5 w-2.5 shrink-0" />
                  {ev.location}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-line bg-white px-3 py-2.5 shadow-card">
          <div className="flex items-center gap-2">
            {SHARE_LOGOS.map((s) => (
              <span key={s.key} className="rounded-md p-0.5">
                <Image src={s.logo} alt={s.name} width={26} height={26} className="rounded" />
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

function SharingMock({ m }: { m: { addToCalendar: string } }) {
  return (
    <MockFrame>
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <p className="shrink-0 text-sm text-inksoft">{m.addToCalendar}</p>
        <div className="flex items-center gap-2 sm:gap-3">
          {SHARE_LOGOS.map((s) => (
            <span key={s.key} className="rounded-lg p-1">
              <Image src={s.logo} alt={s.name} width={36} height={36} className="rounded" />
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2.5 text-xs text-inksoft">
        <Link2 className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">evvycal.app/e/conf-2026</span>
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

function BrandingMock({ m }: { m: { customBrand: string; confirm: string; eventDate: string } }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 shadow-pop" style={{ backgroundColor: "#0F1111" }}>
      <div className="flex items-center gap-3 px-5 py-4 text-white" style={{ backgroundColor: "#131921" }}>
        <span className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight text-white">amazon</span>
          <AmazonSmile />
        </span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/80">
          <CheckCircle2 className="h-3 w-3" style={{ color: "#FF9900" }} />
          {m.customBrand}
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="space-y-1.5">
          <h4 className="text-base font-semibold text-white">Amazon Web Summit 2026</h4>
          <p className="text-xs text-white/50">{m.eventDate}</p>
        </div>
        <div
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg px-6 text-xs font-semibold shadow-sm"
          style={{ backgroundColor: "#FF9900", color: "#0F1111" }}
        >
          {m.confirm}
        </div>
      </div>
    </div>
  );
}

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
        <div className="flex h-9 flex-col items-center justify-center gap-0.5 rounded-lg bg-mint/15 text-[10px] font-semibold text-mint ring-1 ring-mint/30">
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

const RSVP_BULLET_ICONS: LucideIcon[] = [ListChecks, Download, BellRing, HelpCircle, Webhook];
const CALENDARS_BULLET_ICONS: LucideIcon[] = [Palette, Link2, CalendarPlus];
const SHARING_BULLET_ICONS: LucideIcon[] = [Link2, Code2, PanelTop, CalendarRange];
const BRANDING_BULLET_ICONS: LucideIcon[] = [ImageUp, Palette, Copy, EyeOff];

function FeatureBullets({ bullets, icons, dark, cols2 }: { bullets: readonly string[]; icons: LucideIcon[]; dark?: boolean; cols2?: boolean }) {
  return (
    <div className={cn("mt-6 grid gap-2.5", cols2 && "sm:grid-cols-2")}>
      {bullets.map((b, i) => {
        const Icon = icons[i] ?? CheckCircle2;
        return (
          <div
            key={b}
            className={cn(
              "group flex items-start gap-3 rounded-xl border p-3.5 text-sm transition-all duration-200 hover:-translate-y-0.5",
              dark
                ? "border-white/10 bg-white/5 text-white/90 hover:border-white/25"
                : "border-line bg-white text-ink hover:border-evvy/30 hover:shadow-card"
            )}
          >
            <span className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
              dark
                ? "bg-white/10 text-white group-hover:bg-white/20"
                : "bg-evvy-soft text-evvy group-hover:bg-evvy group-hover:text-white"
            )}>
              <Icon className="h-4 w-4" />
            </span>
            <span className="pt-1.5 leading-snug">{b}</span>
          </div>
        );
      })}
    </div>
  );
}

function HighlightedTitle({ title, highlight, highlightClass = "text-evvy" }: { title: string; highlight: string; highlightClass?: string }) {
  const idx = title.indexOf(highlight);
  if (idx === -1) return <>{title}</>;
  return (
    <>
      {title.slice(0, idx)}
      <span className={highlightClass}>{highlight}</span>
      {title.slice(idx + highlight.length)}
    </>
  );
}

function BentoEyebrow({ children, dark }: { children: string; dark?: boolean }) {
  return (
    <span
      className={cn(
        "mb-4 inline-flex items-center gap-2 self-start rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider",
        dark ? "border-white/15 bg-white/5 text-white/75" : "border-line bg-paper text-inksoft"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dark ? "bg-[#9d90ff]" : "bg-evvy")} />
      {children}
    </span>
  );
}

interface BentoTextProps {
  className?: string;
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  bullets: readonly string[];
  icons: LucideIcon[];
  dark?: boolean;
  cols2?: boolean;
  delay?: number;
}

function BentoTextTile({ className, eyebrow, title, highlight, description, bullets, icons, dark, cols2, delay = 0 }: BentoTextProps) {
  return (
    <div
      className={cn(
        "flex animate-fade-in-up flex-col rounded-xl2 border p-6 shadow-card sm:p-8",
        dark ? "border-ink bg-ink text-white" : "border-line bg-white",
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <BentoEyebrow dark={dark}>{eyebrow}</BentoEyebrow>
      <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        <HighlightedTitle title={title} highlight={highlight} highlightClass={dark ? "text-[#9d90ff]" : "text-evvy"} />
      </h3>
      <p className={cn("mt-3 leading-relaxed", dark ? "text-white/70" : "text-inksoft")}>{description}</p>
      <div className="mt-auto">
        <FeatureBullets bullets={bullets} icons={icons} dark={dark} cols2={cols2} />
      </div>
    </div>
  );
}

function BentoMockTile({ className, tone = "tint", children, delay = 0 }: { className?: string; tone?: "tint" | "dark"; children: React.ReactNode; delay?: number }) {
  return (
    <div
      className={cn(
        "flex animate-fade-in-up items-center justify-center rounded-xl2 border p-6 shadow-card sm:p-8",
        tone === "dark" ? "border-ink bg-ink" : "border-line bg-paper",
        className
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="w-full">{children}</div>
    </div>
  );
}

function FaqItem({ question, answer, defaultOpen }: { question: string; answer: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-ink"
      >
        {question}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-inksoft transition-transform duration-300", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-all duration-300 ease-in-out", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">
          <p className="pb-4 text-sm leading-relaxed text-inksoft">{answer}</p>
        </div>
      </div>
    </div>
  );
}

function stripEmoji(s: string) {
  // badges are like "📋 RSVP management" — drop the leading emoji for the eyebrow
  return s.replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

export function LandingContent({ demoCalendar }: LandingContentProps) {
  const { T, lang } = useLanguage();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn.social({ provider: "google", callbackURL: "/dashboard" });
    setGoogleLoading(false);
  };

  const demoDateFmt = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <>
      {/* ─── Hero ─── */}
      <section className="relative isolate overflow-hidden px-4 py-16 sm:px-6 sm:py-20">
        {/* Soft evvy mesh background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20"
          style={{
            background:
              "radial-gradient(circle at 18% 22%, rgba(91,75,230,0.10), transparent 42%), radial-gradient(circle at 82% 18%, rgba(255,122,89,0.08), transparent 46%), radial-gradient(circle at 50% 92%, rgba(91,75,230,0.06), transparent 52%)",
          }}
        />
        {/* Light grid pattern */}
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
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-mint animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              {T.landing.hero.microText}
            </p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="hidden lg:block">
              <HeroMockupComposition m={T.landing.hero.mockup} />
            </div>
            {/* Compact single-card mockup so phone visitors still see the product */}
            <div className="mx-auto mt-2 max-w-sm lg:hidden">
              <HeroEventCardMock m={T.landing.hero.mockup} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features (bento) ─── */}
      <section id="features" className="border-y border-line bg-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            {/* Row A — RSVP */}
            <BentoTextTile
              className="md:col-span-7"
              eyebrow={stripEmoji(T.landing.features.rsvp.badge)}
              title={T.landing.features.rsvp.title}
              highlight={T.landing.features.rsvp.titleHighlight}
              description={T.landing.features.rsvp.description}
              bullets={T.landing.features.rsvp.bullets}
              icons={RSVP_BULLET_ICONS}
              cols2
            />
            <BentoMockTile className="md:col-span-5" tone="dark" delay={0.05}>
              <RsvpMock m={T.landing.mockups.rsvp} />
            </BentoMockTile>

            {/* Row B — Calendars */}
            <BentoMockTile className="md:col-span-5" tone="tint" delay={0.05}>
              <PublicCalendarMock lang={lang} />
            </BentoMockTile>
            <BentoTextTile
              className="md:col-span-7"
              eyebrow={stripEmoji(T.landing.features.calendars.badge)}
              title={T.landing.features.calendars.title}
              highlight={T.landing.features.calendars.titleHighlight}
              description={T.landing.features.calendars.description}
              bullets={T.landing.features.calendars.bullets}
              icons={CALENDARS_BULLET_ICONS}
            />

            {/* Row C — Sharing */}
            <BentoTextTile
              className="md:col-span-8"
              eyebrow={stripEmoji(T.landing.features.sharing.badge)}
              title={T.landing.features.sharing.title}
              highlight={T.landing.features.sharing.titleHighlight}
              description={T.landing.features.sharing.description}
              bullets={T.landing.features.sharing.bullets}
              icons={SHARING_BULLET_ICONS}
              cols2
            />
            <BentoMockTile className="md:col-span-4" tone="tint" delay={0.05}>
              <SharingMock m={T.landing.mockups.sharing} />
            </BentoMockTile>

            {/* Row D — White-label */}
            <BentoMockTile className="md:col-span-5" tone="dark" delay={0.05}>
              <BrandingMock m={T.landing.mockups.branding} />
            </BentoMockTile>
            <BentoTextTile
              className="md:col-span-7"
              dark
              eyebrow={stripEmoji(T.landing.branding.badge)}
              title={T.landing.branding.title}
              highlight={T.landing.branding.titleHighlight}
              description={T.landing.branding.description}
              bullets={T.landing.branding.bullets}
              icons={BRANDING_BULLET_ICONS}
              cols2
            />
          </div>
        </div>
      </section>

      {/* ─── Live demo ─── */}
      {demoCalendar && demoCalendar.events.length > 0 && (
        <section className="px-4 py-20 sm:px-6 sm:py-28">
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
                className="group block border-b border-line bg-paper px-6 py-5 transition-colors hover:bg-evvy-soft/50"
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

            <div className="mt-8 text-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-full border border-evvy/30 bg-evvy-soft px-4 py-2 text-sm font-medium text-evvy transition-colors hover:bg-evvy/10"
              >
                {T.landing.demo.cta}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Pricing ─── */}
      <section id="pricing" className="border-y border-line bg-paper px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{T.landing.pricing.title}</h2>
            <p className="mt-3 leading-relaxed text-inksoft">{T.landing.pricing.subtitle}</p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl items-start gap-6 sm:grid-cols-2">
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
              <p className="mt-3 inline-flex items-center justify-center gap-1.5 text-center text-xs font-medium text-mint">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                {T.landing.hero.microText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-[800px]">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{T.landing.faq.title}</h2>
            <p className="mt-3 leading-relaxed text-inksoft">{T.landing.faq.subtitle}</p>
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
