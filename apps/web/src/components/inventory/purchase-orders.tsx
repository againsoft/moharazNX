"use client";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { CheckCircle2, Package, Plus, Send, Truck } from "lucide-react";
import { toast } from "sonner";
import {
  formatBdt,
  purchaseOrdersSeed,
  PO_STATUS_LABELS,
  type PurchaseOrder,
  type PurchaseOrderStatus,
} from "@/lib/mock-data/inventory";
import { useIsDark } from "@/lib/use-is-dark";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function poStatusVariant(s: PurchaseOrderStatus) {
  if (s === "received") return "success" as const;
  if (s === "confirmed" || s === "partial") return "warning" as const;
  if (s === "cancelled") return "muted" as const;
  if (s === "sent") return "secondary" as const;
  return "secondary" as const;
}

function StatusPill({ value }: { value: PurchaseOrderStatus }) {
  return (
    <div className="flex items-center h-full">
      <Badge variant={poStatusVariant(value)} className="text-[10px]">
        {PO_STATUS_LABELS[value]}
      </Badge>
    </div>
  );
}

function ReceiveProgress({ data }: { data: PurchaseOrder }) {
  const ordered = data.items.reduce((s, i) => s + i.ordered, 0);
  const received = data.items.reduce((s, i) => s + i.received, 0);
  const pct = ordered > 0 ? Math.round((received / ordered) * 100) : 0;
  return (
    <div className="flex items-center gap-2 h-full">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full", pct === 100 ? "bg-emerald-500" : "bg-indigo-500")} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] tabular-nums text-muted-foreground w-16 text-right">
        {received}/{ordered}
      </span>
    </div>
  );
}

