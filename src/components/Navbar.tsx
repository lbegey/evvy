import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Logo } from "@/components/Logo";
import { NavbarAuth } from "@/components/NavbarAuth";
import { LanguageSelector } from "@/components/LanguageSelector";
import { DashboardViewSwitcher } from "@/components/DashboardViewSwitcher";
import { NavbarBrandingLink } from "@/components/NavbarBrandingLink";
import { NavbarMarketingNav } from "@/components/NavbarMarketingNav";

export async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });
  const logoHref = session ? "/dashboard" : "/";
  const isSuperAdmin = session
    ? (await db.user.findUnique({ where: { id: session.user.id }, select: { role: true } }))?.role === "super_admin"
    : false;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href={logoHref}
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <Logo size="md" />
          </Link>

          {!session && <NavbarMarketingNav />}
        </div>

        <div className="flex items-center gap-2">
          {session && (
            <div className="flex items-center gap-1.5">
              <DashboardViewSwitcher />
              <NavbarBrandingLink />
            </div>
          )}
          <LanguageSelector />
          <NavbarAuth isSuperAdmin={isSuperAdmin} />
        </div>
      </div>
    </header>
  );
}
