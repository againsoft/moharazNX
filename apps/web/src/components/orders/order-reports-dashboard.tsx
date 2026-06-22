"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Download,
  Package,
  RefreshCw,
  RotateCcw,
  ShoppingCart,
  Truck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { orderReportsKpis } from "@/lib/mock-data/order-modules";
import { formatCurrency, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { OrdersNav } from "@/components/orders/orders-nav";

const monthlyData = [
  { month: "Jan", orders: 142, revenue: 218000 },
  { month: "Feb", orders: 158, revenue: 245000 },
  { month: "Mar", orders: 171, revenue: 268000 },
  { month: "Apr", orders: 189, revenue: 291000 },
  { month: "May", orders: 203, revenue: 312000 },
  { month: "Jun", orders: 184, revenue: 284500 },
];

const reportCards = [
  { title: "Sales Report", desc: "Revenue by period, channel, branch", icon: BarChart3, href: "#" },
  { title: "Order Report", desc: "Volume, AOV, conversion trends", icon: ShoppingCart, href: "/orders/all" },
  { title: "Status Report", desc: "Count by status, aging analysis", icon: Package, href: "/orders/all" },
  { title: "Payment Report", desc: "Method breakdown, gateway failures", icon: CreditCard, href: "/orders/payments" },
  { title: "Refund Report", desc: "Refund rate, amount by period", icon: RefreshCw, href: "/orders/refunds" },
  { title: "Return Report", desc: "Return rate by product & reason", icon: RotateCcw, href: "/orders/returns" },
  { title: "Shipment Report", desc: "Courier performance, on-time delivery", icon: Truck, href: "/orders/shipments" },
  { title: "Abandoned Cart Report", desc: "Recovery rate, cart value lost", icon: ShoppingCart, href: "/orders/abandoned-carts" },
];

function Kpi({ label, value, sub, up }: { label: string; value: string; sub?: string; up?: boolean }) {
  return (
    <div className="rounded-xl border border-input bg-card p-4">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xl font-bold">{value}</p>
      {sub && (
        <p className={cn("mt-0.5 flex items-center gap-0.5 text-xs", up ? "text-emerald-600" : "text-muted-foreground")}>
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {sub}
        </p>
      )}
    </div>
  );
}

export function OrderReportsDashboard() {
  const kpis = orderReportsKpis;

  return (
    <div className="space-y-6">
      <OrdersNav />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Total Revenue" value={formatCurrency(kpis.totalRevenue)} sub="+12% vs last month" up />
        <Kpi label="Order Volume" value={kpis.orderVolume.toLocaleString()} sub="+8% vs last month" up />
        <Kpi label="Avg Order Value" value={formatCurrency(kpis.avgOrderValue)} sub="Stable" />
        <Kpi label="Payment Success" value={`${kpis.paymentSuccessRate}%`} sub="+1.2%" up />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Return Rate" value={`${kpis.returnRate}%`} sub="Target: <5%" />
        <Kpi label="Refund Rate" value={`${kpis.refundRate}%`} sub="-0.3% improved" up />
        <Kpi label="On-Time Delivery" value={`${kpis.shipmentOnTime}%`} sub="+2.1%" up />
        <Kpi label="Cart Recovery" value={`${kpis.cartRecoveryRate}%`} sub="AI campaigns active" up />
      </div>

      <div className="rounded-xl border border-input bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Monthly Order Volume</h2>
            <p className="text-[11px] text-muted-foreground">Orders & revenue trend</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.success("Export started")}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))" }} />
            <Bar dataKey="orders" name="Orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Available Reports</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {reportCards.map((r) => (
            <Link
              key={r.title}
              href={r.href}
              className="group flex flex-col gap-2 rounded-xl border border-input bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <r.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
              <div>
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="text-[11px] text-muted-foreground">{r.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-800 dark:bg-violet-950/20">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-violet-500" />
          <h2 className="text-sm font-semibold">AI Intelligence Reports</h2>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Fraud detection summary, delivery prediction accuracy, refund risk analysis, and abandoned cart recovery ROI — available in AI OS module.
        </p>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link href="/ai-os">Open AI Reports</Link>
        </Button>
      </div>
    </div>
  );
}
