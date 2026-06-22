"use client";

import { use, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { OrderRefundDetail } from "@/components/orders/refunds-grid";
import {
  updateCommerceRefundStatus,
  useCommerceRefund,
} from "@/lib/api/use-commerce-refunds";
import type { RefundStatus } from "@/lib/mock-data/order-modules";

type Props = { params: Promise<{ id: string }> };

export default function OrderRefundDetailPage({ params }: Props) {
  const { id } = use(params);
  const { refundRow, notes, loading, error, refetch } = useCommerceRefund(id);

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "commerce-refund-detail-api" });
    }
  }, [error]);

  const handleStatusChange = useCallback(
    async (refundId: string, nextStatus: RefundStatus) => {
      try {
        await updateCommerceRefundStatus(refundId, nextStatus);
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
      <div className="mb-1 shrink-0">
        <p className="page-subtitle">MoharazNX › Orders › Refunds</p>
      </div>
      <OrderRefundDetail
        refundRow={refundRow}
        notes={notes}
        loading={loading}
        error={error}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
