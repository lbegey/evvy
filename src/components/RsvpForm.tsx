"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitRsvp } from "@/app/actions/events";
import { en } from "@/i18n/en";
import { fr } from "@/i18n/fr";
import { cn } from "@/lib/utils";
import type { RsvpQuestion } from "@/components/EventQuestionsSection";

const baseSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1).email(),
  status: z.enum(["yes", "no", "maybe"]),
  message: z.string().optional(),
});

type BaseValues = z.infer<typeof baseSchema>;

export function RsvpForm({
  eventId,
  lang,
  questions = [],
}: {
  eventId: string;
  lang: "fr" | "en";
  questions?: RsvpQuestion[];
}) {
  const T = lang === "fr" ? fr : en;
  const [done, setDone] = useState(false);
  const [isFull, setIsFull] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isAlready, setIsAlready] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, ""]))
  );
  const [customErrors, setCustomErrors] = useState<Record<string, boolean>>({});

  const STATUS_OPTIONS = [
    { value: "yes" as const,   label: T.rsvpForm.attending, active: "bg-green-100 text-green-700 border-green-300" },
    { value: "maybe" as const, label: T.rsvpForm.maybe,     active: "bg-amber-100 text-amber-700 border-amber-300" },
    { value: "no" as const,    label: T.rsvpForm.cantMake,  active: "bg-red-100 text-red-700 border-red-300" },
  ];

  const form = useForm<BaseValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: { name: "", email: "", status: "yes", message: "" },
  });

  const status = form.watch("status");

  const handleSubmit = (values: BaseValues) => {
    // Validate required custom questions
    const errors: Record<string, boolean> = {};
    for (const q of questions) {
      if (q.required && !customAnswers[q.id]?.trim()) {
        errors[q.id] = true;
      }
    }
    if (Object.keys(errors).length > 0) {
      setCustomErrors(errors);
      return;
    }
    setCustomErrors({});

    const answers = questions
      .filter((q) => customAnswers[q.id] !== undefined && customAnswers[q.id] !== "")
      .map((q) => ({ questionId: q.id, value: customAnswers[q.id] }));

    startTransition(async () => {
      const result = await submitRsvp({
        eventId,
        name: values.name,
        email: values.email,
        status: values.status,
        message: values.message ?? "",
        answers,
      });
      if (result?.error === "full") { setIsFull(true); return; }
      if (result?.error === "closed") { setIsClosed(true); return; }
      if (result?.error === "already") { setIsAlready(true); return; }
      setDone(true);
    });
  };

  if (isFull) return <div className="flex flex-col items-center gap-2 py-6 text-center"><p className="text-sm text-muted-foreground">{T.rsvpForm.full}</p></div>;
  if (isClosed) return <div className="flex flex-col items-center gap-2 py-6 text-center"><p className="text-sm text-muted-foreground">{T.rsvpForm.closed}</p></div>;
  if (isAlready) return <div className="flex flex-col items-center gap-2 py-6 text-center"><p className="text-sm text-muted-foreground">{T.rsvpForm.already}</p></div>;

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-primary" />
        <p className="font-semibold text-foreground">{T.rsvpForm.successTitle}</p>
        <p className="text-sm text-muted-foreground">{T.rsvpForm.successSubtitle}</p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="flex gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => form.setValue("status", opt.value)}
            className={cn(
              "flex-1 cursor-pointer rounded-lg border px-2 py-2 text-xs font-medium transition-colors sm:px-3",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              status === opt.value
                ? opt.active
                : "border-border/60 text-muted-foreground hover:bg-muted/40"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rsvp-name">{T.rsvpForm.name} *</Label>
        <Input id="rsvp-name" placeholder={T.rsvpForm.namePlaceholder} {...form.register("name")} />
        {form.formState.errors.name && <p className="text-xs text-destructive">{T.rsvpForm.errors.nameRequired}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rsvp-email">{T.rsvpForm.email} *</Label>
        <Input id="rsvp-email" type="email" placeholder={T.rsvpForm.emailPlaceholder} {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive">
            {form.formState.errors.email.type === "too_small" ? T.rsvpForm.errors.emailRequired : T.rsvpForm.errors.emailInvalid}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rsvp-msg">{T.rsvpForm.message}</Label>
        <Textarea id="rsvp-msg" rows={2} placeholder={T.rsvpForm.messagePlaceholder} {...form.register("message")} />
      </div>

      {/* Custom questions */}
      {questions.map((q) => (
        <div key={q.id} className="space-y-1.5">
          <Label htmlFor={`rsvp-q-${q.id}`}>
            {q.label}
            {q.required && <span className="ml-1 text-destructive">*</span>}
          </Label>

          {q.type === "text" && (
            <Input
              id={`rsvp-q-${q.id}`}
              value={customAnswers[q.id] ?? ""}
              onChange={(e) => setCustomAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
            />
          )}

          {q.type === "textarea" && (
            <Textarea
              id={`rsvp-q-${q.id}`}
              rows={2}
              value={customAnswers[q.id] ?? ""}
              onChange={(e) => setCustomAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
            />
          )}

          {q.type === "select" && (() => {
            let opts: string[] = [];
            try { opts = JSON.parse(q.options ?? "[]") as string[]; } catch { /* ignore */ }
            return (
              <div className="flex flex-wrap gap-2">
                {opts.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCustomAnswers((a) => ({ ...a, [q.id]: opt }))}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                      customAnswers[q.id] === opt
                        ? "border-primary bg-primary/10 font-medium text-primary"
                        : "border-border/60 text-muted-foreground hover:bg-muted/40"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            );
          })()}

          {q.type === "boolean" && (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                id={`rsvp-q-${q.id}`}
                checked={customAnswers[q.id] === "true"}
                onChange={(e) => setCustomAnswers((a) => ({ ...a, [q.id]: e.target.checked ? "true" : "false" }))}
                className="h-4 w-4 accent-primary"
              />
              {lang === "fr" ? "Oui" : "Yes"}
            </label>
          )}

          {customErrors[q.id] && (
            <p className="text-xs text-destructive">{T.rsvpForm.errors.nameRequired}</p>
          )}
        </div>
      ))}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? T.rsvpForm.submitting : T.rsvpForm.submit}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {T.rsvpForm.privacyNoticePrefix}{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
          {T.rsvpForm.privacyNoticeLink}
        </Link>
        .
      </p>
    </form>
  );
}
