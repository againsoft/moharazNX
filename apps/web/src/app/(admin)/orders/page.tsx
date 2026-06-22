"use client";

import { Suspense, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { OrdersDashboard } from "@/components/orders/orders-dashboard";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import { useCommerceOrders } from "@/lib/api/use-commerce-orders";
import { useOrderStore } from "@/lib/store/order-store";
import { cn } from "@/lib/utils";

function OrdersDashboardContent() {
  const { orders, total, loading, error, refetch } = useCommerceOrders();
  const setOrders = useOrderStore((s) => s.setOrders);

  useEffect(() => {
    if (orders.length) setOrders(orders);
  }, [orders, setOrders]);

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "commerce-orders-dashboard-api" });
    }
  }, [error]);

  return (
    <>
      <div className="shrink-0 mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Orders</p>
          <h1 className="page-title">Orders Dashboard</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Real-time operational overview · warehouse · delivery · support
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
      <OrdersDashboard orders={orders} loading={loading} />
    </>
  );
}

export default function OrdersDashboardPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={null}>
        <OrdersDashboardContent />
      </Suspense>
    </div>
  );
}
