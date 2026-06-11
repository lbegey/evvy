import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BrandingPresetsPageContent } from "@/components/BrandingPresetsPageContent";

export default async function BrandingPresetsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = await db.user.findUnique({ where: { id: session!.user.id } });
  const unlocked = user?.plan === "premium" || user?.role === "super_admin";
  if (!unlocked) redirect("/dashboard/branding");

  return <BrandingPresetsPageContent />;
}
