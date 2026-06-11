"use client";

import { useEffect, useMemo, useState } from "react";
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
import { getTimezones } from "@/lib/timezones";
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
    calendarId: z.string().optional(),
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

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: Date;
  defaultTimezone: string;
  calendars?: { id: string; name: string }[];
  defaultCalendarId?: string | null;
  onSubmit: (data: {
    title: string;
    description: string;
    location: string;
    organizerEmail: string;
    startAt: string;
    endAt: string;
    allDay: boolean;
    isOnline: boolean;
    rsvpEnabled: boolean;
    timezone: string;
    language: string;
    imageUrl: string;
    calendarId: string | null;
  }) => Promise<void>;
  isPending: boolean;
  error?: string | null;
}

function toDateInput(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function addHour(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function addHourToDatetime(date: string, time: string): { date: string; time: string } {
  const [h, m] = time.split(":").map(Number);
  if (h < 23) return { date, time: `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}` };
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return { date: toDateInput(d), time: `00:${String(m).padStart(2, "0")}` };
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

export function CreateEventDialog({
  open, onOpenChange, defaultDate, defaultTimezone, calendars, defaultCalendarId, onSubmit, isPending, error,
}: CreateEventDialogProps) {
  const { T, lang } = useLanguage();
  const now = new Date();
  const defaultStart = `${String(now.getHours()).padStart(2, "0")}:00`;
  const [imageUrl, setImageUrl] = useState("");
  const timezones = useMemo(() => getTimezones(lang), [lang]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "", startDate: toDateInput(defaultDate), endDate: toDateInput(defaultDate),
      startTime: defaultStart, endTime: addHour(defaultStart), allDay: false, isOnline: false,
      rsvpEnabled: false, timezone: defaultTimezone, language: lang, organizerEmail: "", location: "", description: "",
      calendarId: defaultCalendarId ?? "",
    },
  });

  const allDay = form.watch("allDay");
  const isOnline = form.watch("isOnline");
  const startDate = form.watch("startDate");
  const startTime = form.watch("startTime");

  useEffect(() => {
    form.setValue("startDate", toDateInput(defaultDate));
    form.setValue("endDate", toDateInput(defaultDate));
  }, [defaultDate, form]);

  useEffect(() => {
    const endDate = form.getValues("endDate");
    const endTime = form.getValues("endTime");
    if (`${endDate}T${endTime}` <= `${startDate}T${startTime}`) {
      const next = addHourToDatetime(startDate, startTime);
      form.setValue("endDate", next.date);
      form.setValue("endTime", next.time);
    }
  }, [startDate, startTime]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) {
      form.reset({
        title: "", startDate: toDateInput(defaultDate), endDate: toDateInput(defaultDate),
        startTime: defaultStart, endTime: addHour(defaultStart), allDay: false, isOnline: false,
        rsvpEnabled: false, timezone: defaultTimezone, language: lang, organizerEmail: "", location: "", description: "",
        calendarId: defaultCalendarId ?? "",
      });
      setImageUrl("");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (values: FormValues) => {
    const startAt = values.allDay
      ? naiveToUTC(values.startDate, "00:00", values.timezone)
      : naiveToUTC(values.startDate, values.startTime, values.timezone);
    const endAt = values.allDay
      ? naiveToUTC(values.endDate, "23:59", values.timezone)
      : naiveToUTC(values.endDate, values.endTime, values.timezone);

    await onSubmit({
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
      calendarId: values.calendarId || null,
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
          "transition-[transform,opacity] duration-200",
          "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
          "data-[ending-style]:opacity-0 data-[ending-style]:scale-95"
        )}>
          <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              {T.eventForm.new}
            </Dialog.Title>
            <Dialog.Close className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              <div className="space-y-1.5">
                <Label htmlFor="ev-title">{T.eventForm.title} *</Label>
                <Input id="ev-title" placeholder={T.eventForm.titlePlaceholder} {...form.register("title")} />
                {form.formState.errors.title && (
                  <p className="text-xs text-destructive">{T.eventForm.errors.titleRequired}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="ev-allday"
                    {...form.register("allDay")}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <Label htmlFor="ev-allday" className="cursor-pointer font-normal">{T.eventForm.allDay}</Label>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="ev-online"
                    {...form.register("isOnline")}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <Label htmlFor="ev-online" className="cursor-pointer font-normal">{T.eventForm.onlineEvent}</Label>
                </div>
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="ev-rsvp"
                    {...form.register("rsvpEnabled")}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <Label htmlFor="ev-rsvp" className="cursor-pointer font-normal">{T.eventForm.enableRsvp}</Label>
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl border border-border/60 bg-muted/10 p-3">
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">{T.eventForm.from}</span>
                  <div className="flex items-end gap-2">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Label htmlFor="ev-start-date">{T.eventForm.date} *</Label>
                      <Input id="ev-start-date" type="date" {...form.register("startDate")} />
                    </div>
                    {!allDay && (
                      <div className="w-[104px] shrink-0 space-y-1.5">
                        <Label htmlFor="ev-start-time">{T.eventForm.start} *</Label>
                        <Input id="ev-start-time" type="time" {...form.register("startTime")} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">{T.eventForm.to}</span>
                  <div className="flex items-end gap-2">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Label htmlFor="ev-end-date">{T.eventForm.date} *</Label>
                      <Input id="ev-end-date" type="date" min={startDate} {...form.register("endDate")} />
                    </div>
                    {!allDay && (
                      <div className="w-[104px] shrink-0 space-y-1.5">
                        <Label htmlFor="ev-end-time">{T.eventForm.end} *</Label>
                        <Input id="ev-end-time" type="time" {...form.register("endTime")} />
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
                  <Label htmlFor="ev-tz">{T.eventForm.timezone}</Label>
                  <Select id="ev-tz" {...form.register("timezone")}>
                    {timezones.map(({ group, zones }) => (
                      <optgroup key={group} label={group}>
                        {zones.map(({ label, value }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ev-lang">{T.eventForm.pageLanguage}</Label>
                  <Select id="ev-lang" {...form.register("language")}>
                    <option value="fr">{T.eventForm.languages.fr}</option>
                    <option value="en">{T.eventForm.languages.en}</option>
                  </Select>
                  <p className="text-xs text-muted-foreground">{T.eventForm.pageLanguageHint}</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ev-location">{isOnline ? T.eventForm.meetingLink : T.eventForm.location}</Label>
                  <Input
                    id="ev-location"
                    placeholder={isOnline ? T.eventForm.meetingLinkPlaceholder : T.eventForm.locationPlaceholder}
                    {...form.register("location")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ev-org-email">{T.eventForm.organizerEmail}</Label>
                  <Input id="ev-org-email" type="email" placeholder={T.eventForm.emailPlaceholder} {...form.register("organizerEmail")} />
                  {form.formState.errors.organizerEmail && (
                    <p className="text-xs text-destructive">{T.eventForm.errors.emailInvalid}</p>
                  )}
                </div>

                {calendars && calendars.length > 0 && (
                  <div className="space-y-1.5">
                    <Label htmlFor="ev-calendar">{T.eventForm.calendar}</Label>
                    <Select id="ev-calendar" {...form.register("calendarId")}>
                      <option value="">{T.eventForm.noCalendar}</option>
                      {calendars.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ev-desc">{T.eventForm.description}</Label>
                <Textarea
                  id="ev-desc"
                  rows={4}
                  placeholder={T.eventForm.descriptionPlaceholder}
                  {...form.register("description")}
                />
              </div>
            </div>

            <div className="shrink-0 space-y-2 border-t border-border/60 bg-background px-5 py-4 sm:px-6">
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                  {T.eventForm.cancel}
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {T.eventForm.create}
                </Button>
              </div>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
