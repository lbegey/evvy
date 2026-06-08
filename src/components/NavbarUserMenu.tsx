"use client";

import dynamic from "next/dynamic";

const NavbarUserMenuInner = dynamic(
  () => import("@/components/NavbarUserMenuInner").then((m) => m.NavbarUserMenuInner),
  {
    ssr: false,
    loading: () => <div className="h-7 w-32 animate-pulse rounded-lg bg-muted" />,
  }
);

interface Props {
  isSuperAdmin: boolean;
}

export function NavbarUserMenu({ isSuperAdmin }: Props) {
  return <NavbarUserMenuInner isSuperAdmin={isSuperAdmin} />;
}
