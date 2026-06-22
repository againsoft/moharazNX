"use client";

import { Suspense } from "react";
import { ScanLine } from "lucide-react";
import { CycleCount } from "@/components/inventory/cycle-count";

function CycleCountContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Inventory › Cycle Count</p>
          <div className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-indigo-600" />
            <h1 className="page-title">Cycle Count</h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Schedule and manage physical inventory counts — count lines, variance reconciliation, and approval workflow.
          </p>
        </div>
      </div>
      <CycleCount />
    </div>
  );
}

export default function CycleCountPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <CycleCountContent />
      </Suspense>
    </div>
  );
}
