"use client";

import { createContext, useContext, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { CalendarDialog, type CalendarDialogValues } from "@/components/CalendarDialog";
import { createEvent } from "@/app/actions/events";
import { createCalendar, assignEventToCalendar } from "@/app/actions/calendars";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreateDialogsContextValue {
  openCreateEvent: (opts?: { defaultCalendarId?: string }) => void;
  openCreateCalendar: () => void;
}

const CreateDialogsContext = createContext<CreateDialogsContextValue | null>(null);

/** Topbar (and contextual) create buttons consume this to open the global dialogs. */
export function useCreateDialogs() {
  return useContext(CreateDialogsContext);
}

interface EventSubmitData {
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
}

interface Props {
  calendars: { id: string; name: string }[];
  children: ReactNode;
}

/**
 * Mounts a single shared "New event" / "New calendar" dialog and exposes openers
 * via context, so the universal topbar can create from anywhere (dashboard or
 * public pages) and route to the freshly-created entity.
 */
export function CreateDialogsProvider({ calendars, children }: Props) {
  const router = useRouter();
  const { T } = useLanguage();
  const [browserTz] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);

  const [eventOpen, setEventOpen] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [eventCalendarId, setEventCalendarId] = useState<string | null>(null);
  const [isCreatingEvent, startCreateEvent] = useTransition();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [isCreatingCalendar, startCreateCalendar] = useTransition();

  const handleCreateEvent = async (data: EventSubmitData) => {
    setEventError(null);
    startCreateEvent(async () => {
      const result = await createEvent(data);
      if ("error" in result) {
        setEventError(T.eventForm.errors.limitReached);
        return;
      }
      if (data.calendarId) await assignEventToCalendar(result.id, data.calendarId);
      setEventOpen(false);
      router.push(`/dashboard/events/${result.id}${data.calendarId ? `?calendar=${data.calendarId}` : ""}`);
    });
  };

  const handleCreateCalendar = async (data: CalendarDialogValues) => {
    setCalendarError(null);
    startCreateCalendar(async () => {
      const result = await createCalendar(data);
      if ("error" in result) {
        setCalendarError(result.error === "limit" ? T.calendars.freeLimit : T.calendars.locked);
        return;
      }
      setCalendarOpen(false);
      router.push(`/dashboard/calendars/${result.id}`);
    });
  };

  return (
    <CreateDialogsContext.Provider
      value={{
        openCreateEvent: (opts) => { setEventError(null); setEventCalendarId(opts?.defaultCalendarId ?? null); setEventOpen(true); },
        openCreateCalendar: () => { setCalendarError(null); setCalendarOpen(true); },
      }}
    >
      {children}

      <CreateEventDialog
        open={eventOpen}
        onOpenChange={setEventOpen}
        defaultDate={new Date()}
        defaultTimezone={browserTz}
        calendars={calendars}
        defaultCalendarId={eventCalendarId}
        onSubmit={handleCreateEvent}
        isPending={isCreatingEvent}
        error={eventError}
      />

      <CalendarDialog
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
        onSubmit={handleCreateCalendar}
        isPending={isCreatingCalendar}
        error={calendarError}
      />
    </CreateDialogsContext.Provider>
  );
}
