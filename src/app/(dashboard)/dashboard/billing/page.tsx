import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BillingContent } from "@/components/BillingContent";

export default async function BillingPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = await db.user.findUnique({ where: { id: session!.user.id } });
  const plan = user?.plan ?? "free";

  return (
    <BillingContent
      plan={plan}
      cancelAtPeriodEnd={user?.cancelAtPeriodEnd ?? false}
      currentPeriodEnd={user?.stripeCurrentPeriodEnd?.toISOString() ?? null}
    />
  );
}
