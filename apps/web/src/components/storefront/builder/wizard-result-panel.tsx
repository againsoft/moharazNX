"use client";

import { ArrowRightLeft, CheckCircle2, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import type { AiPcBuildResult } from "@/lib/builder/ai/types";
import { PURPOSE_LABELS } from "@/lib/builder/ai/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  result: AiPcBuildResult;
  onConvert: () => void;
  onRestart: () => void;
  className?: string;
};

export function WizardResultPanel({ result, onConvert, onRestart, className }: Props) {
  const statusVariant =
    result.compatibilityStatus === "compatible"
      ? "success"
      : result.compatibilityStatus === "warning"
        ? "warning"
        : "outline";

  return (
    <section
      className={cn(
        "rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-indigo-50/30 p-5 dark:border-emerald-900/50",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Your recommended build
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {PURPOSE_LABELS[result.intent.purpose]} · {Math.round(result.confidence * 100)}% confidence
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={statusVariant} className="capitalize">{result.compatibilityStatus}</Badge>
          <Badge variant="secondary">{formatCurrency(result.totalPrice)}</Badge>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{result.explanation}</p>

      <ul className="mt-4 space-y-2">
        {result.selections.map((s) => (
          <li key={s.stepId} className="flex items-center justify-between rounded-lg border border-input bg-card px-3 py-2 text-xs">
            <div>
              <span className="font-medium capitalize">{s.stepId}</span>
              <span className="text-muted-foreground"> — {s.productName}</span>
            </div>
            <span className="font-semibold">{formatCurrency(s.price)}</span>
          </li>
        ))}
      </ul>

      {result.compatibilityMessages.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2 text-[11px] dark:border-amber-900/50">
          {result.compatibilityMessages.map((m, i) => (
            <p key={i}>{m}</p>
          ))}
        </div>
      )}

      {result.upgrades.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Upgrade options</p>
          <ul className="mt-2 space-y-1">
            {result.upgrades.map((u) => (
              <li key={u.upgradeProductId} className="text-[11px] text-muted-foreground">
                <span className="font-medium capitalize">{u.stepId}</span>: {u.upgradeProductName} (+{formatCurrency(u.priceDelta)}) — {u.benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.alternatives.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alternatives</p>
          <ul className="mt-2 space-y-1">
            {result.alternatives.map((a) => (
              <li key={a.productId} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <ArrowRightLeft className="h-3 w-3" />
                <span className="capitalize">{a.stepId}</span>: {a.productName} — {a.tradeoff}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        <Button onClick={onConvert}>
          <Wand2 className="mr-1.5 h-3.5 w-3.5" />
          One-click convert to full build
        </Button>
        <Button variant="outline" onClick={onRestart}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Start over
        </Button>
      </div>

      {result.remainingBudget != null && result.remainingBudget > 0 && (
        <p className="mt-3 flex items-center gap-1 text-xs text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {formatCurrency(result.remainingBudget)} under budget
        </p>
      )}
    </section>
  );
}
