"use client";

import { useEffect } from "react";

export function CalendarPageViewTracker({ id }: { id: string }) {
  useEffect(() => {
    fetch(`/api/calendars/${id}/track?service=page`).catch(() => {});
  }, [id]);
  return null;
}
