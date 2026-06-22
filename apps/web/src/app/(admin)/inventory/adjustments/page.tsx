"use client";

import { Suspense } from "react";
import { ClipboardList } from "lucide-react";
import { AdjustmentManager } from "@/components/inventory/adjustment-manager";

function AdjustmentsContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Inventory › Adjustments</p>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-indigo-600" />
            <h1 className="page-title">Adjustments</h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Stock adjustment log — variance corrections, damage write-offs, and cycle count reconciliations with approval workflow.
          </p>
        </div>
      </div>
      <AdjustmentManager />
    </div>
  );
}

export default function AdjustmentsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <AdjustmentsContent />
      </Suspense>
    </div>
  );
}
