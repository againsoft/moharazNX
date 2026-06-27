"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { toast } from "sonner";
import { SHIPMENT_STATUS_LABELS, type OrderShipment, type ShipmentStatus } from "@/lib/mock-data/order-modules";
import { useOrderModulesStore } from "@/lib/store/order-modules-store";
import { formatCurrency } from "@/lib/utils";
import { Select } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";
import { OrderSubGridShell } from "@/components/orders/order-sub-grid-shell";

const FILTER_DEFS = [
  { key: "search", label: "Search", hint: "Shipment ID, tracking #, order", defaultVisible: true },
  { key: "status", label: "Shipment Status", hint: "Pending → Packed → Shipped → Delivered", defaultVisible: true },
  { key: "courier", label: "Courier", hint: "Pathao, RedX, Steadfast", defaultVisible: false },
];
const COLUMN_META = [
  { key: "courier", label: "Courier", hint: "Courier company", defaultVisible: true },
  { key: "trackingNumber", label: "Tracking", hint: "Tracking number", defaultVisible: true },
  { key: "shippingCost", label: "Cost", hint: "Shipping cost", defaultVisible: false },
  { key: "branch", label: "Branch", hint: "Fulfillment branch", defaultVisible: true },
  { key: "shippedAt", label: "Shipped", hint: "Ship date", defaultVisible: true },
  { key: "deliveredAt", label: "Delivered", hint: "Delivery date", defaultVisible: true },
];
const DEFAULT_FILTERS = { search: "", status: "all", courier: "all" };

type Props = { className?: string };

export function ShipmentsGrid({ className }: Props) {
  const router = useRouter();
  const shipments = useOrderModulesStore((s) => s.shipments);
  const updateShipmentStatus = useOrderModulesStore((s) => s.updateShipmentStatus);

  const StatusCell = useCallback(({ data }: ICellRendererParams<OrderShipment>) => {
    if (!data) return null;
    return (
      <Select className="h-7 min-w-[100px] border-0 bg-transparent text-[11px] shadow-none" value={data.status}
        onChange={(e) => { updateShipmentStatus(data.id, e.target.value as ShipmentStatus); toast.success(`${data.shipmentId} updated`); }}
        onClick={(e) => e.stopPropagation()}>
        {Object.entries(SHIPMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </Select>
    );
  }, [updateShipmentStatus]);

  const columnDefs = useMemo<ColDef<OrderShipment>[]>(() => [
    { field: "shipmentId", headerName: "Shipment ID", width: 100 },
    { field: "orderNumber", headerName: "Order #", width: 100, cellRenderer: (p: ICellRendererParams<OrderShipment>) => p.data ? (
      <button type="button" className="text-xs text-primary hover:underline" onClick={() => router.push(`/orders/${p.data!.orderId}`)}>{p.data.orderNumber}</button>
    ) : null },
    { field: "customerName", headerName: "Customer", width: 130 },
    { colId: "courier", field: "courier", headerName: "Courier", width: 90 },
    { colId: "trackingNumber", field: "trackingNumber", headerName: "Tracking", width: 110 },
    { colId: "status", headerName: "Status", width: 110, cellRenderer: StatusCell },
    { colId: "shippingCost", field: "shippingCost", headerName: "Cost", width: 80, valueFormatter: (p) => formatCurrency(p.value ?? 0) },
    { colId: "branch", field: "branch", headerName: "Branch", width: 100 },
    { colId: "shippedAt", headerName: "Shipped", width: 92, valueGetter: (p) => p.data?.shippedAt ? new Date(p.data.shippedAt).toLocaleDateString() : "—" },
    { colId: "deliveredAt", headerName: "Delivered", width: 92, valueGetter: (p) => p.data?.deliveredAt ? new Date(p.data.deliveredAt).toLocaleDateString() : "—" },
    { colId: "activity", headerName: "Activity", width: 72, pinned: "right", sortable: false, cellRenderer: (p: ICellRendererParams<OrderShipment>) => p.data ? (
      <ActivityTriggerButton entity={{ type: "shipment", id: p.data.id, label: p.data.shipmentId, subtitle: p.data.trackingNumber }} />
    ) : null },
  ], [StatusCell, router]);

  const couriers = [...new Set(shipments.map((s) => s.courier))];

  return (
    <OrderSubGridShell
      className={className}
      rowData={shipments}
      columnDefs={columnDefs}
      filterDefs={FILTER_DEFS}
      columnDefs_meta={COLUMN_META}
      defaultFilters={DEFAULT_FILTERS}
      filterFn={(r, f) => {
        const q = f.search.toLowerCase().trim();
        if (q && !r.shipmentId.toLowerCase().includes(q) && !r.trackingNumber.toLowerCase().includes(q) && !r.orderNumber.toLowerCase().includes(q)) return false;
        if (f.status !== "all" && r.status !== f.status) return false;
        if (f.courier !== "all" && r.courier !== f.courier) return false;
        return true;
      }}
      filterWidgets={(filters, setFilters, visible) => (
        <>
          {visible.search && <Input placeholder="Search shipment, tracking…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="max-w-[200px]" />}
          {visible.status && (
            <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-[140px]">
              <option value="all">All statuses</option>
              {Object.entries(SHIPMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          )}
          {visible.courier && (
            <Select value={filters.courier} onChange={(e) => setFilters({ ...filters, courier: e.target.value })} className="w-[120px]">
              <option value="all">All couriers</option>
              {couriers.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          )}
        </>
      )}
    />
  );
}
