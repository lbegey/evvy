"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// The event detail page renders its own full-screen shell (topbar + sidebar),
// so it opts out of the shared dashboard Navbar.
const EVENT_SHELL_ROUTE = /^\/dashboard\/events\/[^/]+\/?$/;

interface DashboardChromeProps {
  navbar: ReactNode;
  banner: ReactNode;
  children: ReactNode;
}

export function DashboardChrome({ navbar, banner, children }: DashboardChromeProps) {
  const pathname = usePathname();

  if (EVENT_SHELL_ROUTE.test(pathname ?? "")) {
    return <>{children}</>;
  }

  // Non-event dashboard pages adopt the new palette + font via the evvy-theme
  // token remap (low-risk: only color/radius/font values change, not layout).
  return (
    <div className="evvy-theme flex min-h-screen flex-col">
      {navbar}
      {banner}
      <main className="flex-1">{children}</main>
    </div>
  );
}
