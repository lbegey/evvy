import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { VerificationBanner } from "@/components/VerificationBanner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { emailVerified: true } });
  const showBanner = user?.emailVerified === false;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {showBanner && <VerificationBanner />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
