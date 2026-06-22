"use client";

import { AbandonedCartsGrid } from "@/components/orders/abandoned-carts-grid";

export default function AbandonedCartsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 mb-1">
        <p className="page-subtitle">MoharazNX › Orders</p>
        <h1 className="page-title">Abandoned Carts</h1>
      </div>
      <AbandonedCartsGrid className="min-h-0 flex-1" />
    </div>
  );
}
