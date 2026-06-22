"use client";

import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { evaluateBuildCompatibility } from "@/lib/builder/compatibility-filter";
import { compatibilityRulesSeed } from "@/lib/mock-data/compatibility-rules";
import { cn } from "@/lib/utils";
import { usePcBuilderStore } from "@/lib/store/pc-builder-store";
import { Badge } from "@/components/ui/badge";

type Props = { className?: string };

export function BuilderCompatibilityBanner({ className }: Props) {
  const selections = usePcBuilderStore((s) => s.selections);
  const details = useMemo(
    () => evaluateBuildCompatibility(selections, compatibilityRulesSeed),
    [selections],
  );

  if (selections.length < 2) return null;

  const status = details.status;
  const Icon = status === "compatible" ? CheckCircle2 : status === "warning" ? AlertTriangle : Info;

  const variant = status === "compatible" ? "success" : status === "warning" ? "warning" : "outline";

  const topMessages = details.results
    .filter((r) => r.status !== "compatible")
    .slice(0, 2)
    .map((r) => r.message);

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        status === "compatible" && "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/30",
        status === "warning" && "border-amber-200 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/30",
        status === "incompatible" && "border-red-200 bg-red-50/60 dark:border-red-900/50 dark:bg-red-950/30",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Icon className={cn("h-4 w-4", status === "compatible" && "text-emerald-600", status === "warning" && "text-amber-600", status === "incompatible" && "text-red-600")} />
        <Badge variant={variant} className="capitalize">{status}</Badge>
        <span className="text-xs text-muted-foreground">
          {status === "compatible"
            ? "All compatibility checks passed"
            : topMessages[0] ?? "Review component selections"}
        </span>
      </div>
      {topMessages.length > 1 && (
        <p className="mt-1 text-[11px] text-muted-foreground">{topMessages[1]}</p>
      )}
    </div>
  );
}
