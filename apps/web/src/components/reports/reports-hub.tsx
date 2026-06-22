"use client";

import { useState } from "react";
import {
  TrendingUp, Package, Users, Landmark, Download, Calendar,
  ArrowUpRight, ArrowDownRight, ShoppingCart, BarChart2,
  RefreshCw, Filter, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "sales" | "inventory" | "customers" | "finance";
type Range = "7d" | "30d" | "90d" | "1y";

// ─── Mock data ────────────────────────────────────────────────────────────────

const SALES_DAILY = [
  { day: "Jun 15", revenue: 42500, orders: 18, returns: 2 },
  { day: "Jun 16", revenue: 38200, orders: 15, returns: 1 },
  { day: "Jun 17", revenue: 55100, orders: 23, returns: 3 },
  { day: "Jun 18", revenue: 61800, orders: 27, returns: 2 },
  { day: "Jun 19", revenue: 48300, orders: 21, returns: 0 },
  { day: "Jun 20", revenue: 72400, orders: 31, returns: 4 },
  { day: "Jun 21", revenue: 58900, orders: 25, returns: 2 },
];

const TOP_PRODUCTS = [
  { name: "UrbanWear Classic Tee",  sku: "UW-TEE-001", sold: 142, revenue: 42458, trend: "up" },
  { name: "Wireless Earbuds Pro",   sku: "SKU-0002",   sold: 98,  revenue: 33908, trend: "up" },
  { name: "Running Shoes Ultra",    sku: "SKU-0004",   sold: 87,  revenue: 38280, trend: "down" },
  { name: "Linen Summer Dress",     sku: "SKU-0006",   sold: 76,  revenue: 40584, trend: "up" },
  { name: "Organic Face Serum",     sku: "SKU-0008",   sold: 71,  revenue: 44588, trend: "up" },
  { name: "Yoga Mat Pro",           sku: "SKU-0009",   sold: 64,  revenue: 43200, trend: "down" },
  { name: "Bluetooth Speaker Mini", sku: "SKU-0007",   sold: 59,  revenue: 34279, trend: "up" },
];

const INVENTORY_SUMMARY = [
  { category: "Apparel",     total: 342, inStock: 298, lowStock: 32, outOfStock: 12, value: 2840000 },
  { category: "Electronics", total: 218, inStock: 171, lowStock: 28, outOfStock: 19, value: 6120000 },
  { category: "Home & Living", total: 89, inStock: 80, lowStock: 7,  outOfStock: 2,  value: 890000  },
  { category: "Beauty",      total: 67,  inStock: 61,  lowStock: 5,  outOfStock: 1,  value: 420000  },
  { category: "Sports",      total: 54,  inStock: 47,  lowStock: 6,  outOfStock: 1,  value: 680000  },
];

const LOW_STOCK_ITEMS = [
  { name: "Wireless Earbuds Pro",    sku: "SKU-0002", stock: 8,  min: 15, warehouse: "Dhaka HQ" },
  { name: "Smart Watch Series 5",    sku: "SKU-0005", stock: 3,  min: 10, warehouse: "Dhaka HQ" },
  { name: "USB-C Hub 7-in-1",        sku: "SKU-0014", stock: 0,  min: 5,  warehouse: "Dhaka HQ" },
  { name: "Ceramic Coffee Mug Set",  sku: "SKU-0003", stock: 14, min: 20, warehouse: "Chittagong" },
  { name: "LED Desk Lamp",           sku: "SKU-0010", stock: 0,  min: 8,  warehouse: "Dhaka HQ" },
];

const CUSTOMER_SEGMENTS = [
  { segment: "VIP",         count: 48,  revenue: 1240000, avgOrder: 25833, color: "#8b5cf6" },
  { segment: "Regular",     count: 612, revenue: 2840000, avgOrder: 4641,  color: "#3b82f6" },
  { segment: "New",         count: 284, revenue: 284000,  avgOrder: 1000,  color: "#10b981" },
  { segment: "At Risk",     count: 127, revenue: 127000,  avgOrder: 1000,  color: "#f59e0b" },
  { segment: "Churned",     count: 177, revenue: 0,       avgOrder: 0,     color: "#ef4444" },
];

const TOP_CUSTOMERS = [
  { name: "Rahim Uddin",   orders: 14, revenue: 182450, lastOrder: "Jun 20", segment: "VIP" },
  { name: "Fatima Khan",   orders: 9,  revenue: 124300, lastOrder: "Jun 18", segment: "VIP" },
  { name: "Karim Ahmed",   orders: 11, revenue: 98700,  lastOrder: "Jun 21", segment: "VIP" },
  { name: "Sadia Rahman",  orders: 7,  revenue: 76200,  lastOrder: "Jun 15", segment: "Regular" },
  { name: "Tanvir Islam",  orders: 6,  revenue: 54800,  lastOrder: "Jun 19", segment: "Regular" },
  { name: "Nadia Begum",   orders: 8,  revenue: 49200,  lastOrder: "Jun 17", segment: "Regular" },
  { name: "Zahir Hossain", orders: 5,  revenue: 38400,  lastOrder: "Jun 14", segment: "Regular" },
];

const FINANCE_MONTHLY = [
  { month: "Jan", revenue: 2840000, expenses: 1920000, profit: 920000 },
  { month: "Feb", revenue: 3120000, expenses: 2100000, profit: 1020000 },
  { month: "Mar", revenue: 2980000, expenses: 1980000, profit: 1000000 },
  { month: "Apr", revenue: 3540000, expenses: 2240000, profit: 1300000 },
  { month: "May", revenue: 3820000, expenses: 2380000, profit: 1440000 },
  { month: "Jun", revenue: 4280000, expenses: 2540000, profit: 1740000 },
];

const EXPENSE_BREAKDOWN = [
  { category: "Cost of Goods",  amount: 1480000, pct: 58 },
  { category: "Shipping",       amount: 320000,  pct: 13 },
  { category: "Marketing",      amount: 280000,  pct: 11 },
  { category: "Salaries",       amount: 240000,  pct: 9  },
  { category: "Operations",     amount: 220000,  pct: 9  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `৳${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `৳${(n / 1_000).toFixed(1)}K`;
  return `৳${n.toLocaleString()}`;
}

function num(n: number) {
  return n.toLocaleString();
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────

function BarChart({ data, color = "var(--primary)" }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-t" style={{ height: `${(d.value / max) * 52}px`, background: color, opacity: 0.85 }} />
          <span className="text-[9px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  const size = 80;
  const r = 28;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circumference}
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
          );
          offset += pct;
          return el;
        })}
      </svg>
      <div className="space-y-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-sm shrink-0" style={{ background: seg.color }} />
            <span className="text-[11px] text-muted-foreground">{seg.label}</span>
            <span className="text-[11px] font-medium ml-auto pl-2">{Math.round((seg.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, trend, up }: { label: string; value: string; sub?: string; trend?: string; up?: boolean }) {
  return (
    <div className="rounded-xl border border-input bg-card p-4 shadow-sm">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
      {trend && (
        <p className={`mt-1 flex items-center gap-0.5 text-[11px] font-medium ${up ? "text-emerald-600" : "text-red-500"}`}>
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {trend}
        </p>
      )}
      {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-semibold">{title}</p>
      {action && <button className="text-[11px] text-primary hover:underline">{action}</button>}
    </div>
  );
}

// ─── Table wrapper ────────────────────────────────────────────────────────────

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="rounded-lg border border-input overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-input bg-muted/40">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left text-[11px] font-medium text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-input">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-muted/20">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 text-[12px]">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tab panels ───────────────────────────────────────────────────────────────

function SalesReport({ range }: { range: Range }) {
  const mul = range === "7d" ? 1 : range === "30d" ? 4.3 : range === "90d" ? 13 : 52;
  const revenue    = Math.round(377200 * mul);
  const orders     = Math.round(160 * mul);
  const avgOrder   = Math.round(revenue / orders);
  const returnRate = 2.8;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Revenue"    value={fmt(revenue)}    trend="+14.2% vs prev" up />
        <KpiCard label="Total Orders"     value={num(orders)}     trend="+8.1% vs prev"  up />
        <KpiCard label="Avg Order Value"  value={fmt(avgOrder)}   trend="+5.6% vs prev"  up />
        <KpiCard label="Return Rate"      value={`${returnRate}%`} trend="-0.4% vs prev" up />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue chart */}
        <div className="rounded-xl border border-input bg-card p-4 shadow-sm">
          <SectionHeader title="Daily Revenue" />
          <BarChart
            data={SALES_DAILY.map((d) => ({ label: d.day.replace("Jun ", ""), value: d.revenue }))}
            color="hsl(var(--primary))"
          />
          <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-input">
            {[["Peak Day", "Jun 20", "৳72.4K"], ["Avg/Day", "", fmt(Math.round(revenue / (range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365)))], ["Total Days", "", range === "7d" ? "7" : range === "30d" ? "30" : range === "90d" ? "90" : "365"]].map(([l, s, v]) => (
              <div key={l}>
                <p className="text-[10px] text-muted-foreground">{l}</p>
                <p className="text-[12px] font-semibold">{v}</p>
                {s && <p className="text-[10px] text-muted-foreground">{s}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Orders by source */}
        <div className="rounded-xl border border-input bg-card p-4 shadow-sm">
          <SectionHeader title="Orders by Source" />
          <DonutChart segments={[
            { label: "Web Store",    value: 58, color: "#3b82f6" },
            { label: "Mobile App",   value: 22, color: "#8b5cf6" },
            { label: "Manual Entry", value: 12, color: "#10b981" },
            { label: "Marketplace",  value: 8,  color: "#f59e0b" },
          ]} />
          <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-input">
            <div><p className="text-[10px] text-muted-foreground">COD Orders</p><p className="text-[12px] font-semibold">64%</p></div>
            <div><p className="text-[10px] text-muted-foreground">Online Pay</p><p className="text-[12px] font-semibold">36%</p></div>
          </div>
        </div>
      </div>

      {/* Top products table */}
      <div className="rounded-xl border border-input bg-card p-4 shadow-sm">
        <SectionHeader title="Top Products by Revenue" action="Export CSV" />
        <DataTable
          headers={["Product", "SKU", "Units Sold", "Revenue", "Trend"]}
          rows={TOP_PRODUCTS.map((p) => [
            <span key="n" className="font-medium">{p.name}</span>,
            <span key="s" className="font-mono text-[11px] text-muted-foreground">{p.sku}</span>,
            num(p.sold),
            <span key="r" className="font-semibold">{fmt(p.revenue)}</span>,
            <span key="t" className={`flex items-center gap-0.5 text-[11px] font-medium ${p.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
              {p.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {p.trend === "up" ? "Growing" : "Declining"}
            </span>,
          ])}
        />
      </div>
    </div>
  );
}

