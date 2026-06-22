"use client";

import { useCallback, useMemo } from "react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Zap } from "lucide-react";
import { toast } from "sonner";
import { RECOVERY_STATUS_LABELS, type AbandonedCart, type RecoveryStatus } from "@/lib/mock-data/order-modules";
import { useOrderModulesStore } from "@/lib/store/order-modules-store";
import { cn, formatCurrency } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OrderSubGridShell } from "@/components/orders/order-sub-grid-shell";

const FILTER_DEFS = [
  { key: "search", label: "Search", hint: "Customer name, email, phone", defaultVisible: true },
  { key: "recoveryStatus", label: "Recovery Status", hint: "Not contacted / Email sent / Recovered", defaultVisible: true },
];
const COLUMN_META = [
  { key: "phone", label: "Phone", hint: "Customer phone", defaultVisible: true },
  { key: "itemCount", label: "Items", hint: "Cart item count", defaultVisible: true },
  { key: "products", label: "Products", hint: "Products in cart", defaultVisible: true },
  { key: "lastActivity", label: "Last Activity", hint: "Last cart activity", defaultVisible: true },
  { key: "aiSuggestion", label: "AI Suggestion", hint: "AI recovery suggestion", defaultVisible: true },
];
const DEFAULT_FILTERS = { search: "", recoveryStatus: "all" };

type Props = { className?: string };

export function AbandonedCartsGrid({ className }: Props) {
  const carts = useOrderModulesStore((s) => s.abandonedCarts);
  const updateRecoveryStatus = useOrderModulesStore((s) => s.updateRecoveryStatus);

  const RecoveryCell = useCallback(({ data }: ICellRendererParams<AbandonedCart>) => {
    if (!data) return null;
    return (
      <Select className="h-7 min-w-[110px] border-0 bg-transparent text-[11px] shadow-none" value={data.recoveryStatus}
        onChange={(e) => { updateRecoveryStatus(data.id, e.target.value as RecoveryStatus); toast.success("Recovery status updated"); }}
        onClick={(e) => e.stopPropagation()}>
        {Object.entries(RECOVERY_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </Select>
    );
  }, [updateRecoveryStatus]);

  const columnDefs = useMemo<ColDef<AbandonedCart>[]>(() => [
    { field: "customerName", headerName: "Customer", width: 130 },
    { field: "email", headerName: "Email", width: 160 },
    { colId: "phone", field: "phone", headerName: "Phone", width: 110 },
    { colId: "itemCount", field: "itemCount", headerName: "Items", width: 60 },
    { field: "cartValue", headerName: "Cart Value", width: 100, valueFormatter: (p) => formatCurrency(p.value ?? 0) },
    { colId: "lastActivity", headerName: "Last Activity", width: 140, valueGetter: (p) => p.data ? new Date(p.data.lastActivity).toLocaleString() : "" },
    { colId: "recoveryStatus", headerName: "Recovery", width: 130, cellRenderer: RecoveryCell },
    { colId: "products", headerName: "Products", width: 180, valueGetter: (p) => p.data?.products.join(", ") ?? "", tooltipValueGetter: (p) => p.data?.products.join(", ") },
    { colId: "aiSuggestion", headerName: "AI Suggestion", width: 220, cellRenderer: (p: ICellRendererParams<AbandonedCart>) => p.data ? (
      <div className="flex items-start gap-1 py-1">
        <Zap className="mt-0.5 h-3 w-3 shrink-0 text-violet-500" />
        <span className="line-clamp-2 text-[10px] text-muted-foreground">{p.data.aiSuggestion}</span>
      </div>
    ) : null },
    { width: 100, pinned: "right", sortable: false, cellRenderer: (p: ICellRendererParams<AbandonedCart>) => p.data ? (
      <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={() => toast.success(`Recovery email sent to ${p.data!.email}`)}>Recover</Button>
    ) : null },
  ], [RecoveryCell]);

  return (
    <OrderSubGridShell
      className={className}
      rowData={carts}
      columnDefs={columnDefs}
      filterDefs={FILTER_DEFS}
      columnDefs_meta={COLUMN_META}
      defaultFilters={DEFAULT_FILTERS}
      filterFn={(r, f) => {
        const q = f.search.toLowerCase().trim();
        if (q && !r.customerName.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q) && !r.phone.includes(q)) return false;
        if (f.recoveryStatus !== "all" && r.recoveryStatus !== f.recoveryStatus) return false;
        return true;
      }}
      filterWidgets={(filters, setFilters, visible) => (
        <>
          {visible.search && <Input placeholder="Search customer, email…" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="max-w-[200px]" />}
          {visible.recoveryStatus && (
            <Select value={filters.recoveryStatus} onChange={(e) => setFilters({ ...filters, recoveryStatus: e.target.value })} className="w-[148px]">
              <option value="all">All recovery</option>
              {Object.entries(RECOVERY_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          )}
        </>
      )}
      createLabel="Send bulk recovery"
      onCreate={() => toast.info("Bulk recovery campaign — prototype")}
    />
  );
}
