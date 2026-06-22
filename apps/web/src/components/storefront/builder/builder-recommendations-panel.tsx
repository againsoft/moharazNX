"use client";

import { useMemo } from "react";
import {
  ArrowRight,
  Fan,
  Lightbulb,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { generateSmartRecommendations } from "@/lib/builder/recommendations/engine";
import { KIND_LABELS, type RecommendationKind, type SmartRecommendation } from "@/lib/builder/recommendations/types";
import { usePcBuilderStore } from "@/lib/store/pc-builder-store";
import type { PcBuilderStepId } from "@/lib/builder/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const KIND_ICONS: Partial<Record<RecommendationKind, React.ComponentType<{ className?: string }>>> = {
  related_component: ArrowRight,
  better_performance: TrendingUp,
  better_value: Lightbulb,
  psu_wattage: Zap,
  cooling: Fan,
  upgrade_path: TrendingUp,
  budget_optimization: Sparkles,
};

type Props = {
  className?: string;
  budgetBdt?: number | null;
};

export function BuilderRecommendationsPanel({ className, budgetBdt }: Props) {
  const selections = usePcBuilderStore((s) => s.selections);
  const selectProduct = usePcBuilderStore((s) => s.selectProduct);
  const setStep = usePcBuilderStore((s) => s.setStep);

  const result = useMemo(
    () => generateSmartRecommendations(selections, { budgetBdt, purpose: "gaming" }),
    [selections, budgetBdt],
  );

  const handleAction = (rec: SmartRecommendation) => {
    if (rec.action === "info" || !rec.stepId || rec.stepId === "cooler") {
      if (rec.kind === "psu_wattage" && rec.stepId === "psu") setStep("psu");
      return;
    }
    if (!rec.productId) return;
    selectProduct(rec.stepId as PcBuilderStepId, rec.productId);
    setStep(rec.stepId as PcBuilderStepId);
    toast.success(rec.action === "add" ? "Component added" : "Component swapped");
  };

  if (selections.length === 0) {
    return (
      <div className={cn("rounded-xl border border-dashed border-input p-4 text-center text-xs text-muted-foreground", className)}>
        Select components to see smart recommendations
      </div>
    );
  }

  return (
    <section className={cn("rounded-xl border border-amber-200/80 bg-amber-50/30 p-4 dark:border-amber-900/40 dark:bg-amber-950/20", className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-600" />
        <h3 className="text-sm font-semibold">Smart recommendations</h3>
        <Badge variant="secondary" className="text-[9px]">{result.recommendations.length}</Badge>
      </div>

      {result.psu && (
        <div className="mt-3 rounded-lg border border-input bg-card/80 px-3 py-2 text-[11px]">
          <div className="flex items-center gap-1.5 font-medium">
            <Zap className="h-3 w-3 text-amber-600" />
            PSU: {result.psu.estimatedDrawW}W draw → {result.psu.recommendedIdealW}W ideal
          </div>
          <p className="mt-0.5 text-muted-foreground">{result.psu.message}</p>
        </div>
      )}

      {result.cooling?.needsAftermarket && (
        <div className="mt-2 rounded-lg border border-input bg-card/80 px-3 py-2 text-[11px]">
          <div className="flex items-center gap-1.5 font-medium">
            <Fan className="h-3 w-3 text-sky-600" />
            Cooling ({result.cooling.cpuTdp}W TDP)
          </div>
          <p className="mt-0.5 text-muted-foreground">{result.cooling.message}</p>
        </div>
      )}

      {result.upgradePath.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Upgrade path</p>
          <ol className="mt-1 space-y-1">
            {result.upgradePath.map((step) => (
              <li key={step.order} className="flex items-start gap-2 text-[11px]">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[9px] font-bold dark:bg-amber-900/50">
                  {step.order}
                </span>
                <span>
                  <span className="font-medium">{step.toProductName}</span>
                  <span className="text-muted-foreground"> (+{formatCurrency(step.priceDelta)}) — {step.impact}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {result.budget?.overBudget && result.budget.suggestions.length > 0 && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50/50 px-3 py-2 text-[11px] dark:border-red-900/50 dark:bg-red-950/20">
          <p className="font-medium text-red-700 dark:text-red-400">Budget optimization</p>
          <ul className="mt-1 space-y-0.5 text-muted-foreground">
            {result.budget.suggestions.map((s) => (
              <li key={s.stepId}>Swap {s.stepId} → {s.swapToProductName} (save ৳{s.savings.toLocaleString()})</li>
            ))}
          </ul>
        </div>
      )}

      <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
        {result.recommendations.slice(0, 8).map((rec) => {
          const Icon = KIND_ICONS[rec.kind] ?? Lightbulb;
          return (
            <li
              key={rec.id}
              className="flex items-start gap-2 rounded-lg border border-input bg-card px-2.5 py-2"
            >
              <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[11px] font-medium">{rec.title}</span>
                  <Badge variant="outline" className="text-[8px]">{KIND_LABELS[rec.kind]}</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">{rec.description}</p>
                {rec.priceDelta !== undefined && rec.priceDelta !== 0 && (
                  <p className="text-[10px] font-semibold">
                    {rec.priceDelta > 0 ? "+" : ""}{formatCurrency(rec.priceDelta)}
                  </p>
                )}
              </div>
              {rec.action !== "info" && rec.productId && rec.stepId !== "cooler" && (
                <Button variant="outline" size="sm" className="h-7 shrink-0 text-[10px]" onClick={() => handleAction(rec)}>
                  {rec.action === "add" ? "Add" : "Swap"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
