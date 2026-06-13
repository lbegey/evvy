"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardListShell } from "@/components/event-dashboard/DashboardListShell";

// The event and calendar detail pages render their own full-screen shell
// (topbar + section sidebar), so they opt out of the shared list shell.
const FULL_SHELL_ROUTE = /^\/dashboard\/(events|calendars)\/[^/]+\/?$/;

interface DashboardChromeProps {
  isSuperAdmin: boolean;
  showBanner: boolean;
  calendars: { id: string; name: string }[];
  children: ReactNode;
}

export function DashboardChrome({ isSuperAdmin, showBanner, calendars, children }: DashboardChromeProps) {
  const pathname = usePathname();

  if (FULL_SHELL_ROUTE.test(pathname ?? "")) {
    return <>{children}</>;
  }

  return (
    <DashboardListShell isSuperAdmin={isSuperAdmin} showBanner={showBanner} calendars={calendars}>
      {children}
    </DashboardListShell>
  );
}
