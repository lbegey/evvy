"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Search, Users, ChevronLeft, ChevronRight, Maximize2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toggleRsvp, deleteRsvp } from "@/app/actions/events";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

export interface RsvpRecord {
  id: string;
  name: string;
  email: string | null;
  status: string;
  message: string | null;
  createdAt: string;
}

interface RsvpSectionProps {
  eventId: string;
  rsvpEnabled: boolean;
  rsvps: RsvpRecord[];
  expanded?: boolean;
  onExpand?: () => void;
}

export function RsvpSection({ eventId, rsvpEnabled, rsvps, expanded = false, onExpand }: RsvpSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { T, lang } = useLanguage();
  const locale = lang === "fr" ? "fr-FR" : "en-US";

  const yes   = rsvps.filter((r) => r.status === "yes").length;
  const no    = rsvps.filter((r) => r.status === "no").length;
  const maybe = rsvps.filter((r) => r.status === "maybe").length;

  const filteredRsvps = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rsvps;
    return rsvps.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      (r.email ?? "").toLowerCase().includes(q) ||
      (r.message ?? "").toLowerCase().includes(q)
    );
  }, [rsvps, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRsvps.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedRsvps = filteredRsvps.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    yes:   { label: T.rsvpSection.statusLabels.yes,   className: "bg-green-100 text-green-700" },
    no:    { label: T.rsvpSection.statusLabels.no,    className: "bg-red-100 text-red-700" },
    maybe: { label: T.rsvpSection.statusLabels.maybe, className: "bg-amber-100 text-amber-700" },
  };

  const handleToggle = () => {
    startTransition(async () => {
      await toggleRsvp(eventId, !rsvpEnabled);
      router.refresh();
    });
  };

  const handleDelete = (rsvpId: string) => {
    if (!confirm(T.rsvpSection.confirmDelete)) return;
    setDeletingId(rsvpId);
    startTransition(async () => {
      await deleteRsvp(rsvpId);
      setDeletingId(null);
      router.refresh();
    });
  };

  return (
    <section className={cn("space-y-4", expanded ? "" : "rounded-xl border border-border/60 p-5")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">{T.rsvpSection.title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {onExpand && (
            <button
              type="button"
              onClick={onExpand}
              title={T.rsvpSection.expand}
              className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}
          <span className={cn("text-xs font-medium", rsvpEnabled ? "text-primary" : "text-muted-foreground")}>
            {rsvpEnabled ? T.rsvpSection.enabled : T.rsvpSection.disabled}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={rsvpEnabled}
            onClick={handleToggle}
            disabled={isPending}
            className={cn(
              "relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:pointer-events-none disabled:opacity-50",
              rsvpEnabled ? "bg-primary" : "bg-muted-foreground/30"
            )}
          >
            <span
              className={cn(
                "inline-block h-3.5 w-3.5 rounded-full bg-background shadow transition-transform",
                rsvpEnabled ? "translate-x-4.5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>
      </div>

      {rsvpEnabled && (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: T.rsvpSection.total, count: rsvps.length, color: "text-foreground" },
              { label: T.rsvpSection.yes,   count: yes,          color: "text-green-600" },
              { label: T.rsvpSection.maybe, count: maybe,        color: "text-amber-600" },
              { label: T.rsvpSection.no,    count: no,           color: "text-red-600" },
            ].map((c) => (
              <div key={c.label} className="rounded-lg bg-muted/40 p-3 text-center">
                <p className={cn("text-xl font-bold", c.color)}>{c.count}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </div>
            ))}
          </div>

          {rsvps.length > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-2 sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder={T.rsvpSection.searchPlaceholder}
                    className="pl-8"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  nativeButton={false}
                  render={<a href={`/api/events/${eventId}/rsvp/export`} download />}
                >
                  <Download className="h-3.5 w-3.5" />
                  {T.rsvpSection.exportCsv}
                </Button>
              </div>

              {paginatedRsvps.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-border/40">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/30">
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                          <span className="sr-only">{T.rsvpSection.table.actions}</span>
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{T.rsvpSection.table.name}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{T.rsvpSection.table.email}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">{T.rsvpSection.table.status}</th>
                        <th className={cn("px-3 py-2 text-left text-xs font-medium text-muted-foreground", !expanded && "hidden sm:table-cell")}>{T.rsvpSection.table.message}</th>
                        <th className={cn("px-3 py-2 text-left text-xs font-medium text-muted-foreground", !expanded && "hidden sm:table-cell")}>{T.rsvpSection.table.date}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRsvps.map((r) => {
                        const cfg = STATUS_CONFIG[r.status] ?? { label: r.status, className: "bg-muted text-muted-foreground" };
                        return (
                          <tr key={r.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                            <td className="px-3 py-2 text-left">
                              <button
                                type="button"
                                title={T.rsvpSection.delete}
                                onClick={() => handleDelete(r.id)}
                                disabled={deletingId === r.id}
                                className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </td>
                            <td className="px-3 py-2 font-medium text-foreground">{r.name}</td>
                            <td className="px-3 py-2 text-muted-foreground">{r.email ?? "—"}</td>
                            <td className="px-3 py-2">
                              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", cfg.className)}>
                                {cfg.label}
                              </span>
                            </td>
                            <td className={cn("px-3 py-2 text-muted-foreground", expanded ? "whitespace-pre-wrap break-words" : "max-w-[200px] truncate hidden sm:table-cell")}>{r.message ?? "—"}</td>
                            <td className={cn("px-3 py-2 text-muted-foreground whitespace-nowrap", !expanded && "hidden sm:table-cell")}>
                              {new Intl.DateTimeFormat(locale, {
                                day: "2-digit", month: "2-digit", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              }).format(new Date(r.createdAt))}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  {T.rsvpSection.noResults}
                </p>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={currentPage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    {T.rsvpSection.pagination.previous}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {T.rsvpSection.pagination.pageInfo(currentPage, totalPages)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    {T.rsvpSection.pagination.next}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </>
          )}

          {rsvps.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {T.rsvpSection.noResponses}
            </p>
          )}
        </>
      )}

      {!rsvpEnabled && (
        <p className="text-sm text-muted-foreground">{T.rsvpSection.disabledHint}</p>
      )}
    </section>
  );
}
