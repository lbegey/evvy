"use client";

import { useEffect } from "react";

export function PageViewTracker({ id }: { id: string }) {
  useEffect(() => {
    fetch(`/api/events/${id}/track?service=page`).catch(() => {});
  }, [id]);
  return null;
}
