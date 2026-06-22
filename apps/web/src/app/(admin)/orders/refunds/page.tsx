"use client";

import { useCallback, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { RefundsGrid } from "@/components/orders/refunds-grid";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import {
  updateCommerceRefundStatus,
  useCommerceRefunds,
} from "@/lib/api/use-commerce-refunds";
import type { RefundStatus } from "@/lib/mock-data/order-modules";
import { cn } from "@/lib/utils";

export default function RefundsPage() {
  const { refunds, total, loading, error, refetch } = useCommerceRefunds();

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "commerce-refunds-list-api" });
    }
  }, [error]);

  const handleStatusChange = useCallback(
    async (id: string, nextStatus: RefundStatus) => {
      try {
        await updateCommerceRefundStatus(id, nextStatus);
        await refetch();
        toast.success("Refund status updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Status update failed");
      }
    },
    [refetch],
  );

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 mb-1 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Orders</p>
          <h1 className="page-title">Refunds</h1>
          <div className="mt-1.5">
            <ApiConnectionBadge loading={loading} error={error} productCount={total} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>
      <RefundsGrid
        className="min-h-0 flex-1"
        refunds={refunds}
        loading={loading}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
