"use client";

import { useMemo } from "react";
import { Bot, Lightbulb, Zap } from "lucide-react";
import { generateSmartRecommendations } from "@/lib/builder/recommendations/engine";
import { evaluateBuildCompatibility } from "@/lib/builder/compatibility-filter";
import { compatibilityRulesSeed } from "@/lib/mock-data/compatibility-rules";
import { usePcBuilderStore } from "@/lib/store/pc-builder-store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = { className?: string };

export function BuilderLiveInsights({ className }: Props) {
  const selections = usePcBuilderStore((s) => s.selections);

  const insights = useMemo(() => {
    if (selections.length === 0) return null;
    const recs = generateSmartRecommendations(selections);
    const compat = evaluateBuildCompatibility(selections, compatibilityRulesSeed);
    return {
      messages: compat.results.slice(0, 3).map((r) => r.message),
      tips: recs.recommendations.slice(0, 3),
      status: compat.status,
    };
  }, [selections]);

  if (!insights) {
    return (
      <div className={cn("rounded-xl border border-dashed border-violet-200 bg-violet-50/30 p-3 dark:border-violet-900/40 dark:bg-violet-950/20", className)}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Bot className="h-4 w-4 text-violet-600" />
          AI insights — parts select করলে tips দেখাবে
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/60 to-background p-3 dark:border-violet-900/50 dark:from-violet-950/30", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-violet-600" />
          <h3 className="text-xs font-semibold">AI Live Insights</h3>
        </div>
        <Badge variant="secondary" className="text-[9px] capitalize">{insights.status}</Badge>
      </div>

      {insights.messages.length > 0 && (
        <ul className="mt-2 space-y-1">
          {insights.messages.map((msg, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
              <Zap className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
              {msg}
            </li>
          ))}
        </ul>
      )}

      {insights.tips.length > 0 && (
        <ul className="mt-2 space-y-1.5 border-t border-violet-200/60 pt-2 dark:border-violet-900/40">
          {insights.tips.map((tip) => (
            <li key={tip.id} className="text-[10px]">
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Lightbulb className="h-3 w-3 text-violet-600" />
                {tip.title}
              </span>
              <span className="text-muted-foreground">{tip.description}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
