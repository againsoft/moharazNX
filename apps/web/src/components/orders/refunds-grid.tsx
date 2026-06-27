"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  REFUND_STATUS_LABELS,
  type OrderRefund,
  type RefundStatus,
} from "@/lib/mock-data/order-modules";
import { useOrderModulesStore } from "@/lib/store/order-modules-store";
import { formatCurrency } from "@/lib/utils";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";
import { OrderSubGridShell } from "@/components/orders/order-sub-grid-shell";

const FILTER_DEFS = [
  { key: "search", label: "Search", hint: "Refund ID, order #, customer", defaultVisible: true },
  { key: "status", label: "Refund Status", hint: "Pending / Approved / Completed", defaultVisible: true },
  { key: "method", label: "Method", hint: "bKash, Card, Nagad, COD", defaultVisible: false },
];
const COLUMN_META = [
  { key: "method", label: "Method", hint: "Refund method", defaultVisible: true },
  { key: "reason", label: "Reason", hint: "Refund reason", defaultVisible: true },
  { key: "approvedBy", label: "Approved By", hint: "Approver name", defaultVisible: true },
  { key: "createdAt", label: "Date", hint: "Request date", defaultVisible: true },
];
const DEFAULT_FILTERS = { search: "", status: "all", method: "all" };

type Props = {
  className?: string;
  refunds?: OrderRefund[];
  loading?: boolean;
  onStatusChange?: (id: string, status: RefundStatus) => void | Promise<void>;
};

