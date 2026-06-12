"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Users, Download, Search, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { toggleRsvp, deleteRsvp, updateRsvpSettings } from "@/app/actions/events";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { EvvySwitch } from "./EvvySwitch";

const PAGE_SIZE = 10;
const AVATAR_STYLES = [
  "bg-coral/15 text-coral",
  "bg-mint/15 text-mint",
  "bg-evvy/15 text-evvy",
];

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

interface Props {
  eventId: string;
  rsvpEnabled: boolean;
  rsvpLimit: number | null;
  rsvpDeadline: string | null;
  timezone: string;
  rsvps: RsvpRecord[];
  questions: { id: string; label: string; type: string }[];
}

function isoToLocalDate(iso: string, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(iso));
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

function formatAnswerValue(type: string, value: string): string {
  if (value === "true") return "✓";
  if (value === "false") return "✗";
  if (type === "checkbox") {
    try {
      const arr = JSON.parse(value) as string[];
      if (Array.isArray(arr)) return arr.join(", ");
    } catch { /* ignore */ }
  }
  return value;
}

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export function EventRsvpCard({ eventId, rsvpEnabled, rsvpLimit, rsvpDeadline, timezone, rsvps, questions }: Props) {
  const router = useRouter();
  const { T, lang } = useLanguage();
  const locale = lang === "fr" ? "fr-FR" : "en-US";
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [limitInput, setLimitInput] = useState(rsvpLimit != null ? String(rsvpLimit) : "");
  const [deadlineInput, setDeadlineInput] = useState(rsvpDeadline ? isoToLocalDate(rsvpDeadline, timezone) : "");

  const yes = rsvps.filter((r) => r.status === "yes").length;
  const no = rsvps.filter((r) => r.status === "no").length;
  const maybe = rsvps.filter((r) => r.status === "maybe").length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rsvps;
    return rsvps.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      (r.email ?? "").toLowerCase().includes(q) ||
      (r.message ?? "").toLowerCase().includes(q)
    );
  }, [rsvps, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const STATUS: Record<string, { label: string; className: string }> = {
    yes:   { label: T.rsvpSection.statusLabels.yes,   className: "text-mint bg-mint/15" },
    maybe: { label: T.rsvpSection.statusLabels.maybe, className: "text-amber-600 bg-amber-100" },
    no:    { label: T.rsvpSection.statusLabels.no,    className: "text-coral bg-coral/15" },
  };

  const handleToggle = (next: boolean) => {
    startTransition(async () => { await toggleRsvp(eventId, next); router.refresh(); });
  };

  const handleSaveSettings = () => {
    startTransition(async () => {
      const limit = limitInput.trim() !== "" ? parseInt(limitInput, 10) : null;
      const deadline = deadlineInput ? naiveToUTC(deadlineInput, "23:59", timezone) : null;
      await updateRsvpSettings(eventId, { rsvpLimit: Number.isNaN(limit as number) ? null : limit, rsvpDeadline: deadline });
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(T.rsvpSection.confirmDelete)) return;
    setDeletingId(id);
    startTransition(async () => { await deleteRsvp(id); setDeletingId(null); router.refresh(); });
  };

  const toggleRow = (id: string) => setExpandedRows((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const formatDate = (iso: string) => {
    const parts = new Intl.DateTimeFormat(locale, {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).formatToParts(new Date(iso));
    const p = (t: string) => parts.find((x) => x.type === t)?.value ?? "";
    return `${p("day")}/${p("month")}/${p("year")} · ${p("hour")}:${p("minute")}`;
  };

  return (
    <div data-reveal id="rsvp" className="scroll-mt-24 rounded-xl2 border border-line bg-white shadow-card xl:col-span-2">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-5">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-evvy-soft text-evvy"><Users className="h-[18px] w-[18px]" /></span>
        <div>
          <h2 className="font-display text-lg font-bold leading-none">{T.rsvpSection.title}</h2>
          <p className="mt-1 text-xs text-inksoft">{T.eventDashboard.rsvpSubtitle}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-inksoft">
            <span>{rsvpEnabled ? T.rsvpSection.enabled : T.rsvpSection.disabled}</span>
            <EvvySwitch checked={rsvpEnabled} onCheckedChange={handleToggle} />
          </label>
          <a
            href={`/api/events/${eventId}/rsvp/export`}
            download
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium transition hover:bg-paper"
          >
            <Download className="h-3.5 w-3.5" />CSV
          </a>
        </div>
      </div>

      {!rsvpEnabled ? (
        <p className="p-5 text-sm text-inksoft">{T.rsvpSection.disabledHint}</p>
      ) : (
        <>
          {/* settings */}
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-inksoft">{T.eventForm.rsvpLimit}</label>
              <input
                type="number" min={0} placeholder={T.eventForm.rsvpLimitPlaceholder}
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                onBlur={handleSaveSettings}
                className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm placeholder:text-inksoft/50 focus:border-evvy focus:outline-none focus:ring-2 focus:ring-evvy/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-inksoft">{T.eventForm.rsvpDeadline}</label>
              <input
                type="date"
                value={deadlineInput}
                onChange={(e) => setDeadlineInput(e.target.value)}
                onBlur={handleSaveSettings}
                className="mt-1.5 h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-inksoft focus:border-evvy focus:outline-none focus:ring-2 focus:ring-evvy/30"
              />
            </div>
          </div>

          {/* stat pills */}
          <div className="grid grid-cols-4 gap-3 px-5">
            <div className="rounded-xl border border-line p-3 text-center"><p className="font-display text-xl font-bold">{rsvps.length}</p><p className="text-[11px] text-inksoft">{T.rsvpSection.total}</p></div>
            <div className="rounded-xl border border-mint/30 bg-mint/[.06] p-3 text-center"><p className="font-display text-xl font-bold text-mint">{yes}</p><p className="text-[11px] text-inksoft">{T.rsvpSection.yes}</p></div>
            <div className="rounded-xl border border-amber-300/50 bg-amber-50 p-3 text-center"><p className="font-display text-xl font-bold text-amber-500">{maybe}</p><p className="text-[11px] text-inksoft">{T.rsvpSection.maybe}</p></div>
            <div className="rounded-xl border border-line p-3 text-center"><p className="font-display text-xl font-bold text-inksoft/60">{no}</p><p className="text-[11px] text-inksoft">{T.rsvpSection.no}</p></div>
          </div>

          {rsvps.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-inksoft">{T.rsvpSection.noResponses}</p>
          ) : (
            <>
              {/* search */}
              <div className="px-5 pt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-inksoft/60" />
                  <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder={T.rsvpSection.searchPlaceholder}
                    className="h-10 w-full rounded-lg border border-line bg-paper/60 pl-9 pr-3 text-sm placeholder:text-inksoft/50 transition focus:border-evvy focus:bg-white focus:outline-none focus:ring-2 focus:ring-evvy/30"
                  />
                </div>
              </div>

              {/* table */}
              <div className="overflow-x-auto p-3 pt-3 sm:p-5">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-inksoft/70">
                      <th className="px-3 py-2 font-medium">{T.rsvpSection.table.name}</th>
                      <th className="px-3 py-2 font-medium">{T.rsvpSection.table.status}</th>
                      <th className="px-3 py-2 font-medium">{T.rsvpSection.table.message}</th>
                      <th className="whitespace-nowrap px-3 py-2 font-medium">{T.rsvpSection.table.date}</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {paginated.map((r, i) => {
                      const cfg = STATUS[r.status] ?? { label: r.status, className: "text-inksoft bg-paper" };
                      const hasAnswers = questions.length > 0 && (r.answers?.length ?? 0) > 0;
                      const isOpen = expandedRows.has(r.id);
                      return (
                        <Fragment key={r.id}>
                          <tr className="transition hover:bg-paper/60">
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2.5">
                                <span className={cn("grid h-8 w-8 place-items-center rounded-full text-xs font-bold", AVATAR_STYLES[i % AVATAR_STYLES.length])}>{initials(r.name)}</span>
                                <div className="min-w-0">
                                  <p className="truncate font-medium leading-tight">{r.name}</p>
                                  <p className="truncate text-xs text-inksoft">{r.email ?? "—"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", cfg.className)}>{cfg.label}</span>
                            </td>
                            <td className={cn("px-3 py-3", r.message ? "text-inksoft" : "text-inksoft/50")}>
                              <span className="inline-flex items-center gap-1.5">
                                {hasAnswers && (
                                  <button type="button" onClick={() => toggleRow(r.id)} className="text-inksoft/50 transition hover:text-evvy" aria-label="answers">
                                    {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                  </button>
                                )}
                                {r.message ?? "—"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-xs text-inksoft">{formatDate(r.createdAt)}</td>
                            <td className="px-3 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDelete(r.id)}
                                disabled={deletingId === r.id}
                                className="text-inksoft/50 transition hover:text-coral disabled:opacity-40"
                                aria-label={T.rsvpSection.delete}
                                title={T.rsvpSection.delete}
                              >
                                <Trash2 className="h-[15px] w-[15px]" />
                              </button>
                            </td>
                          </tr>
                          {hasAnswers && isOpen && (
                            <tr className="bg-paper/40">
                              <td colSpan={5} className="px-4 py-2.5">
                                <dl className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
                                  {questions.map((q) => {
                                    const answer = r.answers?.find((a) => a.questionId === q.id);
                                    if (!answer) return null;
                                    return (
                                      <div key={q.id} className="flex flex-col gap-0.5">
                                        <dt className="text-xs font-medium text-inksoft">{q.label}</dt>
                                        <dd className="text-xs text-ink">{formatAnswerValue(q.type, answer.value)}</dd>
                                      </div>
                                    );
                                  })}
                                </dl>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
                {paginated.length === 0 && (
                  <p className="py-6 text-center text-sm text-inksoft">{T.rsvpSection.noResults}</p>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 px-5 pb-5">
                  <button type="button" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-3 text-xs font-medium transition hover:bg-paper disabled:opacity-40">
                    <ChevronLeft className="h-3.5 w-3.5" />{T.rsvpSection.pagination.previous}
                  </button>
                  <span className="text-xs text-inksoft">{T.rsvpSection.pagination.pageInfo(currentPage, totalPages)}</span>
                  <button type="button" disabled={currentPage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-line px-3 text-xs font-medium transition hover:bg-paper disabled:opacity-40">
                    {T.rsvpSection.pagination.next}<ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
