import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BrandingPageContent } from "@/components/BrandingPageContent";

export default async function BrandingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = await db.user.findUnique({ where: { id: session!.user.id } });
  const plan = user?.plan ?? "free";

  return (
    <BrandingPageContent
      unlocked={plan === "premium" || user?.role === "super_admin"}
      brandLogoUrl={user?.brandLogoUrl ?? null}
      brandLogoSize={user?.brandLogoSize ?? null}
      brandLogoTransparentBg={user?.brandLogoTransparentBg ?? true}
      brandLogoRounded={user?.brandLogoRounded ?? false}
      brandColor={user?.brandColor ?? null}
      brandBackgroundColor={user?.brandBackgroundColor ?? null}
      brandBackgroundImageUrl={user?.brandBackgroundImageUrl ?? null}
    />
  );
}
