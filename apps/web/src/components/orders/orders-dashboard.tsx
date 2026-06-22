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
  Package,
  Sparkles,
  TrendingUp,
  Truck,
} from "lucide-react";
import {
  countOrdersByStatus,
  ordersDashboardChartData,
  ordersStatusPipeline,
  ORDER_STATUS_LABELS,
  type Order,
} from "@/lib/mock-data/orders";
import { useOrderStore } from "@/lib/store/order-store";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrdersNav } from "@/components/orders/orders-nav";
import { statusBadgeVariant } from "@/components/orders/orders-nav";

export function OrdersDashboard({
  orders: ordersProp,
  loading = false,
}: {
  orders?: Order[];
  loading?: boolean;
}) {
  const storeOrders = useOrderStore((s) => s.orders);
  const orders = ordersProp ?? storeOrders;
  const recent = [...orders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 6);

  const statusCounts = countOrdersByStatus(orders);
  const revenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const aov = orders.length ? revenue / orders.length : 0;

  const kpis = [
    { label: "Total Orders", value: (loading ? "…" : orders.length).toLocaleString(), change: "Live from API", up: true, icon: Package },
    { label: "Pending", value: loading ? "…" : String(statusCounts.pending ?? 0), change: "Needs action", up: false, icon: Package },
    { label: "Processing", value: loading ? "…" : String(statusCounts.processing ?? 0), change: "In fulfillment", up: true, icon: TrendingUp },
    { label: "Shipped", value: loading ? "…" : String(statusCounts.shipped ?? 0), change: "In transit", up: true, icon: Truck },
    { label: "Revenue", value: loading ? "…" : formatCurrency(revenue), change: "Seeded orders", up: true, icon: TrendingUp },
    { label: "Avg Order Value", value: loading ? "…" : formatCurrency(aov), change: "Per order", up: true, icon: TrendingUp },
  ];

  const pipeline = ordersStatusPipeline.map((step) => ({
    ...step,
    count: statusCounts[step.status] ?? 0,
  }));
  const pipelineTotal = pipeline.reduce((s, p) => s + p.count, 0) || 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <OrdersNav compact />
        <Button size="sm" asChild>
          <Link href="/orders/create">+ Create Order</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-input bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">{k.label}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{k.value}</p>
              </div>
              <div className="rounded-md bg-muted/60 p-2">
                <k.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <p className={`mt-2 flex items-center gap-0.5 text-xs ${k.up ? "text-emerald-600" : "text-amber-600"}`}>
              {k.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {k.change}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-input bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold">Order pipeline</p>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-muted">
          {pipeline.map((p) => (
            <div
              key={p.status}
              style={{ width: `${(p.count / pipelineTotal) * 100}%`, backgroundColor: p.color }}
              title={`${p.label}: ${p.count}`}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-3">
          {pipeline.map((p) => (
            <Link
              key={p.status}
              href={`/orders/all?status=${p.status}`}
              className="flex items-center gap-1.5 text-[11px] hover:underline"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.label} ({p.count})
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-input bg-card p-4 lg:col-span-2 shadow-sm">
          <p className="text-sm font-semibold">Orders this week</p>
          <div className="mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersDashboardChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(v, name) =>
                    name === "revenue" ? formatCurrency(Number(v)) : v
                  }
                />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/8 to-transparent p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">AI Insights</p>
            <Badge variant="outline" className="text-[9px]">Live</Badge>
          </div>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li className="rounded-md border border-input bg-background/50 px-2.5 py-2">
              3 high-value COD orders need address verification
            </li>
            <li className="rounded-md border border-input bg-background/50 px-2.5 py-2">
              Delay risk on 2 Pathao shipments (weather)
            </li>
            <li className="rounded-md border border-input bg-background/50 px-2.5 py-2">
              Upsell: 8 customers bought earbuds without case bundle
            </li>
          </ul>
          <Button variant="outline" size="sm" className="mt-3 h-8 w-full text-xs" asChild>
            <Link href="/orders/all?status=pending">Review pending orders</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-input bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-input px-4 py-3">
          <p className="text-sm font-semibold">Recent orders</p>
          <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
            <Link href="/orders/all">View all</Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Order</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <RecentOrderRow key={o.id} order={o} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RecentOrderRow({ order }: { order: Order }) {
  return (
    <tr className="border-t border-input hover:bg-muted/30">
      <td className="px-4 py-2.5">
        <Link href={`/orders/${order.id}`} className="font-medium text-primary">
          {order.orderNumber}
        </Link>
      </td>
      <td className="px-4 py-2.5">{order.customer.name}</td>
      <td className="px-4 py-2.5">
        <Badge variant={statusBadgeVariant(order.status)} className="text-[9px]">
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </td>
      <td className="px-4 py-2.5 text-right font-medium tabular-nums">
        {formatCurrency(order.grandTotal)}
      </td>
    </tr>
  );
}
