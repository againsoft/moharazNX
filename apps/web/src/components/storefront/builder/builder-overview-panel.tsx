"use client";

import { ArrowRight, CheckCircle2, Circle, Sparkles, Wrench } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  PC_BUILDER_ASSEMBLY_SERVICE,
  PC_BUILDER_PHASES,
  getStepsForPhase,
  phaseFilledCount,
} from "@/lib/builder/phases";
import { usePcBuilderStore } from "@/lib/store/pc-builder-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = { className?: string };

export function BuilderOverviewPanel({ className }: Props) {
  const selections = usePcBuilderStore((s) => s.selections);
  const totalPrice = usePcBuilderStore((s) => s.totalPrice);
  const assemblyEnabled = usePcBuilderStore((s) => s.assemblyEnabled);
  const compatibilityStatus = usePcBuilderStore((s) => s.compatibilityStatus);
  const getSelectionsForStep = usePcBuilderStore((s) => s.getSelectionsForStep);
  const setPhase = usePcBuilderStore((s) => s.setPhase);
  const setStep = usePcBuilderStore((s) => s.setStep);

  const coreSteps = getStepsForPhase("components");
  const requiredCore = coreSteps.filter((s) => !("optional" in s && s.optional));
  const coreFilled = requiredCore.filter((s) => getSelectionsForStep(s.id).length > 0).length;
  const coreProgress = Math.round((coreFilled / requiredCore.length) * 100);

  const incompleteRequired = requiredCore.filter((s) => getSelectionsForStep(s.id).length === 0);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-xl border border-border/60 bg-gradient-to-br from-indigo-50/50 to-card p-5 dark:from-indigo-950/20">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Your build at a glance</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Wootware-style tabs — কিন্তু আমাদের AI + compatibility engine দিয়ে আরও স্মার্ট।
              প্রথমে <strong>Components</strong> শেষ করুন, তারপর Extras ও Peripherals যোগ করুন।
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/50 bg-background/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Core progress</p>
            <p className="mt-1 text-2xl font-bold">{coreProgress}%</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${coreProgress}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {coreFilled}/{requiredCore.length} required parts
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Compatibility</p>
            <Badge variant={compatibilityStatus() === "compatible" ? "success" : compatibilityStatus() === "warning" ? "warning" : "outline"} className="mt-2 capitalize">
              {compatibilityStatus()}
            </Badge>
            <p className="mt-2 text-[10px] text-muted-foreground">Rules apply to Components only</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-background/80 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Running total</p>
            <p className="mt-1 text-2xl font-bold">{formatCurrency(totalPrice())}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{selections.length} items selected</p>
          </div>
        </div>
      </div>

      {incompleteRequired.length > 0 && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <h3 className="text-sm font-semibold">Next — complete required parts</h3>
          <ul className="mt-2 space-y-1.5">
            {incompleteRequired.slice(0, 5).map((step) => (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => {
                    setPhase("components");
                    setStep(step.id);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-amber-100/80 dark:hover:bg-amber-900/30"
                >
                  <Circle className="h-3.5 w-3.5 text-amber-600" />
                  <span>{step.label}</span>
                  <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {PC_BUILDER_PHASES.filter((p) => p.id !== "overview").map((phase) => {
          const filled = phaseFilledCount(phase.id, getSelectionsForStep);
          const steps = getStepsForPhase(phase.id);
          return (
            <button
              key={phase.id}
              type="button"
              onClick={() => setPhase(phase.id)}
              className="rounded-xl border border-border/60 bg-card p-4 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/30 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{phase.label}</h3>
                {filled > 0 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">Optional</span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{phase.hint}</p>
              <p className="mt-2 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                {filled}/{steps.length} filled · Browse {phase.label}
              </p>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-3">
        <Wrench className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{PC_BUILDER_ASSEMBLY_SERVICE.label}</p>
          <p className="text-[11px] text-muted-foreground">{PC_BUILDER_ASSEMBLY_SERVICE.description}</p>
        </div>
        <span className="text-sm font-semibold">+{formatCurrency(PC_BUILDER_ASSEMBLY_SERVICE.price)}</span>
        {assemblyEnabled && <Badge variant="success">Added</Badge>}
      </div>

      <Button className="w-full sm:w-auto" onClick={() => setPhase("components")}>
        Continue to Components
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}
