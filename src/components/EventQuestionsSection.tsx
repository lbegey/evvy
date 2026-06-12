"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import {
  createRsvpQuestion,
  updateRsvpQuestion,
  deleteRsvpQuestion,
  reorderRsvpQuestions,
} from "@/app/actions/questions";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { LockedNotice } from "@/components/event-dashboard/LockedNotice";

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

type QuestionType = "text" | "textarea" | "select" | "checkbox";

interface FormState {
  label: string;
  type: QuestionType;
  options: string[];
  required: boolean;
}

const EMPTY_FORM: FormState = { label: "", type: "text", options: ["", ""], required: false };

const INPUT_CLS = "h-9 w-full rounded-lg border border-line bg-white px-3 text-sm placeholder:text-inksoft/50 focus:border-evvy focus:outline-none focus:ring-2 focus:ring-evvy/30";
const PRIMARY_BTN = "inline-flex items-center gap-1.5 rounded-lg bg-evvy px-3 text-sm font-medium text-white transition hover:bg-evvy-deep disabled:opacity-40";
const OUTLINE_BTN = "inline-flex items-center gap-1.5 rounded-lg border border-line px-3 text-sm font-medium transition hover:bg-paper disabled:opacity-40";

export function EventQuestionsSection({ eventId, plan, questions: initialQuestions }: Props) {
  const router = useRouter();
  const { T } = useLanguage();
  const [questions, setQuestions] = useState<RsvpQuestion[]>(
    [...initialQuestions].sort((a, b) => a.order - b.order)
  );
  const [editing, setEditing] = useState<string | null>(null); // questionId or "new"
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  if (plan !== "premium") {
    return <LockedNotice message={T.rsvpQuestions.locked} unlock={T.rsvpQuestions.unlock} />;
  }

  const openNew = () => { setForm(EMPTY_FORM); setEditing("new"); };

  const openEdit = (q: RsvpQuestion) => {
    let opts: string[] = ["", ""];
    if ((q.type === "select" || q.type === "checkbox") && q.options) {
      try { opts = JSON.parse(q.options) as string[]; } catch { /* ignore */ }
    }
    setForm({ label: q.label, type: q.type as QuestionType, options: opts, required: q.required });
    setEditing(q.id);
  };

  const closeForm = () => { setEditing(null); setForm(EMPTY_FORM); };

  const handleSave = () => {
    if (!form.label.trim()) return;
    const options = form.type === "select" || form.type === "checkbox"
      ? JSON.stringify(form.options.filter((o) => o.trim()))
      : null;

    startTransition(async () => {
      if (editing === "new") {
        const result = await createRsvpQuestion(eventId, {
          label: form.label, type: form.type, options, required: form.required, order: questions.length,
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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    const el = rowRefs.current.get(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      e.dataTransfer.setDragImage(el, e.clientX - rect.left, e.clientY - rect.top);
    }
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedId && id !== dragOverId) setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    const sourceId = draggedId;
    setDraggedId(null);
    setDragOverId(null);
    if (!sourceId || sourceId === id) return;

    setQuestions((prev) => {
      const fromIdx = prev.findIndex((q) => q.id === sourceId);
      const toIdx = prev.findIndex((q) => q.id === id);
      if (fromIdx < 0 || toIdx < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next.map((q, i) => ({ ...q, order: i }));
    });
    setOrderDirty(true);
  };

  const handleDragEnd = () => { setDraggedId(null); setDragOverId(null); };

  const handleSaveOrder = () => {
    startTransition(async () => {
      await reorderRsvpQuestions(eventId, questions.map((q) => q.id));
      setOrderDirty(false);
      router.refresh();
    });
  };

  const TYPE_LABELS: Record<string, string> = {
    text: T.rsvpQuestions.typeText,
    textarea: T.rsvpQuestions.typeTextarea,
    select: T.rsvpQuestions.typeSelect,
    checkbox: T.rsvpQuestions.typeCheckbox,
    boolean: T.rsvpQuestions.typeBoolean,
  };

  return (
    <div className="space-y-3">
      {questions.length === 0 && editing === null && (
        <p className="text-sm text-inksoft">{T.rsvpQuestions.noQuestionsHint}</p>
      )}

      {questions.map((q) => (
        <div key={q.id}>
          {editing === q.id ? (
            <QuestionForm form={form} setForm={setForm} typeLabels={TYPE_LABELS} T={T} isPending={isPending} onSave={handleSave} onCancel={closeForm} />
          ) : (
            <div
              ref={(el) => { if (el) rowRefs.current.set(q.id, el); else rowRefs.current.delete(q.id); }}
              onDragOver={(e) => handleDragOver(e, q.id)}
              onDrop={(e) => handleDrop(e, q.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 transition-colors",
                draggedId === q.id ? "border-line opacity-40" : "border-line",
                dragOverId === q.id && draggedId !== q.id && "border-dashed border-evvy"
              )}
            >
              <button
                type="button"
                draggable
                onDragStart={(e) => handleDragStart(e, q.id)}
                onDragEnd={handleDragEnd}
                className="shrink-0 cursor-grab rounded p-1 text-inksoft/40 hover:text-inksoft active:cursor-grabbing"
                aria-label="Drag to reorder"
              >
                <GripVertical className="h-3.5 w-3.5" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{q.label}</p>
                <p className="text-xs text-inksoft">
                  {TYPE_LABELS[q.type as QuestionType] ?? q.type}
                  {q.required && <span className="ml-1.5 text-coral">*</span>}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => openEdit(q)} disabled={isPending} className="rounded p-1 text-inksoft hover:text-ink">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => handleDelete(q.id)} disabled={isPending} className="rounded p-1 text-inksoft hover:text-coral">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {editing === "new" && (
        <QuestionForm form={form} setForm={setForm} typeLabels={TYPE_LABELS} T={T} isPending={isPending} onSave={handleSave} onCancel={closeForm} />
      )}

      {editing === null && (
        <div className="flex items-center gap-2">
          <button type="button" onClick={openNew} disabled={isPending} className={cn(OUTLINE_BTN, "h-9")}>
            <Plus className="h-3.5 w-3.5" />{T.rsvpQuestions.add}
          </button>
          {orderDirty && (
            <button type="button" onClick={handleSaveOrder} disabled={isPending} className={cn(PRIMARY_BTN, "h-9")}>
              {T.rsvpQuestions.saveOrder}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionForm({
  form, setForm, typeLabels, T, isPending, onSave, onCancel,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  typeLabels: Record<QuestionType, string>;
  T: { rsvpQuestions: Record<string, string> };
  isPending: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-evvy/30 bg-evvy-soft/40 p-3">
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-inksoft">{T.rsvpQuestions.label}</label>
        <input
          value={form.label}
          onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
          placeholder={T.rsvpQuestions.labelPlaceholder}
          className={cn(INPUT_CLS, "h-8")}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-inksoft">{T.rsvpQuestions.type}</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as FormState["type"] }))}
            className="h-8 w-full rounded-lg border border-line bg-white px-2 text-sm focus:border-evvy focus:outline-none focus:ring-2 focus:ring-evvy/30"
          >
            {(["text", "textarea", "select", "checkbox"] as const).map((t) => (
              <option key={t} value={t}>{typeLabels[t]}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end pb-0.5">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-ink">
            <input
              type="checkbox"
              checked={form.required}
              onChange={(e) => setForm((f) => ({ ...f, required: e.target.checked }))}
              className="h-3.5 w-3.5 accent-evvy"
            />
            {T.rsvpQuestions.required}
          </label>
        </div>
      </div>

      {(form.type === "select" || form.type === "checkbox") && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-inksoft">{T.rsvpQuestions.options}</label>
          {form.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                value={opt}
                onChange={(e) => setForm((f) => {
                  const opts = [...f.options];
                  opts[i] = e.target.value;
                  return { ...f, options: opts };
                })}
                placeholder={`Option ${i + 1}`}
                className={cn(INPUT_CLS, "h-7 text-xs")}
              />
              {form.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, options: f.options.filter((_, j) => j !== i) }))}
                  className="shrink-0 text-xs text-inksoft hover:text-coral"
                >
                  {T.rsvpQuestions.removeOption}
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, options: [...f.options, ""] }))}
            className="text-xs text-evvy hover:text-evvy-deep"
          >
            + {T.rsvpQuestions.addOption}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 pt-1">
        <button type="button" onClick={onSave} disabled={isPending || !form.label.trim()} className={cn(PRIMARY_BTN, "h-7 px-3 text-xs")}>
          {T.rsvpQuestions.save}
        </button>
        <button type="button" onClick={onCancel} disabled={isPending} className="inline-flex h-7 items-center rounded-lg px-3 text-xs font-medium text-inksoft transition hover:bg-paper disabled:opacity-40">
          {T.rsvpQuestions.cancel}
        </button>
      </div>
    </div>
  );
}
