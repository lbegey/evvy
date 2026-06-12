"use client";

import Link from "next/link";
import { X, ArrowLeft, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export interface SidebarItem {
  id: string;
  label: string;
  Icon: LucideIcon;
  badge?: number;
}

interface Props {
  items: SidebarItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  backUrl: string;
  backLabel: string;
  manageLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ items, activeId, onNavigate, backUrl, backLabel, manageLabel, isOpen, onClose }: Props) {
  const { T } = useLanguage();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-line bg-white transition-transform duration-300",
        "lg:static lg:w-64 lg:translate-x-0 lg:bg-transparent",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-line px-4 lg:hidden">
        <span className="font-display font-bold">{T.dashboardDetail.sidebar.events}</span>
        <button onClick={onClose} className="rounded-lg p-2 text-inksoft hover:bg-paper" aria-label="Close">
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>

      <div className="px-4 pb-3 pt-5">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-inksoft/70">{manageLabel}</p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-6 text-sm">
        {items.map(({ id, label, Icon, badge }) => {
          const active = activeId === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => { e.preventDefault(); onNavigate(id); }}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition",
                active ? "bg-evvy-soft font-semibold text-evvy-deep" : "text-inksoft hover:bg-paper"
              )}
            >
              <Icon className={cn("h-[17px] w-[17px] shrink-0", active ? "text-evvy" : "text-inksoft/70")} />
              <span className="min-w-0 truncate">{label}</span>
              {badge != null && badge > 0 && (
                <span className="ml-auto rounded-full bg-mint/15 px-1.5 py-0.5 text-[11px] font-semibold text-mint">{badge}</span>
              )}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-line p-3">
        <Link href={backUrl} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-inksoft transition hover:bg-paper">
          <ArrowLeft className="h-4 w-4" />{backLabel}
        </Link>
      </div>
    </aside>
  );
}
