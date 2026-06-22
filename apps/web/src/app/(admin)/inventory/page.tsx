"use client";

import { Warehouse } from "lucide-react";
import { InventoryDashboard } from "@/components/inventory/inventory-dashboard";

export default function InventoryPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0">
        <p className="page-subtitle">MoharazNX › Inventory</p>
        <div className="flex flex-wrap items-center gap-2">
          <Warehouse className="h-5 w-5 text-indigo-600" />
          <h1 className="page-title">Inventory</h1>
        </div>
        <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
          Stock levels, warehouses, transfers, adjustments, purchase orders, batch tracking — single ledger for every channel.
        </p>
      </div>

      <div className="mt-4 min-h-0 flex-1">
        <InventoryDashboard />
      </div>
    </div>
  );
}
