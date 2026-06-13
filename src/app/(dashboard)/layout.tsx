import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import { DashboardChrome } from "@/components/DashboardChrome";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentUser();
  if (!current) redirect("/login");

  const showBanner = current.user?.emailVerified === false;
  const isSuperAdmin = current.user?.role === "super_admin";
  const calendars = await db.calendar.findMany({
    where: { userId: current.session.user.id },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <DashboardChrome isSuperAdmin={isSuperAdmin} showBanner={showBanner} calendars={calendars}>
      {children}
    </DashboardChrome>
  );
}
