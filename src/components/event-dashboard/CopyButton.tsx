"use client";

import type { ReactNode } from "react";
import { useToast } from "./Toast";

interface CopyButtonProps {
  value: string;
  toast: string;
  className?: string;
  title?: string;
  children: ReactNode;
}

/** Copies `value` to the clipboard and shows a toast. Styling is provided by the caller via className. */
export function CopyButton({ value, toast, className, title, children }: CopyButtonProps) {
  const showToast = useToast();
  return (
    <button
      type="button"
      title={title}
      onClick={() => {
        navigator.clipboard.writeText(value).then(
          () => showToast(toast),
          () => showToast(toast)
        );
      }}
      className={className}
    >
      {children}
    </button>
  );
}
