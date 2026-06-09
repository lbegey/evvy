"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog } from "@base-ui/react/dialog";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ImageDropzone } from "@/components/ImageDropzone";
import { TIMEZONES } from "@/lib/timezones";
import { updateEvent } from "@/app/actions/events";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    title: z.string().min(1),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    allDay: z.boolean(),
    isOnline: z.boolean(),
    rsvpEnabled: z.boolean(),
    timezone: z.string().min(1),
    language: z.enum(["fr", "en"]),
    organizerEmail: z.string().email().or(z.literal("")).optional(),
    location: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = `${data.startDate}T${data.allDay ? "00:00" : data.startTime}`;
      const end = `${data.endDate}T${data.allDay ? "23:59" : data.endTime}`;
      return end >= start;
    },
    { message: "endBeforeStart", path: ["endDate"] }
  );

type FormValues = z.infer<typeof schema>;

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: string;
  event: {
    id: string;
    title: string;
    description: string | null;
    location: string | null;
    imageUrl: string | null;
    organizerEmail: string | null;
    startAt: string;
    endAt: string;
    allDay: boolean;
    isOnline: boolean;
    rsvpEnabled: boolean;
    timezone: string;
    language: string | null;
  };
}

function isoToLocal(iso: string, tz: string): { date: string; time: string } {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const p = (t: string) => parts.find((x) => x.type === t)?.value ?? "00";
  const h = p("hour") === "24" ? "00" : p("hour");
  return { date: `${p("year")}-${p("month")}-${p("day")}`, time: `${h}:${p("minute")}` };
}

function addHourToDatetime(date: string, time: string): { date: string; time: string } {
  const [h, m] = time.split(":").map(Number);
  if (h < 23) return { date, time: `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}` };
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + 1);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `00:${String(m).padStart(2, "0")}` };
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

