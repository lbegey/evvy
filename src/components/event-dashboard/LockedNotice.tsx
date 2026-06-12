import Link from "next/link";
import { Lock } from "lucide-react";

/** Restyled Premium gate used by gated event-dashboard sections. */
export function LockedNotice({ message, unlock }: { message: string; unlock: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-evvy-soft/50 p-3">
      <p className="inline-flex items-center gap-2 text-sm text-inksoft">
        <Lock className="h-4 w-4 shrink-0 text-evvy" />
        {message}
      </p>
      <Link
        href="/dashboard/billing"
        className="inline-flex items-center rounded-lg bg-evvy px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-evvy-deep"
      >
        {unlock}
      </Link>
    </div>
  );
}
