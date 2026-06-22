"use client";

import { Suspense, useEffect } from "react";
import { RefreshCw, Warehouse } from "lucide-react";
import { toast } from "sonner";
import { WarehouseManager } from "@/components/inventory/warehouse-manager";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import { useInventoryWarehouses } from "@/lib/api/use-inventory";
import { cn } from "@/lib/utils";

function WarehousesContent() {
  const { warehouses, total, loading, error, refetch } = useInventoryWarehouses();

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "inventory-warehouses-api" });
    }
  }, [error]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Inventory › Warehouses & Locations</p>
          <div className="flex items-center gap-2">
            <Warehouse className="h-5 w-5 text-indigo-600" />
            <h1 className="page-title">
              Warehouses & Locations
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({loading ? "…" : total.toLocaleString()})
              </span>
            </h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Warehouse profiles, zone matrix, bin occupancy, and capacity planning — across all storage locations.
          </p>
          <div className="mt-1.5">
            <ApiConnectionBadge loading={loading} error={error} productCount={total} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>
      <WarehouseManager warehouses={warehouses} loading={loading} />
    </div>
  );
}

export default function WarehousesPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <WarehousesContent />
      </Suspense>
    </div>
  );
}