export function EditEventDialog({ open, onOpenChange, plan, event }: EditEventDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState(event.imageUrl ?? "");
  const { T, lang } = useLanguage();
  const startLocal = isoToLocal(event.startAt, event.timezone);
  const endLocal = isoToLocal(event.endAt, event.timezone);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: event.title, startDate: startLocal.date, endDate: endLocal.date, startTime: startLocal.time,
      endTime: endLocal.time, allDay: event.allDay, isOnline: event.isOnline, rsvpEnabled: event.rsvpEnabled,
      timezone: event.timezone, language: event.language === "fr" || event.language === "en" ? event.language : lang,
      organizerEmail: event.organizerEmail ?? "", location: event.location ?? "",
      description: event.description ?? "",
    },
  });

  const allDay = form.watch("allDay");
  const isOnline = form.watch("isOnline");
  const startDate = form.watch("startDate");
  const startTime = form.watch("startTime");

  useEffect(() => {
    if (open) {
      const s = isoToLocal(event.startAt, event.timezone);
      const e = isoToLocal(event.endAt, event.timezone);
      form.reset({
        title: event.title, startDate: s.date, endDate: e.date, startTime: s.time, endTime: e.time,
        allDay: event.allDay, isOnline: event.isOnline, rsvpEnabled: event.rsvpEnabled, timezone: event.timezone,
        language: event.language === "fr" || event.language === "en" ? event.language : lang,
        organizerEmail: event.organizerEmail ?? "", location: event.location ?? "",
        description: event.description ?? "",
      });
      setImageUrl(event.imageUrl ?? "");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const endDate = form.getValues("endDate");
    const endTime = form.getValues("endTime");
    if (`${endDate}T${endTime}` <= `${startDate}T${startTime}`) {
      const next = addHourToDatetime(startDate, startTime);
      form.setValue("endDate", next.date);
      form.setValue("endTime", next.time);
    }
  }, [startDate, startTime]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (values: FormValues) => {
    startTransition(async () => {
      const startAt = values.allDay
        ? naiveToUTC(values.startDate, "00:00", values.timezone)
        : naiveToUTC(values.startDate, values.startTime, values.timezone);
      const endAt = values.allDay
        ? naiveToUTC(values.endDate, "23:59", values.timezone)
        : naiveToUTC(values.endDate, values.endTime, values.timezone);

      await updateEvent(event.id, {
        title: values.title,
        description: values.description ?? "",
        location: values.location ?? "",
        organizerEmail: values.organizerEmail ?? "",
        startAt,
        endAt,
        allDay: values.allDay,
        isOnline: values.isOnline,
        rsvpEnabled: values.rsvpEnabled,
        timezone: values.timezone,
        language: values.language,
        imageUrl,
      });
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={cn(
          "fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200",
          "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
        )} />
        <Dialog.Popup className={cn(
          "fixed left-1/2 top-1/2 z-50 flex h-[min(92vh,56rem)] w-[min(96vw,52rem)] -translate-x-1/2 -translate-y-1/2 flex-col",
          "border border-border/60 bg-background shadow-xl",
          "transition-all duration-200",
          "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
          "data-[ending-style]:opacity-0 data-[ending-style]:scale-95"
        )}>
          <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {T.eventForm.edit}
            </Dialog.Title>
            <Dialog.Close className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="space-y-1.5">
                <Label htmlFor="ed-title">{T.eventForm.title} *</Label>
                <Input id="ed-title" {...form.register("title")} />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">{T.eventForm.errors.titleRequired}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="ed-allday"
                    {...form.register("allDay")}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <Label htmlFor="ed-allday" className="cursor-pointer font-normal">{T.eventForm.allDay}</Label>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="ed-online"
                    {...form.register("isOnline")}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <Label htmlFor="ed-online" className="cursor-pointer font-normal">{T.eventForm.onlineEvent}</Label>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="ed-rsvp"
                    {...form.register("rsvpEnabled")}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <Label htmlFor="ed-rsvp" className="cursor-pointer font-normal">{T.eventForm.enableRsvp}</Label>
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl border border-border/60 bg-muted/10 p-3">
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">{T.eventForm.from}</span>
                  <div className="flex items-end gap-2">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Label htmlFor="ed-start-date">{T.eventForm.date} *</Label>
                      <Input id="ed-start-date" type="date" {...form.register("startDate")} />
                    </div>
                    {!allDay && (
                      <div className="w-[104px] shrink-0 space-y-1.5">
                        <Label htmlFor="ed-start-time">{T.eventForm.start} *</Label>
                        <Input id="ed-start-time" type="time" {...form.register("startTime")} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">{T.eventForm.to}</span>
                  <div className="flex items-end gap-2">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Label htmlFor="ed-end-date">{T.eventForm.date} *</Label>
                      <Input id="ed-end-date" type="date" min={startDate} {...form.register("endDate")} />
                    </div>
                    {!allDay && (
                      <div className="w-[104px] shrink-0 space-y-1.5">
                        <Label htmlFor="ed-end-time">{T.eventForm.end} *</Label>
                        <Input id="ed-end-time" type="time" {...form.register("endTime")} />
                      </div>
                    )}
                  </div>
                </div>
                {form.formState.errors.endDate && (
                  <p className="text-xs text-destructive">{T.eventForm.errors.endBeforeStart}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>{T.eventForm.coverImage}</Label>
                <ImageDropzone value={imageUrl} onChange={setImageUrl} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ed-tz">{T.eventForm.timezone}</Label>
                  <Select id="ed-tz" {...form.register("timezone")}>
                    {TIMEZONES.map(({ group, zones }) => (
                      <optgroup key={group} label={group}>
                        {zones.map(({ label, value }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ed-lang">{T.eventForm.pageLanguage}</Label>
                  <Select id="ed-lang" {...form.register("language")}>
                    <option value="fr">{T.eventForm.languages.fr}</option>
                    <option value="en">{T.eventForm.languages.en}</option>
                  </Select>
                  <p className="text-xs text-muted-foreground">{T.eventForm.pageLanguageHint}</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ed-location">{isOnline ? T.eventForm.meetingLink : T.eventForm.location}</Label>
                  <Input
                    id="ed-location"
                    placeholder={isOnline ? T.eventForm.meetingLinkPlaceholder : T.eventForm.locationPlaceholder}
                    {...form.register("location")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ed-org-email">{T.eventForm.organizerEmail}</Label>
                  <Input id="ed-org-email" type="email" placeholder={T.eventForm.emailPlaceholder} {...form.register("organizerEmail")} />
                  {form.formState.errors.organizerEmail && (
                    <p className="text-xs text-destructive">{T.eventForm.errors.emailInvalid}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ed-desc">{T.eventForm.description}</Label>
                <Textarea
                  id="ed-desc"
                  rows={4}
                  placeholder={T.eventForm.descriptionPlaceholder}
                  {...form.register("description")}
                />
              </div>
            </div>

            <div className="shrink-0 border-t border-border/60 bg-background px-5 py-4 sm:px-6">
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                  {T.eventForm.cancel}
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {T.eventForm.save}
                </Button>
              </div>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
