"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ToastProvider } from "./Toast";
import { DashboardTopbar } from "./DashboardTopbar";
import { DashboardSidebar, type SidebarItem } from "./DashboardSidebar";
import { CreateDialogsProvider } from "@/components/CreateDialogsProvider";

interface DashboardShellProps {
  sidebarItems: SidebarItem[];
  manageLabel: string;
  backUrl: string;
  backLabel: string;
  isSuperAdmin: boolean;
  calendars: { id: string; name: string }[];
  children: ReactNode;
}

const topIn = (el: HTMLElement, scroller: HTMLElement) =>
  el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;

/**
 * Full-screen dashboard shell: topbar + section sidebar + an internal scroll area.
 * The page body does not scroll — only the central <main> does. Shared by the
 * event and calendar detail dashboards.
 */
export function DashboardShell({ sidebarItems, manageLabel, backUrl, backLabel, isSuperAdmin, calendars, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(sidebarItems[0]?.id ?? "");
  const scrollerRef = useRef<HTMLElement>(null);
  // Section ids are stable for a given page, so capturing them once is enough.
  const itemsRef = useRef(sidebarItems);

  const navigateTo = (id: string) => {
    const scroller = scrollerRef.current;
    const el = document.getElementById(id);
    if (scroller && el) scroller.scrollTo({ top: topIn(el, scroller) - 24, behavior: "smooth" });
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const spy = () => {
      const items = itemsRef.current;
      if (items.length === 0) return;
      const y = scroller.scrollTop + 130;
      let cur = items[0].id;
      for (const s of items) {
        const el = document.getElementById(s.id);
        if (el && topIn(el, scroller) <= y) cur = s.id;
      }
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4) cur = items[items.length - 1].id;
      setActiveSection(cur);
    };
    scroller.addEventListener("scroll", spy, { passive: true });
    spy();

    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }),
      { root: scroller, threshold: 0.08 }
    );
    scroller.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    return () => { scroller.removeEventListener("scroll", spy); io.disconnect(); };
  }, []);

  return (
    <div
      className="evvy-app fixed inset-0 flex h-full flex-col overflow-hidden bg-paper text-ink"
      style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
    >
      <ToastProvider>
       <CreateDialogsProvider calendars={calendars}>
        <DashboardTopbar isSuperAdmin={isSuperAdmin} isLoggedIn onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex min-h-0 flex-1">
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <DashboardSidebar
            items={sidebarItems}
            activeId={activeSection}
            onNavigate={navigateTo}
            backUrl={backUrl}
            backLabel={backLabel}
            manageLabel={manageLabel}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <main ref={scrollerRef} className="evvy-scroll min-w-0 flex-1 overflow-y-auto scroll-smooth">
            {children}
          </main>
        </div>
       </CreateDialogsProvider>
      </ToastProvider>
    </div>
  );
}
