"use client";

import { Suspense } from "react";
import { ShoppingCart } from "lucide-react";
import { PurchaseOrders } from "@/components/inventory/purchase-orders";

function PurchaseOrdersContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Inventory › Purchase Orders</p>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-indigo-600" />
            <h1 className="page-title">Purchase Orders</h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Manage purchase orders from draft to receipt — send to suppliers, track delivery, and update stock on arrival.
          </p>
        </div>
      </div>
      <PurchaseOrders />
    </div>
  );
}

export default function PurchaseOrdersPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <PurchaseOrdersContent />
      </Suspense>
    </div>
  );
}
