"use client";

import { useEffect } from "react";

/**
 * Posts the rendered embed height to the parent window so our own preview
 * iframes (homepage, dashboard) can size themselves exactly to the content —
 * no inner scrollbars. Measures the #embed-root wrapper (not <body>, which the
 * root layout forces to min-h-full).
 */
export function EmbedHeightReporter() {
  useEffect(() => {
    const el = document.getElementById("embed-root") ?? document.body;
    const report = () => {
      const height = Math.ceil(el.getBoundingClientRect().height);
      window.parent?.postMessage({ type: "evvy-embed-height", height }, "*");
    };
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    window.addEventListener("load", report);
    return () => {
      ro.disconnect();
      window.removeEventListener("load", report);
    };
  }, []);
  return null;
}
