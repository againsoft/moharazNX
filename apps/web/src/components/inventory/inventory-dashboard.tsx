"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowLeftRight,
  Box,
  Calendar,
  ClipboardList,
  Package,
  ScanLine,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Truck,
  Warehouse,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  alertRulesSeed,
  batchesSeed,
  cycleCountsSeed,
  extendedStockSeed,
  extendedTransfersSeed,
  formatBdt,
  inventoryDashboardKpis,
  inventoryMovementChart,
  purchaseOrdersSeed,
  warehouseDistribution,
  extendedAdjustmentsSeed,
} from "@/lib/mock-data/inventory";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function MiniSpark({ data }: { data: { inbound: number; outbound: number }[] }) {
  const max = Math.max(...data.flatMap((d) => [d.inbound, d.outbound]));
  const w = 60;
  const h = 24;
  const pts = (key: "inbound" | "outbound") =>
    data
      .map((d, i) => `${(i / (data.length - 1)) * w},${h - (d[key] / max) * h}`)
      .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-6 w-14 shrink-0">
      <polyline points={pts("inbound")} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts("outbound")} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MovementBar({ day, inbound, outbound, max }: { day: string; inbound: number; outbound: number; max: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-end gap-0.5 h-16">
        <div className="w-3 rounded-t-sm bg-emerald-500" style={{ height: `${(inbound / max) * 64}px` }} />
        <div className="w-3 rounded-t-sm bg-indigo-500" style={{ height: `${(outbound / max) * 64}px` }} />
      </div>
      <span className="text-[9px] text-muted-foreground">{day.slice(0, 1)}</span>
    </div>
  );
}

type ModuleCard = {
  icon: React.ElementType;
  label: string;
  href: string;
  metric: string | number;
  metricLabel: string;
  status?: string;
  statusColor?: string;
  alert?: boolean;
};

function ModuleCard({ card }: { card: ModuleCard }) {
  const Icon = card.icon;
  return (
    <Link
      href={card.href}
      className="group rounded-xl border border-input bg-card p-4 hover:border-indigo-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
      </div>
      <p className="mt-2 text-xs font-medium">{card.label}</p>
      <p className={cn("text-lg font-semibold", card.alert && "text-amber-600")}>{card.metric}</p>
      <p className="text-[10px] text-muted-foreground">{card.metricLabel}</p>
      {card.status && (
        <p className={cn("mt-1 text-[10px] font-medium", card.statusColor ?? "text-muted-foreground")}>{card.status}</p>
      )}
    </Link>
  );
}

