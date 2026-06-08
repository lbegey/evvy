import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminDashboard } from "@/components/AdminDashboard";

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const me = await db.user.findUnique({ where: { id: session.user.id } });
  if (me?.role !== "super_admin") redirect("/dashboard");

  const [users, messages, deletedAccounts] = await Promise.all([
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        plan: true,
        role: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripeCurrentPeriodEnd: true,
        createdAt: true,
        _count: { select: { events: true, calendars: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.contact.findMany({ orderBy: { createdAt: "desc" } }),
    db.deletedAccount.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <AdminDashboard
      currentUserId={session.user.id}
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: u.emailVerified,
        plan: u.plan,
        role: u.role,
        stripeCustomerId: u.stripeCustomerId,
        stripeSubscriptionId: u.stripeSubscriptionId,
        stripeCurrentPeriodEnd: u.stripeCurrentPeriodEnd?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
        eventCount: u._count.events,
        calendarCount: u._count.calendars,
      }))}
      messages={messages.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        subject: m.subject,
        message: m.message,
        archived: m.archived,
        createdAt: m.createdAt.toISOString(),
      }))}
      deletedAccounts={deletedAccounts.map((a) => ({
        id: a.id,
        email: a.email,
        name: a.name,
        plan: a.plan,
        createdAt: a.createdAt.toISOString(),
      }))}
    />
  );
}
