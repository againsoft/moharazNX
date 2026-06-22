"use client";

import {
  AlertTriangle,
  Package,
  Sparkles,
  TrendingUp,
  Truck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type { OrderAiInsights } from "@/lib/mock-data/orders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  insights: OrderAiInsights;
  className?: string;
};

export function OrderAiInsightsPanel({ insights, className }: Props) {
  const riskColor =
    insights.riskLevel === "low"
      ? "text-emerald-600 dark:text-emerald-400"
      : insights.riskLevel === "medium"
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  return (
    <div className={cn("rounded-lg border border-primary/25 bg-gradient-to-br from-primary/8 to-transparent", className)}>
      <div className="flex items-center gap-2 border-b border-primary/15 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">AI Insights</p>
          <p className="text-[10px] text-muted-foreground">Chief AI Agent · mock analysis</p>
        </div>
        <Badge variant="outline" className={cn("capitalize text-[10px]", riskColor)}>
          {insights.riskLevel} risk
        </Badge>
      </div>

      <div className="space-y-4 p-4">
        <InsightBlock icon={Package} title="Order summary" text={insights.orderSummary} />
        <InsightBlock icon={User} title="Customer summary" text={insights.customerSummary} />

        <div className="rounded-md border border-input bg-background/60 p-3">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold">Fraud detection</p>
            <span className={cn("ml-auto text-sm font-bold tabular-nums", riskColor)}>
              {insights.riskScore}/100
            </span>
          </div>
          <ul className="space-y-1">
            {insights.riskReasons.map((r) => (
              <li key={r} className="text-[11px] text-muted-foreground before:mr-1.5 before:content-['•']">
                {r}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Metric label="Delivery success" value={`${insights.deliveryPrediction.success}%`} icon={Truck} />
          <Metric label="Delay risk" value={insights.deliveryPrediction.delayRisk} />
          <Metric label="Return risk" value={insights.deliveryPrediction.returnRisk} />
        </div>

        <div>
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold">Upsell suggestions</p>
          </div>
          <ul className="space-y-1.5">
            {insights.upsellSuggestions.map((u) => (
              <li
                key={u.name}
                className="flex items-start justify-between gap-2 rounded-md border border-input bg-background/50 px-2.5 py-2 text-[11px]"
              >
                <span className="font-medium">{u.name}</span>
                <span className="text-right text-muted-foreground">{u.reason}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Retention probability</span>
          <span className="font-semibold tabular-nums">{insights.retentionProbability}%</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.success("AI summary copied")}>
            Copy summary
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => toast.info("Regenerating insights…")}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}

function InsightBlock({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-xs font-semibold">{title}</p>
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-md border border-input bg-background/50 p-2 text-center">
      {Icon && <Icon className="mx-auto mb-1 h-3.5 w-3.5 text-muted-foreground" />}
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold">{value}</p>
    </div>
  );
}
