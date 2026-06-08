"use client";

import { useMemo, useState } from "react";
import { Search, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

export interface AdminDeletedAccountRecord {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  createdAt: string;
}

interface AdminDeletedAccountsProps {
  accounts: AdminDeletedAccountRecord[];
}

export function AdminDeletedAccounts({ accounts }: AdminDeletedAccountsProps) {
  const { T, lang } = useLanguage();
  const locale = lang === "fr" ? "fr-FR" : "en-US";
  const [search, setSearch] = useState("");

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    [locale]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return accounts;
    return accounts.filter(
      (a) => a.email.toLowerCase().includes(query) || (a.name ?? "").toLowerCase().includes(query)
    );
  }, [accounts, search]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{T.admin.deletedAccounts.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{T.admin.deletedAccounts.subtitle}</p>
      </div>

      {accounts.length > 0 && (
        <div className="relative min-w-0 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={T.admin.deletedAccounts.searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 p-10 text-center">
          <UserX className="h-8 w-8 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">{T.admin.deletedAccounts.noAccounts}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 p-10 text-center">
          <Search className="h-8 w-8 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">{T.admin.deletedAccounts.noResults}</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{a.name || a.email}</p>
                <p className="truncate text-xs text-muted-foreground">{a.email}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-0.5 text-xs text-muted-foreground">
                <span>{T.admin.deletedAccounts.deletedOn} {dateFmt.format(new Date(a.createdAt))}</span>
                <span>{T.admin.deletedAccounts.wasOnPlan}: {a.plan === "premium" ? T.admin.plans.premium : T.admin.plans.free}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
