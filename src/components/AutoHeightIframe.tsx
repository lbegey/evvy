"use client";

import { useEffect, useRef, useState } from "react";

/**
 * An iframe that resizes itself to the exact height reported by the embedded
 * page (via EmbedHeightReporter postMessage), so embed previews never show
 * inner scrollbars and stay responsive.
 */
export function AutoHeightIframe({
  src,
  title,
  className,
  minHeight = 120,
}: {
  src: string;
  title: string;
  className?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(minHeight);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!e.data || e.data.type !== "evvy-embed-height") return;
      if (ref.current && e.source === ref.current.contentWindow) {
        setHeight(Math.max(minHeight, e.data.height));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [minHeight]);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      scrolling="no"
      loading="lazy"
      className={className}
      style={{ height, width: "100%", border: 0, overflow: "hidden" }}
    />
  );
}
