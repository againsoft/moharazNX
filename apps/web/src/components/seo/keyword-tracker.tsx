"use client";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  SlidersHorizontal,
  Plus,
  Download,
  MoreHorizontal,
  Target,
  BarChart2,
  Zap,
  Eye,
  X,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  keywordsSeed,
  KEYWORD_TAG_LABELS,
  type SeoKeyword,
  type KeywordTag,
  type KeywordStatus,
} from "@/lib/mock-data/seo";
import { cn } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const TAG_STYLES: Record<KeywordTag, { dot: string; text: string }> = {
  brand:         { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  product:       { dot: "bg-blue-500",    text: "text-blue-700 dark:text-blue-400" },
  category:      { dot: "bg-violet-500",  text: "text-violet-700 dark:text-violet-400" },
  informational: { dot: "bg-amber-400",   text: "text-amber-700 dark:text-amber-400" },
  local:         { dot: "bg-rose-400",    text: "text-rose-700 dark:text-rose-400" },
};

function TagPill({ tag }: { tag: KeywordTag }) {
  const s = TAG_STYLES[tag];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", s.text)}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", s.dot)} />
      {KEYWORD_TAG_LABELS[tag]}
    </span>
  );
}

function PositionBadge({ pos }: { pos: number }) {
  const cls =
    pos <= 3  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800" :
    pos <= 10 ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800" :
    pos <= 20 ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800" :
                "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700";
  return (
    <span className={cn("inline-flex h-7 w-9 items-center justify-center rounded-md border text-sm font-bold tabular-nums", cls)}>
      {pos > 50 ? "50+" : pos}
    </span>
  );
}

function ChangePill({ change }: { change: number }) {
  if (change === 0) return <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground"><Minus className="h-3 w-3" /> —</span>;
  const up = change > 0;
  return (
    <span className={cn("flex items-center gap-0.5 text-[11px] font-semibold", up ? "text-emerald-600" : "text-red-500")}>
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(change)}
    </span>
  );
}

function DifficultyBar({ value }: { value: number }) {
  const color = value < 35 ? "bg-emerald-500" : value < 60 ? "bg-amber-500" : "bg-red-500";
  const label = value < 35 ? "Easy" : value < 60 ? "Medium" : "Hard";
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted/40">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground tabular-nums">{value}</span>
    </div>
  );
}

/* ─── Position distribution ───────────────────────────────────────────────── */

