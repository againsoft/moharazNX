"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CreditCard, X } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { calculateEmiPlans } from "@/lib/plugins/bank-emi/calculator";
import { resolveEmiSettings } from "@/lib/plugins/bank-emi/settings";
import type { EmiBank } from "@/lib/plugins/bank-emi/types";
import { usePluginsStore } from "@/lib/store/plugins-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAmount: number;
  /** Admin preview — use unsaved bank list */
  banksOverride?: EmiBank[];
};

function BankAvatar({ bank, selected }: { bank: EmiBank; selected: boolean }) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
        selected && "ring-2 ring-offset-2 ring-offset-background",
      )}
      style={{ backgroundColor: bank.brandColor, ...(selected ? { ringColor: bank.brandColor } : {}) }}
    >
      {bank.initial}
    </div>
  );
}

export function EmiPlansModal({ open, onOpenChange, defaultAmount, banksOverride }: Props) {
  const pluginState = usePluginsStore((s) => s.plugins["bank-emi"]);
  const [amountInput, setAmountInput] = useState(String(defaultAmount));
  const [selectedBankId, setSelectedBankId] = useState<string>("");

  const settings = useMemo(() => {
    const base = resolveEmiSettings(
      pluginState?.config,
      pluginState?.installed ?? false,
      pluginState?.enabled ?? false,
    );
    if (banksOverride?.length) {
      return { ...base, banks: banksOverride };
    }
    return base;
  }, [pluginState, banksOverride]);

  const amount = useMemo(() => {
    const n = parseFloat(amountInput.replace(/,/g, ""));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [amountInput]);

  const result = useMemo(() => calculateEmiPlans(amount, settings), [amount, settings]);

  useEffect(() => {
    if (open) {
      setAmountInput(String(Math.round(defaultAmount)));
    }
  }, [open, defaultAmount]);

  useEffect(() => {
    if (result.banks.length > 0 && !result.banks.some((b) => b.bank.id === selectedBankId)) {
      setSelectedBankId(result.banks[0].bank.id);
    }
  }, [result.banks, selectedBankId]);

  const selected = result.banks.find((b) => b.bank.id === selectedBankId);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border/60 bg-background shadow-2xl outline-none">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <Dialog.Title className="text-lg font-semibold tracking-tight">EMI Options</Dialog.Title>
            <Dialog.Close className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            {/* Bank list — left on desktop, chips on mobile */}
            <div className="border-b border-border/60 bg-muted/20 md:w-52 md:shrink-0 md:border-b-0 md:border-r">
              <p className="hidden px-4 pt-4 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:block">
                Select bank
              </p>
              <div className="flex gap-2 overflow-x-auto p-3 md:flex-col md:overflow-y-auto md:p-2">
                {result.banks.map(({ bank }) => {
                  const isSelected = bank.id === selectedBankId;
                  return (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setSelectedBankId(bank.id)}
                      className={cn(
                        "flex shrink-0 items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all md:w-full",
                        isSelected
                          ? "border-amber-400/80 bg-amber-50/80 shadow-sm dark:border-amber-600/50 dark:bg-amber-950/30"
                          : "border-border/50 bg-card hover:border-border hover:bg-muted/40",
                      )}
                    >
                      <BankAvatar bank={bank} selected={isSelected} />
                      <span className="whitespace-nowrap text-sm font-medium md:whitespace-normal">{bank.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Plans table */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-5">
              <div className="mb-4">
                <Label htmlFor="emi-amount" className="text-sm font-medium">
                  Enter Amount
                </Label>
                <Input
                  id="emi-amount"
                  type="number"
                  min={0}
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="mt-1.5 h-11 text-base font-semibold"
                />
              </div>

              {!result.eligible && amount > 0 && (
                <div className="rounded-lg border border-dashed border-amber-300/60 bg-amber-50/50 px-4 py-6 text-center text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-100">
                  Minimum order amount for EMI is {formatCurrency(settings.minOrderAmount)}
                </div>
              )}

              {result.eligible && selected && (
                <div className="overflow-hidden rounded-lg border border-border/60">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <th className="px-4 py-3">Plan (Monthly)</th>
                        <th className="px-4 py-3">EMI</th>
                        <th className="px-4 py-3">Charge</th>
                        <th className="hidden px-4 py-3 sm:table-cell">Effective Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.plans.map((plan) => (
                        <tr
                          key={plan.months}
                          className="border-b border-border/40 last:border-0 transition-colors hover:bg-muted/20"
                        >
                          <td className="px-4 py-3 font-medium">{plan.months}</td>
                          <td className="px-4 py-3 font-semibold text-amber-700 dark:text-amber-400">
                            {formatCurrency(plan.monthlyEmi)}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{plan.chargePercent.toFixed(2)}%</td>
                          <td className="hidden px-4 py-3 font-medium sm:table-cell">
                            {formatCurrency(plan.effectiveCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {result.eligible && selected && (
                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                  <CreditCard className="mr-1 inline h-3.5 w-3.5 align-text-bottom" />
                  Estimated EMI for <strong>{selected.bank.name}</strong>. Final terms confirmed at payment gateway.
                  Cash price may differ from installment total.
                </p>
              )}

              {amount <= 0 && (
                <p className="text-center text-sm text-muted-foreground">Enter a valid amount to see EMI plans.</p>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
