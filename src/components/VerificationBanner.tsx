"use client";

import { useState, useTransition } from "react";
import { MailCheck, X, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useLanguage } from "@/contexts/LanguageContext";

export function VerificationBanner() {
  const { T } = useLanguage();
  const [dismissed, setDismissed] = useState(false);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (dismissed) return null;

  const handleResend = () => {
    startTransition(async () => {
      await authClient.sendVerificationEmail({ email: (await authClient.getSession()).data?.user.email ?? "" });
      setSent(true);
    });
  };

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-amber-800">
          <MailCheck className="h-4 w-4 shrink-0" />
          <span>{T.auth.verification.banner}</span>
          {!sent ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isPending}
              className="ml-1 font-medium underline underline-offset-4 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="inline h-3 w-3 animate-spin" /> : T.auth.verification.resend}
            </button>
          ) : (
            <span className="ml-1 font-medium text-amber-700">{T.auth.verification.resent}</span>
          )}
        </div>
        <button type="button" onClick={() => setDismissed(true)} className="shrink-0 text-amber-600">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
