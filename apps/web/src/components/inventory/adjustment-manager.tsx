"use client";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { CheckCircle2, ClipboardList, Plus, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  extendedAdjustmentsSeed,
  warehousesSeed,
  type AdjustmentStatus,
  type StockAdjustment,
} from "@/lib/mock-data/inventory";
import { useIsDark } from "@/lib/use-is-dark";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function statusVariant(s: AdjustmentStatus) {
  if (s === "approved") return "success" as const;
  if (s === "pending") return "warning" as const;
  return "muted" as const;
}

function QtyCell({ value }: ICellRendererParams<StockAdjustment>) {
  if (value === undefined || value === null) return null;
  const pos = (value as number) > 0;
  return (
    <div className={cn("flex items-center h-full font-semibold text-sm", pos ? "text-emerald-600" : "text-red-600")}>
      {pos ? "+" : ""}
      {value}
    </div>
  );
}

function AdjustmentSheet({
  adj,
  open,
  onClose,
}: {
  adj: StockAdjustment | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!adj) return null;
  const isPos = adj.qtyChange > 0;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[400px] overflow-y-auto">
        <div className="border-b border-border pb-4">
          <p className="text-xs text-muted-foreground">Adjustment</p>
          <h2 className="font-mono font-semibold">{adj.id}</h2>
          <Badge variant={statusVariant(adj.status)} className="mt-1 capitalize text-[10px]">
            {adj.status}
          </Badge>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-input bg-card p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Product</span>
              <span className="font-medium">{adj.product}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SKU</span>
              <span className="font-mono text-xs">{adj.sku}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Warehouse</span>
              <span className="font-medium">{adj.warehouse}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reason</span>
              <span className="font-medium text-right max-w-[200px]">{adj.reason}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Requested</span>
              <span>{adj.requestedAt}</span>
            </div>
          </div>

          <div className={cn("rounded-lg border p-4 text-center", isPos ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20" : "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20")}>
            <p className="text-xs text-muted-foreground mb-1">Quantity change</p>
            <p className={cn("text-3xl font-bold", isPos ? "text-emerald-600" : "text-red-600")}>
              {isPos ? "+" : ""}{adj.qtyChange}
            </p>
          </div>

          {adj.status === "pending" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                onClick={() => { toast.success("Rejected (mock)"); onClose(); }}
              >
                <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => { toast.success("Approved (mock)"); onClose(); }}
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function AdjustmentManager() {
  const isDark = useIsDark();
  const [statusFilter, setStatusFilter] = useState("all");
  const [warehouse, setWarehouse] = useState("all");
  const [selected, setSelected] = useState<StockAdjustment | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const rowData = useMemo(
    () =>
      extendedAdjustmentsSeed.filter((a) => {
        if (statusFilter !== "all" && a.status !== statusFilter) return false;
        if (warehouse !== "all" && a.warehouse !== warehouse) return false;
        return true;
      }),
    [statusFilter, warehouse],
  );

  const pending = extendedAdjustmentsSeed.filter((a) => a.status === "pending").length;
  const approved = extendedAdjustmentsSeed.filter((a) => a.status === "approved").length;
  const rejected = extendedAdjustmentsSeed.filter((a) => a.status === "rejected").length;

  const colDefs = useMemo<ColDef<StockAdjustment>[]>(
    () => [
      { headerName: "ID", field: "id", pinned: "left", minWidth: 110, cellStyle: { fontFamily: "monospace", fontSize: 12 } },
      {
        headerName: "Product",
        minWidth: 180,
        cellRenderer: (p: ICellRendererParams<StockAdjustment>) =>
          p.data ? (
            <div className="flex flex-col justify-center h-full">
              <p className="text-xs font-medium leading-tight">{p.data.product}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{p.data.sku}</p>
            </div>
          ) : null,
      },
      { headerName: "Warehouse", field: "warehouse", minWidth: 130 },
      {
        headerName: "Qty change",
        field: "qtyChange",
        type: "numericColumn",
        minWidth: 110,
        cellRenderer: QtyCell,
      },
      { headerName: "Reason", field: "reason", minWidth: 200 },
      {
        headerName: "Status",
        field: "status",
        minWidth: 110,
        cellRenderer: (p: ICellRendererParams<StockAdjustment>) =>
          p.value ? (
            <div className="flex items-center h-full">
              <Badge variant={statusVariant(p.value as AdjustmentStatus)} className="capitalize text-[10px]">
                {p.value}
              </Badge>
            </div>
          ) : null,
      },
      { headerName: "Requested at", field: "requestedAt", minWidth: 150 },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total adjustments", value: extendedAdjustmentsSeed.length },
          { label: "Pending review", value: pending, warn: pending > 0 },
          { label: "Approved", value: approved },
          { label: "Rejected", value: rejected },
        ].map((kpi) => (
          <div key={kpi.label} className={cn("rounded-lg border border-input bg-card p-3 shadow-sm", kpi.warn && "border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20")}>
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <p className={cn("mt-0.5 text-xl font-semibold", kpi.warn && "text-amber-600")}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-input overflow-hidden">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium capitalize",
                statusFilter === s ? "bg-foreground text-background" : "hover:bg-muted/50",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={warehouse}
          onChange={(e) => setWarehouse(e.target.value)}
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        >
          <option value="all">All warehouses</option>
          {warehousesSeed.map((w) => (
            <option key={w.id} value={w.name}>{w.name}</option>
          ))}
        </select>
        <Button size="sm" className="ml-auto" onClick={() => toast.info("New adjustment — prototype")}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New adjustment
        </Button>
      </div>

      <div
        className={cn(
          "ag-theme-quartz control-border w-full rounded-md bg-card",
          isDark && "ag-theme-quartz-dark",
        )}
      >
        <AgGridReact<StockAdjustment>
          theme="legacy"
          rowData={rowData}
          columnDefs={colDefs}
          
          domLayout="autoHeight"
          rowHeight={44}
          defaultColDef={{ sortable: true, resizable: true }}
          onRowClicked={(e) => {
            if (e.data) {
              setSelected(e.data);
              setSheetOpen(true);
            }
          }}
          rowClass="cursor-pointer"
        />
      </div>

      <AdjustmentSheet adj={selected} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
