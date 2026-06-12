"use client";

import { Popover } from "@base-ui/react/popover";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Mail, LogOut, ChevronDown, ShieldCheck, User, Webhook } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface Props {
  user: { name: string; email: string };
  initials: string;
  isSuperAdmin?: boolean;
}

export function UserSettingsPopover({ user, initials, isSuperAdmin }: Props) {
  const router = useRouter();
  const { T } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Popover.Root>
      <Popover.Trigger
        className={cn(
          "flex items-center gap-2 rounded-lg px-2 py-1.5",
          "text-sm font-medium text-foreground",
          "transition-colors hover:bg-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground select-none">
          {initials}
        </div>
        <span className="hidden sm:block">{user.name}</span>
        <ChevronDown className="hidden h-3 w-3 text-muted-foreground sm:block" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8} className="z-[60]">
          <Popover.Popup
            className={cn(
              "evvy-theme w-56 rounded-xl border border-border/60 bg-background p-1 shadow-pop",
              "origin-[var(--transform-origin)]",
              "transition-[transform,opacity] duration-150",
              "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
              "data-[ending-style]:opacity-0 data-[ending-style]:scale-95"
            )}
          >
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>

            <div className="my-1 h-px bg-border/60" />

            {isSuperAdmin && (
              <Popover.Close
                nativeButton={false}
                render={<Link href="/dashboard/admin" />}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2",
                  "text-sm text-foreground transition-colors hover:bg-muted"
                )}
              >
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                {T.userMenu.admin}
              </Popover.Close>
            )}

            <Popover.Close
              nativeButton={false}
              render={<Link href="/dashboard/profile" />}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2",
                "text-sm text-foreground transition-colors hover:bg-muted"
              )}
            >
              <User className="h-4 w-4 text-muted-foreground" />
              {T.userMenu.profile}
            </Popover.Close>

            <Popover.Close
              nativeButton={false}
              render={<Link href="/dashboard/webhooks" />}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2",
                "text-sm text-foreground transition-colors hover:bg-muted"
              )}
            >
              <Webhook className="h-4 w-4 text-muted-foreground" />
              {T.userMenu.webhooks}
            </Popover.Close>

            <Popover.Close
              nativeButton={false}
              render={<Link href="/dashboard/billing" />}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2",
                "text-sm text-foreground transition-colors hover:bg-muted"
              )}
            >
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              {T.userMenu.billing}
            </Popover.Close>

            <Popover.Close
              nativeButton={false}
              render={<Link href="/contact" />}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2",
                "text-sm text-foreground transition-colors hover:bg-muted"
              )}
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              {T.userMenu.contact}
            </Popover.Close>

            <div className="my-1 h-px bg-border/60" />

            <button
              onClick={handleSignOut}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2",
                "text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              )}
            >
              <LogOut className="h-4 w-4" />
              {T.userMenu.signOut}
            </button>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
