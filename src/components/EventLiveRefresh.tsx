"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL = 10_000;

export function EventLiveRefresh({ id, updatedAt }: { id: string; updatedAt: string }) {
  const router = useRouter();
  const lastUpdatedAt = useRef(updatedAt);

  useEffect(() => {
    lastUpdatedAt.current = updatedAt;
  }, [updatedAt]);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/events/${id}/live`, { cache: "no-store" });
        if (!res.ok) return;
        const data: { updatedAt: string } = await res.json();
        if (!cancelled && data.updatedAt !== lastUpdatedAt.current) {
          lastUpdatedAt.current = data.updatedAt;
          router.refresh();
        }
      } catch {}
    };

    const interval = setInterval(poll, POLL_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id, router]);

  return null;
}
