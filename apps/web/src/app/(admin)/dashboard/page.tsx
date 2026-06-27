"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  aiInsights,
  inventoryAlerts,
  kpiCards,
  recentOrders,
  revenueByCategory,
  salesChartData,
} from "@/lib/mock-data/dashboard";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#94a3b8"];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview · UrbanWear Retail · Dhaka HQ</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/catalog/products">View products</Link>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border bg-card p-3 shadow-sm">
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <p className="mt-0.5 text-xl font-semibold">{kpi.value}</p>
            <p className={`text-xs ${kpi.up ? "text-emerald-600" : "text-red-500"}`}>{kpi.change}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-3 lg:col-span-2">
          <h2 className="mb-2 text-sm font-medium">Sales Analytics</h2>
          <div className="h-48 min-h-0 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                <AreaChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="sales" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <h2 className="mb-2 text-sm font-medium">Revenue by Category</h2>
          <div className="h-48 min-h-0 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" minHeight={192}>
                <PieChart>
                  <Pie data={revenueByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {revenueByCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-3">
          <h2 className="mb-2 text-sm font-medium">Recent Orders</h2>
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <div>
                  <p className="font-medium">{o.id}</p>
                  <p className="text-xs text-muted-foreground">{o.customer}</p>
                </div>
                <div className="text-right">
                  <p>{formatCurrency(o.total)}</p>
                  <Badge variant="secondary" className="capitalize">{o.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <h2 className="mb-2 text-sm font-medium">Inventory Alerts</h2>
          {inventoryAlerts.map((a) => (
            <div key={a.sku} className="mb-2 rounded-md border border-input bg-amber-50 px-3 py-2 text-sm dark:bg-amber-950/20">
              <p className="font-medium">{a.product}</p>
              <p className="text-xs text-muted-foreground">
                {a.sku} · {a.stock} left (min {a.threshold})
              </p>
            </div>
          ))}
          <h2 className="mb-3 mt-6 font-medium">AI Insights</h2>
          {aiInsights.map((insight) => (
            <div key={insight.title} className="mb-2 rounded-md border border-input bg-violet-50 px-3 py-2 text-sm dark:bg-violet-950/20">
              <p className="font-medium text-violet-700 dark:text-violet-300">{insight.title}</p>
              <p className="text-xs text-muted-foreground">{insight.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-3">
        <h2 className="mb-2 text-sm font-medium">Product Analytics (orders)</h2>
        <div className="h-40 min-h-0 w-full">
          {mounted && (
          <ResponsiveContainer width="100%" height="100%" minHeight={160}>
            <BarChart data={salesChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
