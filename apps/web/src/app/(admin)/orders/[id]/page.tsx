"use client";

import { use, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { OrderDetailWorkspace } from "@/components/orders/order-detail-workspace";
import {
  updateCommerceOrderStatus,
  useCommerceOrder,
} from "@/lib/api/use-commerce-orders";
import type { OrderStatus } from "@/lib/mock-data/orders";
import { useOrderStore } from "@/lib/store/order-store";

type Props = {
  params: Promise<{ id: string }>;
};

export default function OrderDetailPage({ params }: Props) {
  const { id } = use(params);
  const { order, loading, error, refetch } = useCommerceOrder(id);
  const setOrders = useOrderStore((s) => s.setOrders);

  useEffect(() => {
    if (!order) return;
    const current = useOrderStore.getState().orders;
    const exists = current.some((o) => o.id === order.id);
    setOrders(exists ? current.map((o) => (o.id === order.id ? order : o)) : [order, ...current]);
  }, [order, setOrders]);

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "commerce-order-detail-api" });
    }
  }, [error]);

  const handleStatusChange = useCallback(
    async (orderId: string, status: OrderStatus) => {
      try {
        const updated = await updateCommerceOrderStatus(orderId, status);
        const current = useOrderStore.getState().orders;
        setOrders(current.map((o) => (o.id === orderId ? updated : o)));
        await refetch();
        toast.success(`Order updated to ${status}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Status update failed");
      }
    },
    [refetch, setOrders],
  );

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <OrderDetailWorkspace
        orderId={id}
        order={order}
        loading={loading}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
