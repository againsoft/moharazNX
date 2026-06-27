"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { toast } from "sonner";
import {
  ORDER_ACTIVITY_TYPE_LABELS,
  type OrderActivity,
  type OrderActivityStatus,
} from "@/lib/mock-data/order-modules";
import { useOrderModulesStore } from "@/lib/store/order-modules-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";
import { OrderSubGridShell } from "@/components/orders/order-sub-grid-shell";

const FILTER_DEFS = [
  { key: "search", label: "Search", hint: "Activity title, customer, order #", defaultVisible: true },
  { key: "status", label: "Activity Status", hint: "Open / In Progress / Done", defaultVisible: true },
  { key: "type", label: "Activity Type", hint: "Call, Follow-up, Warehouse, etc.", defaultVisible: false },
  { key: "assignee", label: "Assignee", hint: "Assigned staff", defaultVisible: false },
];
const COLUMN_META = [
  { key: "type", label: "Type", hint: "Activity type", defaultVisible: true },
  { key: "orderNumber", label: "Order #", hint: "Linked order", defaultVisible: true },
  { key: "assignee", label: "Assignee", hint: "Assigned to", defaultVisible: true },
  { key: "dueDate", label: "Due Date", hint: "Due date", defaultVisible: true },
  { key: "priority", label: "Priority", hint: "Low / Medium / High", defaultVisible: true },
  { key: "createdAt", label: "Created", hint: "Created date", defaultVisible: false },
];
const DEFAULT_FILTERS = { search: "", status: "all", type: "all", assignee: "all" };

const priorityVariant = (p: string) =>
  p === "high" ? "warning" : p === "medium" ? "outline" : "muted";

type Props = { className?: string };

export function OrderActivitiesGrid({ className }: Props) {
  const router = useRouter();
  const activities = useOrderModulesStore((s) => s.activities);
  const updateActivityStatus = useOrderModulesStore((s) => s.updateActivityStatus);

  const StatusCell = useCallback(({ data }: ICellRendererParams<OrderActivity>) => {
    if (!data) return null;
    return (
      <Select className="h-7 min-w-[100px] border-0 bg-transparent text-[11px] shadow-none" value={data.status}
        onChange={(e) => { updateActivityStatus(data.id, e.target.value as OrderActivityStatus); toast.success("Activity updated"); }}
        onClick={(e) => e.stopPropagation()}>
        <option value="open">Open</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
        <option value="cancelled">Cancelled</option>
      </Select>
    );
  }, [updateActivityStatus]);

  const columnDefs = useMemo<ColDef<OrderActivity>[]>(() => [
    { field: "title", headerName: "Activity", width: 220, tooltipField: "title" },
    { colId: "type", headerName: "Type", width: 140, valueGetter: (p) => p.data ? ORDER_ACTIVITY_TYPE_LABELS[p.data.type] : "" },
    { colId: "orderNumber", headerName: "Order #", width: 100, cellRenderer: (p: ICellRendererParams<OrderActivity>) => p.data?.orderId ? (
      <button type="button" className="text-xs text-primary hover:underline" onClick={() => router.push(`/orders/${p.data!.orderId}`)}>{p.data!.orderNumber}</button>
    ) : <span className="text-muted-foreground">—</span> },
    { field: "customerName", headerName: "Customer", width: 130 },
    { colId: "assignee", field: "assignee", headerName: "Assignee", width: 120 },
    { colId: "dueDate", field: "dueDate", headerName: "Due", width: 92 },
    { colId: "priority", headerName: "Priority", width: 80, cellRenderer: (p: ICellRendererParams<OrderActivity>) => p.data ? (
      <Badge variant={priorityVariant(p.data.priority) as "warning" | "outline" | "muted"} className="text-[9px] capitalize">{p.data.priority}</Badge>
    ) : null },
    { colId: "status", headerName: "Status", width: 120, cellRenderer: StatusCell },
    { colId: "createdAt", headerName: "Created", width: 92, valueGetter: (p) => p.data ? new Date(p.data.createdAt).toLocaleDateString() : "" },
  ], [StatusCell, router]);

  const assignees = [...new Set(activities.map((a) => a.assignee))];

  return (
    <OrderSubGridShell
      className={className}
      rowData={activities}
      columnDefs={columnDefs}
      filterDefs={FILTER_DEFS}
      columnDefs_meta={COLUMN_META}
      defaultFilters={DEFAULT_FILTERS}
      filterFn={(r, f) => {
        const q = f.search.toLowerCase().trim();
        if (q && !r.title.toLowerCase().includes(q) && !r.customerName.toLowerCase().includes(q) && !(r.orderNumber?.toLowerCase().includes(q))) return false;
        if (f.status !== "all" && r.status !== f.status) return false;
        if (f.type !== "all" && r.type !== f.type) return false;
        if (f.assignee !== "all" && r.assignee !== f.assignee) return false;
        return true;
      }}
      filterWidgets={(filters, setFilters, visible) => (
        <>
          {visible.search && <Input placeholder="Search activity, customer…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="max-w-[200px]" />}
          {visible.status && (
            <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-[130px]">
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          )}
          {visible.type && (
            <Select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="w-[160px]">
              <option value="all">All types</option>
              {Object.entries(ORDER_ACTIVITY_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          )}
          {visible.assignee && (
            <Select value={filters.assignee} onChange={(e) => setFilters({ ...filters, assignee: e.target.value })} className="w-[140px]">
              <option value="all">All assignees</option>
              {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
            </Select>
          )}
        </>
      )}
      createLabel="+ Log Activity"
      onCreate={() => toast.info("Log activity — prototype")}
    />
  );
}
