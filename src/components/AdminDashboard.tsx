"use client";

import { useState } from "react";
import { Users, MessageSquare, UserX } from "lucide-react";
import { AdminUsersManager, type AdminUserRecord } from "@/components/AdminUsersManager";
import { AdminContactMessages, type AdminContactMessageRecord } from "@/components/AdminContactMessages";
import { AdminDeletedAccounts, type AdminDeletedAccountRecord } from "@/components/AdminDeletedAccounts";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "users", labelKey: "users", icon: Users },
  { id: "messages", labelKey: "messages", icon: MessageSquare },
  { id: "deletedAccounts", labelKey: "deletedAccounts", icon: UserX },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface AdminDashboardProps {
  currentUserId: string;
  users: AdminUserRecord[];
  messages: AdminContactMessageRecord[];
  deletedAccounts: AdminDeletedAccountRecord[];
}

export function AdminDashboard({ currentUserId, users, messages, deletedAccounts }: AdminDashboardProps) {
  const { T } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>("users");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:flex lg:items-start lg:gap-8">
      {/* Sidebar navigation */}
      <aside className="hidden shrink-0 lg:sticky lg:top-20 lg:block lg:w-44">
        <nav className="space-y-0.5">
          {TABS.map(({ id, labelKey, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                activeTab === id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {T.admin.tabs[labelKey]}
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{T.admin.title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{T.admin.subtitle}</p>
        </div>

        {/* Mobile tab nav */}
        <nav className="-mx-4 flex gap-1 overflow-x-auto no-scrollbar px-4 pb-1 lg:hidden">
          {TABS.map(({ id, labelKey, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                activeTab === id
                  ? "border-primary/40 bg-primary/10 text-primary font-medium"
                  : "border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {T.admin.tabs[labelKey]}
            </button>
          ))}
        </nav>

        {activeTab === "users" ? (
          <AdminUsersManager currentUserId={currentUserId} users={users} />
        ) : activeTab === "messages" ? (
          <AdminContactMessages messages={messages} />
        ) : (
          <AdminDeletedAccounts accounts={deletedAccounts} />
        )}
      </div>
    </div>
  );
}
