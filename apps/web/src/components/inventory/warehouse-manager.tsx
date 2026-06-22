"use client";

import { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Building2, Grid3x3, Package, Plus, Warehouse as WarehouseIcon } from "lucide-react";
import { toast } from "sonner";
import {
  warehouseZonesSeed,
  type Warehouse,
  type WarehouseZone,
  type ZoneType,
} from "@/lib/mock-data/inventory";
import { useIsDark } from "@/lib/use-is-dark";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ZONE_TYPE_COLOR: Record<ZoneType, string> = {
  receiving: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  storage: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  picking: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
  packing: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  dispatch: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  quarantine: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
};

function CapacityBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  const color = pct > 85 ? "bg-red-500" : pct > 65 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2 h-full">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] tabular-nums text-muted-foreground w-8 text-right">{pct}%</span>
    </div>
  );
}

function ZoneTypePill({ value }: { value: ZoneType }) {
  return (
    <div className="flex items-center h-full">
      <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium capitalize", ZONE_TYPE_COLOR[value])}>
        {value}
      </span>
    </div>
  );
}

function WarehouseCard({ wh }: { wh: Warehouse }) {
  const zones = warehouseZonesSeed.filter((z) => z.warehouseId === wh.id);
  const totalCap = zones.reduce((s, z) => s + z.totalCapacity, 0);
  const usedCap = zones.reduce((s, z) => s + z.usedCapacity, 0);
  const pct = totalCap > 0 ? Math.round((usedCap / totalCap) * 100) : 0;

  return (
    <div className="rounded-xl border border-input bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center">
            <WarehouseIcon className="h-4.5 w-4.5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{wh.name}</h3>
            <p className="font-mono text-[10px] text-muted-foreground">{wh.code}</p>
          </div>
        </div>
        <Badge variant={wh.active ? "success" : "muted"} className="text-[10px]">
          {wh.active ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="text-xs text-muted-foreground">{wh.type} · {wh.address}</div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Capacity</span>
          <span className={cn("font-medium", pct > 85 ? "text-red-600" : pct > 65 ? "text-amber-600" : "text-emerald-600")}>
            {pct}% used
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full", pct > 85 ? "bg-red-500" : pct > 65 ? "bg-amber-500" : "bg-emerald-500")}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>{usedCap.toLocaleString()} used</span>
          <span>{totalCap.toLocaleString()} total</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-md border border-input p-1.5">
          <p className="text-muted-foreground text-[10px]">Units</p>
          <p className="font-semibold">{wh.totalUnits.toLocaleString()}</p>
        </div>
        <div className="rounded-md border border-input p-1.5">
          <p className="text-muted-foreground text-[10px]">Zones</p>
          <p className="font-semibold">{zones.length}</p>
        </div>
        <div className="rounded-md border border-input p-1.5">
          <p className="text-muted-foreground text-[10px]">Bins</p>
          <p className="font-semibold">{zones.reduce((s, z) => s + z.totalBins, 0)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => toast.info(`${wh.name} zones — prototype`)}>
          <Grid3x3 className="mr-1.5 h-3 w-3" /> View zones
        </Button>
        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => toast.info(`${wh.name} stock — prototype`)}>
          <Package className="mr-1.5 h-3 w-3" /> View stock
        </Button>
      </div>
    </div>
  );
}

const zoneColDefs: ColDef<WarehouseZone>[] = [
  {
    headerName: "Warehouse",
    field: "warehouseName",
    minWidth: 140,
    rowGroup: true,
    hide: true,
  },
  { headerName: "Zone code", field: "zoneCode", minWidth: 100, pinned: "left" },
  { headerName: "Name", field: "name", minWidth: 200 },
  {
    headerName: "Type",
    field: "type",
    minWidth: 110,
    cellRenderer: (p: ICellRendererParams<WarehouseZone>) =>
      p.value ? <ZoneTypePill value={p.value as ZoneType} /> : null,
  },
  { headerName: "Total bins", field: "totalBins", type: "numericColumn", minWidth: 100 },
  { headerName: "Occupied", field: "occupiedBins", type: "numericColumn", minWidth: 100 },
  {
    headerName: "Capacity",
    minWidth: 160,
    cellRenderer: (p: ICellRendererParams<WarehouseZone>) =>
      p.data ? <CapacityBar used={p.data.usedCapacity} total={p.data.totalCapacity} /> : null,
  },
  { headerName: "Total cap", field: "totalCapacity", type: "numericColumn", minWidth: 100 },
  { headerName: "Used cap", field: "usedCapacity", type: "numericColumn", minWidth: 100 },
  {
    headerName: "Status",
    field: "active",
    minWidth: 90,
    cellRenderer: (p: ICellRendererParams<WarehouseZone>) => (
      <div className="flex items-center h-full">
        <Badge variant={p.value ? "success" : "muted"} className="text-[10px]">
          {p.value ? "Active" : "Inactive"}
        </Badge>
      </div>
    ),
  },
];

export function WarehouseManager({
  warehouses,
  loading = false,
}: {
  warehouses: Warehouse[];
  loading?: boolean;
}) {
  const isDark = useIsDark();
  const [view, setView] = useState<"cards" | "zones">("cards");

  const totalUnits = warehouses.reduce((s, w) => s + w.totalUnits, 0);
  const totalZones = warehouseZonesSeed.length;
  const totalBins = warehouseZonesSeed.reduce((s, z) => s + z.totalBins, 0);
  const occupiedBins = warehouseZonesSeed.reduce((s, z) => s + z.occupiedBins, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Warehouses", value: loading ? "…" : warehouses.length },
          { label: "Total units", value: totalUnits.toLocaleString() },
          { label: "Zones", value: totalZones },
          { label: "Bins occupied", value: `${occupiedBins} / ${totalBins}` },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-input bg-card p-3 shadow-sm">
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <p className="mt-0.5 text-xl font-semibold">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-input overflow-hidden">
          {(["cards", "zones"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium capitalize",
                view === v ? "bg-foreground text-background" : "hover:bg-muted/50",
              )}
            >
              {v === "cards" ? "Warehouses" : "Zone matrix"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => toast.info("Add zone — prototype")}>
            <Grid3x3 className="mr-1.5 h-3.5 w-3.5" /> Add zone
          </Button>
          <Button size="sm" onClick={() => toast.info("Add warehouse — prototype")}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add warehouse
          </Button>
        </div>
      </div>

      {view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {warehouses.map((wh) => (
            <WarehouseCard key={wh.id} wh={wh} />
          ))}
          <button
            type="button"
            onClick={() => toast.info("Add warehouse — prototype")}
            className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-input bg-muted/20 text-muted-foreground hover:bg-muted/40"
          >
            <Plus className="mb-2 h-6 w-6" />
            <span className="text-sm font-medium">Add warehouse</span>
          </button>
        </div>
      ) : (
        <div
          className={cn(
            "ag-theme-quartz control-border w-full rounded-md bg-card",
            isDark && "ag-theme-quartz-dark",
          )}
        >
          <AgGridReact<WarehouseZone>
            theme="legacy"
            rowData={warehouseZonesSeed}
            columnDefs={zoneColDefs}
            
            domLayout="autoHeight"
            rowHeight={44}
            defaultColDef={{ sortable: true, resizable: true }}
            groupDefaultExpanded={1}
          />
        </div>
      )}
    </div>
  );
}
