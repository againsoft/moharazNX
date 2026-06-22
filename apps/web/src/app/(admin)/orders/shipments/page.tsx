"use client";

import { ShipmentsGrid } from "@/components/orders/shipments-grid";

export default function ShipmentsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 mb-1">
        <p className="page-subtitle">MoharazNX › Orders</p>
        <h1 className="page-title">Shipments</h1>
      </div>
      <ShipmentsGrid className="min-h-0 flex-1" />
    </div>
  );
}
