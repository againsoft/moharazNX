"use client";

import { cn } from "@/lib/utils";
import { PC_BUILDER_PHASES, phaseFilledCount, type PcBuilderPhaseId } from "@/lib/builder/phases";
import { usePcBuilderStore } from "@/lib/store/pc-builder-store";

type Props = { className?: string };

export function BuilderPhaseTabs({ className }: Props) {
  const currentPhase = usePcBuilderStore((s) => s.currentPhase);
  const setPhase = usePcBuilderStore((s) => s.setPhase);
  const getSelectionsForStep = usePcBuilderStore((s) => s.getSelectionsForStep);

  return (
    <div className={cn("border-b border-border/60", className)}>
      <div className="flex gap-0 overflow-x-auto" role="tablist" aria-label="Builder sections">
        {PC_BUILDER_PHASES.map((phase) => {
          const isActive = currentPhase === phase.id;
          const filled =
            phase.id === "overview"
              ? null
              : phaseFilledCount(phase.id, getSelectionsForStep);
          const total = phase.id === "overview" ? null : phase.id === "components" ? 9 : phase.id === "extras" ? 4 : 9;

          return (
            <button
              key={phase.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setPhase(phase.id as PcBuilderPhaseId)}
              className={cn(
                "relative shrink-0 border-b-2 px-4 py-3 text-left transition-colors sm:px-6",
                isActive
                  ? "border-indigo-500 text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              <span className="block text-sm font-semibold">{phase.label}</span>
              <span className="mt-0.5 block text-[10px] text-muted-foreground">{phase.hint}</span>
              {filled !== null && total !== null && filled > 0 && (
                <span className="absolute right-2 top-2 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {filled}/{total}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
