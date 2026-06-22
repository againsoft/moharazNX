"use client";

import Link from "next/link";
import {
  MousePointerClick, Eye, Percent, BarChart2,
  ChevronUp, ChevronDown, FileText, Link2, ArrowRightLeft,
  Braces, Map, Bot, KeyRound, Globe, AlertTriangle, CheckCircle2, XCircle,
  ArrowRight, Wifi, Shield,
} from "lucide-react";
import {
  gscSummary, gscChart, gscQueriesSeed,
  seoHealthScore, auditIssuesSeed, AUDIT_CATEGORY_SCORES, AUDIT_CATEGORY_LABELS,
  keywordsSeed, metaRecordsSeed, redirectRulesSeed,
  schemaSeed, sitemapIndex, sitemapFilesSeed,
  domainOverview, gscConnection, gscIndexStatus,
} from "@/lib/mock-data/seo";
import { cn } from "@/lib/utils";

/* ─── Sparkline ────────────────────────────────────────────────────────────── */

function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data); const min = Math.min(...data); const range = max - min || 1;
  const w = 120; const h = 32; const pad = 2;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: 80, height: 24 }} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

function Delta({ v, invert = false, suffix = "%" }: { v: number; invert?: boolean; suffix?: string }) {
  const pos = invert ? v < 0 : v > 0;
  if (v === 0) return <span className="text-[10px] text-muted-foreground">—</span>;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[10px] font-semibold", pos ? "text-emerald-600" : "text-red-500")}>
      {pos ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      {Math.abs(v)}{suffix}
    </span>
  );
}

/* ─── GSC KPI strip ────────────────────────────────────────────────────────── */

const clicksData  = gscChart.map((d) => d.clicks);
const impressData = gscChart.map((d) => d.impressions);

