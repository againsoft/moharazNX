"use client";

import { Plus, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  accountDashboard,
  walletHistory,
} from "@/lib/mock-data/storefront-account";
import { formatCurrency } from "@/lib/utils";

export function AccountWalletView() {
  const balance = accountDashboard.walletBalance;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Wallet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Store credit balance and transaction history
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.info("Top-up available per store policy (mock)")}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Top up
        </Button>
      </div>

      <div className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 p-5 dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-teal-950/20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wallet className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium">Available balance</span>
        </div>
        <p className="mt-2 text-3xl font-bold">{formatCurrency(balance)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Apply at checkout · refunds credited automatically
        </p>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold">Transactions</h3>
        <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card">
          {walletHistory.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <p className="font-medium">{tx.label}</p>
                <p className="text-xs text-muted-foreground">{tx.date}</p>
              </div>
              <span
                className={
                  tx.amount > 0
                    ? "font-semibold text-emerald-600"
                    : "font-semibold text-muted-foreground"
                }
              >
                {tx.amount > 0 ? "+" : ""}
                {formatCurrency(Math.abs(tx.amount))}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
