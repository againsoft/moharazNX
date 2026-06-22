"use client";

import { useCallback, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ReturnsGrid } from "@/components/orders/returns-grid";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import {
  updateCommerceReturnStatus,
  useCommerceReturns,
} from "@/lib/api/use-commerce-returns";
import type { ReturnStatus } from "@/lib/mock-data/order-modules";
import { cn } from "@/lib/utils";

export default function ReturnsPage() {
  const { returns, total, loading, error, refetch } = useCommerceReturns();

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "commerce-returns-list-api" });
    }
  }, [error]);

  const handleStatusChange = useCallback(
    async (id: string, nextStatus: ReturnStatus) => {
      try {
        await updateCommerceReturnStatus(id, nextStatus);
        await refetch();
        toast.success("Return status updated");
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
          <h1 className="page-title">Returns</h1>
          <div className="mt-1.5">
            <ApiConnectionBadge loading={loading} error={error} productCount={total} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>
      <ReturnsGrid
        className="min-h-0 flex-1"
        returns={returns}
        loading={loading}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
