"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Search, Users, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Maximize2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toggleRsvp, deleteRsvp, updateRsvpSettings } from "@/app/actions/events";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

function isoToLocalDate(iso: string, tz: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(d);
  const p = (t: string) => parts.find((x) => x.type === t)?.value ?? "00";
  return `${p("year")}-${p("month")}-${p("day")}`;
}

function naiveToUTC(date: string, time: string, tz: string): string {
  const dummy = new Date(`${date}T${time}:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).formatToParts(dummy);
  const p = (t: string) => parts.find((x) => x.type === t)?.value ?? "00";
  const h = p("hour") === "24" ? "00" : p("hour");
  const tzClock = new Date(`${p("year")}-${p("month")}-${p("day")}T${h}:${p("minute")}:${p("second")}Z`);
  return new Date(dummy.getTime() - (tzClock.getTime() - dummy.getTime())).toISOString();
}

export interface RsvpAnswer {
  questionId: string;
  value: string;
}

export interface RsvpRecord {
  id: string;
  name: string;
  email: string | null;
  status: string;
  message: string | null;
  createdAt: string;
  answers?: RsvpAnswer[];
}

interface RsvpSectionProps {
  eventId: string;
  rsvpEnabled: boolean;
  rsvpLimit?: number | null;
  rsvpDeadline?: string | null;
  timezone?: string;
  rsvps: RsvpRecord[];
  questions?: { id: string; label: string }[];
  expanded?: boolean;
  onExpand?: () => void;
}

export function RsvpSection({ eventId, rsvpEnabled, rsvpLimit = null, rsvpDeadline = null, timezone = "UTC", rsvps, questions = [], expanded = false, onExpand }: RsvpSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSavingSettings, startSettingsTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [limitInput, setLimitInput] = useState(rsvpLimit != null ? String(rsvpLimit) : "");
  const [deadlineInput, setDeadlineInput] = useState(rsvpDeadline ? isoToLocalDate(rsvpDeadline, timezone) : "");
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

  const handleSaveSettings = () => {
    startSettingsTransition(async () => {
      const limit = limitInput.trim() !== "" ? parseInt(limitInput, 10) : null;
      const deadline = deadlineInput ? naiveToUTC(deadlineInput, "23:59", timezone) : null;
      await updateRsvpSettings(eventId, { rsvpLimit: limit, rsvpDeadline: deadline });
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
            <Button variant="ghost" size="icon-sm" onClick={onExpand} title={T.rsvpSection.expand} aria-label={T.rsvpSection.expand}>
              <Maximize2 className="h-4 w-4" />
            </Button>
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
          <div className="flex flex-col gap-3 rounded-lg border border-border/40 p-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={`rsvp-limit-${eventId}`}>{T.eventForm.rsvpLimit}</Label>
              <Input
                id={`rsvp-limit-${eventId}`}
                type="number"
                min={0}
                placeholder={T.eventForm.rsvpLimitPlaceholder}
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={`rsvp-deadline-${eventId}`}>{T.eventForm.rsvpDeadline}</Label>
              <Input
                id={`rsvp-deadline-${eventId}`}
                type="date"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
              />
            </div>
            <Button type="button" size="sm" disabled={isSavingSettings} onClick={handleSaveSettings}>
              {T.eventForm.save}
            </Button>
          </div>

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
                        const hasAnswers = questions.length > 0 && (r.answers?.length ?? 0) > 0;
                        const isExpanded = expandedRows.has(r.id);
                        return (
                          <>
                            <tr key={r.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20">
                              <td className="px-3 py-2 text-left">
                                <div className="flex items-center gap-0.5">
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    title={T.rsvpSection.delete}
                                    aria-label={T.rsvpSection.delete}
                                    onClick={() => handleDelete(r.id)}
                                    disabled={deletingId === r.id}
                                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                  {hasAnswers && (
                                    <Button
                                      variant="ghost"
                                      size="icon-sm"
                                      onClick={() => setExpandedRows((prev) => {
                                        const next = new Set(prev);
                                        if (next.has(r.id)) next.delete(r.id); else next.add(r.id);
                                        return next;
                                      })}
                                    >
                                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                    </Button>
                                  )}
                                </div>
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
                            {hasAnswers && isExpanded && (
                              <tr key={`${r.id}-answers`} className="border-b border-border/30 bg-muted/10">
                                <td colSpan={6} className="px-4 py-2.5">
                                  <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                                    {questions.map((q) => {
                                      const answer = r.answers?.find((a) => a.questionId === q.id);
                                      if (!answer) return null;
                                      return (
                                        <div key={q.id} className="flex flex-col gap-0.5">
                                          <dt className="text-xs font-medium text-muted-foreground">{q.label}</dt>
                                          <dd className="text-xs text-foreground">{answer.value === "true" ? "✓" : answer.value === "false" ? "✗" : answer.value}</dd>
                                        </div>
                                      );
                                    })}
                                  </dl>
                                </td>
                              </tr>
                            )}
                          </>
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
