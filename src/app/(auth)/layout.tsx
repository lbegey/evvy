import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { auth } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/dashboard");
  return (
    <div
      className="evvy-theme relative flex min-h-screen flex-col items-center justify-center bg-paper px-6 py-12 text-ink"
      style={{ fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(91,75,230,0.12), transparent 70%)",
        }}
      />
      <Link
        href="/"
        className="mb-10 flex items-center gap-2.5 transition-opacity hover:opacity-80"
      >
        <Logo size="md" />
      </Link>
      {children}
    </div>
  );
}
