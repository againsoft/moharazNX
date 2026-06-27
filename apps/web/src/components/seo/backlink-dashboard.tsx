"use client";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  Link2, ExternalLink, TrendingUp, TrendingDown, Shield,
  Search, SlidersHorizontal, Download, MoreHorizontal,
  ArrowUp, ArrowDown, Globe, CheckCircle2, X, AlertTriangle,
  BarChart2, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  domainOverview, competitorComparison, anchorDistribution,
  referringDomainsSeed, backlinksSeed,
  type ReferringDomain, type BacklinkRecord, type BacklinkType,
} from "@/lib/mock-data/seo";
import { cn } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const LINK_TYPE_STYLES: Record<BacklinkType, { cls: string; label: string }> = {
  dofollow:  { cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800", label: "Dofollow"  },
  nofollow:  { cls: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700",            label: "Nofollow"  },
  ugc:       { cls: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",                   label: "UGC"       },
  sponsored: { cls: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",             label: "Sponsored" },
};

function LinkTypePill({ type }: { type: BacklinkType }) {
  const s = LINK_TYPE_STYLES[type];
  return <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", s.cls)}>{s.label}</span>;
}

function DaBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = value >= 60 ? "bg-emerald-500" : value >= 35 ? "bg-amber-500" : "bg-slate-400";
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-muted/30">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-semibold tabular-nums">{value}</span>
    </div>
  );
}

/* ─── Domain overview card ────────────────────────────────────────────────── */

function DomainOverviewCard() {
  const d = domainOverview;
  const metrics = [
    { label: "Domain Authority", value: d.domainAuthority, max: 100, icon: <Shield className="h-4 w-4 text-blue-500" />,      color: "text-blue-600" },
    { label: "Domain Rating",    value: d.domainRating,    max: 100, icon: <BarChart2 className="h-4 w-4 text-violet-500" />, color: "text-violet-600" },
    { label: "PageRank",         value: d.pageRank,        max: 10,  icon: <Globe className="h-4 w-4 text-emerald-500" />,    color: "text-emerald-600" },
    { label: "Spam Score",       value: d.spamScore,       max: 100, icon: <AlertTriangle className="h-4 w-4 text-rose-400" />, color: d.spamScore < 10 ? "text-emerald-600" : "text-red-500" },
  ];

  return (
    <div className="rounded-2xl border border-input bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Domain Overview</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-base font-bold">
            <Globe className="h-4 w-4 text-muted-foreground" />
            {d.domain}
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => toast.info("Refreshing — prototype")}>
          <RefreshCw className="h-3 w-3" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {m.icon} {m.label}
            </div>
            <div className="flex items-end gap-1">
              <span className={cn("text-3xl font-bold tabular-nums leading-none", m.color)}>{m.value}</span>
              <span className="mb-0.5 text-xs text-muted-foreground">/{m.max}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
              <div
                className={cn("h-full rounded-full transition-all duration-700", m.label === "Spam Score" && m.value < 10 ? "bg-emerald-500" : m.label === "Spam Score" ? "bg-red-500" : m.value >= 60 ? "bg-emerald-500" : m.value >= 35 ? "bg-amber-500" : "bg-slate-400")}
                style={{ width: `${(m.value / m.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-input pt-4 sm:grid-cols-4">
        {[
          { label: "Total Backlinks",    value: d.totalBacklinks.toLocaleString() },
          { label: "Referring Domains",  value: d.referringDomains.toLocaleString() },
          { label: "Dofollow",           value: d.dofollowLinks.toLocaleString() },
          { label: "Nofollow",           value: d.nofollowLinks.toLocaleString() },
        ].map((s) => (
          <div key={s.label}>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="mt-0.5 text-lg font-bold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-4 rounded-lg bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />
          <span className="font-semibold text-emerald-600">+{d.newLinks30d} new</span>
          <span className="text-muted-foreground">last 30d</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <ArrowDown className="h-3.5 w-3.5 text-red-400" />
          <span className="font-semibold text-red-500">-{d.lostLinks30d} lost</span>
          <span className="text-muted-foreground">last 30d</span>
        </div>
        <span className="ml-auto text-[10px] text-muted-foreground">Updated: {d.lastUpdated}</span>
      </div>
    </div>
  );
}

/* ─── Anchor distribution ─────────────────────────────────────────────────── */

function AnchorDistributionCard() {
  const total = anchorDistribution.reduce((s, a) => s + a.count, 0);
  return (
    <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Anchor Text Distribution</p>
      <div className="mb-3 flex h-3 w-full overflow-hidden rounded-full">
        {anchorDistribution.map((a) => (
          <div key={a.type} className={cn("h-full transition-all", a.color)} style={{ width: `${a.pct}%` }} title={a.label} />
        ))}
      </div>
      <div className="space-y-2">
        {anchorDistribution.map((a) => (
          <div key={a.type} className="flex items-center justify-between text-[12px]">
            <div className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full shrink-0", a.color)} />
              <span className="text-muted-foreground">{a.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="tabular-nums text-muted-foreground">{a.count.toLocaleString()}</span>
              <span className="w-8 text-right font-semibold tabular-nums">{a.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Competitor comparison ───────────────────────────────────────────────── */

function CompetitorCard() {
  const max = Math.max(...competitorComparison.map((c) => c.backlinks));
  return (
    <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Competitor Comparison</p>
      <div className="space-y-2.5">
        {competitorComparison.map((c) => (
          <div key={c.domain} className={cn("space-y-1 rounded-lg p-2 -mx-1", c.highlight && "bg-primary/5 ring-1 ring-primary/20")}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                {c.highlight && <span className="shrink-0 rounded bg-primary/10 px-1 py-0.5 text-[9px] font-bold text-primary">YOU</span>}
                <span className="truncate text-[12px] font-medium">{c.domain}</span>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-[11px]">
                <span className="text-muted-foreground">DA <span className="font-bold text-foreground">{c.da}</span></span>
                <span className="text-muted-foreground">DR <span className="font-bold text-foreground">{c.dr}</span></span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted/30">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", c.highlight ? "bg-primary" : "bg-muted-foreground/40")}
                  style={{ width: `${(c.backlinks / max) * 100}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                {c.backlinks.toLocaleString()} links
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tabs ────────────────────────────────────────────────────────────────── */

type Tab = "domains" | "backlinks";

/* ─── Referring domains grid ──────────────────────────────────────────────── */

function ReferringDomainsGrid({ isDark }: { isDark: boolean }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showLost, setShowLost] = useState(false);
  const [colSheetOpen, setColSheetOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return referringDomainsSeed.filter((r) => {
      if (!showLost && r.lost) return false;
      if (q && !r.domain.includes(q) && !r.category.toLowerCase().includes(q)) return false;
      if (filterType !== "all" && r.type !== filterType) return false;
      return true;
    });
  }, [search, filterType, showLost]);

  const colDefs = useMemo<ColDef<ReferringDomain>[]>(() => [
    {
      field: "domain", headerName: "Referring Domain", width: 220, minWidth: 150, pinned: "left",
      resizable: true, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<ReferringDomain>) => p.data ? (
        <div className="flex items-center gap-1.5">
          {p.data.lost && <span className="shrink-0 rounded bg-red-100 px-1 text-[9px] font-bold text-red-600 dark:bg-red-950/40 dark:text-red-400">LOST</span>}
          <span className={cn("truncate text-sm font-medium", p.data.lost && "line-through text-muted-foreground")}>{p.data.domain}</span>
        </div>
      ) : null,
    },
    {
      field: "da", headerName: "DA", width: 100, resizable: true, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<ReferringDomain>) => p.data ? <DaBar value={p.data.da} /> : null,
    },
    {
      field: "dr", headerName: "DR", width: 100, resizable: true, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<ReferringDomain>) => p.data ? <DaBar value={p.data.dr} /> : null,
    },
    {
      field: "backlinks", headerName: "Backlinks", width: 90, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<ReferringDomain>) => p.data ? <span className="text-xs font-semibold tabular-nums">{p.data.backlinks}</span> : null,
    },
    {
      field: "dofollowLinks", headerName: "Dofollow", width: 90, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<ReferringDomain>) => p.data ? (
        <span className={cn("text-xs tabular-nums", p.data.dofollowLinks > 0 ? "text-emerald-600" : "text-muted-foreground")}>{p.data.dofollowLinks}</span>
      ) : null,
    },
    {
      field: "type", headerName: "Type", width: 100, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<ReferringDomain>) => p.data ? <LinkTypePill type={p.data.type} /> : null,
    },
    {
      field: "category", headerName: "Category", width: 110, resizable: true, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<ReferringDomain>) => p.data ? <span className="text-[11px] text-muted-foreground">{p.data.category}</span> : null,
    },
    {
      field: "firstSeen", headerName: "First seen", width: 100, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<ReferringDomain>) => p.data ? <span className="text-[11px] text-muted-foreground">{p.data.firstSeen}</span> : null,
    },
    {
      field: "lastSeen", headerName: "Last seen", width: 100, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<ReferringDomain>) => p.data ? (
        <span className={cn("text-[11px]", p.data.lost ? "text-red-500" : "text-muted-foreground")}>{p.data.lastSeen}</span>
      ) : null,
    },
    {
      colId: "actions", headerName: "", width: 44, maxWidth: 44, pinned: "right",
      resizable: false, suppressMovable: true, sortable: false, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<ReferringDomain>) => p.data ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info("Open domain — prototype")}>
              <ExternalLink className="mr-2 h-3.5 w-3.5" /> Visit domain
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(p.data!.domain); toast.success("Copied!"); }}>
              Copy domain
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null,
    },
  ], []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search domain…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-[180px] pl-8" />
        </div>
        <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-8 w-[130px] text-sm">
          <option value="all">All types</option>
          <option value="dofollow">Dofollow</option>
          <option value="nofollow">Nofollow</option>
          <option value="ugc">UGC</option>
        </Select>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={showLost} onChange={(e) => setShowLost(e.target.checked)} className="rounded border-input" />
          Show lost
        </label>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => toast.success("Export started")}>
          <Download className="mr-1.5 h-3.5 w-3.5" /> Export
        </Button>
      </div>
      <div className={cn("ag-theme-quartz control-border w-full rounded-md bg-card", isDark && "ag-theme-quartz-dark")}>
        <AgGridReact
         theme="legacy"
          domLayout="autoHeight"
          rowData={filtered}
          columnDefs={colDefs}
          defaultColDef={{ sortable: true, resizable: true, filter: false, suppressHeaderMenuButton: true, minWidth: 60 }}
          animateRows
          pagination
          paginationPageSize={20}
        />
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} referring domains</p>
    </div>
  );
}

