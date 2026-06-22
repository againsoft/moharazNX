"use client";

import { cn } from "@/lib/utils";
import { getStepsForPhase } from "@/lib/builder/phases";
import { type PcBuilderStepId } from "@/lib/builder/types";
import { PC_BUILDER_STEP_ICONS } from "@/lib/builder/step-icons";
import { usePcBuilderStore } from "@/lib/store/pc-builder-store";

type Props = {
  className?: string;
};

export function BuilderStepNav({ className }: Props) {
  const currentPhase = usePcBuilderStore((s) => s.currentPhase);
  const currentStep = usePcBuilderStore((s) => s.currentStep);
  const setStep = usePcBuilderStore((s) => s.setStep);
  const getSelectionsForStep = usePcBuilderStore((s) => s.getSelectionsForStep);

  const phaseSteps = getStepsForPhase(currentPhase);
  if (phaseSteps.length === 0) return null;

  const stepIndex = phaseSteps.findIndex((s) => s.id === currentStep);

  return (
    <nav className={cn("overflow-x-auto", className)} aria-label="Build steps">
      <ol className="flex min-w-max gap-1 sm:gap-2">
        {phaseSteps.map((step, idx) => {
          const Icon = PC_BUILDER_STEP_ICONS[step.id as PcBuilderStepId];
          const isActive = currentStep === step.id;
          const hasSelection = getSelectionsForStep(step.id).length > 0;
          const isPast = idx < stepIndex;

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => setStep(step.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-left transition-colors sm:px-3",
                  isActive
                    ? "border-indigo-500 bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-100"
                    : hasSelection || isPast
                      ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50"
                      : "border-border/60 bg-card hover:bg-muted/50",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    isActive ? "bg-indigo-600 text-white" : hasSelection ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground",
                  )}
                >
                  {hasSelection ? "✓" : idx + 1}
                </span>
                <Icon className="hidden h-3.5 w-3.5 sm:block" />
                <span className="text-[11px] font-medium sm:text-xs">{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
