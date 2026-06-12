"use client";

import { useState, type ReactNode } from "react";
import { VerificationBanner } from "@/components/VerificationBanner";
import { ToastProvider } from "./Toast";
import { DashboardTopbar } from "./DashboardTopbar";
import { DashboardNavSidebar } from "./DashboardNavSidebar";

interface Props {
  isSuperAdmin: boolean;
  showBanner: boolean;
  children: ReactNode;
}

/**
 * Full-screen shell for the list / settings dashboard pages: topbar + app-nav
 * sidebar + an internal scroll area (the body never scrolls). The page content
 * is themed via evvy-theme so the existing shadcn-based views adopt the palette.
 */
export function DashboardListShell({ isSuperAdmin, showBanner, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="evvy-app fixed inset-0 flex h-full flex-col overflow-hidden bg-paper text-ink"
      style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
    >
      <ToastProvider>
        <DashboardTopbar isSuperAdmin={isSuperAdmin} onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex min-h-0 flex-1">
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <DashboardNavSidebar isSuperAdmin={isSuperAdmin} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="evvy-theme evvy-scroll min-w-0 flex-1 overflow-y-auto scroll-smooth">
            {showBanner && <VerificationBanner />}
            {children}
          </main>
        </div>
      </ToastProvider>
    </div>
  );
}