export function InventoryDashboard() {
  const inTransit = extendedTransfersSeed.filter((t) => t.status === "in_transit").length;
  const pendingAdj = extendedAdjustmentsSeed.filter((a) => a.status === "pending").length;
  const openPOs = purchaseOrdersSeed.filter((p) => !["received", "cancelled"].includes(p.status)).length;
  const openValue = purchaseOrdersSeed.filter((p) => !["received", "cancelled"].includes(p.status)).reduce((s, p) => s + p.totalValue, 0);
  const expiringSoon = batchesSeed.filter((b) => b.status === "active" && b.daysToExpiry >= 0 && b.daysToExpiry <= 30).length;
  const alertCount = alertRulesSeed.length;
  const pendingCC = cycleCountsSeed.filter((c) => c.status === "pending_review" || c.status === "in_progress").length;
  const lowStock = extendedStockSeed.filter((s) => s.status === "low_stock" || s.status === "out_of_stock").length;

  const maxMov = Math.max(...inventoryMovementChart.flatMap((d) => [d.inbound, d.outbound]));

  const modules: ModuleCard[] = [
    {
      icon: Package,
      label: "Stock Management",
      href: "/inventory/stock",
      metric: extendedStockSeed.length,
      metricLabel: "SKUs tracked",
      status: `${lowStock} low/out of stock`,
      statusColor: lowStock > 0 ? "text-amber-600" : "text-emerald-600",
      alert: lowStock > 0,
    },
    {
      icon: AlertTriangle,
      label: "Low Stock Alerts",
      href: "/inventory/alerts",
      metric: alertCount,
      metricLabel: "active alert rules",
      status: `${alertRulesSeed.filter((r) => r.action === "auto_po").length} auto-PO rules`,
      statusColor: alertCount > 0 ? "text-amber-600" : "text-emerald-600",
      alert: alertCount > 0,
    },
    {
      icon: Warehouse,
      label: "Warehouses",
      href: "/inventory/warehouses",
      metric: 3,
      metricLabel: "active warehouses",
      status: "DHK · CTG · Online FC",
    },
    {
      icon: Truck,
      label: "Transfers",
      href: "/inventory/transfers",
      metric: inTransit,
      metricLabel: "in transit",
      status: `${extendedTransfersSeed.length} total transfers`,
      statusColor: inTransit > 0 ? "text-amber-600" : "text-emerald-600",
    },
    {
      icon: ClipboardList,
      label: "Adjustments",
      href: "/inventory/adjustments",
      metric: pendingAdj,
      metricLabel: "pending review",
      status: `${extendedAdjustmentsSeed.length} total`,
      statusColor: pendingAdj > 0 ? "text-amber-600" : "text-emerald-600",
      alert: pendingAdj > 0,
    },
    {
      icon: ScanLine,
      label: "Cycle Count",
      href: "/inventory/cycle-count",
      metric: pendingCC,
      metricLabel: "sessions active",
      status: `${cycleCountsSeed.length} total sessions`,
      statusColor: pendingCC > 0 ? "text-amber-600" : "text-emerald-600",
    },
    {
      icon: ShoppingCart,
      label: "Purchase Orders",
      href: "/inventory/purchase-orders",
      metric: openPOs,
      metricLabel: "open POs",
      status: formatBdt(openValue) + " open value",
      statusColor: openPOs > 0 ? "text-blue-600" : "text-emerald-600",
    },
    {
      icon: Calendar,
      label: "Batch & Expiry",
      href: "/inventory/batches",
      metric: expiringSoon,
      metricLabel: "expiring in 30d",
      status: `${batchesSeed.filter((b) => b.status === "active").length} active batches`,
      statusColor: expiringSoon > 0 ? "text-amber-600" : "text-emerald-600",
      alert: expiringSoon > 0,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Action strip */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "New transfer", icon: ArrowLeftRight, href: "/inventory/transfers" },
          { label: "New adjustment", icon: ClipboardList, href: "/inventory/adjustments" },
          { label: "Cycle count", icon: ScanLine, href: "/inventory/cycle-count" },
          { label: "New PO", icon: ShoppingCart, href: "/inventory/purchase-orders" },
          { label: "Receive goods", icon: Truck, href: "/inventory/purchase-orders" },
        ].map(({ label, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Button variant="outline" size="sm">
              <Icon className="mr-1.5 h-3.5 w-3.5" />
              {label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Top KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total SKUs", value: inventoryDashboardKpis.totalSkus.toLocaleString(), sub: "Across 3 warehouses", spark: true },
          { label: "Total units", value: inventoryDashboardKpis.totalUnits.toLocaleString(), sub: "+1.2% vs last week", up: true },
          { label: "Stock value", value: formatBdt(inventoryDashboardKpis.stockValue), sub: "FIFO valuation" },
          { label: "Alerts / Issues", value: lowStock + pendingAdj, sub: `${lowStock} low stock · ${pendingAdj} adj pending`, alert: lowStock + pendingAdj > 0 },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={cn(
              "rounded-lg border border-input bg-card p-3 shadow-sm",
              kpi.alert && "border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20",
            )}
          >
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <div className="flex items-end justify-between gap-2">
              <p className={cn("mt-0.5 text-xl font-semibold", kpi.alert && "text-amber-600")}>{kpi.value}</p>
              {kpi.spark && <MiniSpark data={inventoryMovementChart} />}
            </div>
            <p className={cn("text-xs", kpi.up ? "text-emerald-600" : kpi.alert ? "text-amber-600" : "text-muted-foreground")}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Movement chart + warehouse distribution */}
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-input bg-card p-3 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium">Stock movements (7 days)</h2>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Inbound</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-indigo-500" />Outbound</span>
            </div>
          </div>
          <div className="flex items-end justify-between gap-2">
            {inventoryMovementChart.map((d) => (
              <MovementBar key={d.day} day={d.day} inbound={d.inbound} outbound={d.outbound} max={maxMov} />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-input bg-card p-3">
          <h2 className="mb-3 text-sm font-medium">Units by warehouse</h2>
          <div className="space-y-3">
            {warehouseDistribution.map((w) => {
              const pct = (w.units / 14200) * 100;
              return (
                <div key={w.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{w.name}</span>
                    <span className="font-medium">{w.units.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs border-t border-input pt-3">
            <div className="rounded-md border border-input p-2">
              <p className="text-muted-foreground">In transit</p>
              <p className="font-semibold text-amber-600">{inTransit}</p>
            </div>
            <div className="rounded-md border border-input p-2">
              <p className="text-muted-foreground">Open POs</p>
              <p className="font-semibold text-blue-600">{openPOs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Module grid */}
      <div>
        <h2 className="text-sm font-medium mb-3">Modules</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((card) => (
            <ModuleCard key={card.label} card={card} />
          ))}
        </div>
      </div>

      {/* Bottom row: recent alerts + expiring batches */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-medium">Low stock alerts</h3>
            </div>
            <Link href="/inventory/alerts" className="text-xs text-indigo-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-1.5">
            {alertRulesSeed.slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs">
                <div>
                  <p className="font-medium">{r.product}</p>
                  <p className="text-muted-foreground">{r.sku} · {r.warehouse}</p>
                </div>
                <div className="text-right">
                  <p className={cn("font-semibold", r.currentQty === 0 ? "text-red-600" : "text-amber-600")}>{r.currentQty} / {r.minQty}</p>
                  <p className="text-muted-foreground text-[10px]">current / min</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-input bg-card p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Expiring batches (30d)</h3>
              <Link href="/inventory/batches" className="text-xs text-indigo-600 hover:underline">View all →</Link>
            </div>
            {batchesSeed
              .filter((b) => b.daysToExpiry >= 0 && b.daysToExpiry <= 90 && b.status === "active")
              .sort((a, b) => a.daysToExpiry - b.daysToExpiry)
              .slice(0, 3)
              .map((b) => (
                <div key={b.id} className="flex items-center justify-between rounded-md border border-input px-3 py-2 text-xs mb-2 last:mb-0">
                  <div>
                    <p className="font-medium">{b.product}</p>
                    <p className="text-muted-foreground">{b.lot} · {b.available} units</p>
                  </div>
                  <div className={cn("text-right font-semibold", b.daysToExpiry <= 30 ? "text-amber-600" : "text-muted-foreground")}>
                    {b.daysToExpiry}d
                  </div>
                </div>
              ))}
          </div>

          <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/20 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-medium">AI insights</h3>
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="text-muted-foreground"><span className="font-medium text-indigo-700 dark:text-indigo-300">Reorder: </span>Wireless Earbuds Pro — auto PO for 50 units queued</p>
              <p className="text-muted-foreground"><span className="font-medium text-indigo-700 dark:text-indigo-300">Overstock: </span>Bluetooth Speaker Mini at Chittagong (+180% vs max)</p>
              <p className="text-muted-foreground"><span className="font-medium text-indigo-700 dark:text-indigo-300">Incoming: </span>USB-C Hub 12 units arriving Jun 20 from GlobalTech</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
