"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowLeftRight,
  ClipboardList,
  Package,
  Plus,
  ScanLine,
  Truck,
  Warehouse,
} from "lucide-react";
import { toast } from "sonner";
import {
  adjustmentsSeed,
  aiForecastHighlights,
  expiringBatches,
  formatBdt,
  inventoryKpis,
  lowStockAlerts,
  reservationsSeed,
  STOCK_STATUS_LABELS,
  stockMovementChart,
  transfersSeed,
  warehouseDistribution,
  warehousesSeed,
  type InventoryTab,
  type StockStatus,
} from "@/lib/mock-data/inventory";
import { useInventoryStore } from "@/lib/store/inventory-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import { InventoryNav } from "@/components/inventory/inventory-nav";

function stockStatusVariant(status: StockStatus) {
  if (status === "in_stock") return "success" as const;
  if (status === "low_stock") return "warning" as const;
  if (status === "out_of_stock") return "muted" as const;
  return "secondary" as const;
}

function DashboardTab() {
  const inTransit = transfersSeed.filter((t) => t.status === "in_transit").length;
  const pendingAdj = adjustmentsSeed.filter((a) => a.status === "pending").length;
  const movements = useInventoryStore((s) => s.movements);
  const recentMovements = movements.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          { label: "New transfer", icon: ArrowLeftRight },
          { label: "New adjustment", icon: ClipboardList },
          { label: "Cycle count", icon: ScanLine },
          { label: "Receive goods", icon: Truck },
        ].map(({ label, icon: Icon }) => (
          <Button
            key={label}
            variant="outline"
            size="sm"
            onClick={() => toast.info(`${label} — prototype`)}
          >
            <Icon className="mr-1.5 h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {inventoryKpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-input bg-card p-3 shadow-sm">
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <p className="mt-0.5 text-xl font-semibold">{kpi.value}</p>
            <p
              className={cn(
                "text-xs",
                kpi.alert ? "text-amber-600" : kpi.up ? "text-emerald-600" : "text-muted-foreground",
              )}
            >
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-input bg-card p-3 lg:col-span-2">
          <h2 className="mb-2 text-sm font-medium">Stock movements (7 days)</h2>
          <div className="h-44 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockMovementChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="inbound" name="Inbound" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outbound" name="Outbound" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-input bg-card p-3">
          <h2 className="mb-2 text-sm font-medium">Units by warehouse</h2>
          <div className="space-y-2">
            {warehouseDistribution.map((w) => (
              <div key={w.name}>
                <div className="flex justify-between text-xs">
                  <span>{w.name}</span>
                  <span className="font-medium">{w.units.toLocaleString()}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${(w.units / 14200) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded-md border border-input p-2">
              <p className="text-muted-foreground">In transit</p>
              <p className="font-semibold">{inTransit}</p>
            </div>
            <div className="rounded-md border border-input p-2">
              <p className="text-muted-foreground">Pending adj.</p>
              <p className="font-semibold">{pendingAdj}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-medium">Low stock alerts</h2>
          </div>
          <div className="space-y-2">
            {lowStockAlerts.map((item) => (
              <div key={item.id} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.sku} · {item.available} available (min {item.minQty})
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-input bg-card p-3">
            <h2 className="mb-2 text-sm font-medium">Expiring batches (30 days)</h2>
            {expiringBatches.map((b) => (
              <div key={b.lot} className="mb-2 rounded-md border border-input px-3 py-2 text-sm last:mb-0">
                <p className="font-medium">{b.product}</p>
                <p className="text-xs text-muted-foreground">
                  {b.lot} · {b.qty} units · expires {b.expiry}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3 dark:border-violet-900 dark:bg-violet-950/20">
            <h2 className="mb-2 text-sm font-medium">AI forecast highlights</h2>
            {aiForecastHighlights.map((h) => (
              <div key={h.title} className="mb-2 last:mb-0">
                <p className="text-sm font-medium text-violet-700 dark:text-violet-300">{h.title}</p>
                <p className="text-xs text-muted-foreground">{h.body}</p>
              </div>
            ))}
          </div>

          {recentMovements.length > 0 && (
            <div className="rounded-lg border border-input bg-card p-3 lg:col-span-2">
              <h2 className="mb-2 text-sm font-medium">Recent stock movements</h2>
              <ul className="space-y-1.5 text-xs">
                {recentMovements.map((m) => (
                  <li key={m.id} className="flex flex-wrap justify-between gap-1 border-b border-input/60 pb-1.5 last:border-0">
                    <span>
                      <span className="font-mono">{m.sku}</span>
                      <span className="text-muted-foreground"> · {m.referenceLabel}</span>
                    </span>
                    <span className="text-muted-foreground">
                      {m.type.replace(/_/g, " ")} {m.quantity} @ {m.warehouse}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StockTab() {
  const [search, setSearch] = useState("");
  const [warehouse, setWarehouse] = useState("all");
  const [status, setStatus] = useState("all");
  const stockItems = useInventoryStore((s) => s.stockItems);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return stockItems.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q) && !s.sku.toLowerCase().includes(q)) return false;
      if (warehouse !== "all" && s.warehouse !== warehouse) return false;
      if (status !== "all" && s.status !== status) return false;
      return true;
    });
  }, [search, warehouse, status, stockItems]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search SKU, product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-[220px]"
        />
        <Select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="w-[160px]">
          <option value="all">All warehouses</option>
          {warehousesSeed.map((w) => (
            <option key={w.id} value={w.name}>
              {w.name}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-[140px]">
          <option value="all">All status</option>
          {(Object.keys(STOCK_STATUS_LABELS) as StockStatus[]).map((s) => (
            <option key={s} value={s}>
              {STOCK_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Button size="sm" className="ml-auto" onClick={() => toast.info("Export — prototype")}>
          Export
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-input">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="border-b border-input bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="px-3 py-2 font-medium">Warehouse</th>
              <th className="px-3 py-2 font-medium text-right">On hand</th>
              <th className="px-3 py-2 font-medium text-right">Reserved</th>
              <th className="px-3 py-2 font-medium text-right">Available</th>
              <th className="px-3 py-2 font-medium text-right">Incoming</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <span className="h-8 w-8 rounded bg-muted" />
                    )}
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{item.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 text-xs">{item.warehouse}</td>
                <td className="px-3 py-2 text-right">{item.onHand}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{item.reserved}</td>
                <td className="px-3 py-2 text-right font-medium">{item.available}</td>
                <td className="px-3 py-2 text-right text-muted-foreground">{item.incoming || "—"}</td>
                <td className="px-3 py-2">
                  <Badge variant={stockStatusVariant(item.status)} className="text-[10px]">
                    {STOCK_STATUS_LABELS[item.status]}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-right text-xs">
                  {formatBdt(item.onHand * item.unitCost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        qty_available = on_hand − reserved · Product identity from Product Master (read-only)
      </p>
    </div>
  );
}

function WarehousesTab() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {warehousesSeed.map((wh) => (
        <div key={wh.id} className="rounded-lg border border-input bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Warehouse className="h-4 w-4 text-indigo-600" />
              <div>
                <h3 className="font-semibold">{wh.name}</h3>
                <p className="font-mono text-[11px] text-muted-foreground">{wh.code}</p>
              </div>
            </div>
            <Badge variant={wh.active ? "success" : "muted"}>{wh.active ? "Active" : "Inactive"}</Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{wh.type}</p>
          <p className="text-xs text-muted-foreground">{wh.address}</p>
          <div className="mt-3 flex gap-4 text-xs">
            <span>{wh.locations} locations</span>
            <span>{wh.totalUnits.toLocaleString()} units</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full"
            onClick={() => toast.info(`${wh.name} locations — prototype`)}
          >
            View locations
          </Button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => toast.info("Add warehouse — prototype")}
        className="flex min-h-[160px] flex-col items-center justify-center rounded-lg border border-dashed border-input bg-muted/20 text-muted-foreground hover:bg-muted/40"
      >
        <Plus className="mb-2 h-6 w-6" />
        <span className="text-sm font-medium">Add warehouse</span>
      </button>
    </div>
  );
}

function TransfersTab() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => toast.info("New transfer — prototype")}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New transfer
        </Button>
      </div>
      {transfersSeed.map((t) => (
        <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-input bg-card p-4">
          <div>
            <p className="font-mono text-sm font-medium">{t.id}</p>
            <p className="mt-1 text-sm">
              {t.from} → {t.to}
            </p>
            <p className="text-xs text-muted-foreground">
              {t.items} items · {t.units} units · {t.createdAt}
            </p>
          </div>
          <Badge
            variant={
              t.status === "received"
                ? "success"
                : t.status === "in_transit"
                  ? "warning"
                  : "secondary"
            }
            className="capitalize"
          >
            {t.status.replace("_", " ")}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function AdjustmentsTab() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => toast.info("New adjustment — prototype")}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New adjustment
        </Button>
      </div>
      {adjustmentsSeed.map((a) => (
        <div key={a.id} className="rounded-lg border border-input bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-mono text-sm font-medium">{a.id}</p>
              <p className="mt-1 font-medium">{a.product}</p>
              <p className="text-xs text-muted-foreground">
                {a.sku} · {a.warehouse} · {a.reason}
              </p>
            </div>
            <div className="text-right">
              <p className={cn("text-lg font-semibold", a.qtyChange < 0 ? "text-red-500" : "text-emerald-600")}>
                {a.qtyChange > 0 ? "+" : ""}
                {a.qtyChange}
              </p>
              <Badge
                variant={
                  a.status === "approved" ? "success" : a.status === "pending" ? "warning" : "muted"
                }
                className="mt-1 capitalize"
              >
                {a.status}
              </Badge>
            </div>
          </div>
          {a.status === "pending" && (
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toast.success("Rejected (mock)")}>
                Reject
              </Button>
              <Button size="sm" onClick={() => toast.success("Approved (mock)")}>
                Approve
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ReservationsTab() {
  const totalHeld = reservationsSeed.reduce((s, r) => s + r.qty, 0);
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {reservationsSeed.length} active holds · {totalHeld} units reserved for orders
      </p>
      <div className="overflow-hidden rounded-lg border border-input">
        <table className="w-full text-sm">
          <thead className="border-b border-input bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Order</th>
              <th className="px-3 py-2 font-medium">Product</th>
              <th className="px-3 py-2 font-medium">Warehouse</th>
              <th className="px-3 py-2 font-medium text-right">Qty</th>
              <th className="px-3 py-2 font-medium">Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reservationsSeed.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="px-3 py-2 font-mono text-xs">{r.orderId}</td>
                <td className="px-3 py-2">
                  <p className="font-medium">{r.product}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{r.sku}</p>
                </td>
                <td className="px-3 py-2 text-xs">{r.warehouse}</td>
                <td className="px-3 py-2 text-right font-medium">{r.qty}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.expiresAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InventoryControlCenter() {
  const [tab, setTab] = useState<InventoryTab>("dashboard");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50/40 px-4 py-2.5 text-xs dark:border-indigo-900/50 dark:bg-indigo-950/20">
        <Package className="h-4 w-4 shrink-0 text-indigo-600" />
        <span>
          Independent stock ledger — Product Master identity, immutable movements, event-driven
          channels (Orders, Purchase, POS).
        </span>
      </div>

      <InventoryNav
        active={tab}
        onChange={setTab}
        lowStockCount={lowStockAlerts.length}
      />

      {tab === "dashboard" && <DashboardTab />}
      {tab === "stock" && <StockTab />}
      {tab === "warehouses" && <WarehousesTab />}
      {tab === "transfers" && <TransfersTab />}
      {tab === "adjustments" && <AdjustmentsTab />}
      {tab === "reservations" && <ReservationsTab />}
    </div>
  );
}
