import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { VerificationBanner } from "@/components/VerificationBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const current = await getCurrentUser();
  if (!current) redirect("/login");

  const showBanner = current.user?.emailVerified === false;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {showBanner && <VerificationBanner />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
