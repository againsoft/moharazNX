"use client";

import { Bot, ListChecks, Sparkles, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BuilderMode } from "@/lib/builder/wizard/types";
import { BUILDER_MODE_DESCRIPTIONS, BUILDER_MODE_LABELS } from "@/lib/builder/wizard/types";
import { usePcBuilderWizardStore } from "@/lib/store/pc-builder-wizard-store";
import { Badge } from "@/components/ui/badge";

const MODES: { id: BuilderMode; icon: typeof Wrench; recommended?: boolean }[] = [
  { id: "ai_chat", icon: Bot, recommended: true },
  { id: "wizard", icon: ListChecks },
  { id: "manual", icon: Wrench },
];

type Props = { className?: string };

export function BuilderModeSelector({ className }: Props) {
  const mode = usePcBuilderWizardStore((s) => s.mode);
  const setMode = usePcBuilderWizardStore((s) => s.setMode);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-600" />
        <p className="text-xs font-medium text-muted-foreground">
          AI-First PC Builder — বাংলা/English-এ বলুন, আমরা compatible parts বেছে দেব
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {MODES.map(({ id, icon: Icon, recommended }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={cn(
              "relative rounded-xl border p-3 text-left transition-all",
              mode === id
                ? id === "ai_chat"
                  ? "border-violet-400 bg-violet-50/60 ring-1 ring-violet-400 dark:border-violet-600 dark:bg-violet-950/40"
                  : "border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-400 dark:border-indigo-600 dark:bg-indigo-950/40"
                : "border-border/60 bg-card hover:border-indigo-200",
            )}
          >
            {recommended && (
              <Badge className="absolute -right-1 -top-1 text-[8px]" variant="default">
                Recommended
              </Badge>
            )}
            <Icon
              className={cn(
                "h-5 w-5",
                mode === id
                  ? id === "ai_chat"
                    ? "text-violet-600"
                    : "text-indigo-600"
                  : "text-muted-foreground",
              )}
            />
            <p className="mt-2 text-sm font-semibold">{BUILDER_MODE_LABELS[id]}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{BUILDER_MODE_DESCRIPTIONS[id]}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
