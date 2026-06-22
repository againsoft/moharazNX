"use client";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  TrendingUp, TrendingDown, Minus, MousePointerClick, Eye,
  Percent, BarChart2, Globe, Monitor, Smartphone, Tablet,
  Search, RefreshCw, Settings, CheckCircle2, AlertTriangle,
  ExternalLink, ChevronUp, ChevronDown as ChevronDownIcon,
  Wifi, WifiOff, Link2, LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import {
  gscConnection, gscSummary, gscChart, gscQueriesSeed, gscPagesSeed,
  gscIndexStatus, gscCountriesSeed, gscDevicesSeed,
  type GscQuery, type GscPage, type GscCountryRow, type GscDeviceRow,
} from "@/lib/mock-data/seo";
import { cn } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function Delta({ value, invert = false, suffix = "" }: { value: number; invert?: boolean; suffix?: string }) {
  const positive = invert ? value < 0 : value > 0;
  const zero = value === 0;
  if (zero) return <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground"><Minus className="h-3 w-3" />—</span>;
  return (
    <span className={cn("flex items-center gap-0.5 text-[11px] font-medium", positive ? "text-emerald-600" : "text-red-500")}>
      {positive ? <ChevronUp className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
      {Math.abs(value)}{suffix}
    </span>
  );
}

function PositionChip({ pos }: { pos: number }) {
  const color = pos <= 3 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
    : pos <= 10 ? "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
    : pos <= 20 ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
    : "bg-slate-100 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400";
  return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums", color)}>{pos.toFixed(1)}</span>;
}

/* ─── Sparkline chart ──────────────────────────────────────────────────────── */

function SparkChart({ data, metric }: { data: typeof gscChart; metric: "clicks" | "impressions" }) {
  const values = data.map((d) => d[metric]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 600; const h = 80; const pad = 4;
  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  const color = metric === "clicks" ? "#6366f1" : "#22c55e";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 56 }}>
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
      {values.map((v, i) => {
        const x = pad + (i / (values.length - 1)) * (w - pad * 2);
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r="2.5" fill={color} opacity={i === values.length - 1 ? 1 : 0.3} />;
      })}
    </svg>
  );
}

/* ─── KPI card ─────────────────────────────────────────────────────────────── */

function KpiCard({ label, value, delta, deltaInvert, suffix, icon, chartMetric, accent }:
  { label: string; value: string; delta: number; deltaInvert?: boolean; suffix?: string; icon: React.ReactNode; chartMetric: "clicks" | "impressions"; accent: string }) {
  return (
    <div className={cn("rounded-2xl border border-input bg-card p-4 shadow-sm flex flex-col gap-2")}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span className={cn("flex h-5 w-5 items-center justify-center rounded-md", accent)}>{icon}</span>
          {label}
        </div>
        <Delta value={delta} invert={deltaInvert} suffix={suffix} />
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <SparkChart data={gscChart} metric={chartMetric} />
      <p className="text-[10px] text-muted-foreground">{gscSummary.dateRange}</p>
    </div>
  );
}

/* ─── Connection banner ────────────────────────────────────────────────────── */

