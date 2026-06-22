"use client";

import { Suspense, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { OrderGrid } from "@/components/orders/order-grid";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import {
  updateCommerceOrderStatus,
  useCommerceOrders,
} from "@/lib/api/use-commerce-orders";
import type { OrderStatus } from "@/lib/mock-data/orders";
import { useOrderStore } from "@/lib/store/order-store";
import { cn } from "@/lib/utils";

function AllOrdersContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "all";
  const { orders, total, loading, error, refetch } = useCommerceOrders();
  const setOrders = useOrderStore((s) => s.setOrders);

  useEffect(() => {
    if (orders.length) setOrders(orders);
  }, [orders, setOrders]);

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "commerce-orders-api" });
    }
  }, [error]);

  const handleStatusChange = useCallback(
    async (id: string, nextStatus: OrderStatus) => {
      try {
        const updated = await updateCommerceOrderStatus(id, nextStatus);
        setOrders(orders.map((o) => (o.id === id ? updated : o)));
        await refetch();
        toast.success(`Order updated to ${nextStatus}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Status update failed");
      }
    },
    [orders, refetch, setOrders],
  );

  return (
    <>
      <div className="shrink-0 mb-1 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Orders</p>
          <h1 className="page-title">
            Orders
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({loading ? "…" : total.toLocaleString()})
            </span>
          </h1>
          <div className="mt-1.5">
            <ApiConnectionBadge loading={loading} error={error} productCount={total} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>
      <OrderGrid
        className="min-h-0 flex-1"
        initialStatus={status}
        orders={orders}
        loading={loading}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}

export default function AllOrdersPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<div className="min-h-0 flex-1 rounded-lg border border-input bg-muted/20" />}>
        <AllOrdersContent />
      </Suspense>
    </div>
  );
}
