"use client";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { ArrowRight, Plus, Truck } from "lucide-react";
import { toast } from "sonner";
import {
  extendedTransfersSeed,
  warehousesSeed,
  type StockTransfer,
  type TransferStatus,
} from "@/lib/mock-data/inventory";
import { useIsDark } from "@/lib/use-is-dark";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

function statusVariant(s: TransferStatus) {
  if (s === "received") return "success" as const;
  if (s === "in_transit") return "warning" as const;
  if (s === "draft") return "secondary" as const;
  return "muted" as const;
}

function StatusPill({ value }: { value: TransferStatus }) {
  const label = value.replace(/_/g, " ");
  return (
    <div className="flex items-center h-full">
      <Badge variant={statusVariant(value)} className="capitalize text-[10px]">{label}</Badge>
    </div>
  );
}

function RouteCell({ data }: ICellRendererParams<StockTransfer>) {
  if (!data) return null;
  return (
    <div className="flex items-center gap-1.5 h-full text-xs">
      <span className="font-medium">{data.from}</span>
      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
      <span className="font-medium">{data.to}</span>
    </div>
  );
}

function TransferSheet({
  transfer,
  open,
  onClose,
}: {
  transfer: StockTransfer | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!transfer) return null;
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-[400px] overflow-y-auto">
        <div className="border-b border-border pb-4">
          <p className="text-xs text-muted-foreground">Transfer</p>
          <h2 className="font-mono font-semibold">{transfer.id}</h2>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={statusVariant(transfer.status)} className="capitalize text-[10px]">
              {transfer.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-input bg-card p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{transfer.from}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{transfer.to}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Items</p>
                <p className="font-semibold text-base">{transfer.items}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Units</p>
                <p className="font-semibold text-base">{transfer.units}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">{transfer.createdAt}</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            {[
              { step: "Draft created", done: true },
              { step: "Approved", done: transfer.status !== "draft" },
              { step: "Items picked", done: transfer.status === "in_transit" || transfer.status === "received" },
              { step: "In transit", done: transfer.status === "in_transit" || transfer.status === "received" },
              { step: "Received", done: transfer.status === "received" },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-2 text-xs">
                <div className={cn("h-2 w-2 rounded-full", s.done ? "bg-emerald-500" : "bg-muted")} />
                <span className={cn(s.done ? "text-foreground" : "text-muted-foreground")}>{s.step}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            {transfer.status === "draft" && (
              <Button size="sm" className="flex-1" onClick={() => { toast.success("Approved (mock)"); onClose(); }}>
                Approve & pick
              </Button>
            )}
            {transfer.status === "in_transit" && (
              <Button size="sm" className="flex-1" onClick={() => { toast.success("Marked received (mock)"); onClose(); }}>
                Mark received
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => toast.info("Print manifest — prototype")}>
              Print
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function TransferManager() {
  const isDark = useIsDark();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<StockTransfer | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const rowData = useMemo(
    () =>
      extendedTransfersSeed.filter(
        (t) => statusFilter === "all" || t.status === statusFilter,
      ),
    [statusFilter],
  );

  const inTransit = extendedTransfersSeed.filter((t) => t.status === "in_transit").length;
  const draft = extendedTransfersSeed.filter((t) => t.status === "draft").length;
  const received = extendedTransfersSeed.filter((t) => t.status === "received").length;

  const colDefs = useMemo<ColDef<StockTransfer>[]>(
    () => [
      { headerName: "ID", field: "id", pinned: "left", minWidth: 110, cellStyle: { fontFamily: "monospace", fontSize: 12 } },
      {
        headerName: "Route",
        minWidth: 200,
        cellRenderer: RouteCell,
      },
      { headerName: "Items", field: "items", type: "numericColumn", minWidth: 80 },
      { headerName: "Units", field: "units", type: "numericColumn", minWidth: 80 },
      {
        headerName: "Status",
        field: "status",
        minWidth: 120,
        cellRenderer: (p: ICellRendererParams<StockTransfer>) =>
          p.value ? <StatusPill value={p.value as TransferStatus} /> : null,
      },
      { headerName: "Created", field: "createdAt", minWidth: 110 },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total transfers", value: extendedTransfersSeed.length },
          { label: "In transit", value: inTransit, warn: inTransit > 0 },
          { label: "Draft", value: draft },
          { label: "Received", value: received },
        ].map((kpi) => (
          <div key={kpi.label} className={cn("rounded-lg border border-input bg-card p-3 shadow-sm", kpi.warn && "border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20")}>
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <p className={cn("mt-0.5 text-xl font-semibold", kpi.warn && "text-amber-600")}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-input overflow-hidden">
          {(["all", "draft", "in_transit", "received", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium capitalize",
                statusFilter === s ? "bg-foreground text-background" : "hover:bg-muted/50",
              )}
            >
              {s === "all" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>
        <Button size="sm" className="ml-auto" onClick={() => toast.info("New transfer — prototype")}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New transfer
        </Button>
      </div>

      <div
        className={cn(
          "ag-theme-quartz control-border w-full rounded-md bg-card",
          isDark && "ag-theme-quartz-dark",
        )}
      >
        <AgGridReact<StockTransfer>
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

      <TransferSheet transfer={selected} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