function ConnectionBanner() {
  const c = gscConnection;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950/20">
      <div className="flex items-center gap-2">
        <Wifi className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Connected</span>
      </div>
      <div className="flex items-center gap-1.5 text-[12px] text-emerald-700 dark:text-emerald-400">
        <span className="font-medium">{c.account}</span>
        <span className="opacity-60">·</span>
        <span className="font-mono">{c.property}</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Fetched: {c.lastFetchedAt} · {c.dataFreshness}</span>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs"
          onClick={() => toast.info("Refreshing data — prototype")}>
          <RefreshCw className="h-3 w-3" /> Refresh
        </Button>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground"
          onClick={() => toast.info("Settings — prototype")}>
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

/* ─── Index coverage card ──────────────────────────────────────────────────── */

function IndexCard() {
  const s = gscIndexStatus;
  const total = s.totalIndexed + s.notIndexed;
  const indexedPct = Math.round((s.totalIndexed / total) * 100);
  return (
    <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Index Coverage</p>
      <div className="flex items-end gap-3">
        <div>
          <p className="text-3xl font-bold tabular-nums text-emerald-600">{s.totalIndexed.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground">pages indexed</p>
        </div>
        <div className="mb-0.5 text-[12px] text-muted-foreground">/ {total.toLocaleString()} total</div>
        <div className="ml-auto text-right">
          <p className="text-xl font-bold text-emerald-600">{indexedPct}%</p>
          <p className="text-[10px] text-muted-foreground">coverage</p>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted/30">
        <div className="flex h-full">
          <div className="bg-emerald-500 transition-all" style={{ width: `${(s.totalIndexed / total) * 100}%` }} />
          <div className="bg-amber-400 transition-all" style={{ width: `${((s.crawledNotIndexed + s.discoveredNotCrawled) / total) * 100}%` }} />
          <div className="bg-red-400 transition-all" style={{ width: `${(s.errors / total) * 100}%` }} />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {[
          { label: "Indexed",                 value: s.totalIndexed,          color: "bg-emerald-500" },
          { label: "Errors",                  value: s.errors,                color: "bg-red-400" },
          { label: "Crawled, not indexed",    value: s.crawledNotIndexed,     color: "bg-amber-400" },
          { label: "Discovered, not crawled", value: s.discoveredNotCrawled,  color: "bg-slate-300 dark:bg-slate-600" },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-1.5 text-[11px]">
            <span className={cn("h-2 w-2 shrink-0 rounded-full", r.color)} />
            <span className="text-muted-foreground">{r.label}</span>
            <span className="ml-auto font-semibold tabular-nums">{r.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">Last crawled: {s.lastCrawled}</p>
    </div>
  );
}

/* ─── Device breakdown ─────────────────────────────────────────────────────── */

function DeviceCard() {
  const total = gscDevicesSeed.reduce((s, d) => s + d.clicks, 0);
  const icons: Record<string, React.ReactNode> = {
    MOBILE:  <Smartphone className="h-3.5 w-3.5" />,
    DESKTOP: <Monitor className="h-3.5 w-3.5" />,
    TABLET:  <Tablet className="h-3.5 w-3.5" />,
  };
  const colors: Record<string, string> = {
    MOBILE:  "bg-violet-500",
    DESKTOP: "bg-blue-500",
    TABLET:  "bg-amber-400",
  };
  return (
    <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Device Breakdown</p>
      <div className="mb-3 flex h-2.5 w-full overflow-hidden rounded-full">
        {gscDevicesSeed.map((d) => (
          <div key={d.device} className={cn("h-full transition-all", colors[d.device])} style={{ width: `${(d.clicks / total) * 100}%` }} />
        ))}
      </div>
      <div className="space-y-2">
        {gscDevicesSeed.map((d) => (
          <div key={d.device} className="flex items-center gap-2 text-[12px]">
            <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-white", colors[d.device])}>
              {icons[d.device]}
            </span>
            <span className="capitalize text-muted-foreground">{d.device.toLowerCase()}</span>
            <div className="ml-auto flex items-center gap-3 tabular-nums">
              <span className="text-muted-foreground">{((d.clicks / total) * 100).toFixed(0)}%</span>
              <span className="font-semibold">{d.clicks.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Country card ─────────────────────────────────────────────────────────── */

function CountryCard() {
  const max = gscCountriesSeed[0].clicks;
  const FLAGS: Record<string, string> = { BD:"🇧🇩", IN:"🇮🇳", US:"🇺🇸", GB:"🇬🇧", PK:"🇵🇰", AE:"🇦🇪", CA:"🇨🇦" };
  return (
    <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Top Countries</p>
      <div className="space-y-2">
        {gscCountriesSeed.map((c) => (
          <div key={c.code} className="space-y-1">
            <div className="flex items-center gap-2 text-[12px]">
              <span>{FLAGS[c.code] ?? "🌐"}</span>
              <span className="text-muted-foreground">{c.country}</span>
              <span className="ml-auto font-semibold tabular-nums">{c.clicks.toLocaleString()}</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted/30">
              <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${(c.clicks / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tab types ────────────────────────────────────────────────────────────── */

type DataTab = "queries" | "pages" | "countries" | "devices";

/* ─── Queries grid ─────────────────────────────────────────────────────────── */

function QueriesGrid({ isDark }: { isDark: boolean }) {
  const [search, setSearch] = useState("");
  const rows = useMemo(() =>
    gscQueriesSeed.filter((q) => !search || q.query.toLowerCase().includes(search.toLowerCase())),
    [search]);

  const colDefs = useMemo<ColDef<GscQuery>[]>(() => [
    {
      field: "query", headerName: "Query", flex: 1, minWidth: 180, pinned: "left",
      resizable: true, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<GscQuery>) => p.data
        ? <span className="text-[12px] font-medium">{p.data.query}</span>
        : null,
    },
    {
      field: "clicks", headerName: "Clicks", width: 100, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<GscQuery>) => p.data ? (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold tabular-nums">{p.data.clicks.toLocaleString()}</span>
          <Delta value={p.data.clicksDelta} suffix="" />
        </div>
      ) : null,
    },
    {
      field: "impressions", headerName: "Impressions", width: 120, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<GscQuery>) => p.data
        ? <span className="text-xs tabular-nums text-muted-foreground">{p.data.impressions.toLocaleString()}</span>
        : null,
    },
    {
      field: "ctr", headerName: "CTR", width: 80, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<GscQuery>) => p.data
        ? <span className="text-xs font-medium tabular-nums">{p.data.ctr.toFixed(1)}%</span>
        : null,
    },
    {
      field: "position", headerName: "Position", width: 100, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<GscQuery>) => p.data ? (
        <div className="flex items-center gap-1.5">
          <PositionChip pos={p.data.position} />
          <Delta value={-p.data.positionDelta} invert />
        </div>
      ) : null,
    },
  ], []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Filter queries…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-[220px] pl-8" />
        </div>
        <span className="ml-auto text-xs text-muted-foreground">{rows.length} queries</span>
      </div>
      <div className={cn("ag-theme-quartz control-border w-full rounded-md bg-card", isDark && "ag-theme-quartz-dark")}>
        <AgGridReact theme="legacy" domLayout="autoHeight" rowData={rows} columnDefs={colDefs}
          defaultColDef={{ sortable: true, resizable: true, filter: false, suppressHeaderMenuButton: true }}
          animateRows pagination paginationPageSize={15} />
      </div>
    </div>
  );
}

/* ─── Pages grid ───────────────────────────────────────────────────────────── */

function PagesGrid({ isDark }: { isDark: boolean }) {
  const [search, setSearch] = useState("");
  const rows = useMemo(() =>
    gscPagesSeed.filter((p) => !search || p.page.toLowerCase().includes(search.toLowerCase())),
    [search]);

  const colDefs = useMemo<ColDef<GscPage>[]>(() => [
    {
      field: "page", headerName: "Page", flex: 1, minWidth: 200, pinned: "left",
      resizable: true, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<GscPage>) => p.data ? (
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[12px]">{p.data.page}</span>
          <button type="button" onClick={() => toast.info("Open page — prototype")} className="text-muted-foreground hover:text-foreground">
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      ) : null,
    },
    {
      field: "clicks", headerName: "Clicks", width: 110, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<GscPage>) => p.data ? (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold tabular-nums">{p.data.clicks.toLocaleString()}</span>
          <Delta value={p.data.clicksDelta} />
        </div>
      ) : null,
    },
    {
      field: "impressions", headerName: "Impressions", width: 120, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<GscPage>) => p.data
        ? <span className="text-xs tabular-nums text-muted-foreground">{p.data.impressions.toLocaleString()}</span>
        : null,
    },
    {
      field: "ctr", headerName: "CTR", width: 80, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<GscPage>) => p.data
        ? <span className="text-xs font-medium tabular-nums">{p.data.ctr.toFixed(1)}%</span>
        : null,
    },
    {
      field: "position", headerName: "Position", width: 100, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<GscPage>) => p.data ? <PositionChip pos={p.data.position} /> : null,
    },
  ], []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Filter pages…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-[220px] pl-8" />
        </div>
        <span className="ml-auto text-xs text-muted-foreground">{rows.length} pages</span>
      </div>
      <div className={cn("ag-theme-quartz control-border w-full rounded-md bg-card", isDark && "ag-theme-quartz-dark")}>
        <AgGridReact  domLayout="autoHeight" rowData={rows} columnDefs={colDefs}
          defaultColDef={{ sortable: true, resizable: true, filter: false, suppressHeaderMenuButton: true }}
          animateRows pagination paginationPageSize={15} />
      </div>
    </div>
  );
}

/* ─── Countries table ──────────────────────────────────────────────────────── */

function CountriesTable() {
  const FLAGS: Record<string, string> = { BD:"🇧🇩", IN:"🇮🇳", US:"🇺🇸", GB:"🇬🇧", PK:"🇵🇰", AE:"🇦🇪", CA:"🇨🇦" };
  return (
    <div className="overflow-x-auto rounded-xl border border-input">
      <table className="w-full text-sm">
        <thead className="border-b border-input bg-muted/30">
          <tr>
            {["Country","Clicks","Impressions","CTR","Avg. Position"].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-input">
          {gscCountriesSeed.map((c) => (
            <tr key={c.code} className="hover:bg-muted/20">
              <td className="px-4 py-2.5">
                <span className="flex items-center gap-2">{FLAGS[c.code] ?? "🌐"} <span className="font-medium">{c.country}</span></span>
              </td>
              <td className="px-4 py-2.5 font-semibold tabular-nums">{c.clicks.toLocaleString()}</td>
              <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{c.impressions.toLocaleString()}</td>
              <td className="px-4 py-2.5 tabular-nums">{c.ctr.toFixed(1)}%</td>
              <td className="px-4 py-2.5"><PositionChip pos={c.position} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */

const DATE_RANGES = ["Last 7 days", "Last 28 days", "Last 3 months", "Last 6 months", "Last 12 months", "Custom"];
const SEARCH_TYPES = ["Web", "Image", "Video", "News"];

export function SearchConsole() {
  const isDark = useIsDark();
  const [dateRange, setDateRange] = useState("Last 28 days");
  const [searchType, setSearchType] = useState("Web");
  const [activeTab, setActiveTab] = useState<DataTab>("queries");

  const kpis = [
    { label: "Total Clicks",      value: gscSummary.clicks.toLocaleString(),      delta: gscSummary.clicksDelta,      suffix: "%", icon: <MousePointerClick className="h-3 w-3 text-violet-600" />,  accent: "bg-violet-50 dark:bg-violet-950/30", chartMetric: "clicks"      as const },
    { label: "Impressions",       value: gscSummary.impressions.toLocaleString(), delta: gscSummary.impressionsDelta, suffix: "%", icon: <Eye className="h-3 w-3 text-emerald-600" />,              accent: "bg-emerald-50 dark:bg-emerald-950/30", chartMetric: "impressions" as const },
    { label: "Avg. CTR",          value: `${gscSummary.ctr}%`,                    delta: gscSummary.ctrDelta,         suffix: "%", icon: <Percent className="h-3 w-3 text-blue-600" />,             accent: "bg-blue-50 dark:bg-blue-950/30",    chartMetric: "clicks"      as const },
    { label: "Avg. Position",     value: gscSummary.avgPosition.toFixed(1),       delta: gscSummary.positionDelta,    suffix: "",  icon: <BarChart2 className="h-3 w-3 text-amber-600" />,           accent: "bg-amber-50 dark:bg-amber-950/30",  chartMetric: "clicks"      as const, deltaInvert: true },
  ];

  const tabs: { key: DataTab; label: string; count: number }[] = [
    { key: "queries",   label: "Top Queries",  count: gscQueriesSeed.length },
    { key: "pages",     label: "Top Pages",    count: gscPagesSeed.length   },
    { key: "countries", label: "Countries",    count: gscCountriesSeed.length },
    { key: "devices",   label: "Devices",      count: gscDevicesSeed.length },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* ── Connection status ── */}
      <ConnectionBanner />

      {/* ── Filters bar ── */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-input bg-card px-3 py-2">
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm font-medium">
          {DATE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <div className="flex gap-0.5 rounded-lg border border-input bg-muted/30 p-0.5">
          {SEARCH_TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setSearchType(t)}
              className={cn("rounded-md px-3 py-1 text-xs font-medium transition-colors",
                searchType === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {t}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[10px] text-muted-foreground">Data: {gscConnection.lastFetchedAt} · ~2 day lag</span>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => toast.info("Open in GSC — prototype")}>
          <ExternalLink className="h-3.5 w-3.5" /> Open in GSC
        </Button>
      </div>

      {/* ── 4 KPI cards ── */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* ── 3-column: Index + Device + Country ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <IndexCard />
        <DeviceCard />
        <CountryCard />
      </div>

      {/* ── Data tabs ── */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-1 rounded-xl border border-input bg-muted/30 p-1 w-fit flex-wrap">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
              className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                activeTab === t.key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
              {t.label}
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                activeTab === t.key ? "bg-muted" : "bg-muted/50")}>{t.count}</span>
            </button>
          ))}
        </div>
        {activeTab === "queries"   && <QueriesGrid isDark={isDark} />}
        {activeTab === "pages"     && <PagesGrid isDark={isDark} />}
        {activeTab === "countries" && <CountriesTable />}
        {activeTab === "devices"   && (
          <div className="overflow-x-auto rounded-xl border border-input">
            <table className="w-full text-sm">
              <thead className="border-b border-input bg-muted/30">
                <tr>{["Device","Clicks","Impressions","CTR","Avg. Position"].map((h) =>
                  <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-input">
                {gscDevicesSeed.map((d) => (
                  <tr key={d.device} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-2 font-medium capitalize">
                        {d.device === "MOBILE" && <Smartphone className="h-4 w-4 text-violet-500" />}
                        {d.device === "DESKTOP" && <Monitor className="h-4 w-4 text-blue-500" />}
                        {d.device === "TABLET" && <Tablet className="h-4 w-4 text-amber-500" />}
                        {d.device.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-semibold tabular-nums">{d.clicks.toLocaleString()}</td>
                    <td className="px-4 py-2.5 tabular-nums text-muted-foreground">{d.impressions.toLocaleString()}</td>
                    <td className="px-4 py-2.5 tabular-nums">{d.ctr.toFixed(1)}%</td>
                    <td className="px-4 py-2.5"><PositionChip pos={d.position} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
