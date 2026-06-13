"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus, CalendarPlus } from "lucide-react";
import { Logo } from "@/components/Logo";
import { NavbarUserMenu } from "@/components/NavbarUserMenu";
import { NavbarMarketingNav } from "@/components/NavbarMarketingNav";
import { useCreateDialogs } from "@/components/CreateDialogsProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface Props {
  isSuperAdmin: boolean;
  isLoggedIn: boolean;
  onMenuClick?: () => void;
}

export function DashboardTopbar({ isSuperAdmin, isLoggedIn, onMenuClick }: Props) {
  const { lang, setLanguage, T } = useLanguage();
  const pathname = usePathname() ?? "";
  const createDialogs = useCreateDialogs();
  const onCalendars = pathname.startsWith("/dashboard/calendars");
  const onEvents = pathname.startsWith("/dashboard") && !onCalendars;

  const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-evvy/50 focus-visible:ring-offset-1";

  const navLink = (active: boolean) =>
    cn(focusRing, "rounded-lg px-3 py-1.5 transition", active ? "bg-paper font-medium text-ink" : "text-inksoft hover:bg-paper hover:text-ink");

  const mobileTab = (active: boolean) =>
    cn(
      focusRing,
      "flex-1 border-b-2 px-3 py-2.5 text-center text-sm font-medium transition",
      active ? "border-evvy text-evvy" : "border-transparent text-inksoft hover:text-ink"
    );

  return (
    <header className="z-40 shrink-0 border-b border-line bg-white">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
      {onMenuClick && (
        <button onClick={onMenuClick} className={cn(focusRing, "-ml-1 rounded-lg p-2 text-inksoft hover:bg-paper lg:hidden")} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
      )}

      <Link href={isLoggedIn ? "/dashboard" : "/"} className="shrink-0 transition-opacity hover:opacity-80">
        <Logo size="md" />
      </Link>

      {isLoggedIn ? (
        <nav className="ml-4 hidden items-center gap-1 text-sm md:flex">
          <Link href="/dashboard" className={navLink(onEvents)}>{T.nav.events}</Link>
          <Link href="/dashboard/calendars" className={navLink(onCalendars)}>{T.nav.calendars}</Link>
        </nav>
      ) : (
        <div className="ml-4 hidden md:block">
          <NavbarMarketingNav />
        </div>
      )}

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {/* Language switch — always visible (flag on mobile, flag + label on larger screens) */}
        <div className="flex items-center rounded-lg border border-line p-0.5 text-xs font-medium">
          <button
            onClick={() => setLanguage("en")}
            aria-label="English"
            aria-pressed={lang === "en"}
            className={cn(focusRing, "flex items-center gap-1 rounded-md px-2 py-1 transition", lang === "en" ? "bg-evvy-soft text-evvy-deep" : "text-inksoft hover:text-ink")}
          >
            <span className="fi fi-gb text-base" /><span className="hidden sm:inline">EN</span>
          </button>
          <button
            onClick={() => setLanguage("fr")}
            aria-label="Français"
            aria-pressed={lang === "fr"}
            className={cn(focusRing, "flex items-center gap-1 rounded-md px-2 py-1 transition", lang === "fr" ? "bg-evvy-soft text-evvy-deep" : "text-inksoft hover:text-ink")}
          >
            <span className="fi fi-fr text-base" /><span className="hidden sm:inline">FR</span>
          </button>
        </div>

        {isLoggedIn && createDialogs && (
          <>
            <button
              onClick={() => createDialogs.openCreateEvent()}
              aria-label={T.calendar.newEvent}
              className={cn(focusRing, "inline-flex h-9 items-center gap-1.5 rounded-lg bg-evvy px-2.5 text-sm font-medium text-white shadow-card transition hover:bg-evvy-deep sm:px-3")}
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="hidden lg:inline">{T.calendar.newEvent}</span>
            </button>
            <button
              onClick={() => createDialogs.openCreateCalendar()}
              aria-label={T.calendar.newCalendar}
              className={cn(focusRing, "inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 text-sm font-medium text-ink transition hover:bg-paper sm:px-3")}
            >
              <CalendarPlus className="h-4 w-4 shrink-0" />
              <span className="hidden lg:inline">{T.calendar.newCalendar}</span>
            </button>
          </>
        )}

        <NavbarUserMenu isSuperAdmin={isSuperAdmin} />
      </div>
      </div>

      {/* Secondary nav — mobile only, kept visible under the sticky topbar so
          Events/Calendars (or the marketing links) stay reachable on phones. */}
      {isLoggedIn ? (
        <nav className="flex border-t border-line px-2 md:hidden">
          <Link href="/dashboard" className={mobileTab(onEvents)}>{T.nav.events}</Link>
          <Link href="/dashboard/calendars" className={mobileTab(onCalendars)}>{T.nav.calendars}</Link>
        </nav>
      ) : (
        <nav className="flex border-t border-line px-2 md:hidden">
          <Link href="/#features" className={mobileTab(false)}>{T.landing.nav.features}</Link>
          <Link href="/#pricing" className={mobileTab(false)}>{T.landing.nav.pricing}</Link>
          <Link href="/#faq" className={mobileTab(false)}>{T.landing.nav.faq}</Link>
        </nav>
      )}
    </header>
  );
}
