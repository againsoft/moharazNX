"use client";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  batchesSeed,
  warehousesSeed,
  type BatchRecord,
  type BatchStatus,
} from "@/lib/mock-data/inventory";
import { useIsDark } from "@/lib/use-is-dark";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function statusVariant(s: BatchStatus) {
  if (s === "active") return "success" as const;
  if (s === "quarantine") return "warning" as const;
  if (s === "expired") return "muted" as const;
  return "secondary" as const;
}

function ExpiryChip({ days }: { days: number }) {
  if (days < 0) {
    return (
      <div className="flex items-center gap-1 h-full">
        <XCircle className="h-3 w-3 text-red-600" />
        <span className="text-[10px] font-medium text-red-600">Expired ({Math.abs(days)}d ago)</span>
      </div>
    );
  }
  if (days <= 30) {
    return (
      <div className="flex items-center gap-1 h-full">
        <AlertTriangle className="h-3 w-3 text-amber-600" />
        <span className="text-[10px] font-medium text-amber-600">{days}d left</span>
      </div>
    );
  }
  if (days <= 90) {
    return (
      <div className="flex items-center h-full">
        <span className="text-[10px] text-muted-foreground">{days}d left</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 h-full">
      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
      <span className="text-[10px] text-muted-foreground">{days}d left</span>
    </div>
  );
}

function ConsumeBar({ consumed, total }: { consumed: number; total: number }) {
  const pct = total > 0 ? Math.round((consumed / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 h-full">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums w-10 text-right">{pct}%</span>
    </div>
  );
}

function BatchSheet({ batch, open, onClose }: { batch: BatchRecord | null; open: boolean; onClose: () => void }) {
  if (!batch) return null;
  const urgent = batch.daysToExpiry >= 0 && batch.daysToExpiry <= 30;
  const expired = batch.daysToExpiry < 0;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[420px] overflow-y-auto">
        <div className="border-b border-border pb-4">
          <p className="text-xs text-muted-foreground">Batch / Lot</p>
          <h2 className="font-mono font-semibold">{batch.lot}</h2>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={statusVariant(batch.status)} className="capitalize text-[10px]">{batch.status}</Badge>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-input bg-card p-3 space-y-2 text-sm">
            {[
              { label: "Product", value: batch.product },
              { label: "SKU", value: batch.sku },
              { label: "Warehouse", value: batch.warehouse },
              { label: "Location", value: batch.location ?? "—" },
              { label: "PO ref", value: batch.poRef ?? "—" },
              { label: "Manufactured", value: batch.manufacturedDate ?? "—" },
              { label: "Expiry date", value: batch.expiryDate },
            ].map((r) => (
              <div key={r.label} className="flex justify-between">
                <span className="text-muted-foreground">{r.label}</span>
                <span className={cn("font-medium font-mono text-xs", r.label === "SKU" && "font-mono")}>{r.value}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Total", value: batch.quantity },
              { label: "Consumed", value: batch.consumed },
              { label: "Available", value: batch.available },
            ].map((r) => (
              <div key={r.label} className="rounded-lg border border-input bg-card p-2 text-center">
                <p className="text-[10px] text-muted-foreground">{r.label}</p>
                <p className="font-semibold text-base">{r.value}</p>
              </div>
            ))}
          </div>

          <div className={cn("rounded-lg border p-3", expired ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20" : urgent ? "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20" : "border-input bg-card")}>
            <div className="flex items-center gap-2">
              {expired ? <XCircle className="h-4 w-4 text-red-600" /> : urgent ? <AlertTriangle className="h-4 w-4 text-amber-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              <p className={cn("text-sm font-medium", expired ? "text-red-600" : urgent ? "text-amber-600" : "text-emerald-600")}>
                {expired ? `Expired ${Math.abs(batch.daysToExpiry)} days ago` : `${batch.daysToExpiry} days until expiry`}
              </p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {batch.status === "active" && (
              <Button size="sm" variant="outline" onClick={() => toast.info("Move to quarantine — prototype")} className="flex-1">
                Quarantine
              </Button>
            )}
            {batch.status === "quarantine" && (
              <>
                <Button size="sm" onClick={() => { toast.success("Released (mock)"); onClose(); }} className="flex-1">
                  Release
                </Button>
                <Button size="sm" variant="outline" className="text-red-600" onClick={() => toast.info("Write off — prototype")}>
                  Write off
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={() => toast.info("Print label — prototype")}>
              Print label
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function BatchExpiry() {
  const isDark = useIsDark();
  const [statusFilter, setStatusFilter] = useState("all");
  const [warehouse, setWarehouse] = useState("all");
  const [selected, setSelected] = useState<BatchRecord | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const rowData = useMemo(() => {
    return batchesSeed
      .filter((b) => {
        if (statusFilter !== "all" && b.status !== statusFilter) return false;
        if (warehouse !== "all" && b.warehouse !== warehouse) return false;
        return true;
      })
      .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
  }, [statusFilter, warehouse]);

  const expired = batchesSeed.filter((b) => b.status === "expired").length;
  const expiringSoon = batchesSeed.filter((b) => b.status === "active" && b.daysToExpiry >= 0 && b.daysToExpiry <= 30).length;
  const quarantine = batchesSeed.filter((b) => b.status === "quarantine").length;
  const active = batchesSeed.filter((b) => b.status === "active").length;

  const colDefs = useMemo<ColDef<BatchRecord>[]>(
    () => [
      { headerName: "Lot #", field: "lot", pinned: "left", minWidth: 130, cellStyle: { fontFamily: "monospace", fontSize: 11 } },
      {
        headerName: "Product",
        minWidth: 180,
        cellRenderer: (p: ICellRendererParams<BatchRecord>) =>
          p.data ? (
            <div className="flex flex-col justify-center h-full">
              <p className="text-xs font-medium leading-tight">{p.data.product}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{p.data.sku}</p>
            </div>
          ) : null,
      },
      { headerName: "Warehouse", field: "warehouse", minWidth: 120 },
      { headerName: "Location", field: "location", minWidth: 100, valueFormatter: (p) => p.value ?? "—" },
      {
        headerName: "Status",
        field: "status",
        minWidth: 110,
        cellRenderer: (p: ICellRendererParams<BatchRecord>) =>
          p.value ? (
            <div className="flex items-center h-full">
              <Badge variant={statusVariant(p.value as BatchStatus)} className="capitalize text-[10px]">{p.value}</Badge>
            </div>
          ) : null,
      },
      { headerName: "Qty", field: "quantity", type: "numericColumn", minWidth: 80 },
      { headerName: "Available", field: "available", type: "numericColumn", minWidth: 90, cellStyle: { fontWeight: 600 } },
      {
        headerName: "Consumed",
        minWidth: 140,
        cellRenderer: (p: ICellRendererParams<BatchRecord>) =>
          p.data ? <ConsumeBar consumed={p.data.consumed} total={p.data.quantity} /> : null,
      },
      { headerName: "Expiry date", field: "expiryDate", minWidth: 110 },
      {
        headerName: "Expiry",
        field: "daysToExpiry",
        minWidth: 140,
        cellRenderer: (p: ICellRendererParams<BatchRecord>) =>
          p.value !== undefined ? <ExpiryChip days={p.value as number} /> : null,
        sort: "asc",
      },
    ] as ColDef<BatchRecord>[],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active batches", value: active },
          { label: "Expiring ≤30d", value: expiringSoon, warn: expiringSoon > 0 },
          { label: "Quarantine", value: quarantine, warn: quarantine > 0 },
          { label: "Expired", value: expired, danger: expired > 0 },
        ].map((kpi) => (
          <div key={kpi.label} className={cn("rounded-lg border border-input bg-card p-3 shadow-sm", kpi.warn && "border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20", kpi.danger && "border-red-200 bg-red-50/40 dark:border-red-900 dark:bg-red-950/20")}>
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <p className={cn("mt-0.5 text-xl font-semibold", kpi.warn && "text-amber-600", kpi.danger && "text-red-600")}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-input overflow-hidden">
          {(["all", "active", "quarantine", "expired", "consumed"] as const).map((s) => (
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
      </div>

      {expiringSoon > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20 p-3 text-xs text-amber-700 dark:text-amber-300">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>
            <strong>{expiringSoon} batch{expiringSoon > 1 ? "es" : ""}</strong> expiring within 30 days — review and action required. FEFO picking enforced.
          </span>
        </div>
      )}

      <div
        className={cn(
          "ag-theme-quartz control-border w-full rounded-md bg-card",
          isDark && "ag-theme-quartz-dark",
        )}
      >
        <AgGridReact<BatchRecord>
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
          getRowClass={(p) => {
            if (p.data?.status === "expired") return "opacity-60";
            if (p.data?.daysToExpiry !== undefined && p.data.daysToExpiry >= 0 && p.data.daysToExpiry <= 30) return "bg-amber-50/30 dark:bg-amber-950/10";
            return "";
          }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Sorted by expiry (soonest first) · FEFO: First Expiry First Out picking enabled
      </p>

      <BatchSheet batch={selected} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
