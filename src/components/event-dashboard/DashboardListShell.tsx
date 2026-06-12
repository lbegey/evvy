"use client";

import { type ReactNode } from "react";
import { VerificationBanner } from "@/components/VerificationBanner";
import { ToastProvider } from "./Toast";
import { DashboardTopbar } from "./DashboardTopbar";

interface Props {
  isSuperAdmin: boolean;
  showBanner: boolean;
  children: ReactNode;
}

/**
 * Full-screen shell for the list / settings dashboard pages: a topbar over an
 * internal white scroll area (the body never scrolls), no sidebar. Content is
 * themed via evvy-theme so the existing shadcn-based views adopt the palette.
 */
export function DashboardListShell({ isSuperAdmin, showBanner, children }: Props) {
  return (
    <div
      className="evvy-app fixed inset-0 flex h-full flex-col overflow-hidden bg-white text-ink"
      style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
    >
      <ToastProvider>
        <DashboardTopbar isSuperAdmin={isSuperAdmin} />

        <main className="evvy-theme evvy-scroll min-w-0 flex-1 overflow-y-auto bg-white scroll-smooth">
          {showBanner && <VerificationBanner />}
          {children}
        </main>
      </ToastProvider>
    </div>
  );
}
