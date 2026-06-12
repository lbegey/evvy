"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, LayoutGrid, CalendarRange, Palette, CreditCard, Webhook, ShieldCheck, User, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface Props {
  isSuperAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardNavSidebar({ isSuperAdmin, isOpen, onClose }: Props) {
  const { T } = useLanguage();
  const pathname = usePathname() ?? "";

  const items: { href: string; label: string; Icon: LucideIcon; active: boolean }[] = [
    { href: "/dashboard", label: T.nav.events, Icon: LayoutGrid, active: pathname === "/dashboard" },
    { href: "/dashboard/calendars", label: T.nav.calendars, Icon: CalendarRange, active: pathname.startsWith("/dashboard/calendars") },
    { href: "/dashboard/branding", label: T.nav.branding, Icon: Palette, active: pathname.startsWith("/dashboard/branding") },
    { href: "/dashboard/billing", label: T.userMenu.billing, Icon: CreditCard, active: pathname.startsWith("/dashboard/billing") },
    { href: "/dashboard/webhooks", label: T.userMenu.webhooks, Icon: Webhook, active: pathname.startsWith("/dashboard/webhooks") },
    ...(isSuperAdmin ? [{ href: "/dashboard/admin", label: T.userMenu.admin, Icon: ShieldCheck, active: pathname.startsWith("/dashboard/admin") }] : []),
  ];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-line bg-white transition-transform duration-300",
        "lg:static lg:w-64 lg:translate-x-0 lg:bg-transparent",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-line px-4 lg:hidden">
        <span className="font-display font-bold">Menu</span>
        <button onClick={onClose} className="rounded-lg p-2 text-inksoft hover:bg-paper" aria-label="Close">
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-6 pt-5 text-sm">
        {items.map(({ href, label, Icon, active }) => (
          <Link
            key={href}
            href={href}
            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 transition",
              active ? "bg-evvy-soft font-semibold text-evvy-deep" : "text-inksoft hover:bg-paper"
            )}
          >
            <Icon className={cn("h-[17px] w-[17px] shrink-0", active ? "text-evvy" : "text-inksoft/70")} />
            <span className="min-w-0 truncate">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <Link href="/dashboard/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-inksoft transition hover:bg-paper">
          <User className="h-4 w-4" />{T.userMenu.profile}
        </Link>
      </div>
    </aside>
  );
}
