"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { toast } from "sonner";
import { PAYMENT_TXN_STATUS_LABELS, type OrderPayment, type PaymentTxnStatus } from "@/lib/mock-data/order-modules";
import { useOrderModulesStore } from "@/lib/store/order-modules-store";
import { formatCurrency } from "@/lib/utils";
import { Select } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";
import { OrderSubGridShell } from "@/components/orders/order-sub-grid-shell";

const FILTER_DEFS = [
  { key: "search", label: "Search", hint: "Transaction ID, order #, customer", defaultVisible: true },
  { key: "status", label: "Payment Status", hint: "Successful / Pending / Failed / Refunded", defaultVisible: true },
  { key: "gateway", label: "Gateway", hint: "Payment gateway filter", defaultVisible: false },
];
const COLUMN_META = [
  { key: "method", label: "Method", hint: "Payment method", defaultVisible: true },
  { key: "gateway", label: "Gateway", hint: "Payment gateway", defaultVisible: true },
  { key: "createdAt", label: "Date", hint: "Transaction date", defaultVisible: true },
];
const DEFAULT_FILTERS = { search: "", status: "all", gateway: "all" };

type Props = { className?: string };

export function PaymentsGrid({ className }: Props) {
  const router = useRouter();
  const payments = useOrderModulesStore((s) => s.payments);
  const updatePaymentStatus = useOrderModulesStore((s) => s.updatePaymentStatus);

  const StatusCell = useCallback(({ data }: ICellRendererParams<OrderPayment>) => {
    if (!data) return null;
    return (
      <Select className="h-7 min-w-[100px] border-0 bg-transparent text-[11px] shadow-none" value={data.status}
        onChange={(e) => { updatePaymentStatus(data.id, e.target.value as PaymentTxnStatus); toast.success(`${data.transactionId} updated`); }}
        onClick={(e) => e.stopPropagation()}>
        {Object.entries(PAYMENT_TXN_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </Select>
    );
  }, [updatePaymentStatus]);

  const columnDefs = useMemo<ColDef<OrderPayment>[]>(() => [
    { field: "transactionId", headerName: "Transaction ID", width: 120 },
    { field: "orderNumber", headerName: "Order #", width: 100, cellRenderer: (p: ICellRendererParams<OrderPayment>) => p.data ? (
      <button type="button" className="text-xs text-primary hover:underline" onClick={() => router.push(`/orders/${p.data!.orderId}`)}>{p.data.orderNumber}</button>
    ) : null },
    { field: "customerName", headerName: "Customer", width: 130 },
    { colId: "method", field: "method", headerName: "Method", width: 80 },
    { colId: "gateway", field: "gateway", headerName: "Gateway", width: 100 },
    { field: "amount", headerName: "Amount", width: 100, valueFormatter: (p) => formatCurrency(p.value ?? 0) },
    { colId: "status", headerName: "Status", width: 110, cellRenderer: StatusCell },
    { colId: "createdAt", headerName: "Date", width: 140, valueGetter: (p) => p.data ? new Date(p.data.createdAt).toLocaleString() : "" },
    { colId: "activity", headerName: "Activity", width: 72, pinned: "right", sortable: false, cellRenderer: (p: ICellRendererParams<OrderPayment>) => p.data ? (
      <ActivityTriggerButton entity={{ type: "payment", id: p.data.id, label: p.data.transactionId, subtitle: p.data.orderNumber }} />
    ) : null },
  ], [StatusCell, router]);

  const gateways = [...new Set(payments.map((p) => p.gateway))];

  return (
    <OrderSubGridShell
      className={className}
      rowData={payments}
      columnDefs={columnDefs}
      filterDefs={FILTER_DEFS}
      columnDefs_meta={COLUMN_META}
      defaultFilters={DEFAULT_FILTERS}
      filterFn={(r, f) => {
        const q = f.search.toLowerCase().trim();
        if (q && !r.transactionId.toLowerCase().includes(q) && !r.orderNumber.toLowerCase().includes(q) && !r.customerName.toLowerCase().includes(q)) return false;
        if (f.status !== "all" && r.status !== f.status) return false;
        if (f.gateway !== "all" && r.gateway !== f.gateway) return false;
        return true;
      }}
      filterWidgets={(filters, setFilters, visible) => (
        <>
          {visible.search && <Input placeholder="Search transaction, order…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="max-w-[200px]" />}
          {visible.status && (
            <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-[140px]">
              <option value="all">All statuses</option>
              {Object.entries(PAYMENT_TXN_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          )}
          {visible.gateway && (
            <Select value={filters.gateway} onChange={(e) => setFilters({ ...filters, gateway: e.target.value })} className="w-[130px]">
              <option value="all">All gateways</option>
              {gateways.map((g) => <option key={g} value={g}>{g}</option>)}
            </Select>
          )}
        </>
      )}
    />
  );
}