function PositionDistribution({ rows }: { rows: SeoKeyword[] }) {
  const bands = [
    { label: "Top 3",  min: 1,  max: 3,  color: "bg-emerald-500", textColor: "text-emerald-700 dark:text-emerald-400" },
    { label: "4 – 10", min: 4,  max: 10, color: "bg-blue-500",    textColor: "text-blue-700 dark:text-blue-400" },
    { label: "11 – 20",min: 11, max: 20, color: "bg-amber-500",   textColor: "text-amber-700 dark:text-amber-400" },
    { label: "21 – 50",min: 21, max: 50, color: "bg-orange-400",  textColor: "text-orange-700 dark:text-orange-400" },
    { label: "50+",    min: 51, max: 999,color: "bg-slate-400",   textColor: "text-slate-600 dark:text-slate-400" },
  ];
  const total = rows.length;
  return (
    <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Position Distribution</p>
      <div className="space-y-2.5">
        {bands.map((b) => {
          const count = rows.filter((r) => r.position >= b.min && r.position <= b.max).length;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={b.label} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-[11px] text-muted-foreground">{b.label}</span>
              <div className="flex-1 h-2 overflow-hidden rounded-full bg-muted/30">
                <div className={cn("h-full rounded-full transition-all duration-500", b.color)} style={{ width: `${pct}%` }} />
              </div>
              <span className={cn("w-6 shrink-0 text-right text-[11px] font-bold tabular-nums", b.textColor)}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Volume sparkline (simple bars) ─────────────────────────────────────── */

function VolumeBars({ value }: { value: number }) {
  const max = 10000;
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/30">
        <div className="h-full rounded-full bg-primary/50" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground">{value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}</span>
    </div>
  );
}

/* ─── Filters ─────────────────────────────────────────────────────────────── */

type Filters = { search: string; tag: string; status: string; position: string; change: string };
const DEFAULT_FILTERS: Filters = { search: "", tag: "all", status: "all", position: "all", change: "all" };

function applyFilters(rows: SeoKeyword[], f: Filters): SeoKeyword[] {
  const q = f.search.toLowerCase();
  return rows.filter((r) => {
    if (q && !r.keyword.toLowerCase().includes(q) && !r.targetUrl.toLowerCase().includes(q)) return false;
    if (f.tag !== "all" && r.tag !== f.tag) return false;
    if (f.status !== "all" && r.status !== f.status) return false;
    if (f.position === "top3"  && r.position > 3)  return false;
    if (f.position === "top10" && r.position > 10) return false;
    if (f.position === "top20" && r.position > 20) return false;
    if (f.position === "below20" && r.position <= 20) return false;
    if (f.change === "up"   && r.change <= 0) return false;
    if (f.change === "down" && r.change >= 0) return false;
    if (f.change === "flat" && r.change !== 0) return false;
    return true;
  });
}

/* ─── Column keys ─────────────────────────────────────────────────────────── */

const COLUMN_KEYS = ["tag", "targetUrl", "position", "change", "volume", "difficulty", "ctr", "clicks30d", "impressions30d"] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];
const COLUMN_LABELS: Record<ColumnKey, string> = {
  tag: "Tag", targetUrl: "Target URL", position: "Position", change: "Change (7d)",
  volume: "Search volume", difficulty: "Difficulty", ctr: "CTR %", clicks30d: "Clicks (30d)", impressions30d: "Impressions (30d)",
};
const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = {
  tag: true, targetUrl: true, position: true, change: true,
  volume: true, difficulty: true, ctr: false, clicks30d: true, impressions30d: false,
};

/* ─── Main component ──────────────────────────────────────────────────────── */

const PAGE_SIZE = 25;

export function KeywordTracker() {
  const isDark = useIsDark();
  const [rows] = useState<SeoKeyword[]>(keywordsSeed);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE);
  const [selected, setSelected] = useState<SeoKeyword[]>([]);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => applyFilters(rows, filters), [rows, filters]);

  /* ── KPIs ── */
  const tracked       = rows.filter((r) => r.status === "tracking");
  const avgPos        = tracked.length ? Math.round(tracked.reduce((s, r) => s + r.position, 0) / tracked.length) : 0;
  const top3          = tracked.filter((r) => r.position <= 3).length;
  const top10         = tracked.filter((r) => r.position <= 10).length;
  const improved      = tracked.filter((r) => r.change > 0).length;
  const totalClicks   = rows.reduce((s, r) => s + r.clicks30d, 0);
  const totalImpr     = rows.reduce((s, r) => s + r.impressions30d, 0);

  /* ── Column defs ── */
  const columnDefs = useMemo<ColDef<SeoKeyword>[]>(() => [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 32, maxWidth: 32,
      pinned: "left", resizable: false, suppressMovable: true, suppressHeaderMenuButton: true, sortable: false,
    },
    {
      field: "keyword", headerName: "Keyword",
      width: 240, minWidth: 160, pinned: "left",
      resizable: true, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SeoKeyword>) => p.data ? (
        <div className="min-w-0">
          <p className="truncate font-medium text-sm leading-tight">{p.data.keyword}</p>
          <p className="truncate font-mono text-[10px] text-muted-foreground">{p.data.targetUrl}</p>
        </div>
      ) : null,
    },
    {
      colId: "tag", field: "tag", headerName: "Tag",
      hide: !visibleCols.tag, width: 110, resizable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SeoKeyword>) => p.data ? <TagPill tag={p.data.tag} /> : null,
    },
    {
      colId: "position", field: "position", headerName: "Position",
      hide: !visibleCols.position, width: 90, resizable: false, suppressHeaderMenuButton: true, sortable: true,
      cellRenderer: (p: ICellRendererParams<SeoKeyword>) => p.data ? <PositionBadge pos={p.data.position} /> : null,
    },
    {
      colId: "change", field: "change", headerName: "7d Change",
      hide: !visibleCols.change, width: 90, resizable: false, suppressHeaderMenuButton: true, sortable: true,
      cellRenderer: (p: ICellRendererParams<SeoKeyword>) => p.data ? <ChangePill change={p.data.change} /> : null,
    },
    {
      colId: "volume", field: "volume", headerName: "Volume / mo",
      hide: !visibleCols.volume, width: 150, resizable: true, suppressHeaderMenuButton: true, sortable: true,
      cellRenderer: (p: ICellRendererParams<SeoKeyword>) => p.data ? <VolumeBars value={p.data.volume} /> : null,
    },
    {
      colId: "difficulty", field: "difficulty", headerName: "Difficulty",
      hide: !visibleCols.difficulty, width: 130, resizable: true, suppressHeaderMenuButton: true, sortable: true,
      cellRenderer: (p: ICellRendererParams<SeoKeyword>) => p.data ? <DifficultyBar value={p.data.difficulty} /> : null,
    },
    {
      colId: "ctr", field: "ctr", headerName: "CTR %",
      hide: !visibleCols.ctr, width: 80, resizable: false, suppressHeaderMenuButton: true, sortable: true,
      cellRenderer: (p: ICellRendererParams<SeoKeyword>) => p.data ? <span className="text-xs tabular-nums">{p.data.ctr}%</span> : null,
    },
    {
      colId: "clicks30d", field: "clicks30d", headerName: "Clicks (30d)",
      hide: !visibleCols.clicks30d, width: 100, resizable: false, suppressHeaderMenuButton: true, sortable: true,
      cellRenderer: (p: ICellRendererParams<SeoKeyword>) => p.data ? (
        <span className="flex items-center gap-1 text-xs tabular-nums">
          <BarChart2 className="h-3 w-3 text-muted-foreground" />
          {p.data.clicks30d.toLocaleString()}
        </span>
      ) : null,
    },
    {
      colId: "impressions30d", field: "impressions30d", headerName: "Impressions",
      hide: !visibleCols.impressions30d, width: 110, resizable: false, suppressHeaderMenuButton: true, sortable: true,
      cellRenderer: (p: ICellRendererParams<SeoKeyword>) => p.data ? (
        <span className="text-xs tabular-nums text-muted-foreground">{p.data.impressions30d.toLocaleString()}</span>
      ) : null,
    },
    {
      colId: "actions", headerName: "",
      width: 44, maxWidth: 44,
      pinned: "right", resizable: false, suppressMovable: true, sortable: false, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SeoKeyword>) => p.data ? (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info("SERP preview — prototype")}>
                <Eye className="mr-2 h-3.5 w-3.5" /> SERP preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("History — prototype")}>
                <BarChart2 className="mr-2 h-3.5 w-3.5" /> Position history
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Pause — prototype")}>
                Pause tracking
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500" onClick={() => toast.info("Remove — prototype")}>
                Remove keyword
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null,
    },
  ], [visibleCols]);

  const pageStart = page * PAGE_SIZE + 1;
  const pageEnd   = Math.min((page + 1) * PAGE_SIZE, filtered.length);

  return (
    <>
      <div className="flex flex-col gap-4">

        {/* ── KPI strip ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Tracked",        value: tracked.length,                icon: <Target className="h-4 w-4 text-muted-foreground" />,   cls: "text-foreground" },
            { label: "Avg. position",  value: avgPos,                         icon: <BarChart2 className="h-4 w-4 text-muted-foreground" />, cls: "text-foreground" },
            { label: "Top 3",          value: top3,                           icon: <Zap className="h-4 w-4 text-emerald-500" />,           cls: "text-emerald-600" },
            { label: "Top 10",         value: top10,                          icon: <TrendingUp className="h-4 w-4 text-blue-500" />,       cls: "text-blue-600" },
            { label: "Improved (7d)",  value: improved,                       icon: <ArrowUp className="h-4 w-4 text-emerald-500" />,       cls: "text-emerald-600" },
            { label: "Clicks (30d)",   value: totalClicks.toLocaleString(),   icon: <BarChart2 className="h-4 w-4 text-violet-500" />,      cls: "text-foreground" },
          ].map((k) => (
            <div key={k.label} className="flex items-center gap-3 rounded-xl border border-input bg-card px-4 py-3 shadow-sm">
              <div className="rounded-lg bg-muted/50 p-1.5 shrink-0">{k.icon}</div>
              <div className="min-w-0">
                <p className={cn("text-xl font-bold tabular-nums leading-tight", k.cls)}>{k.value}</p>
                <p className="truncate text-[10px] text-muted-foreground">{k.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Position distribution + Tag breakdown ── */}
        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <PositionDistribution rows={tracked} />

          {/* Tag breakdown */}
          <div className="rounded-2xl border border-input bg-card p-4 shadow-sm lg:w-56">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">By Tag</p>
            <div className="space-y-2">
              {(Object.keys(KEYWORD_TAG_LABELS) as KeywordTag[]).map((tag) => {
                const count = rows.filter((r) => r.tag === tag).length;
                const s = TAG_STYLES[tag];
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, tag: f.tag === tag ? "all" : tag }))}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/40",
                      filters.tag === tag && "bg-muted/60 font-semibold",
                    )}
                  >
                    <span className={cn("flex items-center gap-2", s.text)}>
                      <span className={cn("h-2 w-2 rounded-full", s.dot)} />
                      {KEYWORD_TAG_LABELS[tag]}
                    </span>
                    <span className="text-[11px] font-bold tabular-nums text-muted-foreground">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search keywords…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="h-8 w-[200px] pl-8"
            />
          </div>
          <Select value={filters.position} onChange={(e) => setFilters((f) => ({ ...f, position: e.target.value }))} className="h-8 w-[140px] text-sm">
            <option value="all">All positions</option>
            <option value="top3">Top 3</option>
            <option value="top10">Top 10</option>
            <option value="top20">Top 20</option>
            <option value="below20">Below 20</option>
          </Select>
          <Select value={filters.change} onChange={(e) => setFilters((f) => ({ ...f, change: e.target.value }))} className="h-8 w-[130px] text-sm">
            <option value="all">All changes</option>
            <option value="up">↑ Improved</option>
            <option value="down">↓ Dropped</option>
            <option value="flat">— No change</option>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setFilterSheetOpen(true)}>
            <Filter className="mr-1.5 h-3.5 w-3.5" /> Filters
          </Button>
          <Button variant="outline" size="sm" onClick={() => setColumnSheetOpen(true)}>
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> Columns
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success("Export started (mock CSV)")}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export
            </Button>
            <Button size="sm" onClick={() => toast.info("Add keyword — prototype")}>
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Add keyword
            </Button>
          </div>
        </div>

        {/* Bulk bar */}
        {selected.length > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
            <span className="text-xs font-medium">{selected.length} selected</span>
            <Button size="sm" variant="secondary" onClick={() => toast.info("Bulk pause — prototype")}>Pause tracking</Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Export selected")}>Export</Button>
            <Button variant="ghost" size="sm" className="ml-auto h-7 w-7 p-0" onClick={() => setSelected([])}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ── Desktop grid ── */}
        <div className="hidden flex-col md:flex">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-input bg-card py-16">
              <p className="font-medium">No keywords match your filters</p>
              <Button size="sm" className="mt-4" onClick={() => setFilters(DEFAULT_FILTERS)}>Clear filters</Button>
            </div>
          ) : (
            <div className={cn("ag-theme-quartz control-border w-full rounded-md bg-card", isDark && "ag-theme-quartz-dark")}>
              <AgGridReact
               theme="legacy"
                domLayout="autoHeight"
                rowData={filtered}
                columnDefs={columnDefs}
                defaultColDef={{ sortable: true, resizable: true, filter: false, suppressHeaderMenuButton: true, minWidth: 60 }}
                rowSelection="multiple"
                suppressRowClickSelection
                animateRows
                colResizeDefault="shift"
                onSelectionChanged={(e) => setSelected(e.api.getSelectedRows())}
                pagination
                paginationPageSize={PAGE_SIZE}
                onPaginationChanged={(e) => setPage(e.api.paginationGetCurrentPage())}
              />
            </div>
          )}
          {filtered.length > 0 && (
            <p className="pt-1 text-xs text-muted-foreground">
              Showing {pageStart}–{pageEnd} of {filtered.length}
              {filtered.length !== rows.length && ` (filtered from ${rows.length})`}
            </p>
          )}
        </div>

        {/* ── Mobile cards ── */}
        <div className="flex flex-col gap-2 md:hidden">
          {filtered.slice(0, 30).map((r) => (
            <div key={r.id} className="rounded-xl border border-input bg-card p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <TagPill tag={r.tag} />
                  <p className="mt-0.5 truncate font-semibold text-sm">{r.keyword}</p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">{r.targetUrl}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <PositionBadge pos={r.position} />
                  <ChangePill change={r.change} />
                </div>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                <div>Vol: <span className="font-medium text-foreground">{r.volume >= 1000 ? `${(r.volume / 1000).toFixed(1)}k` : r.volume}</span></div>
                <div>Clicks: <span className="font-medium text-foreground">{r.clicks30d}</span></div>
                <div>CTR: <span className="font-medium text-foreground">{r.ctr}%</span></div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Filters sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
          <h2 className="pr-8 text-base font-semibold">Filters</h2>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Tag</label>
              <Select value={filters.tag} onChange={(e) => setFilters((f) => ({ ...f, tag: e.target.value }))} className="h-9 text-sm w-full">
                <option value="all">All tags</option>
                {(Object.keys(KEYWORD_TAG_LABELS) as KeywordTag[]).map((t) => <option key={t} value={t}>{KEYWORD_TAG_LABELS[t]}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Status</label>
              <Select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="h-9 text-sm w-full">
                <option value="all">All</option>
                <option value="tracking">Tracking</option>
                <option value="paused">Paused</option>
                <option value="lost">Lost (50+)</option>
              </Select>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset all</Button>
        </SheetContent>
      </Sheet>

      {/* Columns sheet */}
      <Sheet open={columnSheetOpen} onOpenChange={setColumnSheetOpen}>
        <SheetContent side="right" className="w-full max-w-xs">
          <h2 className="pr-8 text-base font-semibold">Columns</h2>
          <div className="mt-4 space-y-2">
            {COLUMN_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={visibleCols[key]}
                  onChange={(e) => setVisibleCols((v) => ({ ...v, [key]: e.target.checked }))}
                  className="rounded border-input"
                />
                {COLUMN_LABELS[key]}
              </label>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setVisibleCols(DEFAULT_VISIBLE)}>Reset</Button>
        </SheetContent>
      </Sheet>
    </>
  );
}
