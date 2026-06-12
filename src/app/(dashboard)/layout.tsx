import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { VerificationBanner } from "@/components/VerificationBanner";
import { DashboardChrome } from "@/components/DashboardChrome";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentUser();
  if (!current) redirect("/login");

  const showBanner = current.user?.emailVerified === false;

  return (
    <DashboardChrome
      navbar={<Navbar />}
      banner={showBanner ? <VerificationBanner /> : null}
    >
      {children}
    </DashboardChrome>
  );
}