/* ─── Backlinks grid ──────────────────────────────────────────────────────── */

function BacklinksGrid({ isDark }: { isDark: boolean }) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showLost, setShowLost] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return backlinksSeed.filter((r) => {
      if (!showLost && r.lost) return false;
      if (q && !r.sourceDomain.includes(q) && !r.anchorText.toLowerCase().includes(q) && !r.targetUrl.includes(q)) return false;
      if (filterType !== "all" && r.type !== filterType) return false;
      return true;
    });
  }, [search, filterType, showLost]);

  const colDefs = useMemo<ColDef<BacklinkRecord>[]>(() => [
    {
      field: "sourceUrl", headerName: "Source Page", width: 260, minWidth: 160, pinned: "left",
      resizable: true, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<BacklinkRecord>) => p.data ? (
        <div className="min-w-0">
          {p.data.lost && <span className="rounded bg-red-100 px-1 text-[9px] font-bold text-red-600 dark:bg-red-950/40 dark:text-red-400 mr-1">LOST</span>}
          <span className="text-[11px] font-medium">{p.data.sourceDomain}</span>
          <p className="truncate font-mono text-[10px] text-muted-foreground">{p.data.sourceUrl.replace(`https://${p.data.sourceDomain}`, "")}</p>
        </div>
      ) : null,
    },
    {
      field: "sourceDa", headerName: "DA", width: 100, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<BacklinkRecord>) => p.data ? <DaBar value={p.data.sourceDa} /> : null,
    },
    {
      field: "anchorText", headerName: "Anchor Text", width: 180, resizable: true, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<BacklinkRecord>) => p.data ? (
        <div>
          <span className="text-[12px]">{p.data.anchorText}</span>
          <span className="ml-1.5 rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">{p.data.anchorType}</span>
        </div>
      ) : null,
    },
    {
      field: "targetUrl", headerName: "Target Page", width: 200, resizable: true, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<BacklinkRecord>) => p.data ? (
        <span className="font-mono text-[11px] text-muted-foreground">{p.data.targetUrl}</span>
      ) : null,
    },
    {
      field: "type", headerName: "Type", width: 100, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<BacklinkRecord>) => p.data ? <LinkTypePill type={p.data.type} /> : null,
    },
    {
      field: "firstSeen", headerName: "First seen", width: 100, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<BacklinkRecord>) => p.data ? <span className="text-[11px] text-muted-foreground">{p.data.firstSeen}</span> : null,
    },
    {
      field: "lastSeen", headerName: "Last seen", width: 100, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<BacklinkRecord>) => p.data ? (
        <span className={cn("text-[11px]", p.data.lost ? "text-red-500" : "text-muted-foreground")}>{p.data.lastSeen}</span>
      ) : null,
    },
    {
      colId: "actions", headerName: "", width: 44, maxWidth: 44, pinned: "right",
      resizable: false, suppressMovable: true, sortable: false, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<BacklinkRecord>) => p.data ? (
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => window.open(p.data!.sourceUrl, "_blank")}>
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      ) : null,
    },
  ], []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search backlinks…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-[180px] pl-8" />
        </div>
        <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-8 w-[130px] text-sm">
          <option value="all">All types</option>
          <option value="dofollow">Dofollow</option>
          <option value="nofollow">Nofollow</option>
          <option value="ugc">UGC</option>
          <option value="sponsored">Sponsored</option>
        </Select>
        <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={showLost} onChange={(e) => setShowLost(e.target.checked)} className="rounded border-input" />
          Show lost
        </label>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => toast.success("Export started")}>
          <Download className="mr-1.5 h-3.5 w-3.5" /> Export
        </Button>
      </div>
      <div className={cn("ag-theme-quartz control-border w-full rounded-md bg-card", isDark && "ag-theme-quartz-dark")}>
        <AgGridReact
         
          domLayout="autoHeight"
          rowData={filtered}
          columnDefs={colDefs}
          defaultColDef={{ sortable: true, resizable: true, filter: false, suppressHeaderMenuButton: true, minWidth: 60 }}
          animateRows
          pagination
          paginationPageSize={20}
        />
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} backlinks</p>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────────────────── */

