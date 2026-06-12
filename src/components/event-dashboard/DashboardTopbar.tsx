"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus } from "lucide-react";
import { NavbarUserMenu } from "@/components/NavbarUserMenu";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface Props {
  isSuperAdmin: boolean;
  onMenuClick?: () => void;
  onNewEvent?: () => void;
  showNav?: boolean;
}

export function DashboardTopbar({ isSuperAdmin, onMenuClick, onNewEvent, showNav = true }: Props) {
  const { lang, setLanguage, T } = useLanguage();
  const pathname = usePathname() ?? "";
  const onCalendars = pathname.startsWith("/dashboard/calendars");
  const onEvents = !onCalendars;

  const navLink = (active: boolean) =>
    cn("rounded-lg px-3 py-1.5 transition", active ? "bg-paper font-medium text-ink" : "text-inksoft hover:bg-paper hover:text-ink");

  return (
    <header className="z-40 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-white px-4 sm:px-6">
      {onMenuClick && (
        <button onClick={onMenuClick} className="-ml-1 rounded-lg p-2 text-inksoft hover:bg-paper lg:hidden" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
      )}

      <Link href="/dashboard" className="font-display text-[22px] font-extrabold tracking-tight text-ink">
        Ev<span className="text-evvy">vy</span><span className="text-evvy">.</span>
      </Link>

      {showNav && (
        <nav className="ml-4 hidden items-center gap-1 text-sm md:flex">
          <Link href="/dashboard" className={navLink(onEvents)}>{T.nav.events}</Link>
          <Link href="/dashboard/calendars" className={navLink(onCalendars)}>{T.nav.calendars}</Link>
        </nav>
      )}

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center rounded-lg border border-line p-0.5 text-xs font-medium sm:flex">
          <button onClick={() => setLanguage("en")} className={cn("rounded-md px-2.5 py-1 transition", lang === "en" ? "bg-evvy-soft text-evvy-deep" : "text-inksoft hover:text-ink")}>🇬🇧 EN</button>
          <button onClick={() => setLanguage("fr")} className={cn("rounded-md px-2.5 py-1 transition", lang === "fr" ? "bg-evvy-soft text-evvy-deep" : "text-inksoft hover:text-ink")}>🇫🇷 FR</button>
        </div>
        {onNewEvent && (
          <button onClick={onNewEvent} className="hidden h-9 items-center gap-1.5 rounded-lg bg-evvy px-3 text-sm font-medium text-white shadow-card transition hover:bg-evvy-deep sm:inline-flex">
            <Plus className="h-4 w-4" />{T.calendar.newEvent}
          </button>
        )}
        <NavbarUserMenu isSuperAdmin={isSuperAdmin} />
      </div>
    </header>
  );
}
