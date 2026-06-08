"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changeEmail, deleteAccount } from "@/app/actions/account";
import { signOut } from "@/lib/auth-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface ProfileContentProps {
  name: string;
  email: string;
  plan: string;
  createdAt: string;
}

export function ProfileContent({ name, email, plan, createdAt }: ProfileContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { T, lang } = useLanguage();
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [isSavingEmail, startSaveEmail] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const [confirmationStatus, setConfirmationStatus] = useState<"success" | "invalid" | "expired" | null>(null);

  useEffect(() => {
    const status = searchParams.get("emailChange");
    if (status === "success" || status === "invalid" || status === "expired") {
      setConfirmationStatus(status);
      router.replace("/dashboard/profile");
    }
  }, [searchParams, router]);

  const memberSince = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", {
    day: "numeric", month: "long", year: "numeric",
  }).format(new Date(createdAt));

  const planLabel = plan === "premium" ? T.billing.premiumPlan.name : T.billing.freePlan.name;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);
    startSaveEmail(async () => {
      const result = await changeEmail(newEmail);
      if ("error" in result) {
        setEmailError(result.error === "taken" ? T.profile.changeEmail.taken : T.profile.changeEmail.invalid);
        return;
      }
      setEmailSuccess(true);
      setNewEmail("");
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!confirm(T.profile.dangerZone.confirm)) return;
    setDeleteError(null);
    startDelete(async () => {
      const result = await deleteAccount();
      if ("error" in result) {
        setDeleteError(T.profile.dangerZone.error);
        return;
      }
      await signOut();
      router.push("/");
      router.refresh();
    });
  };

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{T.profile.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{T.profile.subtitle}</p>
      </div>

      {confirmationStatus && (
        <p
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            confirmationStatus === "success"
              ? "border-green-600/30 bg-green-600/5 text-green-700"
              : "border-destructive/30 bg-destructive/5 text-destructive"
          )}
        >
          {confirmationStatus === "success"
            ? T.profile.changeEmail.confirmedSuccess
            : confirmationStatus === "expired"
            ? T.profile.changeEmail.confirmedExpired
            : T.profile.changeEmail.confirmedInvalid}
        </p>
      )}

      <div className="rounded-xl border border-border/60 p-5">
        <h2 className="text-sm font-semibold text-foreground">{T.profile.accountInfo}</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">{T.profile.name}</dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground">{name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{T.profile.email}</dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground">{email}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{T.profile.plan}</dt>
            <dd className="mt-0.5">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {planLabel}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{T.profile.memberSince}</dt>
            <dd className="mt-0.5 text-sm font-medium capitalize text-foreground">{memberSince}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-border/60 p-5">
        <h2 className="text-sm font-semibold text-foreground">{T.profile.changeEmail.title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{T.profile.changeEmail.subtitle}</p>
        <form onSubmit={handleEmailSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="new-email">{T.profile.changeEmail.label}</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={T.profile.changeEmail.placeholder}
                className="pl-9"
                required
              />
            </div>
          </div>
          <Button type="submit" disabled={isSavingEmail || !newEmail.trim()} className="shrink-0">
            {isSavingEmail ? T.profile.changeEmail.saving : T.profile.changeEmail.save}
          </Button>
        </form>
        {emailError && <p className="mt-2 text-xs text-destructive">{emailError}</p>}
        {emailSuccess && <p className="mt-2 text-xs text-green-600">{T.profile.changeEmail.success}</p>}
      </div>

      <div className="rounded-xl border border-destructive/30 p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <h2 className="text-sm font-semibold text-foreground">{T.profile.dangerZone.title}</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{T.profile.dangerZone.subtitle}</p>
        <p className="mt-3 text-xs text-muted-foreground">{T.profile.dangerZone.billingNotice}</p>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
          className="mt-4 cursor-pointer"
        >
          {isDeleting ? T.profile.dangerZone.deleting : T.profile.dangerZone.deleteAccount}
        </Button>
        {deleteError && <p className="mt-2 text-xs text-destructive">{deleteError}</p>}
      </div>
    </section>
  );
}
