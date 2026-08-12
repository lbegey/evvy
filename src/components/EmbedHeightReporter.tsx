"use client";

import { useEffect } from "react";
import { EMBED_HEIGHT_MSG, EMBED_HEIGHT_REQUEST_MSG } from "@/lib/embed-height";

/**
 * Posts the rendered embed height to the parent window so our own preview
 * iframes (homepage, dashboard) can size themselves exactly to the content —
 * no inner scrollbars. Measures the #embed-root wrapper (not <body>, which the
 * root layout forces to min-h-full).
 *
 * React can swap the wrapper node out from under us (hydration recovery, Fast
 * Refresh), and a detached node measures 0 — so the node is looked up on every
 * report rather than captured once, and the observers follow it.
 */
export function EmbedHeightReporter() {
  useEffect(() => {
    let observed: Element | null = null;

    const report = () => {
      const el = document.getElementById("embed-root") ?? document.body;
      if (el !== observed) {
        if (observed) ro.unobserve(observed);
        ro.observe(el);
        observed = el;
      }
      const rect = el.getBoundingClientRect();
      // Include anything sitting above the wrapper so nothing gets clipped.
      const offsetTop = Math.max(0, rect.top + window.scrollY);
      const height = Math.ceil(rect.height + offsetTop);
      if (height > 0) window.parent?.postMessage({ type: EMBED_HEIGHT_MSG, height }, "*");
    };

    const ro = new ResizeObserver(report);
    // The wrapper is a direct child of <body>; catch it being replaced.
    const mo = new MutationObserver(report);
    mo.observe(document.body, { childList: true });

    const onRequest = (e: MessageEvent) => {
      if (e.data?.type === EMBED_HEIGHT_REQUEST_MSG) report();
    };

    report();
    window.addEventListener("message", onRequest);
    window.addEventListener("load", report);
    document.fonts?.ready.then(report).catch(() => {});
    // The host page can hydrate (and start listening) after us — repeat the
    // report a few times so it never has to rely on catching the first one.
    const timers = [100, 400, 1000, 2500].map((d) => setTimeout(report, d));

    return () => {
      ro.disconnect();
      mo.disconnect();
      timers.forEach(clearTimeout);
      window.removeEventListener("message", onRequest);
      window.removeEventListener("load", report);
    };
  }, []);
  return null;
}
