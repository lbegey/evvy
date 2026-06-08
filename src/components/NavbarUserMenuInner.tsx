"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { UserSettingsPopover } from "@/components/UserSettingsPopover";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  isSuperAdmin: boolean;
}

export function NavbarUserMenuInner({ isSuperAdmin }: Props) {
  const { data: session, isPending } = useSession();
  const { T } = useLanguage();

  if (isPending) {
    return <div className="h-7 w-28 animate-pulse rounded-lg bg-muted" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/login" />}
          className="hidden sm:flex whitespace-nowrap"
        >
          {T.nav.signIn}
        </Button>
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/register" />}
          className="whitespace-nowrap"
        >
          {T.nav.getStarted}
        </Button>
      </div>
    );
  }

  const initials = session.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return <UserSettingsPopover user={session.user} initials={initials} isSuperAdmin={isSuperAdmin} />;
}