export function RefundsGrid({
  className,
  refunds: refundsProp,
  loading = false,
  onStatusChange,
}: Props) {
  const router = useRouter();
  const canWrite = useAdminCanWrite();
  const storeRefunds = useOrderModulesStore((s) => s.refunds);
  const storeUpdateRefundStatus = useOrderModulesStore((s) => s.updateRefundStatus);
  const refunds = refundsProp ?? storeRefunds;

  const updateRefundStatus = useCallback(
    (id: string, status: RefundStatus) => {
      if (onStatusChange) {
        void onStatusChange(id, status);
        return;
      }
      storeUpdateRefundStatus(id, status);
    },
    [onStatusChange, storeUpdateRefundStatus],
  );

  const StatusCell = useCallback(
    ({ data }: ICellRendererParams<OrderRefund>) => {
      if (!data) return null;
      if (!canWrite) {
        return (
          <span className="text-[11px] font-medium capitalize">
            {REFUND_STATUS_LABELS[data.status]}
          </span>
        );
      }
      return (
        <Select
          className="h-7 min-w-[100px] border-0 bg-transparent text-[11px] shadow-none"
          value={data.status}
          onChange={(e) => {
            updateRefundStatus(data.id, e.target.value as RefundStatus);
            if (!onStatusChange) toast.success(`${data.refundId} updated`);
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {Object.entries(REFUND_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      );
    },
    [onStatusChange, updateRefundStatus, canWrite],
  );

  const columnDefs = useMemo<ColDef<OrderRefund>[]>(() => [
    { field: "refundId", headerName: "Refund ID", width: 100, pinned: "left" },
    {
      field: "orderNumber",
      headerName: "Order #",
      width: 100,
      cellRenderer: (p: ICellRendererParams<OrderRefund>) =>
        p.data ? (
          <button
            type="button"
            className="text-xs text-primary hover:underline"
            onClick={() => router.push(`/orders/${p.data!.orderId}`)}
          >
            {p.data.orderNumber}
          </button>
        ) : null,
    },
    { field: "customerName", headerName: "Customer", width: 130 },
    {
      field: "amount",
      headerName: "Amount",
      width: 100,
      valueFormatter: (p) => formatCurrency(p.value ?? 0),
    },
    { colId: "method", field: "method", headerName: "Method", width: 80 },
    { colId: "reason", field: "reason", headerName: "Reason", width: 200, tooltipField: "reason" },
    { colId: "status", headerName: "Status", width: 120, cellRenderer: StatusCell },
    {
      colId: "approvedBy",
      field: "approvedBy",
      headerName: "Approved By",
      width: 110,
      valueFormatter: (p) => p.value ?? "—",
    },
    {
      colId: "createdAt",
      headerName: "Date",
      width: 92,
      valueGetter: (p) => (p.data ? new Date(p.data.createdAt).toLocaleDateString() : ""),
    },
    {
      colId: "activity",
      headerName: "Activity",
      width: 72,
      pinned: "right",
      sortable: false,
      cellRenderer: (p: ICellRendererParams<OrderRefund>) =>
        p.data ? (
          <ActivityTriggerButton
            entity={{
              type: "order",
              id: p.data.orderId,
              label: p.data.refundId,
              subtitle: p.data.orderNumber,
            }}
          />
        ) : null,
    },
  ], [StatusCell, router]);

  const methods = [...new Set(refunds.map((r) => r.method))];

  return (
    <OrderSubGridShell
      className={className}
      rowData={refunds}
      columnDefs={columnDefs}
      filterDefs={FILTER_DEFS}
      columnDefs_meta={COLUMN_META}
      defaultFilters={DEFAULT_FILTERS}
      filterFn={(r, f) => {
        const q = f.search.toLowerCase().trim();
        if (
          q &&
          !r.refundId.toLowerCase().includes(q) &&
          !r.orderNumber.toLowerCase().includes(q) &&
          !r.customerName.toLowerCase().includes(q)
        ) {
          return false;
        }
        if (f.status !== "all" && r.status !== f.status) return false;
        if (f.method !== "all" && r.method !== f.method) return false;
        return true;
      }}
      filterWidgets={(filters, setFilters, visible) => (
        <>
          {visible.search && (
            <Input
              placeholder="Search refund, order…"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="max-w-[200px]"
            />
          )}
          {visible.status && (
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-[140px]"
            >
              <option value="all">All statuses</option>
              {Object.entries(REFUND_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          )}
          {visible.method && (
            <Select
              value={filters.method}
              onChange={(e) => setFilters({ ...filters, method: e.target.value })}
              className="w-[120px]"
            >
              <option value="all">All methods</option>
              {methods.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
          )}
        </>
      )}
      onRowClicked={(row) => router.push(`/orders/refunds/${row.id}`)}
      loading={loading}
    />
  );
}

type DetailProps = {
  refundRow: OrderRefund | null;
  notes: string | null;
  loading: boolean;
  error: string | null;
  onStatusChange?: (id: string, status: RefundStatus) => void | Promise<void>;
};

export function OrderRefundDetail({
  refundRow,
  notes,
  loading,
  error,
  onStatusChange,
}: DetailProps) {
  const storeUpdateRefundStatus = useOrderModulesStore((s) => s.updateRefundStatus);
  const canWrite = useAdminCanWrite();

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed p-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !refundRow) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">{error ?? "Refund not found"}</p>
        <Button variant="ghost" size="sm" asChild className="mt-2">
          <Link href="/orders/refunds">Back to refunds</Link>
        </Button>
      </div>
    );
  }

  const handleStatusChange = (status: RefundStatus) => {
    if (onStatusChange) {
      void onStatusChange(refundRow.id, status);
      return;
    }
    storeUpdateRefundStatus(refundRow.id, status);
    toast.success(`${refundRow.refundId} updated`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 h-8">
            <Link href="/orders/refunds">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Refunds
            </Link>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">{refundRow.refundId}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Order{" "}
            <Link href={`/orders/${refundRow.orderId}`} className="text-primary hover:underline">
              {refundRow.orderNumber}
            </Link>
            · {refundRow.customerName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{REFUND_STATUS_LABELS[refundRow.status]}</Badge>
          {canWrite ? (
            <Select
              value={refundRow.status}
              onChange={(e) => handleStatusChange(e.target.value as RefundStatus)}
              className="w-[160px]"
            >
              {Object.entries(REFUND_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="text-sm font-medium">Payment</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Amount</dt>
              <dd>{formatCurrency(refundRow.amount)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Method</dt>
              <dd>{refundRow.method}</dd>
            </div>
            {refundRow.approvedBy && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Approved by</dt>
                <dd>{refundRow.approvedBy}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="text-sm font-medium">Refund details</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Reason</dt>
              <dd className="mt-1">{refundRow.reason}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Requested</dt>
              <dd>{new Date(refundRow.createdAt).toLocaleString()}</dd>
            </div>
            {notes && (
              <div>
                <dt className="text-muted-foreground">Notes</dt>
                <dd className="mt-1">{notes}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
