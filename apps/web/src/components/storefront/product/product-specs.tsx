import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProductSpecGroup } from "@/lib/mock-data/storefront-product";

type ProductSpecsProps = {
  specs: ProductSpecGroup[];
  compact?: boolean;
};

export function ProductSpecs({ specs, compact }: ProductSpecsProps) {
  return (
    <div className={cn(compact ? "space-y-3" : "space-y-6")}>
      {specs.map((group) => (
        <div key={group.name}>
          <h3 className={cn("font-semibold", compact ? "mb-1.5 text-xs" : "mb-3 text-sm")}>
            {group.name}
          </h3>
          <dl
            className={cn(
              "divide-y divide-border/60 rounded-lg border border-border/60",
              compact && "text-xs",
            )}
          >
            {group.specs.map((spec) => (
              <div
                key={spec.label}
                className={cn(
                  "flex justify-between gap-3",
                  compact ? "px-2.5 py-2" : "px-4 py-2.5 text-sm",
                )}
              >
                <dt className="text-muted-foreground">{spec.label}</dt>
                <dd className="text-right font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

type ProductAiSummaryProps = {
  bullets: string[];
};

export function ProductAiSummary({ bullets }: ProductAiSummaryProps) {
  return (
    <div className="rounded-xl border border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-indigo-50/50 p-4 dark:border-violet-900/40 dark:from-violet-950/30 dark:to-indigo-950/20">
      <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
        <Sparkles className="h-3.5 w-3.5" />
        AI Summary
      </div>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-violet-500">•</span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
