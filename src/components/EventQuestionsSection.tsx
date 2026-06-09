"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createRsvpQuestion,
  updateRsvpQuestion,
  deleteRsvpQuestion,
  reorderRsvpQuestions,
} from "@/app/actions/questions";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export interface RsvpQuestion {
  id: string;
  label: string;
  type: string;
  options: string | null;
  required: boolean;
  order: number;
}

interface Props {
  eventId: string;
  plan: string;
  questions: RsvpQuestion[];
}

type QuestionType = "text" | "textarea" | "select" | "boolean";

interface FormState {
  label: string;
  type: QuestionType;
  options: string[];
  required: boolean;
}

const EMPTY_FORM: FormState = { label: "", type: "text", options: ["", ""], required: false };

export function EventQuestionsSection({ eventId, plan, questions: initialQuestions }: Props) {
  const router = useRouter();
  const { T } = useLanguage();
  const [questions, setQuestions] = useState<RsvpQuestion[]>(
    [...initialQuestions].sort((a, b) => a.order - b.order)
  );
  const [editing, setEditing] = useState<string | null>(null); // questionId or "new"
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();

  if (plan !== "premium") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 p-3">
        <p className="text-sm text-muted-foreground">{T.rsvpQuestions.locked}</p>
        <Link href="/dashboard/billing" className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/80">
          {T.rsvpQuestions.unlock}
        </Link>
      </div>
    );
  }

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditing("new");
  };

  const openEdit = (q: RsvpQuestion) => {
    let opts: string[] = ["", ""];
    if (q.type === "select" && q.options) {
      try { opts = JSON.parse(q.options) as string[]; } catch { /* ignore */ }
    }
    setForm({ label: q.label, type: q.type as QuestionType, options: opts, required: q.required });
    setEditing(q.id);
  };

  const closeForm = () => { setEditing(null); setForm(EMPTY_FORM); };

  const handleSave = () => {
    if (!form.label.trim()) return;
    const options = form.type === "select"
      ? JSON.stringify(form.options.filter((o) => o.trim()))
      : null;

    startTransition(async () => {
      if (editing === "new") {
        const result = await createRsvpQuestion(eventId, {
          label: form.label,
          type: form.type,
          options,
          required: form.required,
          order: questions.length,
        });
        if (!("error" in result)) {
          setQuestions((prev) => [
            ...prev,
            { id: result.id, label: form.label, type: form.type, options, required: form.required, order: prev.length },
          ]);
        }
      } else if (editing) {
        await updateRsvpQuestion(editing, { label: form.label, type: form.type, options, required: form.required });
        setQuestions((prev) =>
          prev.map((q) => q.id === editing ? { ...q, label: form.label, type: form.type, options, required: form.required } : q)
        );
      }
      closeForm();
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(T.rsvpQuestions.confirmDelete)) return;
    startTransition(async () => {
      await deleteRsvpQuestion(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      router.refresh();
    });
  };

  const handleMove = (id: string, dir: -1 | 1) => {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      const reordered = next.map((q, i) => ({ ...q, order: i }));
      startTransition(async () => {
        await reorderRsvpQuestions(eventId, reordered.map((q) => q.id));
        router.refresh();
      });
      return reordered;
    });
  };

  const TYPE_LABELS: Record<QuestionType, string> = {
    text: T.rsvpQuestions.typeText,
    textarea: T.rsvpQuestions.typeTextarea,
    select: T.rsvpQuestions.typeSelect,
    boolean: T.rsvpQuestions.typeBoolean,
  };

  return (
    <div className="space-y-3">
      {questions.length === 0 && editing === null && (
        <p className="text-sm text-muted-foreground">{T.rsvpQuestions.noQuestionsHint}</p>
      )}

      {questions.map((q, idx) => (
        <div key={q.id}>
          {editing === q.id ? (
            <QuestionForm
              form={form}
              setForm={setForm}
              typeLabels={TYPE_LABELS}
              T={T}
              isPending={isPending}
              onSave={handleSave}
              onCancel={closeForm}
            />
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2.5">
              <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{q.label}</p>
                <p className="text-xs text-muted-foreground">
                  {TYPE_LABELS[q.type as QuestionType] ?? q.type}
                  {q.required && <span className="ml-1.5 text-destructive">*</span>}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(q.id, -1)}
                  disabled={idx === 0 || isPending}
                  className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(q.id, 1)}
                  disabled={idx === questions.length - 1 || isPending}
                  className="rounded p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(q)}
                  disabled={isPending}
                  className="rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(q.id)}
                  disabled={isPending}
                  className="rounded p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {editing === "new" && (
        <QuestionForm
          form={form}
          setForm={setForm}
          typeLabels={TYPE_LABELS}
          T={T}
          isPending={isPending}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}

      {editing === null && (
        <Button variant="outline" size="sm" className="gap-1.5" onClick={openNew} disabled={isPending}>
          <Plus className="h-3.5 w-3.5" />
          {T.rsvpQuestions.add}
        </Button>
      )}
    </div>
  );
}

function QuestionForm({
  form,
  setForm,
  typeLabels,
  T,
  isPending,
  onSave,
  onCancel,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  typeLabels: Record<string, string>;
  T: { rsvpQuestions: Record<string, string> };
  isPending: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
      <div className="space-y-1.5">
        <Label className="text-xs">{T.rsvpQuestions.label}</Label>
        <Input
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          placeholder={T.rsvpQuestions.labelPlaceholder}
          className="h-8 text-sm"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">{T.rsvpQuestions.type}</Label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as FormState["type"] }))}
            className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
          >
            {(["text", "textarea", "select", "boolean"] as const).map((t) => (
              <option key={t} value={t}>{typeLabels[t]}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-0.5">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={form.required}
              onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))}
              className="h-3.5 w-3.5 accent-primary"
            />
            {T.rsvpQuestions.required}
          </label>
        </div>
      </div>

      {form.type === "select" && (
        <div className="space-y-1.5">
          <Label className="text-xs">{T.rsvpQuestions.options}</Label>
          {form.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <Input
                value={opt}
                onChange={(e) => setForm((f) => {
                  const opts = [...f.options];
                  opts[i] = e.target.value;
                  return { ...f, options: opts };
                })}
                placeholder={`Option ${i + 1}`}
                className="h-7 text-xs"
              />
              {form.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, options: f.options.filter((_, j) => j !== i) }))}
                  className="shrink-0 text-xs text-muted-foreground hover:text-destructive"
                >
                  {T.rsvpQuestions.removeOption}
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, options: [...f.options, ""] }))}
            className={cn("text-xs text-primary hover:text-primary/80")}
          >
            + {T.rsvpQuestions.addOption}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <Button size="sm" onClick={onSave} disabled={isPending || !form.label.trim()} className="h-7 text-xs px-3">
          {T.rsvpQuestions.save}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={isPending} className="h-7 text-xs px-3">
          {T.rsvpQuestions.cancel}
        </Button>
      </div>
    </div>
  );
}
