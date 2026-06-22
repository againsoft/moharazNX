"use client";

import Link from "next/link";
import { AlertTriangle, Sparkles } from "lucide-react";
import type { TimelineAiSummary } from "@/lib/timeline/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** AI Timeline Summary Panel */
export function TimelineAiSummaryPanel({ summary }: { summary: TimelineAiSummary }) {
  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-900 dark:bg-violet-950/20">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" aria-hidden />
          <h3 className="text-sm font-semibold">Daily Summary</h3>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{summary.dailySummary}</p>
      </section>

      <section className="rounded-lg border border-input bg-card p-4">
        <h3 className="text-sm font-semibold">Weekly Summary</h3>
        <p className="mt-2 text-sm text-muted-foreground">{summary.weeklySummary}</p>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Risk Indicators</h3>
        <ul className="space-y-2">
          {summary.riskIndicators.map((risk) => (
            <li
              key={risk.id}
              className={cn(
                "flex gap-2 rounded-lg border px-3 py-2.5",
                risk.severity === "critical" && "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20",
                risk.severity === "warning" && "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30",
                risk.severity === "info" && "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20",
              )}
            >
              <AlertTriangle
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  risk.severity === "critical" && "text-red-600",
                  risk.severity === "warning" && "text-amber-600",
                  risk.severity === "info" && "text-blue-600",
                )}
                aria-hidden
              />
              <div>
                <Badge variant="outline" className="text-[9px] capitalize">
                  {risk.severity}
                </Badge>
                <p className="mt-1 text-sm font-medium">{risk.title}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Recommendations</h3>
        <ul className="space-y-2">
          {summary.recommendations.map((rec) => (
            <li key={rec.id} className="rounded-lg border border-input px-3 py-2.5">
              <p className="text-sm font-medium">{rec.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{rec.action}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-[11px] text-muted-foreground">
        AI summaries are advisory only — generated from logged activity events.{" "}
        <Link href="/hr/ai/insights" className="text-primary hover:underline">
          Open AI insights
        </Link>
      </p>
    </div>
  );
}
