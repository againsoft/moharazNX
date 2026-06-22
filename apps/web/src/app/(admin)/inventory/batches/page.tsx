"use client";

import { Suspense } from "react";
import { Calendar } from "lucide-react";
import { BatchExpiry } from "@/components/inventory/batch-expiry";

function BatchesContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Inventory › Batch & Expiry</p>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <h1 className="page-title">Batch & Expiry</h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Lot tracking, expiry dates, quarantine management, and FEFO (First Expiry First Out) picking enforcement.
          </p>
        </div>
      </div>
      <BatchExpiry />
    </div>
  );
}

export default function BatchesPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <BatchesContent />
      </Suspense>
    </div>
  );
}
