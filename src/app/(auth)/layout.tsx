import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { auth } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/dashboard");
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.09 0 0 / 0.08), transparent)",
        }}
      />
      <Link
        href="/"
        className="mb-10 flex items-center gap-2.5 font-semibold text-foreground transition-opacity hover:opacity-80"
      >
        <Logo size="md" />
      </Link>
      {children}
    </div>
  );
}
