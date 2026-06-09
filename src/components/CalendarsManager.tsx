"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, CalendarRange, Search, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDialog, type CalendarDialogValues } from "@/components/CalendarDialog";
import { createCalendar, deleteCalendar } from "@/app/actions/calendars";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const CALENDARS_PER_PAGE = 10;
const FREE_CALENDAR_LIMIT = 1;

export interface CalendarRecord {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  eventCount: number;
}

interface CalendarsManagerProps {
  calendars: CalendarRecord[];
  appUrl: string;
  plan: string;
}

export function CalendarsManager({ calendars, appUrl, plan }: CalendarsManagerProps) {
  const router = useRouter();
  const { T } = useLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isPremium = plan === "premium";
  const atFreeLimit = !isPremium && calendars.length >= FREE_CALENDAR_LIMIT;

  const filteredCalendars = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return calendars;
    return calendars.filter((c) => c.name.toLowerCase().includes(query));
  }, [calendars, search]);

  const pageCount = Math.max(1, Math.ceil(filteredCalendars.length / CALENDARS_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const pagedCalendars = filteredCalendars.slice(
    (currentPage - 1) * CALENDARS_PER_PAGE,
    currentPage * CALENDARS_PER_PAGE
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const openCreate = () => {
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: CalendarDialogValues) => {
    setFormError(null);
    startTransition(async () => {
      const result = await createCalendar(data);
      if (result && "error" in result) {
        setFormError(result.error === "limit" ? T.calendars.freeLimit : T.calendars.locked);
        return;
      }
      setDialogOpen(false);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(T.calendars.confirmDelete)) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteCalendar(id);
      if (result?.error === "forbidden") setDeleteError(T.calendars.locked);
      else router.refresh();
    });
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(`${appUrl}/c/${id}`).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="space-y-4">
      {!isPremium && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground">
          <span>{T.calendars.freeLimitBanner(calendars.length, FREE_CALENDAR_LIMIT)}</span>
          <Link href="/dashboard/billing" className="shrink-0 text-xs font-medium text-primary underline-offset-4 hover:underline">
            {T.calendars.unlock}
          </Link>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {calendars.length > 0 && (
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={T.calendars.searchPlaceholder}
              className="pl-9"
            />
          </div>
        )}
        <Button onClick={openCreate} disabled={atFreeLimit} className="shrink-0 gap-1.5">
          <Plus className="h-4 w-4" />
          {T.calendars.create}
        </Button>
      </div>

      {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}

      {calendars.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 p-10 text-center">
          <CalendarRange className="h-8 w-8 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">{T.calendars.noCalendars}</p>
        </div>
      ) : filteredCalendars.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 p-10 text-center">
          <Search className="h-8 w-8 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">{T.calendars.noResults}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {pagedCalendars.map((calendar) => {
            const hasColor = /^#[0-9a-fA-F]{3,8}$/.test(calendar.color ?? "");
            return (
              <li
                key={calendar.id}
                className="group relative flex items-center gap-3 rounded-xl border border-border/60 bg-background p-3 transition-colors hover:bg-muted/20"
              >
                <Link
                  href={`/dashboard/calendars/${calendar.id}`}
                  className="absolute inset-0 z-10 rounded-xl"
                  aria-label={calendar.name}
                />
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: hasColor ? calendar.color! : "var(--muted-foreground)" }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{calendar.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {calendar.eventCount} {calendar.eventCount === 1 ? T.calendars.event : T.calendars.events}
                    {calendar.description ? ` · ${calendar.description}` : ""}
                  </p>
                </div>
                <div className="relative z-20 flex shrink-0 items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleCopy(calendar.id)}
                    title={copiedId === calendar.id ? T.common.copied : T.common.copyUrl}
                    aria-label={copiedId === calendar.id ? T.common.copied : T.common.copyUrl}
                    className={cn(copiedId === calendar.id && "border border-green-500/40 bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700")}
                  >
                    {copiedId === calendar.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleDelete(calendar.id)}
                    disabled={isDeleting}
                    aria-label={T.calendars.delete}
                    className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
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
            {T.calendars.pagination.previous}
          </Button>
          <p className="text-xs text-muted-foreground">
            {T.calendars.pagination.pageInfo(currentPage, pageCount)}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={currentPage >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            {T.calendars.pagination.next}
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      <CalendarDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        isPending={isPending}
        error={formError}
      />
    </div>
  );
}
