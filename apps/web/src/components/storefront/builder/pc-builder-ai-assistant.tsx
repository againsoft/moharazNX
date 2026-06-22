"use client";

import { useState } from "react";
import { ArrowUpRight, Bot, Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { EXAMPLE_PROMPTS } from "@/lib/builder/ai/prompts";
import { pcBuilderAiService } from "@/lib/builder/ai/pc-builder-ai-service";
import type { AiPcBuildResult } from "@/lib/builder/ai/types";
import { PURPOSE_LABELS } from "@/lib/builder/ai/types";
import { usePcBuilderStore } from "@/lib/store/pc-builder-store";
import type { PcBuilderStepId } from "@/lib/builder/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = { className?: string };

export function PcBuilderAiAssistant({ className }: Props) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiPcBuildResult | null>(null);
  const applyAiBuild = usePcBuilderStore((s) => s.applyAiBuild);
  const setBuildName = usePcBuilderStore((s) => s.setBuildName);

  const handleGenerate = async (text?: string) => {
    const q = (text ?? prompt).trim();
    if (!q) {
      toast.error("Describe the PC you want to build");
      return;
    }
    setLoading(true);
    try {
      const build = await pcBuilderAiService.buildFromPrompt(q);
      setResult(build);
      setPrompt(q);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result) return;
    applyAiBuild(
      result.selections.map((s) => ({
        stepId: s.stepId as PcBuilderStepId,
        productId: s.productId,
      })),
    );
    setBuildName(`${PURPOSE_LABELS[result.intent.purpose]} AI Build`);
    toast.success("AI build applied to your configurator");
  };

  const statusVariant =
    result?.compatibilityStatus === "compatible"
      ? "success"
      : result?.compatibilityStatus === "warning"
        ? "warning"
        : "outline";

  return (
    <section
      className={cn(
        "rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-indigo-50/40 p-4 dark:border-violet-900/50 dark:from-violet-950/30 dark:to-indigo-950/20",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
          <Bot className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            AI PC Builder
            <Badge variant="secondary" className="text-[9px]">
              <Sparkles className="mr-0.5 h-2.5 w-2.5" />
              Natural language
            </Badge>
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Describe your dream PC — budget, purpose, and performance — we pick compatible parts.
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g. "Build a gaming PC under 100000 BDT"'
          className="h-9 flex-1 text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />
        <Button size="sm" className="h-9 shrink-0" onClick={() => handleGenerate()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          <span className="ml-1.5 hidden sm:inline">Build</span>
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {EXAMPLE_PROMPTS.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setPrompt(ex);
              handleGenerate(ex);
            }}
            className="rounded-full border border-violet-200 bg-background/80 px-2.5 py-1 text-[10px] text-muted-foreground transition-colors hover:border-violet-400 hover:text-foreground dark:border-violet-800"
          >
            {ex}
          </button>
        ))}
      </div>

      {result && (
        <div className="mt-4 space-y-3 rounded-lg border border-input bg-card/90 p-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {PURPOSE_LABELS[result.intent.purpose]}
            </Badge>
            {result.intent.budgetBdt && (
              <Badge variant="outline" className="text-[10px]">
                Budget ৳{result.intent.budgetBdt.toLocaleString()}
              </Badge>
            )}
            <Badge variant={statusVariant} className="text-[10px] capitalize">
              {result.compatibilityStatus}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              {Math.round(result.confidence * 100)}% confidence
            </span>
          </div>

          <p className="text-xs leading-relaxed text-foreground/90">{result.explanation}</p>

          <ul className="space-y-1.5">
            {result.selections.map((pick) => (
              <li key={pick.stepId} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="capitalize text-muted-foreground">{pick.stepId}</span>
                <span className="truncate font-medium">{pick.productName}</span>
                <span className="shrink-0 font-semibold">{formatCurrency(pick.price)}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-input pt-2">
            <span className="text-xs font-medium">Total</span>
            <span className="text-base font-bold">{formatCurrency(result.totalPrice)}</span>
          </div>

          {result.remainingBudget !== null && result.remainingBudget >= 0 && (
            <p className="text-[10px] text-emerald-600">
              ৳{result.remainingBudget.toLocaleString()} under budget
            </p>
          )}

          {result.upgrades.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Suggested upgrades
              </p>
              <ul className="mt-1 space-y-1">
                {result.upgrades.map((u) => (
                  <li key={u.upgradeProductId} className="flex items-start gap-1 text-[11px]">
                    <ArrowUpRight className="mt-0.5 h-3 w-3 shrink-0 text-violet-600" />
                    <span>
                      <span className="font-medium">{u.upgradeProductName}</span>
                      <span className="text-muted-foreground"> (+{formatCurrency(u.priceDelta)}) — {u.benefit}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.alternatives.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Alternatives
              </p>
              <ul className="mt-1 space-y-1">
                {result.alternatives.map((a) => (
                  <li key={a.productId} className="text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">{a.productName}</span> — {a.tradeoff}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button className="w-full" size="sm" onClick={handleApply}>
            Apply this build to configurator
          </Button>
        </div>
      )}
    </section>
  );
}
