"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Package, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  formatBdt,
  STOCK_STATUS_LABELS,
  type StockItem,
  type StockStatus,
  type Warehouse,
} from "@/lib/mock-data/inventory";
import { useIsDark } from "@/lib/use-is-dark";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function statusVariant(s: StockStatus): "success" | "warning" | "muted" | "secondary" {
  if (s === "in_stock") return "success";
  if (s === "low_stock") return "warning";
  if (s === "out_of_stock") return "muted";
  return "secondary";
}

function StatusPill({ value }: { value: StockStatus }) {
  return (
    <div className="flex items-center h-full">
      <Badge variant={statusVariant(value)} className="text-[10px]">
        {STOCK_STATUS_LABELS[value]}
      </Badge>
    </div>
  );
}

function StockBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const color = pct < 20 ? "bg-red-500" : pct > 90 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2 h-full">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums w-8 text-right">{value}</span>
    </div>
  );
}

function ProductCell({ data }: ICellRendererParams<StockItem>) {
  if (!data) return null;
  return (
    <div className="flex items-center gap-2 h-full py-1">
      {data.thumbnail ? (
        <img src={data.thumbnail} alt="" className="h-7 w-7 rounded object-cover shrink-0" />
      ) : (
        <div className="h-7 w-7 rounded bg-muted shrink-0 flex items-center justify-center">
          <Package className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0">
        <p className="font-medium text-xs leading-tight truncate">{data.name}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{data.sku}</p>
      </div>
    </div>
  );
}

function StockDetailSheet({
  item,
  open,
  onClose,
}: {
  item: StockItem | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!item) return null;
  const pct = item.maxQty > 0 ? Math.round((item.onHand / item.maxQty) * 100) : 0;
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[400px] overflow-y-auto">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          {item.thumbnail ? (
            <img src={item.thumbnail} alt="" className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div>
            <h2 className="font-semibold">{item.name}</h2>
            <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "On Hand", value: item.onHand },
              { label: "Reserved", value: item.reserved },
              { label: "Available", value: item.available },
              { label: "Incoming", value: item.incoming || "—" },
            ].map((r) => (
              <div key={r.label} className="rounded-lg border border-input bg-card p-3">
                <p className="text-[11px] text-muted-foreground">{r.label}</p>
                <p className="text-xl font-semibold">{r.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-input bg-card p-3 space-y-2">
            <h3 className="text-xs font-medium">Stock level</h3>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: {item.minQty}</span>
              <span>{pct}% of max</span>
              <span>Max: {item.maxQty}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  pct < 15 ? "bg-red-500" : pct > 90 ? "bg-amber-500" : "bg-emerald-500",
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="rounded-lg border border-input bg-card p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Warehouse</span>
              <span className="font-medium">{item.warehouse}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unit cost</span>
              <span className="font-medium">{formatBdt(item.unitCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total value</span>
              <span className="font-medium">{formatBdt(item.onHand * item.unitCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant={statusVariant(item.status)} className="text-[10px]">
                {STOCK_STATUS_LABELS[item.status]}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last updated</span>
              <span>{item.updatedAt}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => toast.info("Adjust stock — prototype")}>
              Adjust stock
            </Button>
            <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info("Create PO — prototype")}>
              Create PO
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function StockManagement({
  items,
  warehouses,
  loading = false,
}: {
  items: StockItem[];
  warehouses: Warehouse[];
  loading?: boolean;
}) {
  const isDark = useIsDark();
  const gridRef = useRef<AgGridReact<StockItem>>(null);
  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<StockItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const rowData = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q) && !s.sku.toLowerCase().includes(q)) return false;
      if (warehouse !== "all" && s.warehouse !== warehouse) return false;
      if (status !== "all" && s.status !== status) return false;
      return true;
    });
  }, [items, search, warehouse, status]);

  const colDefs = useMemo<ColDef<StockItem>[]>(
    () => [
      {
        headerName: "Product",
        field: "name",
        pinned: "left",
        minWidth: 220,
        cellRenderer: ProductCell,
      },
      { headerName: "Warehouse", field: "warehouse", minWidth: 130 },
      {
        headerName: "On Hand",
        field: "onHand",
        type: "numericColumn",
        minWidth: 140,
        cellRenderer: (p: ICellRendererParams<StockItem>) =>
          p.data ? <StockBar value={p.data.onHand} max={p.data.maxQty} /> : null,
      },
      { headerName: "Reserved", field: "reserved", type: "numericColumn", minWidth: 90 },
      {
        headerName: "Available",
        field: "available",
        type: "numericColumn",
        minWidth: 90,
        cellStyle: { fontWeight: 600 },
      },
      {
        headerName: "Incoming",
        field: "incoming",
        type: "numericColumn",
        minWidth: 90,
        valueFormatter: (p) => (p.value ? String(p.value) : "—"),
        cellStyle: { color: "var(--color-emerald-600)" },
      },
      { headerName: "Min", field: "minQty", type: "numericColumn", minWidth: 70 },
      { headerName: "Max", field: "maxQty", type: "numericColumn", minWidth: 70 },
      {
        headerName: "Status",
        field: "status",
        minWidth: 120,
        cellRenderer: (p: ICellRendererParams<StockItem>) =>
          p.value ? <StatusPill value={p.value as StockStatus} /> : null,
      },
      {
        headerName: "Unit cost",
        field: "unitCost",
        type: "numericColumn",
        minWidth: 110,
        valueFormatter: (p) => formatBdt(p.value),
      },
      {
        headerName: "Total value",
        minWidth: 120,
        valueGetter: (p) => (p.data ? p.data.onHand * p.data.unitCost : 0),
        type: "numericColumn",
        valueFormatter: (p) => formatBdt(p.value),
      },
      { headerName: "Updated", field: "updatedAt", minWidth: 100 },
    ] as ColDef<StockItem>[],
    [],
  );

  const onRowClicked = useCallback((e: { data?: StockItem }) => {
    if (e.data) {
      setSelected(e.data);
      setSheetOpen(true);
    }
  }, []);

  const totalValue = rowData.reduce((s, i) => s + i.onHand * i.unitCost, 0);
  const lowCount = rowData.filter((i) => i.status === "low_stock" || i.status === "out_of_stock").length;
  const inTransit = rowData.reduce((s, i) => s + (i.incoming || 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total SKUs shown", value: rowData.length, icon: Package, color: "text-indigo-600" },
          { label: "Total units", value: rowData.reduce((s, i) => s + i.onHand, 0).toLocaleString(), icon: TrendingUp, color: "text-emerald-600" },
          { label: "Stock value (FIFO)", value: formatBdt(totalValue), icon: TrendingUp, color: "text-blue-600" },
          { label: "Low / out of stock", value: lowCount, icon: TrendingDown, color: "text-amber-600", alert: lowCount > 0 },
        ].map((kpi) => (
          <div key={kpi.label} className={cn("rounded-lg border border-input bg-card p-3 shadow-sm", kpi.alert && "border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20")}>
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <p className={cn("mt-0.5 text-xl font-semibold", kpi.alert && "text-amber-600")}>{kpi.value}</p>
            {kpi.label === "Total units" && (
              <p className="text-xs text-muted-foreground">{inTransit} incoming</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search SKU, product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-[200px]"
        />
        <Select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="w-[150px]">
          <option value="all">All warehouses</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.name}>{w.name}</option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-[140px]">
          <option value="all">All status</option>
          {(Object.keys(STOCK_STATUS_LABELS) as StockStatus[]).map((s) => (
            <option key={s} value={s}>{STOCK_STATUS_LABELS[s]}</option>
          ))}
        </Select>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.info("Import CSV — prototype")}>Import</Button>
          <Button size="sm" variant="outline" onClick={() => toast.info("Export — prototype")}>Export</Button>
          <Button size="sm" onClick={() => toast.info("Adjust stock — prototype")}>Adjust stock</Button>
        </div>
      </div>

      <div
        className={cn(
          "ag-theme-quartz control-border w-full rounded-md bg-card",
          isDark && "ag-theme-quartz-dark",
        )}
      >
        <AgGridReact<StockItem>
          theme="legacy"
          ref={gridRef}
          rowData={rowData}
          columnDefs={colDefs}
          
          domLayout="autoHeight"
          rowHeight={44}
          defaultColDef={{ sortable: true, resizable: true, filter: true }}
          onRowClicked={onRowClicked}
          rowClass="cursor-pointer"
          loading={loading}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        available = on_hand − reserved · Click a row to view details & adjust
      </p>

      <StockDetailSheet item={selected} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
