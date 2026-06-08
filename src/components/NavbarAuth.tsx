"use client";

import dynamic from "next/dynamic";

const NavbarUserMenu = dynamic(
  () => import("@/components/NavbarUserMenu").then((m) => m.NavbarUserMenu),
  {
    ssr: false,
    loading: () => <div className="h-7 w-32 animate-pulse rounded-lg bg-muted" />,
  }
);

interface Props {
  isSuperAdmin: boolean;
}

export function NavbarAuth({ isSuperAdmin }: Props) {
  return <NavbarUserMenu isSuperAdmin={isSuperAdmin} />;
}