function GscStrip() {
  const kpis = [
    { label: "Clicks",        value: gscSummary.clicks.toLocaleString(),      delta: gscSummary.clicksDelta,      color: "#6366f1", data: clicksData,  icon: <MousePointerClick className="h-3.5 w-3.5" />,              invert: false },
    { label: "Impressions",   value: gscSummary.impressions.toLocaleString(), delta: gscSummary.impressionsDelta, color: "#22c55e", data: impressData, icon: <Eye className="h-3.5 w-3.5" />,                           invert: false },
    { label: "Avg. CTR",      value: `${gscSummary.ctr}%`,                   delta: gscSummary.ctrDelta,         color: "#3b82f6", data: clicksData,  icon: <Percent className="h-3.5 w-3.5" />,                       invert: false },
    { label: "Avg. Position", value: gscSummary.avgPosition.toFixed(1),       delta: gscSummary.positionDelta,    color: "#f59e0b", data: clicksData,  icon: <BarChart2 className="h-3.5 w-3.5" />,                     invert: true  },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {kpis.map((k) => (
        <div key={k.label} className="flex flex-col gap-1 rounded-2xl border border-input bg-card px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">{k.icon} {k.label}</span>
            <Spark data={k.data} color={k.color} />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold tabular-nums">{k.value}</span>
            <Delta v={k.delta} invert={k.invert} />
          </div>
          <p className="text-[10px] text-muted-foreground">{gscSummary.dateRange}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Health score + category bars ────────────────────────────────────────── */

function HealthPanel() {
  const score = seoHealthScore;
  const ring  = 2 * Math.PI * 40;
  const dash  = (score / 100) * ring;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "Good" : score >= 60 ? "Needs work" : "Poor";
  const cats  = Object.entries(AUDIT_CATEGORY_SCORES) as [string, number][];
  const catCl = (s: number) => s >= 75 ? "bg-emerald-500" : s >= 50 ? "bg-amber-400" : "bg-red-400";
  const openHigh = auditIssuesSeed.filter((i) => i.status === "open" && i.severity === "high").length;
  const openAll  = auditIssuesSeed.filter((i) => i.status === "open").length;

  return (
    <div className="rounded-2xl border border-input bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">SEO Health</p>
        <Link href="/seo/audit" className="flex items-center gap-1 text-[11px] text-primary hover:underline">Full audit <ArrowRight className="h-3 w-3" /></Link>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <svg width="96" height="96" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
            <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
              strokeDasharray={`${dash} ${ring - dash}`} strokeDashoffset={ring / 4} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>{score}</span>
            <span className="text-[9px] text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5 min-w-0">
          {cats.map(([cat, s]) => (
            <div key={cat} className="flex items-center gap-2">
              <span className="w-[72px] shrink-0 truncate text-[10px] text-muted-foreground">
                {AUDIT_CATEGORY_LABELS[cat as keyof typeof AUDIT_CATEGORY_LABELS]}
              </span>
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted/30">
                <div className={cn("h-full rounded-full", catCl(s))} style={{ width: `${s}%` }} />
              </div>
              <span className="w-6 text-right text-[10px] font-semibold tabular-nums">{s}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-4 rounded-lg bg-muted/30 px-3 py-2 text-[11px]">
        <span className="flex items-center gap-1.5 font-semibold text-red-500">
          <AlertTriangle className="h-3.5 w-3.5" /> {openHigh} high severity
        </span>
        <span className="text-muted-foreground">{openAll} open total</span>
        <span className="ml-auto font-semibold" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}

/* ─── Module cards ─────────────────────────────────────────────────────────── */

function ModuleCard({ href, icon, iconBg, title, metric, metricLabel, status, statusOk }: {
  href: string; icon: React.ReactNode; iconBg: string;
  title: string; metric: string; metricLabel: string;
  status: string; statusOk: boolean;
}) {
  return (
    <Link href={href}
      className="group flex flex-col gap-2.5 rounded-2xl border border-input bg-card p-4 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/20">
      <div className="flex items-start justify-between">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", iconBg)}>{icon}</span>
        <span className={cn("flex items-center gap-1 text-[10px] font-semibold",
          statusOk ? "text-emerald-600" : "text-amber-500")}>
          {statusOk ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
          {status}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="mt-0.5 text-lg font-bold tabular-nums leading-tight">{metric}</p>
        <p className="text-[10px] text-muted-foreground">{metricLabel}</p>
      </div>
      <span className="flex items-center gap-1 text-[10px] text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Open <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
}

function ModuleGrid() {
  const metaMissing  = metaRecordsSeed.filter((m) => m.score < 50).length;
  const redirActive  = redirectRulesSeed.filter((r) => r.status === "active").length;
  const schemaErrors = schemaSeed.filter((s) => s.status === "error").length;
  const smErrors     = sitemapFilesSeed.filter((f) => f.status === "error").length;
  const topKw        = keywordsSeed.filter((k) => (k.position ?? 99) <= 10).length;
  const avgPos       = Math.round(keywordsSeed.reduce((s, k) => s + (k.position ?? 50), 0) / keywordsSeed.length);

  const modules = [
    { href: "/seo/search-console", icon: <Globe className="h-4 w-4 text-blue-600" />,    iconBg: "bg-blue-50 dark:bg-blue-950/30",
      title: "Search Console", metric: gscSummary.clicks.toLocaleString(), metricLabel: "clicks / 28d",
      status: "Connected", statusOk: true },
    { href: "/seo/meta",           icon: <FileText className="h-4 w-4 text-violet-600" />, iconBg: "bg-violet-50 dark:bg-violet-950/30",
      title: "Meta Manager", metric: metaRecordsSeed.length.toString(), metricLabel: `pages · ${metaMissing} missing`,
      status: metaMissing === 0 ? "All good" : `${metaMissing} missing`, statusOk: metaMissing === 0 },
    { href: "/seo/keywords",       icon: <KeyRound className="h-4 w-4 text-emerald-600" />, iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
      title: "Keywords", metric: keywordsSeed.length.toString(), metricLabel: `tracked · ${topKw} top 10`,
      status: `Avg #${avgPos}`, statusOk: avgPos <= 15 },
    { href: "/seo/backlinks",      icon: <Link2 className="h-4 w-4 text-sky-600" />,    iconBg: "bg-sky-50 dark:bg-sky-950/30",
      title: "Backlinks", metric: `DA ${domainOverview.domainAuthority}`, metricLabel: `${domainOverview.totalBacklinks.toLocaleString()} links`,
      status: `${domainOverview.referringDomains} domains`, statusOk: true },
    { href: "/seo/audit",          icon: <Shield className="h-4 w-4 text-amber-600" />, iconBg: "bg-amber-50 dark:bg-amber-950/30",
      title: "SEO Audit", metric: `${seoHealthScore}/100`, metricLabel: "health score",
      status: auditIssuesSeed.filter(i=>i.status==="open"&&i.severity==="high").length > 0
        ? `${auditIssuesSeed.filter(i=>i.status==="open"&&i.severity==="high").length} high`
        : "No high issues",
      statusOk: auditIssuesSeed.filter(i=>i.status==="open"&&i.severity==="high").length === 0 },
    { href: "/seo/urls",           icon: <Globe className="h-4 w-4 text-slate-500" />,  iconBg: "bg-slate-100 dark:bg-slate-800/40",
      title: "URL Manager", metric: "42", metricLabel: "pages managed",
      status: "4 redirects", statusOk: true },
    { href: "/seo/redirects",      icon: <ArrowRightLeft className="h-4 w-4 text-amber-600" />, iconBg: "bg-amber-50 dark:bg-amber-950/30",
      title: "Redirects", metric: redirectRulesSeed.length.toString(), metricLabel: `rules · ${redirActive} active`,
      status: `${redirectRulesSeed.reduce((s,r)=>s+r.hits30d,0).toLocaleString()} hits/30d`, statusOk: true },
    { href: "/seo/schema",         icon: <Braces className="h-4 w-4 text-violet-600" />, iconBg: "bg-violet-50 dark:bg-violet-950/30",
      title: "Schema", metric: schemaSeed.length.toString(), metricLabel: `schemas · ${schemaSeed.filter(s=>s.status==="active").length} active`,
      status: schemaErrors > 0 ? `${schemaErrors} error` : "All valid", statusOk: schemaErrors === 0 },
    { href: "/seo/sitemap",        icon: <Map className="h-4 w-4 text-emerald-600" />,  iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
      title: "Sitemap", metric: sitemapIndex.totalUrls.toLocaleString(), metricLabel: `URLs · ${sitemapIndex.totalFiles} files`,
      status: smErrors > 0 ? `${smErrors} file error` : "Submitted ✓", statusOk: smErrors === 0 },
    { href: "/seo/robots",         icon: <Bot className="h-4 w-4 text-slate-500" />,    iconBg: "bg-slate-100 dark:bg-slate-800/40",
      title: "Robots.txt", metric: "5", metricLabel: "bot groups defined",
      status: "Valid", statusOk: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {modules.map((m) => <ModuleCard key={m.href} {...m} />)}
    </div>
  );
}

/* ─── Index coverage mini ──────────────────────────────────────────────────── */

function IndexMini() {
  const s = gscIndexStatus;
  const total = s.totalIndexed + s.notIndexed;
  return (
    <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Index Coverage</p>
        <Link href="/seo/search-console" className="flex items-center gap-1 text-[11px] text-primary hover:underline">GSC <ArrowRight className="h-3 w-3" /></Link>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-emerald-600">{s.totalIndexed.toLocaleString()}</span>
        <span className="mb-0.5 text-xs text-muted-foreground">/ {total.toLocaleString()} pages</span>
        <span className="ml-auto text-lg font-bold text-emerald-600">{Math.round((s.totalIndexed / total) * 100)}%</span>
      </div>
      <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full">
        <div className="bg-emerald-500 transition-all" style={{ width: `${(s.totalIndexed / total) * 100}%` }} />
        <div className="bg-amber-400 transition-all" style={{ width: `${((s.crawledNotIndexed + s.discoveredNotCrawled) / total) * 100}%` }} />
        <div className="bg-red-400 transition-all"   style={{ width: `${(s.errors / total) * 100}%` }} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1">
        {[
          { label: "Indexed",      value: s.totalIndexed,          dot: "bg-emerald-500" },
          { label: "Errors",       value: s.errors,                dot: "bg-red-400" },
          { label: "Not indexed",  value: s.crawledNotIndexed,     dot: "bg-amber-400" },
          { label: "Not crawled",  value: s.discoveredNotCrawled,  dot: "bg-slate-300 dark:bg-slate-600" },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-1.5 text-[10px]">
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", r.dot)} />
            <span className="truncate text-muted-foreground">{r.label}</span>
            <span className="ml-auto font-semibold">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Top queries mini ─────────────────────────────────────────────────────── */

function TopQueriesMini() {
  const top5 = gscQueriesSeed.slice(0, 5);
  const maxC = top5[0].clicks;
  return (
    <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Top Queries</p>
        <Link href="/seo/search-console" className="flex items-center gap-1 text-[11px] text-primary hover:underline">All <ArrowRight className="h-3 w-3" /></Link>
      </div>
      <div className="space-y-2">
        {top5.map((q) => (
          <div key={q.query} className="space-y-0.5">
            <div className="flex items-center justify-between gap-2 text-[11px]">
              <span className="truncate font-medium">{q.query}</span>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="font-semibold tabular-nums">{q.clicks.toLocaleString()}</span>
                <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                  q.position <= 3  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : q.position <= 10 ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400")}>
                  #{q.position.toFixed(0)}
                </span>
              </div>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted/30">
              <div className="h-full rounded-full bg-primary/50" style={{ width: `${(q.clicks / maxC) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Top keywords mini ────────────────────────────────────────────────────── */

function TopKeywordsMini() {
  const top5 = [...keywordsSeed].sort((a, b) => (a.position ?? 99) - (b.position ?? 99)).slice(0, 5);
  return (
    <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Top Keywords</p>
        <Link href="/seo/keywords" className="flex items-center gap-1 text-[11px] text-primary hover:underline">All <ArrowRight className="h-3 w-3" /></Link>
      </div>
      <div className="space-y-2">
        {top5.map((k) => {
          const pos  = k.position ?? 99;
          const prev = k.prevPosition ?? pos;
          const chg  = prev - pos;
          return (
            <div key={k.keyword} className="flex items-center gap-2 text-[11px]">
              <span className={cn("flex h-5 w-6 shrink-0 items-center justify-center rounded text-[9px] font-bold",
                pos <= 3  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                : pos <= 10 ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400")}>
                {pos}
              </span>
              <span className="flex-1 truncate font-medium">{k.keyword}</span>
              {chg !== 0 && (
                <span className={cn("flex shrink-0 items-center gap-0.5 text-[10px] font-semibold",
                  chg > 0 ? "text-emerald-600" : "text-red-500")}>
                  {chg > 0 ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {Math.abs(chg)}
                </span>
              )}
              <span className="shrink-0 text-[10px] text-muted-foreground">{k.volume?.toLocaleString()}/mo</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Open issues mini ─────────────────────────────────────────────────────── */

function IssuesMini() {
  const high = auditIssuesSeed.filter((i) => i.status === "open" && i.severity === "high").slice(0, 4);
  return (
    <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Open Issues</p>
        <Link href="/seo/audit" className="flex items-center gap-1 text-[11px] text-primary hover:underline">Audit <ArrowRight className="h-3 w-3" /></Link>
      </div>
      {high.length === 0 ? (
        <div className="flex items-center gap-2 text-[11px] text-emerald-600">
          <CheckCircle2 className="h-4 w-4" /> No high severity issues
        </div>
      ) : (
        <div className="space-y-2">
          {high.map((issue) => (
            <div key={issue.id} className="flex items-start gap-2 rounded-lg bg-muted/20 px-2 py-1.5">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium leading-tight">{issue.entity}</p>
                <p className="truncate font-mono text-[10px] text-muted-foreground">{issue.url}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Backlink mini ────────────────────────────────────────────────────────── */

function BacklinkMini() {
  const d = domainOverview;
  return (
    <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Backlinks</p>
        <Link href="/seo/backlinks" className="flex items-center gap-1 text-[11px] text-primary hover:underline">Analyze <ArrowRight className="h-3 w-3" /></Link>
      </div>
      <div className="space-y-2.5">
        {[
          { label: "Domain Authority", value: d.domainAuthority, max: 100, color: "bg-blue-500" },
          { label: "Domain Rating",    value: d.domainRating,    max: 100, color: "bg-violet-500" },
          { label: "PageRank",         value: d.pageRank,        max: 10,  color: "bg-emerald-500" },
        ].map((m) => (
          <div key={m.label} className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-muted-foreground">{m.label}</span>
              <span className="font-bold">{m.value} <span className="font-normal text-muted-foreground">/ {m.max}</span></span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
              <div className={cn("h-full rounded-full", m.color)} style={{ width: `${(m.value / m.max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 border-t border-input pt-3 text-[11px]">
        <div><p className="text-muted-foreground">Total</p><p className="font-bold">{d.totalBacklinks.toLocaleString()}</p></div>
        <div><p className="text-muted-foreground">Domains</p><p className="font-bold">{d.referringDomains}</p></div>
        <div><p className="text-muted-foreground">Spam</p><p className="font-bold">{d.spamScore}%</p></div>
        <div className="ml-auto"><p className="text-muted-foreground">New 30d</p><p className="font-bold text-emerald-600">+{d.newLinks30d}</p></div>
      </div>
    </div>
  );
}

/* ─── Main export ──────────────────────────────────────────────────────────── */

export function SeoControlCenter() {
  return (
    <div className="flex flex-col gap-5">

      {/* Connection banner */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] dark:border-emerald-800 dark:bg-emerald-950/20">
        <Wifi className="h-3.5 w-3.5 text-emerald-600" />
        <span className="font-semibold text-emerald-700 dark:text-emerald-400">Google Search Console connected</span>
        <span className="opacity-50">·</span>
        <span className="font-mono text-emerald-700 dark:text-emerald-400">{gscConnection.property}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">Fetched {gscConnection.lastFetchedAt} · ~2 day lag</span>
        <Link href="/seo/search-console" className="flex items-center gap-1 text-[11px] text-primary hover:underline">
          Details <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* GSC KPI strip */}
      <GscStrip />

      {/* Health score + module grid */}
      <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <HealthPanel />
        <ModuleGrid />
      </div>

      {/* 4-column bottom row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IndexMini />
        <TopQueriesMini />
        <TopKeywordsMini />
        <IssuesMini />
      </div>

      {/* Backlink + Sitemap + Schema */}
      <div className="grid gap-4 lg:grid-cols-3">
        <BacklinkMini />

        {/* Sitemap files */}
        <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Sitemap Files</p>
            <Link href="/seo/sitemap" className="flex items-center gap-1 text-[11px] text-primary hover:underline">Manage <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-1.5">
            {sitemapFilesSeed.map((f) => (
              <div key={f.id} className="flex items-center gap-2 text-[11px]">
                {f.status === "ok"      && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                {f.status === "warning" && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                {f.status === "error"   && <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />}
                <span className="flex-1 truncate font-medium">{f.name}</span>
                <span className="tabular-nums text-muted-foreground">{f.urlCount.toLocaleString()} URLs</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground">Generated: {sitemapIndex.lastGenerated} · Google: Submitted ✓</p>
        </div>

        {/* Schema schemas */}
        <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Schema Markup</p>
            <Link href="/seo/schema" className="flex items-center gap-1 text-[11px] text-primary hover:underline">Manage <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <div className="space-y-1.5">
            {schemaSeed.map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-[11px]">
                {s.status === "active"  && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
                {s.status === "warning" && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
                {s.status === "error"   && <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />}
                {s.status === "draft"   && <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-400 inline-block" />}
                <span className="flex-1 truncate font-medium">{s.name}</span>
                <span className="text-[10px] capitalize text-muted-foreground">{s.scope}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
