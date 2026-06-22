"use client";

import { Suspense } from "react";
import { AlertTriangle } from "lucide-react";
import { LowStockAlerts } from "@/components/inventory/low-stock-alerts";

function AlertsContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Inventory › Low Stock Alerts</p>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h1 className="page-title">Low Stock Alerts</h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Alert rules, reorder thresholds, and auto-PO triggers — manage when and how the system responds to low inventory.
          </p>
        </div>
      </div>
      <LowStockAlerts />
    </div>
  );
}

export default function AlertsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <AlertsContent />
      </Suspense>
    </div>
  );
}
