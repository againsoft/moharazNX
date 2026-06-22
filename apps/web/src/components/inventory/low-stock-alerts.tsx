"use client";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { AlertTriangle, Bell, BellOff, CheckCircle2, Package, Zap } from "lucide-react";
import { toast } from "sonner";
import {
  alertRulesSeed,
  STOCK_STATUS_LABELS,
  warehousesSeed,
  type AlertRuleAction,
  type StockAlertRule,
  type StockStatus,
} from "@/lib/mock-data/inventory";
import { useIsDark } from "@/lib/use-is-dark";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function statusVariant(s: StockStatus) {
  if (s === "in_stock") return "success" as const;
  if (s === "low_stock") return "warning" as const;
  if (s === "out_of_stock") return "muted" as const;
  return "secondary" as const;
}

function actionLabel(a: AlertRuleAction) {
  if (a === "auto_po") return "Auto PO";
  if (a === "notify_and_po") return "Notify + PO";
  return "Notify only";
}

function ActionBadge({ value }: { value: AlertRuleAction }) {
  const color =
    value === "auto_po"
      ? "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300"
      : value === "notify_and_po"
        ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
        : "bg-muted text-muted-foreground";
  return (
    <div className="flex items-center h-full">
      <span className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium", color)}>
        {value === "auto_po" ? <Zap className="h-2.5 w-2.5" /> : <Bell className="h-2.5 w-2.5" />}
        {actionLabel(value)}
      </span>
    </div>
  );
}

