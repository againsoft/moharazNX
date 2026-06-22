"use client";

import { Suspense, useEffect } from "react";
import { Package, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { StockManagement } from "@/components/inventory/stock-management";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import { useInventoryStock, useInventoryWarehouses } from "@/lib/api/use-inventory";
import { cn } from "@/lib/utils";

function StockContent() {
  const { warehouses, loading: whLoading, error: whError, refetch: refetchWh } = useInventoryWarehouses();
  const { items, total, loading: stockLoading, error: stockError, refetch: refetchStock } = useInventoryStock();

  const loading = whLoading || stockLoading;
  const error = whError ?? stockError;

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "inventory-stock-api" });
    }
  }, [error]);

  const refetch = async () => {
    await Promise.all([refetchWh(), refetchStock()]);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Inventory › Stock Management</p>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            <h1 className="page-title">
              Stock Management
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({loading ? "…" : total.toLocaleString()})
              </span>
            </h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Full SKU ledger — on-hand, reserved, available, incoming, FIFO valuation, and reorder thresholds across all warehouses.
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
      <StockManagement items={items} warehouses={warehouses} loading={loading} />
    </div>
  );
}

export default function StockPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <StockContent />
      </Suspense>
    </div>
  );
}