function POSheet({ po, open, onClose }: { po: PurchaseOrder | null; open: boolean; onClose: () => void }) {
  if (!po) return null;
  const ordered = po.items.reduce((s, i) => s + i.ordered, 0);
  const received = po.items.reduce((s, i) => s + i.received, 0);

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[460px] overflow-y-auto">
        <div className="border-b border-border pb-4">
          <p className="text-xs text-muted-foreground">Purchase Order</p>
          <h2 className="font-mono font-semibold">{po.id}</h2>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={poStatusVariant(po.status)} className="text-[10px]">
              {PO_STATUS_LABELS[po.status]}
            </Badge>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-input bg-card p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Supplier</span>
              <span className="font-medium">{po.supplier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Warehouse</span>
              <span>{po.warehouse}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total value</span>
              <span className="font-semibold">{formatBdt(po.totalValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expected date</span>
              <span>{po.expectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{po.createdAt}</span>
            </div>
          </div>

          {po.notes && (
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20 p-3 text-xs text-blue-700 dark:text-blue-300">
              {po.notes}
            </div>
          )}

          <div>
            <h3 className="text-xs font-medium mb-2">Line items</h3>
            <div className="rounded-lg border border-input overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Product</th>
                    <th className="px-3 py-2 text-right font-medium">Ordered</th>
                    <th className="px-3 py-2 text-right font-medium">Received</th>
                    <th className="px-3 py-2 text-right font-medium">Unit cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {po.items.map((item) => (
                    <tr key={item.sku} className="hover:bg-muted/20">
                      <td className="px-3 py-2">
                        <p className="font-medium">{item.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{item.sku}</p>
                      </td>
                      <td className="px-3 py-2 text-right">{item.ordered}</td>
                      <td className="px-3 py-2 text-right">
                        <span className={cn(item.received === item.ordered ? "text-emerald-600 font-semibold" : "")}>
                          {item.received}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">{formatBdt(item.unitCost)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/20 border-t border-input">
                  <tr>
                    <td className="px-3 py-2 font-medium">Total</td>
                    <td className="px-3 py-2 text-right font-medium">{ordered}</td>
                    <td className="px-3 py-2 text-right font-medium text-emerald-600">{received}</td>
                    <td className="px-3 py-2 text-right font-semibold">{formatBdt(po.totalValue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {po.status === "draft" && (
              <Button size="sm" className="flex-1" onClick={() => { toast.success("PO sent (mock)"); onClose(); }}>
                <Send className="mr-1.5 h-3.5 w-3.5" /> Send to supplier
              </Button>
            )}
            {(po.status === "confirmed" || po.status === "partial") && (
              <Button size="sm" className="flex-1" onClick={() => toast.info("Receive goods — prototype")}>
                <Truck className="mr-1.5 h-3.5 w-3.5" /> Receive goods
              </Button>
            )}
            {po.status === "received" && (
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Fully received · stock updated</span>
              </div>
            )}
            <Button size="sm" variant="outline" onClick={() => toast.info("Print PO — prototype")}>
              Print PO
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function PurchaseOrders() {
  const isDark = useIsDark();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const rowData = useMemo(
    () =>
      purchaseOrdersSeed.filter(
        (p) => statusFilter === "all" || p.status === statusFilter,
      ),
    [statusFilter],
  );

  const openValue = purchaseOrdersSeed
    .filter((p) => !["received", "cancelled"].includes(p.status))
    .reduce((s, p) => s + p.totalValue, 0);

  const colDefs = useMemo<ColDef<PurchaseOrder>[]>(
    () => [
      { headerName: "PO #", field: "id", pinned: "left", minWidth: 130, cellStyle: { fontFamily: "monospace", fontSize: 12 } },
      { headerName: "Supplier", field: "supplier", minWidth: 180 },
      { headerName: "Warehouse", field: "warehouse", minWidth: 130 },
      {
        headerName: "Status",
        field: "status",
        minWidth: 120,
        cellRenderer: (p: ICellRendererParams<PurchaseOrder>) =>
          p.value ? <StatusPill value={p.value as PurchaseOrderStatus} /> : null,
      },
      { headerName: "Items", minWidth: 80, type: "numericColumn", valueGetter: (p) => p.data?.items.length ?? 0 },
      {
        headerName: "Total value",
        field: "totalValue",
        minWidth: 130,
        type: "numericColumn",
        valueFormatter: (p) => formatBdt(p.value),
      },
      {
        headerName: "Receipt",
        minWidth: 160,
        cellRenderer: (p: ICellRendererParams<PurchaseOrder>) =>
          p.data ? <ReceiveProgress data={p.data} /> : null,
      },
      { headerName: "Expected", field: "expectedDate", minWidth: 110 },
      { headerName: "Created", field: "createdAt", minWidth: 110 },
    ],
    [],
  );

  const open = purchaseOrdersSeed.filter((p) => !["received", "cancelled"].includes(p.status)).length;
  const received = purchaseOrdersSeed.filter((p) => p.status === "received").length;
  const draft = purchaseOrdersSeed.filter((p) => p.status === "draft").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Open POs", value: open, warn: open > 0 },
          { label: "Draft", value: draft },
          { label: "Received", value: received },
          { label: "Open value", value: formatBdt(openValue) },
        ].map((kpi) => (
          <div key={kpi.label} className={cn("rounded-lg border border-input bg-card p-3 shadow-sm", kpi.warn && "border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20")}>
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <p className={cn("mt-0.5 text-xl font-semibold", kpi.warn && "text-amber-600")}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-input overflow-hidden">
          {(["all", "draft", "sent", "confirmed", "partial", "received", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-2.5 py-1.5 text-xs font-medium capitalize",
                statusFilter === s ? "bg-foreground text-background" : "hover:bg-muted/50",
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <Button size="sm" className="ml-auto" onClick={() => toast.info("New PO — prototype")}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New PO
        </Button>
      </div>

      <div
        className={cn(
          "ag-theme-quartz control-border w-full rounded-md bg-card",
          isDark && "ag-theme-quartz-dark",
        )}
      >
        <AgGridReact<PurchaseOrder>
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

      <POSheet po={selected} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
