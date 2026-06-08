"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Shield,
  Mail,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { removeSuperAdmin, setUserPlan, sendPasswordResetEmail } from "@/app/actions/admin";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const USERS_PER_PAGE = 20;
const PREMIUM_MONTHLY_PRICE_EUR = 6;

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  plan: string;
  role: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeCurrentPeriodEnd: string | null;
  createdAt: string;
  eventCount: number;
  calendarCount: number;
}

interface AdminUsersManagerProps {
  currentUserId: string;
  users: AdminUserRecord[];
}

export function AdminUsersManager({ currentUserId, users }: AdminUsersManagerProps) {
  const { T, lang } = useLanguage();
  const locale = lang === "fr" ? "fr-FR" : "en-US";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<Record<string, string | null>>({});
  const [resetState, setResetState] = useState<Record<string, "sent" | "error" | null>>({});
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }),
    [locale]
  );

  const currencyFmt = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
    [locale]
  );

  const { activeSubscriberCount, monthlyRevenue } = useMemo(() => {
    const count = users.filter((u) => u.plan === "premium" && u.stripeSubscriptionId).length;
    return { activeSubscriberCount: count, monthlyRevenue: count * PREMIUM_MONTHLY_PRICE_EUR };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
    );
  }, [users, search]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const pagedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRemoveSuperAdmin = (user: AdminUserRecord) => {
    if (!confirm(T.admin.confirmRemoveSuperAdmin(user.name))) return;
    setRoleError((prev) => ({ ...prev, [user.id]: null }));
    setPendingId(user.id);
    startTransition(async () => {
      const result = await removeSuperAdmin(user.id);
      if ("error" in result) {
        setRoleError((prev) => ({ ...prev, [user.id]: T.admin.cannotChangeOwnRole }));
      }
      setPendingId(null);
    });
  };

  const handleTogglePlan = (user: AdminUserRecord) => {
    const nextPlan = user.plan === "premium" ? "free" : "premium";
    if (!confirm(T.admin.confirmPlanChange(user.name, T.admin.plans[nextPlan]))) return;
    setPendingId(user.id);
    startTransition(async () => {
      await setUserPlan(user.id, nextPlan);
      setPendingId(null);
    });
  };


  const handleSendReset = (user: AdminUserRecord) => {
    if (!confirm(T.admin.confirmSendReset(user.email))) return;
    setResetState((prev) => ({ ...prev, [user.id]: null }));
    setPendingId(user.id);
    startTransition(async () => {
      const result = await sendPasswordResetEmail(user.id);
      setResetState((prev) => ({ ...prev, [user.id]: "error" in result ? "error" : "sent" }));
      setPendingId(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 p-4">
          <p className="text-xs text-muted-foreground">{T.admin.stats.activeSubscribers}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{activeSubscriberCount}</p>
        </div>
        <div className="rounded-xl border border-border/60 p-4">
          <p className="text-xs text-muted-foreground">{T.admin.stats.monthlyRevenue}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{currencyFmt.format(monthlyRevenue)}</p>
        </div>
      </div>

      {users.length > 0 && (
        <div className="relative min-w-0 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={T.admin.searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 p-10 text-center">
          <Users className="h-8 w-8 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">{T.admin.noResults}</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {pagedUsers.map((user) => {
            const isExpanded = expandedId === user.id;
            const isSelf = user.id === currentUserId;
            const isSuperAdmin = user.role === "super_admin";
            const isUserPending = isPending && pendingId === user.id;
            const reset = resetState[user.id];

            return (
              <li key={user.id} className="rounded-xl border border-border/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : user.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                        {isSelf && <Badge variant="outline">{T.admin.you}</Badge>}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </button>

                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <Badge variant={user.plan === "premium" ? "default" : "secondary"}>
                      {user.plan === "premium" ? T.admin.plans.premium : T.admin.plans.free}
                    </Badge>
                    <Badge variant={isSuperAdmin ? "default" : "outline"} className="gap-1">
                      {isSuperAdmin ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                      {isSuperAdmin ? T.admin.roles.superAdmin : T.admin.roles.user}
                    </Badge>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-xs sm:grid-cols-2">
                      <div className="flex items-center justify-between gap-2 sm:justify-start">
                        <dt className="text-muted-foreground">{T.admin.fields.joined}</dt>
                        <dd className="font-medium text-foreground">{dateFmt.format(new Date(user.createdAt))}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-2 sm:justify-start">
                        <dt className="text-muted-foreground">{T.admin.fields.emailVerified}</dt>
                        <dd className="font-medium text-foreground">{user.emailVerified ? T.admin.fields.yes : T.admin.fields.no}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-2 sm:justify-start">
                        <dt className="text-muted-foreground">{T.admin.fields.events}</dt>
                        <dd className="font-medium text-foreground">{user.eventCount}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-2 sm:justify-start">
                        <dt className="text-muted-foreground">{T.admin.fields.calendars}</dt>
                        <dd className="font-medium text-foreground">{user.calendarCount}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-2 sm:justify-start">
                        <dt className="text-muted-foreground">{T.admin.fields.stripeCustomer}</dt>
                        <dd className="truncate font-medium text-foreground">{user.stripeCustomerId ?? T.admin.fields.none}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-2 sm:justify-start">
                        <dt className="text-muted-foreground">{T.admin.fields.subscriptionRenewal}</dt>
                        <dd className="font-medium text-foreground">
                          {user.stripeCurrentPeriodEnd ? dateFmt.format(new Date(user.stripeCurrentPeriodEnd)) : T.admin.fields.none}
                        </dd>
                      </div>
                    </dl>

                    <div className="flex flex-wrap items-center gap-2">
                      {!(isSuperAdmin && user.plan === "premium") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleTogglePlan(user)}
                          disabled={isUserPending}
                        >
                          <Users className="h-3.5 w-3.5" />
                          {user.plan === "premium" ? T.admin.downgradeToFree : T.admin.makePremium}
                        </Button>
                      )}
                      {isSuperAdmin && !isSelf && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleRemoveSuperAdmin(user)}
                          disabled={isUserPending}
                        >
                          <Shield className="h-3.5 w-3.5" />
                          {T.admin.demote}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleSendReset(user)}
                        disabled={isUserPending}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {T.admin.sendResetEmail}
                      </Button>
                      {reset === "sent" && <p className="text-xs text-green-600">{T.admin.resetEmailSent}</p>}
                      {reset === "error" && <p className="text-xs text-destructive">{T.admin.resetEmailError}</p>}
                      {roleError[user.id] && <p className="text-xs text-destructive">{roleError[user.id]}</p>}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {T.admin.pagination.previous}
          </Button>
          <p className="text-xs text-muted-foreground">{T.admin.pagination.pageInfo(currentPage, pageCount)}</p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={currentPage >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            {T.admin.pagination.next}
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
