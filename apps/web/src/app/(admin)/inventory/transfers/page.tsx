"use client";

import { Suspense } from "react";
import { Truck } from "lucide-react";
import { TransferManager } from "@/components/inventory/transfer-manager";

function TransfersContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Inventory › Transfers</p>
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-indigo-600" />
            <h1 className="page-title">Transfers</h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Inter-warehouse stock transfers — draft, approve, dispatch, and receive across all locations.
          </p>
        </div>
      </div>
      <TransferManager />
    </div>
  );
}

export default function TransfersPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <TransfersContent />
      </Suspense>
    </div>
  );
}
