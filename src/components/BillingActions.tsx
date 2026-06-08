"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, CreditCard, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCheckoutSession, createPortalSession, cancelSubscription, resumeSubscription } from "@/app/actions/billing";
import { useLanguage } from "@/contexts/LanguageContext";

interface BillingActionsProps {
  plan: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

export function BillingActions({ plan, cancelAtPeriodEnd, currentPeriodEnd }: BillingActionsProps) {
  const router = useRouter();
  const { T, lang } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [isCancelling, startCancel] = useTransition();
  const [isResuming, startResume] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const periodEndLabel = currentPeriodEnd
    ? new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "long", year: "numeric" }).format(new Date(currentPeriodEnd))
    : "";

  const handleCancel = () => {
    if (!confirm(T.billing.cancelConfirm(periodEndLabel))) return;
    setError(null);
    startCancel(async () => {
      const result = await cancelSubscription();
      if ("error" in result) {
        setError(T.billing.cancelError);
        return;
      }
      router.refresh();
    });
  };

  const handleResume = () => {
    setError(null);
    startResume(async () => {
      const result = await resumeSubscription();
      if ("error" in result) {
        setError(T.billing.cancelError);
        return;
      }
      router.refresh();
    });
  };

  if (plan === "premium") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="gap-1.5"
            disabled={isPending}
            onClick={() => startTransition(async () => { await createPortalSession(); })}
          >
            <CreditCard className="h-4 w-4" />
            {isPending ? T.billing.loading : T.billing.manageSubscription}
          </Button>

          {cancelAtPeriodEnd ? (
            <Button
              variant="outline"
              className="gap-1.5"
              disabled={isResuming}
              onClick={handleResume}
            >
              <RotateCcw className="h-4 w-4" />
              {isResuming ? T.billing.resuming : T.billing.resumeSubscription}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="gap-1.5 text-destructive hover:text-destructive"
              disabled={isCancelling}
              onClick={handleCancel}
            >
              <XCircle className="h-4 w-4" />
              {isCancelling ? T.billing.cancelling : T.billing.cancelSubscription}
            </Button>
          )}
        </div>

        {cancelAtPeriodEnd && periodEndLabel && (
          <p className="text-xs text-muted-foreground">{T.billing.scheduledCancellation(periodEndLabel)}</p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <Button
      className="gap-1.5"
      disabled={isPending}
      onClick={() => startTransition(async () => { await createCheckoutSession(); })}
    >
      <Sparkles className="h-4 w-4" />
      {isPending ? T.billing.loading : T.billing.upgrade}
    </Button>
  );
}
