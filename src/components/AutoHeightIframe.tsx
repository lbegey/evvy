"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EMBED_HEIGHT_MSG, EMBED_HEIGHT_REQUEST_MSG } from "@/lib/embed-height";

/**
 * Delays (ms) at which we re-ask for a height while still stuck on minHeight.
 * The frame may not be loaded — or not yet hydrated — when the first ones fire,
 * so this backs off well past a slow embed load.
 */
const RETRY_DELAYS = [0, 200, 500, 1000, 2000, 3500, 6000];

/**
 * An iframe that resizes itself to the exact height reported by the embedded
 * page (via EmbedHeightReporter postMessage), so embed previews never show
 * inner scrollbars and stay responsive.
 *
 * The embed can finish loading and post its height before this component has
 * hydrated, in which case that first message is lost — so we also actively ask
 * the frame for its height on mount, on load, and a few times after.
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
  const measured = useRef(false);

  const requestHeight = useCallback(() => {
    ref.current?.contentWindow?.postMessage({ type: EMBED_HEIGHT_REQUEST_MSG }, "*");
  }, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type !== EMBED_HEIGHT_MSG) return;
      if (ref.current && e.source === ref.current.contentWindow) {
        measured.current = true;
        setHeight(Math.max(minHeight, Math.ceil(e.data.height)));
      }
    };
    window.addEventListener("message", onMessage);

    const timers = RETRY_DELAYS.map((d) =>
      setTimeout(() => {
        if (!measured.current) requestHeight();
      }, d)
    );

    return () => {
      window.removeEventListener("message", onMessage);
      timers.forEach(clearTimeout);
    };
  }, [minHeight, requestHeight]);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      scrolling="no"
      loading="lazy"
      onLoad={requestHeight}
      className={className}
      style={{ height, width: "100%", border: 0, overflow: "hidden" }}
    />
  );
}
