"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function DashboardViewSwitcher() {
  const pathname = usePathname();
  const { T } = useLanguage();
  const isCalendars = pathname?.startsWith("/dashboard/calendars") ?? false;
  const isEvents = pathname === "/dashboard" || (pathname?.startsWith("/dashboard/events") ?? false);

  const ITEMS = [
    { id: "events", href: "/dashboard", label: T.nav.events, icon: LayoutDashboard, active: isEvents },
    { id: "calendars", href: "/dashboard/calendars", label: T.nav.calendars, icon: CalendarDays, active: isCalendars },
  ] as const;

  return (
    <div className="flex items-center gap-2">
      {ITEMS.map(({ id, href, label, icon: Icon, active }) => (
        <Link
          key={id}
          href={href}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active
              ? "border-border/60 bg-muted text-foreground"
              : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          aria-label={label}
        >
          <Icon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{label}</span>
        </Link>
      ))}
    </div>
  );
}
