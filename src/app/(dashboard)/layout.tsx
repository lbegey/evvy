import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
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

  return (
    <DashboardChrome isSuperAdmin={isSuperAdmin} showBanner={showBanner}>
      {children}
    </DashboardChrome>
  );
}
