"use client";

import { use } from "react";
import { OrderFormWorkspace } from "@/components/orders/create-order-workspace";

type Props = {
  params: Promise<{ id: string }>;
};

export default function EditOrderPage({ params }: Props) {
  const { id } = use(params);

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="mb-1 shrink-0">
        <p className="page-subtitle">MoharazNX › Orders</p>
        <h1 className="page-title">Edit Order</h1>
      </div>
      <OrderFormWorkspace orderId={id} className="min-h-0 flex-1" />
    </div>
  );
}
