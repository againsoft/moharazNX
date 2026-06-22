"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
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
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  MessageSquare,
  Shield,
  Star,
  ThumbsUp,
  Video,
  Zap,
  XCircle,
  BarChart3,
} from "lucide-react";
import { useReviewStore } from "@/lib/store/review-store";
import { reviewsDashboardKpis } from "@/lib/mock-data/reviews";
import { cn } from "@/lib/utils";
import { ReviewsNav } from "@/components/reviews/reviews-nav";

// ─── Mock chart data ──────────────────────────────────────────────────────────

const ratingDistribution = [
  { rating: "5★", count: 982, color: "#22c55e" },
  { rating: "4★", count: 476, color: "#84cc16" },
  { rating: "3★", count: 218, color: "#f59e0b" },
  { rating: "2★", count: 108, color: "#f97316" },
  { rating: "1★", count: 63, color: "#ef4444" },
];

const sentimentData = [
  { name: "Positive", value: 1180, color: "#22c55e" },
  { name: "Neutral", value: 380, color: "#94a3b8" },
  { name: "Mixed", value: 198, color: "#f59e0b" },
  { name: "Negative", value: 89, color: "#ef4444" },
];

const weeklyData = [
  { day: "Mon", reviews: 28, pending: 8 },
  { day: "Tue", reviews: 35, pending: 12 },
  { day: "Wed", reviews: 22, pending: 5 },
  { day: "Thu", reviews: 41, pending: 18 },
  { day: "Fri", reviews: 38, pending: 11 },
  { day: "Sat", reviews: 52, pending: 22 },
  { day: "Sun", reviews: 31, pending: 9 },
];

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  alert,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  alert?: boolean;
  href?: string;
}) {
  const inner = (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md",
        alert ? "border-destructive/30 bg-destructive/5" : "border-input bg-card",
      )}
    >
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        {alert && (
          <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
            Action needed
          </span>
        )}
      </div>
      <div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground/70">{sub}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Star display ────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn("h-3.5 w-3.5", s <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted")}
        />
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReviewsDashboard() {
  const reviews = useReviewStore((s) => s.reviews);
  const kpis = reviewsDashboardKpis;

  const pendingReviews = useMemo(
    () => reviews.filter((r) => r.status === "pending").slice(0, 5),
    [reviews],
  );

  const negativeReviews = useMemo(
    () =>
      reviews
        .filter((r) => r.rating <= 2 && r.status !== "rejected" && r.status !== "spam")
        .slice(0, 4),
    [reviews],
  );

  const topReviews = useMemo(
    () =>
      reviews
        .filter((r) => r.status === "approved")
        .sort((a, b) => b.helpfulVotes - a.helpfulVotes)
        .slice(0, 4),
    [reviews],
  );

  return (
    <div className="space-y-6">
      <ReviewsNav />

      {/* ── KPI Row 1 ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Total Reviews" value={kpis.total.toLocaleString()} sub="All time" icon={MessageSquare} color="bg-blue-500" href="/catalog/reviews/all" />
        <KpiCard label="Pending Review" value={kpis.pending} sub="Awaiting moderation" icon={Clock} color="bg-orange-500" alert href="/catalog/reviews/all?status=pending" />
        <KpiCard label="Approved" value={kpis.approved.toLocaleString()} sub="Live on storefront" icon={CheckCircle2} color="bg-emerald-500" href="/catalog/reviews/all?status=approved" />
        <KpiCard label="Avg Rating" value={`${kpis.avgRating} ★`} sub="Across all products" icon={Star} color="bg-yellow-500" />
      </div>

      {/* ── KPI Row 2 ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Photo Reviews" value={kpis.photoReviews} sub="With images" icon={Camera} color="bg-violet-500" href="/catalog/reviews/all?type=photo" />
        <KpiCard label="Video Reviews" value={kpis.videoReviews} sub="With video" icon={Video} color="bg-pink-500" href="/catalog/reviews/all?type=video" />
        <KpiCard label="Verified Reviews" value={kpis.verifiedReviews.toLocaleString()} sub="Confirmed purchase" icon={Shield} color="bg-cyan-500" />
        <KpiCard label="Negative Alerts" value={kpis.negativeAlerts} sub="1-2 star, unresponded" icon={AlertTriangle} color="bg-red-500" alert />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Weekly reviews bar chart */}
        <div className="xl:col-span-2 rounded-xl border border-input bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">Weekly Review Volume</h2>
              <p className="text-[11px] text-muted-foreground">New reviews vs pending queue</p>
            </div>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))" }}
              />
              <Bar dataKey="reviews" name="Reviews" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex gap-4">
            <div className="flex items-center gap-1.5 text-[11px]"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /><span className="text-muted-foreground">Reviews</span></div>
            <div className="flex items-center gap-1.5 text-[11px]"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /><span className="text-muted-foreground">Pending</span></div>
          </div>
        </div>

        {/* Sentiment donut */}
        <div className="rounded-xl border border-input bg-card p-4">
          <div className="mb-2">
            <h2 className="text-sm font-semibold">Sentiment Distribution</h2>
            <p className="text-[11px] text-muted-foreground">AI-analyzed sentiment</p>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={sentimentData} cx="50%" cy="50%" innerRadius={44} outerRadius={64} paddingAngle={3} dataKey="value">
                {sentimentData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {sentimentData.map((s) => (
              <div key={s.name} className="flex items-center gap-2 text-[11px]">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="flex-1 text-muted-foreground">{s.name}</span>
                <span className="font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Rating distribution ── */}
      <div className="rounded-xl border border-input bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Rating Distribution</h2>
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold">{kpis.avgRating}</span>
            <span className="text-xs text-muted-foreground">/ 5.0</span>
          </div>
        </div>
        <div className="space-y-2">
          {ratingDistribution.map((r) => {
            const pct = Math.round((r.count / kpis.total) * 100);
            return (
              <div key={r.rating} className="flex items-center gap-3 text-xs">
                <span className="w-7 shrink-0 font-medium">{r.rating}</span>
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: r.color }} />
                  </div>
                </div>
                <span className="w-8 text-right text-muted-foreground">{r.count}</span>
                <span className="w-8 text-right text-muted-foreground">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main tables ── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Pending queue */}
        <div className="rounded-xl border border-input bg-card">
          <div className="flex items-center justify-between border-b border-input px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <h2 className="text-sm font-semibold">Pending Moderation</h2>
            </div>
            <Link href="/catalog/reviews/all?status=pending" className="text-[11px] text-primary hover:underline">
              View all ({kpis.pending})
            </Link>
          </div>
          {pendingReviews.length === 0 ? (
            <p className="p-4 text-xs text-muted-foreground">No pending reviews.</p>
          ) : (
            <div className="divide-y divide-input">
              {pendingReviews.map((r) => (
                <Link
                  key={r.id}
                  href={`/catalog/reviews/${r.id}`}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Stars rating={r.rating} />
                      <span className={cn(
                        "rounded px-1 py-0.5 text-[9px] font-medium capitalize",
                        r.aiAnalysis.sentiment === "negative" ? "bg-destructive/10 text-destructive"
                        : r.aiAnalysis.sentiment === "positive" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                      )}>
                        {r.aiAnalysis.sentiment}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs font-medium">{r.title}</p>
                    <p className="text-[11px] text-muted-foreground">{r.product.name} · {r.customer.name}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Negative alerts */}
          <div className="rounded-xl border border-destructive/20 bg-card">
            <div className="flex items-center gap-2 border-b border-input px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h2 className="text-sm font-semibold">Negative Review Alerts</h2>
              <span className="ml-auto rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                {negativeReviews.length}
              </span>
            </div>
            {negativeReviews.length === 0 ? (
              <p className="p-4 text-xs text-muted-foreground">No negative alerts.</p>
            ) : (
              <div className="divide-y divide-input">
                {negativeReviews.map((r) => (
                  <Link
                    key={r.id}
                    href={`/catalog/reviews/${r.id}`}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-[11px] font-bold text-destructive">
                      {r.rating}★
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{r.title}</p>
                      <p className="text-[11px] text-muted-foreground">{r.product.name}</p>
                    </div>
                    <span className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
                      r.status === "pending" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      : "bg-muted text-muted-foreground"
                    )}>
                      {r.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Top helpful reviews */}
          <div className="rounded-xl border border-input bg-card">
            <div className="flex items-center justify-between border-b border-input px-4 py-3">
              <div className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-emerald-500" />
                <h2 className="text-sm font-semibold">Most Helpful Reviews</h2>
              </div>
            </div>
            <div className="divide-y divide-input">
              {topReviews.map((r) => (
                <Link
                  key={r.id}
                  href={`/catalog/reviews/${r.id}`}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <Stars rating={r.rating} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{r.title}</p>
                    <p className="text-[11px] text-muted-foreground">{r.customer.name} · {r.product.name}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 shrink-0">
                    <ThumbsUp className="h-3 w-3" />
                    {r.helpfulVotes}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="rounded-xl border border-input bg-card">
        <div className="flex items-center gap-2 border-b border-input px-4 py-3">
          <Zap className="h-4 w-4 text-violet-500" />
          <h2 className="text-sm font-semibold">Chief AI Agent — Review Intelligence</h2>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "🎯", color: "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30", category: "Sentiment", text: "63.9% of reviews are Positive. Camera quality and battery life are the top mentioned features across all products." },
            { icon: "⚠️", color: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30", category: "Complaint Detection", text: "Thermal management complaints detected in Laptop category — escalate to product team. 3 products affected." },
            { icon: "🛡️", color: "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30", category: "Spam Detection", text: "AI blocked 12 spam reviews this week. 3 suspicious accounts flagged for manual review. Trust system working." },
            { icon: "📸", color: "border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30", category: "Media Impact", text: "Photo reviews have 3.2x more helpful votes than text-only. Encourage photo submission in post-purchase emails." },
            { icon: "💬", color: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30", category: "Response Rate", text: `Response rate is ${kpis.responseRate}%. Industry benchmark is 80%. Increase team response allocation for 1-2 star reviews.` },
            { icon: "🏆", color: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30", category: "Top Products", text: "Dell UltraSharp 27 and Logitech MX Master 3S have highest trust scores. Use as anchor products in marketing campaigns." },
          ].map((item, i) => (
            <div key={i} className={`flex gap-2.5 rounded-lg border p-3 text-xs ${item.color}`}>
              <span className="shrink-0 text-base leading-4">{item.icon}</span>
              <div>
                <span className="font-semibold">{item.category} — </span>
                <span className="text-muted-foreground">{item.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
