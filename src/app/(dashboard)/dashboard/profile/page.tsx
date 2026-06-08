import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileContent } from "@/components/ProfileContent";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = await db.user.findUnique({ where: { id: session!.user.id } });

  return (
    <ProfileContent
      name={user?.name ?? ""}
      email={user?.email ?? ""}
      plan={user?.plan ?? "free"}
      createdAt={(user?.createdAt ?? new Date()).toISOString()}
    />
  );
}