function InventoryReport() {
  const totalValue = INVENTORY_SUMMARY.reduce((s, r) => s + r.value, 0);
  const totalSKUs  = INVENTORY_SUMMARY.reduce((s, r) => s + r.total, 0);
  const outOfStock = INVENTORY_SUMMARY.reduce((s, r) => s + r.outOfStock, 0);
  const lowStock   = INVENTORY_SUMMARY.reduce((s, r) => s + r.lowStock, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Stock Value" value={fmt(totalValue)} sub="Across all warehouses" />
        <KpiCard label="Total SKUs"        value={num(totalSKUs)}  sub="Active products" />
        <KpiCard label="Low Stock Items"   value={String(lowStock)} trend="Needs reorder" up={false} />
        <KpiCard label="Out of Stock"      value={String(outOfStock)} trend="Action required" up={false} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-input bg-card p-4 shadow-sm">
          <SectionHeader title="Stock by Category" />
          <div className="space-y-3">
            {INVENTORY_SUMMARY.map((row) => {
              const pct = Math.round((row.inStock / row.total) * 100);
              return (
                <div key={row.category}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="font-medium">{row.category}</span>
                    <span className="text-muted-foreground">{pct}% in stock</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span className="text-emerald-600">{row.inStock} in stock</span>
                    <span className="text-amber-500">{row.lowStock} low</span>
                    <span className="text-red-500">{row.outOfStock} out</span>
                    <span className="ml-auto">{fmt(row.value)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-input bg-card p-4 shadow-sm">
          <SectionHeader title="Inventory Value Breakdown" />
          <DonutChart segments={INVENTORY_SUMMARY.map((r, i) => ({
            label: r.category,
            value: r.value,
            color: ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444"][i],
          }))} />
          <div className="mt-4 pt-3 border-t border-input">
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-[10px] text-muted-foreground">Warehouse (Dhaka HQ)</p><p className="text-[12px] font-semibold">{fmt(totalValue * 0.68)}</p></div>
              <div><p className="text-[10px] text-muted-foreground">Warehouse (Others)</p><p className="text-[12px] font-semibold">{fmt(totalValue * 0.32)}</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-input bg-card p-4 shadow-sm">
        <SectionHeader title="Low Stock & Out of Stock Alert" action="Create Purchase Order" />
        <DataTable
          headers={["Product", "SKU", "Stock", "Min Required", "Warehouse", "Action"]}
          rows={LOW_STOCK_ITEMS.map((item) => [
            <span key="n" className="font-medium">{item.name}</span>,
            <span key="s" className="font-mono text-[11px] text-muted-foreground">{item.sku}</span>,
            <span key="st" className={`font-semibold ${item.stock === 0 ? "text-red-500" : "text-amber-500"}`}>{item.stock}</span>,
            item.min,
            item.warehouse,
            <button key="a" className="text-[11px] text-primary hover:underline">{item.stock === 0 ? "Restock" : "Reorder"}</button>,
          ])}
        />
      </div>
    </div>
  );
}

function CustomerReport() {
  const totalCustomers = CUSTOMER_SEGMENTS.reduce((s, r) => s + r.count, 0);
  const totalRevenue   = CUSTOMER_SEGMENTS.reduce((s, r) => s + r.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Customers"   value={num(totalCustomers)} trend="+3.2% this month" up />
        <KpiCard label="Customer Revenue"  value={fmt(totalRevenue)}   trend="+11.4% vs prev"  up />
        <KpiCard label="Avg LTV"           value={fmt(Math.round(totalRevenue / totalCustomers))} sub="Lifetime value" />
        <KpiCard label="Retention Rate"    value="73.4%" trend="+1.8% vs prev" up />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-input bg-card p-4 shadow-sm">
          <SectionHeader title="Customer Segments" />
          <DonutChart segments={CUSTOMER_SEGMENTS.map((s) => ({
            label: s.segment, value: s.count, color: s.color,
          }))} />
          <div className="mt-4 space-y-2 pt-3 border-t border-input">
            {CUSTOMER_SEGMENTS.map((seg) => (
              <div key={seg.segment} className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-sm" style={{ background: seg.color }} />
                  <span>{seg.segment}</span>
                  <span className="text-muted-foreground">({seg.count})</span>
                </div>
                <span className="font-semibold">{seg.revenue > 0 ? fmt(seg.revenue) : "—"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-input bg-card p-4 shadow-sm">
          <SectionHeader title="Acquisition Channels" />
          <BarChart
            data={[
              { label: "Organic", value: 38 },
              { label: "Referral", value: 24 },
              { label: "Paid Ads", value: 18 },
              { label: "Social", value: 12 },
              { label: "Direct", value: 8 },
            ]}
            color="#8b5cf6"
          />
          <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-input">
            <div><p className="text-[10px] text-muted-foreground">New This Month</p><p className="text-[12px] font-semibold">+47</p></div>
            <div><p className="text-[10px] text-muted-foreground">Churned</p><p className="text-[12px] font-semibold text-red-500">-12</p></div>
            <div><p className="text-[10px] text-muted-foreground">Reactivated</p><p className="text-[12px] font-semibold text-emerald-600">+8</p></div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-input bg-card p-4 shadow-sm">
        <SectionHeader title="Top Customers by Revenue" action="Export CSV" />
        <DataTable
          headers={["Customer", "Orders", "Revenue", "Last Order", "Segment"]}
          rows={TOP_CUSTOMERS.map((c) => [
            <span key="n" className="font-medium">{c.name}</span>,
            c.orders,
            <span key="r" className="font-semibold">{fmt(c.revenue)}</span>,
            c.lastOrder,
            <span key="s" className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
              c.segment === "VIP"
                ? "bg-purple-50 text-purple-700 border border-purple-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}>{c.segment}</span>,
          ])}
        />
      </div>
    </div>
  );
}

function FinanceReport() {
  const latestMonth = FINANCE_MONTHLY[FINANCE_MONTHLY.length - 1];
  const prevMonth   = FINANCE_MONTHLY[FINANCE_MONTHLY.length - 2];
  const revGrowth   = (((latestMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100).toFixed(1);
  const profitMargin = ((latestMonth.profit / latestMonth.revenue) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Revenue (MTD)"    value={fmt(latestMonth.revenue)} trend={`+${revGrowth}% vs prev`} up />
        <KpiCard label="Expenses (MTD)"   value={fmt(latestMonth.expenses)} sub="Operating costs" />
        <KpiCard label="Net Profit (MTD)" value={fmt(latestMonth.profit)} trend="+20.8% vs prev" up />
        <KpiCard label="Profit Margin"    value={`${profitMargin}%`} trend="+2.1% vs prev" up />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-input bg-card p-4 shadow-sm">
          <SectionHeader title="P&L Trend (6 months)" />
          <div className="flex items-end gap-1 h-24">
            {FINANCE_MONTHLY.map((m) => {
              const maxRev = Math.max(...FINANCE_MONTHLY.map((x) => x.revenue));
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: "84px" }}>
                    <div className="w-full rounded-t" style={{ height: `${(m.revenue / maxRev) * 50}px`, background: "#3b82f6", opacity: 0.7 }} />
                    <div className="w-full rounded-t" style={{ height: `${(m.expenses / maxRev) * 50}px`, background: "#ef4444", opacity: 0.5 }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground">{m.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2 text-[11px]">
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-blue-500 opacity-70" /> Revenue</span>
            <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded bg-red-500 opacity-50" /> Expenses</span>
          </div>
        </div>

        <div className="rounded-xl border border-input bg-card p-4 shadow-sm">
          <SectionHeader title="Expense Breakdown (MTD)" />
          <div className="space-y-2.5">
            {EXPENSE_BREAKDOWN.map((e) => (
              <div key={e.category}>
                <div className="flex justify-between text-[12px] mb-1">
                  <span>{e.category}</span>
                  <span className="font-semibold">{fmt(e.amount)} <span className="text-muted-foreground font-normal">({e.pct}%)</span></span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary/70" style={{ width: `${e.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-input bg-card p-4 shadow-sm">
        <SectionHeader title="Monthly P&L Summary" action="Export to Excel" />
        <DataTable
          headers={["Month", "Revenue", "Expenses", "Gross Profit", "Margin"]}
          rows={[...FINANCE_MONTHLY].reverse().map((m) => [
            <span key="m" className="font-medium">{m.month} 2026</span>,
            <span key="r" className="font-semibold text-emerald-600">{fmt(m.revenue)}</span>,
            <span key="e" className="text-red-500">{fmt(m.expenses)}</span>,
            <span key="p" className="font-semibold">{fmt(m.profit)}</span>,
            <span key="mg" className={`font-medium ${(m.profit / m.revenue) > 0.3 ? "text-emerald-600" : "text-amber-500"}`}>
              {((m.profit / m.revenue) * 100).toFixed(1)}%
            </span>,
          ])}
        />
      </div>
    </div>
  );
}

// ─── Main hub ─────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "sales",     label: "Sales",     icon: TrendingUp },
  { key: "inventory", label: "Inventory", icon: Package    },
  { key: "customers", label: "Customers", icon: Users      },
  { key: "finance",   label: "Finance",   icon: Landmark   },
];

const RANGES: { key: Range; label: string }[] = [
  { key: "7d",  label: "Last 7 days"  },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "1y",  label: "Last year"    },
];

export function ReportsHub() {
  const [tab,   setTab]   = useState<Tab>("sales");
  const [range, setRange] = useState<Range>("30d");
  const [showRange, setShowRange] = useState(false);

  const activeRange = RANGES.find((r) => r.key === range)!;

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">MoharazNX</p>
          <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Analytics across sales, inventory, customers & finance</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range picker */}
          <div className="relative">
            <button
              onClick={() => setShowRange((v) => !v)}
              className="flex items-center gap-1.5 rounded-md border border-input bg-card px-3 py-1.5 text-[12px] font-medium hover:bg-muted transition-colors shadow-sm"
            >
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {activeRange.label}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            {showRange && (
              <div className="absolute right-0 top-8 z-10 w-40 rounded-md border border-input bg-card shadow-lg py-1">
                {RANGES.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => { setRange(r.key); setShowRange(false); }}
                    className={`w-full px-3 py-1.5 text-left text-[12px] hover:bg-muted transition-colors ${range === r.key ? "text-primary font-medium" : "text-foreground"}`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button size="sm" variant="outline" className="h-8 gap-1.5">
            <Filter className="h-3.5 w-3.5" /> Filter
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-input">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "sales"     && <SalesReport range={range} />}
      {tab === "inventory" && <InventoryReport />}
      {tab === "customers" && <CustomerReport />}
      {tab === "finance"   && <FinanceReport />}
    </div>
  );
}
