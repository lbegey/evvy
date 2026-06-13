"use client";

import { type ReactNode } from "react";
import { VerificationBanner } from "@/components/VerificationBanner";
import { CreateDialogsProvider } from "@/components/CreateDialogsProvider";
import { ToastProvider } from "./Toast";
import { DashboardTopbar } from "./DashboardTopbar";

interface Props {
  isSuperAdmin: boolean;
  showBanner: boolean;
  calendars: { id: string; name: string }[];
  children: ReactNode;
}

/**
 * Full-screen shell for the list / settings dashboard pages: a topbar over an
 * internal scroll area (the body never scrolls), no sidebar. The scroll area
 * sits on the violet "paper" surface so its white cards read as blocks, and is
 * themed via evvy-theme so the existing shadcn-based views adopt the palette.
 */
export function DashboardListShell({ isSuperAdmin, showBanner, calendars, children }: Props) {
  return (
    <div
      className="evvy-app fixed inset-0 flex h-full flex-col overflow-hidden bg-paper text-ink"
      style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
    >
      <ToastProvider>
        <CreateDialogsProvider calendars={calendars}>
          <DashboardTopbar isSuperAdmin={isSuperAdmin} isLoggedIn />

          <main className="evvy-theme evvy-scroll min-w-0 flex-1 overflow-y-auto bg-paper scroll-smooth">
            {showBanner && <VerificationBanner />}
            {children}
          </main>
        </CreateDialogsProvider>
      </ToastProvider>
    </div>
  );
}
