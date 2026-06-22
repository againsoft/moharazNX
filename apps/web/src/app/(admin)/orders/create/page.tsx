"use client";

import { CreateOrderWorkspace } from "@/components/orders/create-order-workspace";

export default function CreateOrderPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="mb-1 shrink-0">
        <p className="page-subtitle">MoharazNX › Orders</p>
        <h1 className="page-title">Create Order</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Add customer, products, shipping, and payment — save as draft or create live order
        </p>
      </div>
      <CreateOrderWorkspace className="min-h-0 flex-1" />
    </div>
  );
}
