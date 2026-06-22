"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Clock, ListChecks, Plus, ScanLine } from "lucide-react";
import { toast } from "sonner";
import {
  cycleCountsSeed,
  CYCLE_COUNT_STATUS_LABELS,
  type CycleCountLine,
  type CycleCountSession,
  type CycleCountStatus,
} from "@/lib/mock-data/inventory";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function statusVariant(s: CycleCountStatus) {
  if (s === "closed") return "success" as const;
  if (s === "pending_review") return "warning" as const;
  if (s === "in_progress") return "secondary" as const;
  return "muted" as const;
}

function VarianceCell({ line }: { line: CycleCountLine }) {
  if (line.countedQty === null || line.variance === null) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }
  if (line.variance === 0) {
    return <span className="text-emerald-600 text-xs font-medium">✓ Match</span>;
  }
  return (
    <span className={cn("text-xs font-semibold", line.variance < 0 ? "text-red-600" : "text-amber-600")}>
      {line.variance > 0 ? "+" : ""}
      {line.variance}
    </span>
  );
}

function SessionCard({
  session,
  expanded,
  onToggle,
}: {
  session: CycleCountSession;
  expanded: boolean;
  onToggle: () => void;
}) {
  const totalLines = session.lines.length;
  const countedLines = session.lines.filter((l) => l.countedQty !== null).length;
  const variances = session.lines.filter((l) => l.variance !== null && l.variance !== 0).length;
  const pct = totalLines > 0 ? Math.round((countedLines / totalLines) * 100) : 0;

  return (
    <div className="rounded-xl border border-input bg-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30"
      >
        <div className="shrink-0">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold">{session.id}</span>
            <Badge variant={statusVariant(session.status)} className="text-[10px]">
              {CYCLE_COUNT_STATUS_LABELS[session.status]}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {session.warehouse}{session.zone && ` · ${session.zone}`} · {session.scheduledDate}
            {session.countedBy && ` · by ${session.countedBy}`}
          </p>
        </div>

        <div className="shrink-0 text-right hidden sm:block">
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-muted-foreground w-16">{countedLines}/{totalLines} lines</span>
          </div>
          {variances > 0 && (
            <p className="text-[10px] text-amber-600 text-right mt-0.5">{variances} variance{variances > 1 ? "s" : ""}</p>
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-input">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">SKU</th>
                  <th className="px-3 py-2 text-left font-medium">Product</th>
                  <th className="px-3 py-2 text-left font-medium">Location</th>
                  <th className="px-3 py-2 text-right font-medium">System qty</th>
                  <th className="px-3 py-2 text-right font-medium">Counted</th>
                  <th className="px-3 py-2 text-right font-medium">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {session.lines.map((line) => (
                  <tr key={line.sku} className={cn("hover:bg-muted/20", line.variance !== null && line.variance !== 0 && "bg-amber-50/40 dark:bg-amber-950/10")}>
                    <td className="px-3 py-2 font-mono">{line.sku}</td>
                    <td className="px-3 py-2 font-medium">{line.product}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{line.location}</td>
                    <td className="px-3 py-2 text-right">{line.systemQty}</td>
                    <td className="px-3 py-2 text-right">
                      {line.countedQty !== null ? line.countedQty : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <VarianceCell line={line} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 px-4 py-3 border-t border-input">
            {session.status === "pending_review" && (
              <>
                <Button size="sm" onClick={() => toast.success("Count approved (mock)")}>
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve & post
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast.info("Re-count flagged — prototype")}>
                  Request re-count
                </Button>
              </>
            )}
            {session.status === "in_progress" && (
              <Button size="sm" onClick={() => toast.info("Submit count — prototype")}>
                <ListChecks className="mr-1.5 h-3.5 w-3.5" /> Submit count
              </Button>
            )}
            {session.status === "scheduled" && (
              <Button size="sm" onClick={() => toast.info("Start count — prototype")}>
                <ScanLine className="mr-1.5 h-3.5 w-3.5" /> Start counting
              </Button>
            )}
            {session.status === "closed" && (
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Closed by {session.approvedBy} · adjustments posted</span>
              </div>
            )}
            <Button size="sm" variant="ghost" className="ml-auto" onClick={() => toast.info("Print sheet — prototype")}>
              Print sheet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CycleCount() {
  const [expandedId, setExpandedId] = useState<string | null>(cycleCountsSeed[0]?.id ?? null);

  const pending = cycleCountsSeed.filter((s) => s.status === "pending_review").length;
  const inProgress = cycleCountsSeed.filter((s) => s.status === "in_progress").length;
  const scheduled = cycleCountsSeed.filter((s) => s.status === "scheduled").length;
  const totalVariances = cycleCountsSeed.flatMap((s) => s.lines).filter((l) => l.variance !== null && l.variance !== 0).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Pending review", value: pending, warn: pending > 0 },
          { label: "In progress", value: inProgress },
          { label: "Scheduled", value: scheduled },
          { label: "Open variances", value: totalVariances, warn: totalVariances > 0 },
        ].map((kpi) => (
          <div key={kpi.label} className={cn("rounded-lg border border-input bg-card p-3 shadow-sm", kpi.warn && "border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20")}>
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <p className={cn("mt-0.5 text-xl font-semibold", kpi.warn && "text-amber-600")}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Cycle count sessions — expand to view / post count lines
        </span>
        <Button size="sm" className="ml-auto" onClick={() => toast.info("Schedule count — prototype")}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Schedule count
        </Button>
      </div>

      <div className="space-y-3">
        {cycleCountsSeed.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            expanded={expandedId === session.id}
            onToggle={() => setExpandedId(expandedId === session.id ? null : session.id)}
          />
        ))}
      </div>
    </div>
  );
}
