"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  RETURN_STATUS_LABELS,
  type OrderReturn,
  type ReturnStatus,
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
  { key: "search", label: "Search", hint: "RMA ID, order #, customer, product", defaultVisible: true },
  { key: "status", label: "Return Status", hint: "Requested → Review → Approved → …", defaultVisible: true },
];
const COLUMN_META = [
  { key: "sku", label: "SKU", hint: "Product SKU", defaultVisible: true },
  { key: "quantity", label: "Qty", hint: "Return quantity", defaultVisible: false },
  { key: "reason", label: "Reason", hint: "Return reason", defaultVisible: true },
  { key: "assignedStaff", label: "Assigned", hint: "Staff handling return", defaultVisible: true },
  { key: "createdAt", label: "Date", hint: "Request date", defaultVisible: true },
];
const DEFAULT_FILTERS = { search: "", status: "all" };

type Props = {
  className?: string;
  returns?: OrderReturn[];
  loading?: boolean;
  onStatusChange?: (id: string, status: ReturnStatus) => void | Promise<void>;
};

export function ReturnsGrid({
  className,
  returns: returnsProp,
  loading = false,
  onStatusChange,
}: Props) {
  const router = useRouter();
  const canWrite = useAdminCanWrite();
  const storeReturns = useOrderModulesStore((s) => s.returns);
  const storeUpdateReturnStatus = useOrderModulesStore((s) => s.updateReturnStatus);
  const returns = returnsProp ?? storeReturns;

  const updateReturnStatus = useCallback(
    (id: string, status: ReturnStatus) => {
      if (onStatusChange) {
        void onStatusChange(id, status);
        return;
      }
      storeUpdateReturnStatus(id, status);
    },
    [onStatusChange, storeUpdateReturnStatus],
  );

  const StatusCell = useCallback(
    ({ data }: ICellRendererParams<OrderReturn>) => {
      if (!data) return null;
      if (!canWrite) {
        return (
          <span className="text-[11px] font-medium capitalize">
            {RETURN_STATUS_LABELS[data.status]}
          </span>
        );
      }
      return (
        <Select
          className="h-7 min-w-[110px] border-0 bg-transparent text-[11px] shadow-none"
          value={data.status}
          onChange={(e) => {
            updateReturnStatus(data.id, e.target.value as ReturnStatus);
            if (!onStatusChange) toast.success(`${data.returnId} updated`);
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {Object.entries(RETURN_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      );
    },
    [onStatusChange, updateReturnStatus, canWrite],
  );

  const columnDefs = useMemo<ColDef<OrderReturn>[]>(() => [
    { field: "returnId", headerName: "Return ID", width: 100, pinned: "left" },
    {
      field: "orderNumber",
      headerName: "Order #",
      width: 100,
      cellRenderer: (p: ICellRendererParams<OrderReturn>) =>
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
    { field: "productName", headerName: "Product", width: 180 },
    { colId: "sku", field: "sku", headerName: "SKU", width: 90 },
    { colId: "quantity", field: "quantity", headerName: "Qty", width: 60 },
    {
      field: "amount",
      headerName: "Amount",
      width: 90,
      valueFormatter: (p) => formatCurrency(p.value ?? 0),
    },
    { colId: "reason", field: "reason", headerName: "Reason", width: 200, tooltipField: "reason" },
    { colId: "status", headerName: "Status", width: 130, cellRenderer: StatusCell },
    { colId: "assignedStaff", field: "assignedStaff", headerName: "Assigned", width: 110 },
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
      cellRenderer: (p: ICellRendererParams<OrderReturn>) =>
        p.data ? (
          <ActivityTriggerButton
            entity={{
              type: "order",
              id: p.data.orderId,
              label: p.data.returnId,
              subtitle: p.data.orderNumber,
            }}
          />
        ) : null,
    },
  ], [StatusCell, router]);

  return (
    <OrderSubGridShell
      className={className}
      rowData={returns}
      columnDefs={columnDefs}
      filterDefs={FILTER_DEFS}
      columnDefs_meta={COLUMN_META}
      defaultFilters={DEFAULT_FILTERS}
      filterFn={(r, f) => {
        const q = f.search.toLowerCase().trim();
        if (
          q &&
          !r.returnId.toLowerCase().includes(q) &&
          !r.orderNumber.toLowerCase().includes(q) &&
          !r.customerName.toLowerCase().includes(q) &&
          !r.productName.toLowerCase().includes(q)
        ) {
          return false;
        }
        if (f.status !== "all" && r.status !== f.status) return false;
        return true;
      }}
      filterWidgets={(filters, setFilters, visible) => (
        <>
          {visible.search && (
            <Input
              placeholder="Search RMA, order, customer…"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="max-w-[220px]"
            />
          )}
          {visible.status && (
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-[148px]"
            >
              <option value="all">All statuses</option>
              {Object.entries(RETURN_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          )}
        </>
      )}
      createLabel={canWrite ? "+ New Return" : undefined}
      onCreate={canWrite ? () => toast.info("Create return — prototype") : undefined}
      onRowClicked={(row) => router.push(`/orders/returns/${row.id}`)}
      loading={loading}
    />
  );
}

type DetailProps = {
  returnRow: OrderReturn | null;
  notes: string | null;
  loading: boolean;
  error: string | null;
  onStatusChange?: (id: string, status: ReturnStatus) => void | Promise<void>;
};

export function OrderReturnDetail({
  returnRow,
  notes,
  loading,
  error,
  onStatusChange,
}: DetailProps) {
  const storeUpdateReturnStatus = useOrderModulesStore((s) => s.updateReturnStatus);
  const canWrite = useAdminCanWrite();

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed p-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !returnRow) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">{error ?? "Return not found"}</p>
        <Button variant="ghost" size="sm" asChild className="mt-2">
          <Link href="/orders/returns">Back to returns</Link>
        </Button>
      </div>
    );
  }

  const handleStatusChange = (status: ReturnStatus) => {
    if (onStatusChange) {
      void onStatusChange(returnRow.id, status);
      return;
    }
    storeUpdateReturnStatus(returnRow.id, status);
    toast.success(`${returnRow.returnId} updated`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 h-8">
            <Link href="/orders/returns">
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Returns
            </Link>
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">{returnRow.returnId}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Order{" "}
            <Link href={`/orders/${returnRow.orderId}`} className="text-primary hover:underline">
              {returnRow.orderNumber}
            </Link>
            · {returnRow.customerName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{RETURN_STATUS_LABELS[returnRow.status]}</Badge>
          {canWrite ? (
            <Select
              value={returnRow.status}
              onChange={(e) => handleStatusChange(e.target.value as ReturnStatus)}
              className="w-[160px]"
            >
              {Object.entries(RETURN_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="text-sm font-medium">Product</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Item</dt>
              <dd className="text-right">{returnRow.productName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">SKU</dt>
              <dd>{returnRow.sku}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Quantity</dt>
              <dd>{returnRow.quantity}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Amount</dt>
              <dd>{formatCurrency(returnRow.amount)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border p-4 space-y-3">
          <h2 className="text-sm font-medium">Return details</h2>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Reason</dt>
              <dd className="mt-1">{returnRow.reason}</dd>
            </div>
            {returnRow.assignedStaff && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Assigned</dt>
                <dd>{returnRow.assignedStaff}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Requested</dt>
              <dd>{new Date(returnRow.createdAt).toLocaleString()}</dd>
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
