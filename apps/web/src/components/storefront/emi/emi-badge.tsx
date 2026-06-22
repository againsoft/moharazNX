"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useBankEmi } from "@/hooks/use-bank-emi";
import { EmiPlansModal } from "@/components/storefront/emi/emi-plans-modal";

type Props = {
  amount: number;
  className?: string;
  variant?: "default" | "compact";
  showCashLabel?: boolean;
};

export function EmiBadge({ amount, className, variant = "default", showCashLabel }: Props) {
  const [open, setOpen] = useState(false);
  const { isActive, label, lowestMonthly, settings } = useBankEmi(amount);

  if (!settings.showOnPdp && variant === "default") return null;
  if (!isActive) return null;

  if (variant === "compact") {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
            className,
          )}
        >
          <CreditCard className="h-3 w-3" />
          EMI from {formatCurrency(lowestMonthly ?? 0)}/mo
        </button>
        <EmiPlansModal open={open} onOpenChange={setOpen} defaultAmount={amount} />
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          "rounded-lg border border-amber-200/70 bg-gradient-to-r from-amber-50/80 to-orange-50/40 px-3.5 py-3 dark:border-amber-900/40 dark:from-amber-950/25 dark:to-orange-950/10",
          className,
        )}
      >
        {showCashLabel && (
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Cash price shown above</p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-start gap-2">
            <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-950 dark:text-amber-100">{label}</p>
              {lowestMonthly != null && (
                <p className="mt-0.5 text-xs text-amber-800/80 dark:text-amber-200/80">
                  From {formatCurrency(lowestMonthly)}/month
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 rounded-md border border-amber-400/60 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm transition-colors hover:bg-amber-50 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-100 dark:hover:bg-amber-950"
          >
            View Plans
          </button>
        </div>
      </div>
      <EmiPlansModal open={open} onOpenChange={setOpen} defaultAmount={amount} />
    </>
  );
}

type InlineProps = {
  amount: number;
  className?: string;
  surface?: "cart" | "builder";
};

export function EmiInlineLink({ amount, className, surface = "cart" }: InlineProps) {
  const [open, setOpen] = useState(false);
  const { isActive, lowestMonthly, settings } = useBankEmi(amount);

  const show = surface === "builder" ? settings.showOnBuilder : settings.showOnCart;

  if (!show || !isActive || lowestMonthly == null) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-dashed border-amber-300/60 bg-amber-50/40 px-3 py-2.5 text-left text-xs transition-colors hover:bg-amber-50/70 dark:border-amber-800/50 dark:bg-amber-950/20 dark:hover:bg-amber-950/30",
          className,
        )}
      >
        <span className="flex items-center gap-1.5 font-medium text-amber-900 dark:text-amber-100">
          <CreditCard className="h-3.5 w-3.5" />
          EMI from {formatCurrency(lowestMonthly)}/mo
        </span>
        <span className="font-semibold text-amber-700 underline-offset-2 hover:underline dark:text-amber-400">
          View Plans
        </span>
      </button>
      <EmiPlansModal open={open} onOpenChange={setOpen} defaultAmount={amount} />
    </>
  );
}
