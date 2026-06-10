"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Copy, Check, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveWebhook, toggleWebhookActive, deleteWebhook, testWebhook } from "@/app/actions/webhooks";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export interface WebhookDelivery {
  id: string;
  eventType: string;
  statusCode: number | null;
  error: string | null;
  createdAt: string;
}

export interface WebhookData {
  id: string;
  url: string;
  secret: string;
  active: boolean;
  events: string;
  deliveries: WebhookDelivery[];
}

interface Props {
  plan: string;
  webhook: WebhookData | null;
}

const EVENT_OPTIONS = [
  { key: "rsvp.created", labelKey: "eventRsvpCreated" as const },
  { key: "rsvp.updated", labelKey: "eventRsvpUpdated" as const },
  { key: "rsvp.deleted", labelKey: "eventRsvpDeleted" as const },
];

export function WebhookManager({ plan, webhook: initialWebhook }: Props) {
  const { T } = useLanguage();
  const Tw = T.webhooks;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">{Tw.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{Tw.subtitle}</p>
      </div>
      <WebhookManagerBody plan={plan} initialWebhook={initialWebhook} />
    </div>
  );
}

function WebhookManagerBody({ plan, initialWebhook }: { plan: string; initialWebhook: WebhookData | null }) {
  const router = useRouter();
  const { T } = useLanguage();
  const Tw = T.webhooks;
  const [isPending, startTransition] = useTransition();

  const [webhook, setWebhook] = useState(initialWebhook);
  const [url, setUrl] = useState(initialWebhook?.url ?? "");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(() => {
    if (!initialWebhook) return ["rsvp.created"];
    try { return JSON.parse(initialWebhook.events) as string[]; } catch { return ["rsvp.created"]; }
  });
  const [active, setActive] = useState(initialWebhook?.active ?? true);
  const [revealedSecret, setRevealedSecret] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; code?: number | null; error?: string } | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (plan !== "premium") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
        <p className="text-sm text-muted-foreground">{Tw.locked}</p>
        <Link href="/dashboard/billing" className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80">
          {Tw.unlock}
        </Link>
      </div>
    );
  }

  const handleSave = () => {
    setSaveError(null);
    setTestResult(null);
    startTransition(async () => {
      const result = await saveWebhook({ url, events: selectedEvents, active });
      if (result.error) {
        setSaveError(result.error);
        return;
      }
      if (result.secret) {
        setNewSecret(result.secret);
      }
      setWebhook((prev) =>
        prev
          ? { ...prev, url, events: JSON.stringify(selectedEvents), active }
          : { id: "", url, secret: result.secret ?? "", active, events: JSON.stringify(selectedEvents), deliveries: [] }
      );
      router.refresh();
    });
  };

  const handleToggleActive = (val: boolean) => {
    setActive(val);
    startTransition(async () => {
      await toggleWebhookActive(val);
      setWebhook((prev) => prev ? { ...prev, active: val } : prev);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm(Tw.confirmDelete)) return;
    startTransition(async () => {
      await deleteWebhook();
      setWebhook(null);
      setUrl("");
      setSelectedEvents(["rsvp.created"]);
      setActive(true);
      setNewSecret(null);
      setTestResult(null);
      router.refresh();
    });
  };

  const handleTest = () => {
    setTestResult(null);
    startTransition(async () => {
      const result = await testWebhook();
      setTestResult({ ok: result.ok, code: result.statusCode, error: result.error });
      router.refresh();
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const displaySecret = newSecret ?? webhook?.secret ?? "";

  return (
    <div className="space-y-5">
      {/* URL + events form */}
      <div className="space-y-4 rounded-xl border border-border/60 p-4 sm:p-5">
        <div className="space-y-1.5">
          <Label htmlFor="webhook-url">{Tw.url}</Label>
          <Input
            id="webhook-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={Tw.urlPlaceholder}
          />
          {saveError === "invalid_url" && (
            <p className="text-xs text-destructive">Invalid URL — must start with https://</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>{Tw.events}</Label>
          <div className="flex flex-wrap gap-3">
            {EVENT_OPTIONS.map((opt) => (
              <label key={opt.key} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={selectedEvents.includes(opt.key)}
                  onChange={(e) => {
                    setSelectedEvents((prev) =>
                      e.target.checked ? [...prev, opt.key] : prev.filter((k) => k !== opt.key)
                    );
                  }}
                  className="h-4 w-4 accent-primary"
                />
                {Tw[opt.labelKey]}
              </label>
            ))}
          </div>
          {saveError === "no_events" && (
            <p className="text-xs text-destructive">Select at least one event.</p>
          )}
        </div>

        {webhook && (
          <div className="flex items-center gap-3">
            <Label className="shrink-0">{Tw.active}</Label>
            <button
              type="button"
              role="switch"
              aria-checked={active}
              onClick={() => handleToggleActive(!active)}
              disabled={isPending}
              className={cn(
                "relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                "disabled:pointer-events-none disabled:opacity-50",
                active ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-background shadow transition-transform", active ? "translate-x-4.5" : "translate-x-0.5")} />
            </button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleSave} disabled={isPending || !url.trim() || selectedEvents.length === 0} size="sm">
            {isPending ? Tw.saving : Tw.save}
          </Button>
          {webhook && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={isPending}
              >
                {isPending ? Tw.testing : Tw.test}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
                className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {Tw.delete}
              </Button>
            </>
          )}
        </div>

        {testResult && (
          <p className={cn("text-xs", testResult.ok ? "text-green-600" : "text-destructive")}>
            {testResult.ok
              ? Tw.testSuccess(testResult.code ?? 200)
              : Tw.testError(testResult.error ?? "Unknown error")}
          </p>
        )}
      </div>

      {/* Secret */}
      {displaySecret && (
        <div className="space-y-1.5 rounded-xl border border-border/60 p-4 sm:p-5">
          <Label>{Tw.secret}</Label>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md border border-border/60 bg-muted/40 px-3 py-2 font-mono text-xs text-foreground break-all">
              {revealedSecret ? displaySecret : "•".repeat(Math.min(displaySecret.length, 40))}
            </code>
            <button
              type="button"
              onClick={() => setRevealedSecret((v) => !v)}
              className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              title={revealedSecret ? "Hide" : "Reveal"}
            >
              {revealedSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => handleCopy(displaySecret)}
              className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              title={Tw.copySecret}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{Tw.secretHint}</p>
        </div>
      )}

      {/* Delivery logs */}
      {webhook && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">{Tw.deliveries}</h3>
          {(webhook.deliveries?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">{Tw.deliveriesEmpty}</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/30">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Date</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Event</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {webhook.deliveries.map((d) => (
                    <tr key={d.id} className="border-b border-border/30 last:border-0">
                      <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                        {new Intl.DateTimeFormat("fr-FR", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        }).format(new Date(d.createdAt))}
                      </td>
                      <td className="px-3 py-2 text-foreground">{d.eventType}</td>
                      <td className="px-3 py-2">
                        {d.statusCode ? (
                          <span className={cn(
                            "rounded-full px-2 py-0.5 font-medium",
                            d.statusCode >= 200 && d.statusCode < 300
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          )}>
                            {d.statusCode}
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700">
                            {d.error ?? "error"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!webhook && !initialWebhook && (
        <p className="text-xs text-muted-foreground">{Tw.noWebhookHint}</p>
      )}
    </div>
  );
}
