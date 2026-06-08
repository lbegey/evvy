"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL = 10_000;

export function CalendarLiveRefresh({ id, signature }: { id: string; signature: string }) {
  const router = useRouter();
  const lastSignature = useRef(signature);

  useEffect(() => {
    lastSignature.current = signature;
  }, [signature]);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`/api/calendars/${id}/live`, { cache: "no-store" });
        if (!res.ok) return;
        const data: { signature: string } = await res.json();
        if (!cancelled && data.signature !== lastSignature.current) {
          lastSignature.current = data.signature;
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
