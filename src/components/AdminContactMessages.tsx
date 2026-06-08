"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, MessageSquare, CheckCircle2, Trash2, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { archiveContact, deleteContact } from "@/app/actions/admin";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const MESSAGES_PER_PAGE = 20;

export interface AdminContactMessageRecord {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  archived: boolean;
  createdAt: string;
}

interface AdminContactMessagesProps {
  messages: AdminContactMessageRecord[];
}

function MessageList({
  messages,
  dateFmt,
  emptyLabel,
  noResultsLabel,
  emptyIcon: EmptyIcon,
  page,
  setPage,
  search,
  T,
  renderActions,
}: {
  messages: AdminContactMessageRecord[];
  dateFmt: Intl.DateTimeFormat;
  emptyLabel: string;
  noResultsLabel: string;
  emptyIcon: typeof MessageSquare;
  page: number;
  setPage: (updater: (p: number) => number) => void;
  search: string;
  T: ReturnType<typeof useLanguage>["T"];
  renderActions: (id: string) => React.ReactNode;
}) {
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return messages;
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        (m.subject ?? "").toLowerCase().includes(query)
    );
  }, [messages, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / MESSAGES_PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * MESSAGES_PER_PAGE, currentPage * MESSAGES_PER_PAGE);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 p-10 text-center">
        <EmptyIcon className="h-8 w-8 text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 p-10 text-center">
        <Search className="h-8 w-8 text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground">{noResultsLabel}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2.5">
        {paged.map((m) => (
          <li key={m.id} className="space-y-2 rounded-xl border border-border/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">{m.email}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <p className="text-xs text-muted-foreground">{dateFmt.format(new Date(m.createdAt))}</p>
                {renderActions(m.id)}
              </div>
            </div>
            <p className="text-sm font-medium text-foreground">
              {m.subject || <span className="italic text-muted-foreground">{T.admin.contact.noSubject}</span>}
            </p>
            <p className="whitespace-pre-wrap break-words text-sm text-foreground/80">{m.message}</p>
          </li>
        ))}
      </ul>

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

export function AdminContactMessages({ messages }: AdminContactMessagesProps) {
  const router = useRouter();
  const { T, lang } = useLanguage();
  const locale = lang === "fr" ? "fr-FR" : "en-US";
  const [search, setSearch] = useState("");
  const [inboxPage, setInboxPage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const dateFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
    [locale]
  );

  const inboxMessages = useMemo(() => messages.filter((m) => !m.archived), [messages]);
  const archivedMessages = useMemo(() => messages.filter((m) => m.archived), [messages]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setInboxPage(1);
    setArchivedPage(1);
  };

  const handleArchive = (id: string) => {
    setPendingId(id);
    startTransition(async () => {
      await archiveContact(id);
      setPendingId(null);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(T.admin.contact.confirmDelete)) return;
    setPendingId(id);
    startTransition(async () => {
      await deleteContact(id);
      setPendingId(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {messages.length > 0 && (
        <div className="relative min-w-0 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={T.admin.contact.searchPlaceholder}
            className="pl-9"
          />
        </div>
      )}

      <MessageList
        messages={inboxMessages}
        dateFmt={dateFmt}
        emptyLabel={T.admin.contact.noMessages}
        noResultsLabel={T.admin.contact.noResults}
        emptyIcon={MessageSquare}
        page={inboxPage}
        setPage={setInboxPage}
        search={search}
        T={T}
        renderActions={(id) => (
          <div className="flex items-center gap-1">
            <button
              type="button"
              title={T.admin.contact.validate}
              onClick={() => handleArchive(id)}
              disabled={pendingId === id}
              className={cn(
                "cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              title={T.admin.contact.delete}
              onClick={() => handleDelete(id)}
              disabled={pendingId === id}
              className={cn(
                "cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      />

      <div className="space-y-3">
        <div className="flex items-center gap-2 border-t border-border/60 pt-5">
          <Archive className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">{T.admin.contact.archivedTitle}</h3>
        </div>

        <MessageList
          messages={archivedMessages}
          dateFmt={dateFmt}
          emptyLabel={T.admin.contact.noArchivedMessages}
          noResultsLabel={T.admin.contact.noResults}
          emptyIcon={Archive}
          page={archivedPage}
          setPage={setArchivedPage}
          search={search}
          T={T}
          renderActions={(id) => (
            <button
              type="button"
              title={T.admin.contact.delete}
              onClick={() => handleDelete(id)}
              disabled={pendingId === id}
              className={cn(
                "cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        />
      </div>
    </div>
  );
}
