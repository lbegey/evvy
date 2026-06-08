"use client";

import { Check, X } from "lucide-react";
import { BillingActions } from "@/components/BillingActions";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface BillingContentProps {
  plan: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
}

export function BillingContent({ plan, cancelAtPeriodEnd, currentPeriodEnd }: BillingContentProps) {
  const { T } = useLanguage();
  const rows = T.billing.compare.rows;

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {T.billing.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{T.billing.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div
          className={cn(
            "flex flex-col rounded-xl border p-5",
            plan === "free" ? "border-primary/60 ring-1 ring-primary/20" : "border-border/60"
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">{T.billing.freePlan.name}</h2>
            {plan === "free" && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {T.billing.currentPlan}
              </span>
            )}
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{T.billing.freePlan.price}</p>
          <p className="mt-1 text-xs text-muted-foreground">{T.billing.freePlan.tagline}</p>
        </div>

        <div
          className={cn(
            "flex flex-col rounded-xl border p-5",
            plan === "premium" ? "border-primary/60 ring-1 ring-primary/20" : "border-border/60"
          )}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">{T.billing.premiumPlan.name}</h2>
            {plan === "premium" && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {T.billing.currentPlan}
              </span>
            )}
          </div>
          <p className="mt-1 text-2xl font-bold text-foreground">{T.billing.premiumPlan.price}</p>
          <p className="mt-1 text-xs text-muted-foreground">{T.billing.premiumPlan.tagline}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60">
        <div className="border-b border-border/60 bg-muted/30 px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">{T.billing.compare.title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{T.billing.compare.subtitle}</p>
        </div>

        <div className="grid grid-cols-2 border-b border-border/60 bg-muted/10 text-xs font-semibold text-muted-foreground">
          <div className="px-5 py-2.5">{T.billing.freePlan.name}</div>
          <div className="border-l border-border/60 px-5 py-2.5 text-primary">{T.billing.premiumPlan.name}</div>
        </div>

        <ul>
          {rows.map((row, i) => (
            <li
              key={i}
              className={cn("grid grid-cols-2 text-sm", i !== rows.length - 1 && "border-b border-border/60")}
            >
              <div className="flex items-start gap-2 px-5 py-3">
                {row.freeIncluded ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                )}
                <span className="text-muted-foreground">{row.free}</span>
              </div>
              <div className="flex items-start gap-2 border-l border-border/60 px-5 py-3">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span className="text-foreground">{row.premium}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-3">
        <BillingActions plan={plan} cancelAtPeriodEnd={cancelAtPeriodEnd} currentPeriodEnd={currentPeriodEnd} />
        {plan === "free" && (
          <p className="text-xs text-muted-foreground">{T.billing.upgradeHint}</p>
        )}
      </div>
    </section>
  );
}
