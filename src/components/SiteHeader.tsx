import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { CreateDialogsProvider } from "@/components/CreateDialogsProvider";
import { DashboardTopbar } from "@/components/event-dashboard/DashboardTopbar";

/**
 * Universal site header for public/marketing pages. Renders the same topbar as
 * the dashboard (sticky here instead of inside the full-screen shell). When the
 * visitor is signed in it exposes the global "New event/calendar" dialogs so
 * they can create from anywhere; otherwise it shows the marketing nav + auth.
 */
export async function SiteHeader() {
  const current = await getCurrentUser();
  const isLoggedIn = !!current?.session;
  const isSuperAdmin = current?.user?.role === "super_admin";

  const calendars = isLoggedIn
    ? await db.calendar.findMany({
        where: { userId: current!.session.user.id },
        select: { id: true, name: true },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <CreateDialogsProvider calendars={calendars}>
      <div className="evvy-app sticky top-0 z-50" style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}>
        <DashboardTopbar isSuperAdmin={isSuperAdmin} isLoggedIn={isLoggedIn} />
      </div>
    </CreateDialogsProvider>
  );
}