function AlertRuleSheet({
  rule,
  open,
  onClose,
}: {
  rule: StockAlertRule | null;
  open: boolean;
  onClose: () => void;
}) {
  const [action, setAction] = useState<AlertRuleAction>(rule?.action ?? "notify");
  if (!rule) return null;

  const pct = rule.minQty > 0 ? Math.round((rule.currentQty / rule.minQty) * 100) : 0;

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[400px] overflow-y-auto">
        <div className="border-b border-border pb-4">
          <p className="text-xs text-muted-foreground">{rule.sku}</p>
          <h2 className="font-semibold">{rule.product}</h2>
          <p className="text-xs text-muted-foreground">{rule.warehouse}</p>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Current", value: rule.currentQty, red: rule.currentQty === 0 },
              { label: "Min", value: rule.minQty },
              { label: "Reorder qty", value: rule.reorderQty },
            ].map((r) => (
              <div key={r.label} className={cn("rounded-lg border border-input bg-card p-2 text-center", r.red && "border-red-300 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20")}>
                <p className="text-[11px] text-muted-foreground">{r.label}</p>
                <p className={cn("text-lg font-semibold", r.red && "text-red-600")}>{r.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-input bg-card p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Stock vs minimum</span>
              <span className={cn("font-medium", pct < 50 ? "text-red-600" : "text-amber-600")}>
                {pct}% of min
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full", pct === 0 ? "bg-red-500" : pct < 50 ? "bg-red-400" : "bg-amber-500")}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium">Action when triggered</p>
            {(["notify", "notify_and_po", "auto_po"] as AlertRuleAction[]).map((a) => (
              <label
                key={a}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-input p-3 cursor-pointer",
                  action === a && "border-indigo-400 bg-indigo-50/50 dark:border-indigo-700 dark:bg-indigo-950/20",
                )}
              >
                <input
                  type="radio"
                  className="accent-indigo-600"
                  checked={action === a}
                  onChange={() => setAction(a)}
                />
                <div>
                  <p className="text-sm font-medium">{actionLabel(a)}</p>
                  <p className="text-xs text-muted-foreground">
                    {a === "notify" && "Send alert to inventory managers"}
                    {a === "notify_and_po" && "Alert + draft a purchase order"}
                    {a === "auto_po" && "Auto-submit PO to preferred supplier"}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {rule.preferredSupplier && (
            <div className="rounded-lg border border-input bg-card p-3 text-sm">
              <span className="text-muted-foreground">Preferred supplier: </span>
              <span className="font-medium">{rule.preferredSupplier}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={() => { toast.success("Rule saved (mock)"); onClose(); }}>
              Save rule
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.info("Create PO now — prototype")}>
              Create PO now
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function LowStockAlerts() {
  const isDark = useIsDark();
  const [warehouse, setWarehouse] = useState("all");
  const [selected, setSelected] = useState<StockAlertRule | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const rowData = useMemo(
    () => alertRulesSeed.filter((r) => warehouse === "all" || r.warehouse === warehouse),
    [warehouse],
  );

  const outOfStock = rowData.filter((r) => r.status === "out_of_stock").length;
  const autoPo = rowData.filter((r) => r.action === "auto_po").length;

  const colDefs = useMemo<ColDef<StockAlertRule>[]>(
    () => [
      {
        headerName: "Product",
        field: "product",
        minWidth: 200,
        cellRenderer: (p: ICellRendererParams<StockAlertRule>) =>
          p.data ? (
            <div className="flex flex-col justify-center h-full">
              <p className="text-xs font-medium leading-tight">{p.data.product}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{p.data.sku}</p>
            </div>
          ) : null,
      },
      { headerName: "Warehouse", field: "warehouse", minWidth: 130 },
      {
        headerName: "Current",
        field: "currentQty",
        type: "numericColumn",
        minWidth: 90,
        cellStyle: (p) => ({
          color: p.value === 0 ? "var(--color-red-600)" : "var(--color-amber-600)",
          fontWeight: 600,
        }),
      },
      { headerName: "Min qty", field: "minQty", type: "numericColumn", minWidth: 80 },
      { headerName: "Reorder qty", field: "reorderQty", type: "numericColumn", minWidth: 100 },
      {
        headerName: "Status",
        field: "status",
        minWidth: 120,
        cellRenderer: (p: ICellRendererParams<StockAlertRule>) =>
          p.value ? (
            <div className="flex items-center h-full">
              <Badge variant={statusVariant(p.value as StockStatus)} className="text-[10px]">
                {STOCK_STATUS_LABELS[p.value as StockStatus]}
              </Badge>
            </div>
          ) : null,
      },
      {
        headerName: "Action",
        field: "action",
        minWidth: 130,
        cellRenderer: (p: ICellRendererParams<StockAlertRule>) =>
          p.value ? <ActionBadge value={p.value as AlertRuleAction} /> : null,
      },
      { headerName: "Supplier", field: "preferredSupplier", minWidth: 160, valueFormatter: (p) => p.value ?? "—" },
      { headerName: "Last triggered", field: "lastTriggered", minWidth: 130, valueFormatter: (p) => p.value ?? "—" },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active alerts", value: rowData.length, icon: AlertTriangle, color: "text-amber-600", alert: true },
          { label: "Out of stock", value: outOfStock, icon: Package, color: "text-red-600", danger: outOfStock > 0 },
          { label: "Auto-PO rules", value: autoPo, icon: Zap, color: "text-violet-600" },
          { label: "Notify-only rules", value: rowData.length - autoPo, icon: Bell, color: "text-blue-600" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={cn(
              "rounded-lg border border-input bg-card p-3 shadow-sm",
              kpi.alert && "border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20",
              kpi.danger && "border-red-200 bg-red-50/40 dark:border-red-900 dark:bg-red-950/20",
            )}
          >
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <p className={cn("mt-0.5 text-xl font-semibold", kpi.color)}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-xs font-medium">{rowData.length} items need attention</span>
        </div>
        <select
          value={warehouse}
          onChange={(e) => setWarehouse(e.target.value)}
          className="ml-auto rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        >
          <option value="all">All warehouses</option>
          {warehousesSeed.map((w) => (
            <option key={w.id} value={w.name}>{w.name}</option>
          ))}
        </select>
        <Button size="sm" variant="outline" onClick={() => toast.info("Add rule — prototype")}>
          <Bell className="mr-1.5 h-3.5 w-3.5" /> Add rule
        </Button>
        <Button size="sm" onClick={() => toast.info("Create all POs — prototype")}>
          <Zap className="mr-1.5 h-3.5 w-3.5" /> Create all POs
        </Button>
      </div>

      <div
        className={cn(
          "ag-theme-quartz control-border w-full rounded-md bg-card",
          isDark && "ag-theme-quartz-dark",
        )}
      >
        <AgGridReact<StockAlertRule>
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

      <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3 dark:border-violet-900 dark:bg-violet-950/20 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-3.5 w-3.5 text-violet-600" />
          <span className="font-medium text-violet-700 dark:text-violet-300">Auto-PO rules</span>
        </div>
        <p className="text-muted-foreground">
          When stock drops below min, the system automatically drafts a purchase order to the preferred supplier. You can approve or modify before submission.
        </p>
      </div>

      <AlertRuleSheet rule={selected} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
