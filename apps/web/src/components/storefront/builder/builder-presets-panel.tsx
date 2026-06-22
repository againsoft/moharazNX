"use client";

import { Layers } from "lucide-react";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { pcBuildPresets } from "@/lib/mock-data/pc-builder-presets";
import { PC_BUILDER_STEPS } from "@/lib/builder/types";
import { usePcBuilderStore } from "@/lib/store/pc-builder-store";
import { Badge } from "@/components/ui/badge";

type Props = { className?: string };

const TIER_LABELS = {
  budget: "Budget",
  mid: "Mid-range",
  high: "High-end",
} as const;

export function BuilderPresetsPanel({ className }: Props) {
  const loadPreset = usePcBuilderStore((s) => s.loadPreset);
  const selections = usePcBuilderStore((s) => s.selections);

  const handleLoad = (presetId: string, name: string) => {
    const ok = loadPreset(presetId);
    if (ok) {
      toast.success(`Loaded "${name}" — ${PC_BUILDER_STEPS.length} step build applied`);
    } else {
      toast.error("Could not load preset");
    }
  };

  return (
    <div className={cn("rounded-lg border border-input bg-muted/20 p-3", className)}>
      <div className="mb-2 flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Demo full builds</h3>
        <Badge variant="secondary" className="text-[9px]">5 presets</Badge>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        One-click load a complete compatible PC — or pick parts step by step below.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {pcBuildPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handleLoad(preset.id, preset.name)}
            className="rounded-lg border border-input bg-background p-2.5 text-left transition-colors hover:border-primary/50 hover:bg-muted/40"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-medium leading-tight">{preset.name}</span>
              <Badge variant="outline" className="shrink-0 text-[8px]">
                {TIER_LABELS[preset.tier]}
              </Badge>
            </div>
            <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">{preset.description}</p>
            <p className="mt-1.5 text-[10px] font-semibold text-primary">{formatCurrency(preset.totalEstimate)}</p>
          </button>
        ))}
      </div>
        {selections.length > 0 && (
        <p className="mt-2 text-[10px] text-muted-foreground">
          {selections.length} parts · use Next to review or change any step.
        </p>
      )}
    </div>
  );
}
