"use client";

import { use, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { OrderReturnDetail } from "@/components/orders/returns-grid";
import {
  updateCommerceReturnStatus,
  useCommerceReturn,
} from "@/lib/api/use-commerce-returns";
import type { ReturnStatus } from "@/lib/mock-data/order-modules";

type Props = { params: Promise<{ id: string }> };

export default function OrderReturnDetailPage({ params }: Props) {
  const { id } = use(params);
  const { returnRow, notes, loading, error, refetch } = useCommerceReturn(id);

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "commerce-return-detail-api" });
    }
  }, [error]);

  const handleStatusChange = useCallback(
    async (returnId: string, nextStatus: ReturnStatus) => {
      try {
        await updateCommerceReturnStatus(returnId, nextStatus);
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
      <div className="mb-1 shrink-0">
        <p className="page-subtitle">MoharazNX › Orders › Returns</p>
      </div>
      <OrderReturnDetail
        returnRow={returnRow}
        notes={notes}
        loading={loading}
        error={error}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