export function BacklinkDashboard() {
  const isDark = useIsDark();
  const [activeTab, setActiveTab] = useState<Tab>("domains");

  const d = domainOverview;
  const newLinks  = backlinksSeed.filter((b) => !b.lost && new Date(b.firstSeen) >= new Date("2026-05-20"));
  const lostLinks = backlinksSeed.filter((b) => b.lost);

  return (
    <div className="flex flex-col gap-5">

      {/* ── Domain overview ── */}
      <DomainOverviewCard />

      {/* ── Three-column cards ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* New vs Lost */}
        <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">New vs Lost (30d)</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
                <ArrowUp className="h-3.5 w-3.5" /> New links
              </div>
              <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">+{d.newLinks30d}</p>
              <p className="text-[10px] text-emerald-600/70">referring domains gained</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/20">
              <div className="flex items-center gap-1.5 text-[11px] text-red-500">
                <ArrowDown className="h-3.5 w-3.5" /> Lost links
              </div>
              <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">-{d.lostLinks30d}</p>
              <p className="text-[10px] text-red-500/70">referring domains lost</p>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {newLinks.slice(0, 3).map((b) => (
              <div key={b.id} className="flex items-center gap-2 text-[11px]">
                <ArrowUp className="h-3 w-3 shrink-0 text-emerald-500" />
                <span className="truncate font-medium">{b.sourceDomain}</span>
                <span className="ml-auto shrink-0 text-muted-foreground">DA {b.sourceDa}</span>
              </div>
            ))}
            {lostLinks.slice(0, 2).map((b) => (
              <div key={b.id} className="flex items-center gap-2 text-[11px]">
                <ArrowDown className="h-3 w-3 shrink-0 text-red-400" />
                <span className="truncate text-muted-foreground line-through">{b.sourceDomain}</span>
                <span className="ml-auto shrink-0 text-muted-foreground">DA {b.sourceDa}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Anchor distribution */}
        <AnchorDistributionCard />

        {/* Competitor comparison */}
        <CompetitorCard />
      </div>

      {/* ── Tabs: Referring Domains / Backlinks ── */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-1 rounded-xl border border-input bg-muted/30 p-1 w-fit">
          {([
            { key: "domains",   label: "Referring Domains", count: referringDomainsSeed.filter(r => !r.lost).length },
            { key: "backlinks", label: "Backlinks",         count: backlinksSeed.filter(b => !b.lost).length },
          ] as const).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                activeTab === t.key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", activeTab === t.key ? "bg-muted" : "bg-muted/50")}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "domains"
          ? <ReferringDomainsGrid isDark={isDark} />
          : <BacklinksGrid isDark={isDark} />
        }
      </div>
    </div>
  );
}
