"use client";

import { OrderActivitiesGrid } from "@/components/orders/order-activities-grid";

export default function OrderActivitiesPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 mb-1">
        <p className="page-subtitle">MoharazNX › Orders</p>
        <h1 className="page-title">Activities</h1>
      </div>
      <OrderActivitiesGrid className="min-h-0 flex-1" />
    </div>
  );
}
