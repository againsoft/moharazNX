"use client";

import { OrderReportsDashboard } from "@/components/orders/order-reports-dashboard";

export default function OrderReportsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 mb-1">
        <p className="page-subtitle">MoharazNX › Orders</p>
        <h1 className="page-title">Reports</h1>
      </div>
      <OrderReportsDashboard />
    </div>
  );
}
