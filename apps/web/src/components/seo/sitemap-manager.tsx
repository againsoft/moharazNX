"use client";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  RefreshCw, ExternalLink, CheckCircle2, AlertTriangle, XCircle,
  Search, Download, Image, FileText, Globe, ChevronDown,
  ChevronRight, MoreHorizontal, Plus, Send, Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  sitemapIndex, sitemapFilesSeed, sitemapUrlsSeed,
  type SitemapFile, type SitemapUrl, type SitemapChangefreq,
} from "@/lib/mock-data/seo";
import { cn } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const STATUS_CFG = {
  ok:      { icon: <CheckCircle2 className="h-3.5 w-3.5" />, cls: "text-emerald-600", label: "OK"      },
  warning: { icon: <AlertTriangle className="h-3.5 w-3.5" />, cls: "text-amber-500",  label: "Warning" },
  error:   { icon: <XCircle className="h-3.5 w-3.5" />,      cls: "text-red-500",    label: "Error"   },
};

const FREQ_ORDER: SitemapChangefreq[] = ["always","hourly","daily","weekly","monthly","yearly","never"];
const FREQ_COLOR: Record<SitemapChangefreq, string> = {
  always:  "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  hourly:  "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
  daily:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
  weekly:  "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-400",
  monthly: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  yearly:  "bg-slate-100 text-slate-600 dark:bg-slate-800/40 dark:text-slate-400",
  never:   "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400",
};

function PriorityBar({ value }: { value: number }) {
  const pct = value * 100;
  const color = value >= 0.8 ? "bg-emerald-500" : value >= 0.5 ? "bg-amber-400" : "bg-slate-300";
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-1.5 w-10 overflow-hidden rounded-full bg-muted/40">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[11px] font-semibold tabular-nums">{value.toFixed(1)}</span>
    </div>
  );
}

/* ─── Sitemap file card ────────────────────────────────────────────────────── */

function SitemapFileCard({ file, active, onClick }: { file: SitemapFile; active: boolean; onClick: () => void }) {
  const s = STATUS_CFG[file.status];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-3 text-left transition-colors",
        active ? "border-primary bg-primary/5" : "border-input bg-card hover:bg-muted/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={cn("flex items-center gap-0.5 text-[11px] font-medium", s.cls)}>
              {s.icon}
            </span>
            <span className="truncate text-[13px] font-semibold">{file.name}</span>
            {file.includesImages && (
              <span className="flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-medium text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                <Image className="h-2.5 w-2.5" /> IMG
              </span>
            )}
          </div>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{file.path}</p>
          {file.statusNote && (
            <p className={cn("mt-1 text-[10px]", s.cls)}>{file.statusNote}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[13px] font-bold tabular-nums">{file.urlCount.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">URLs</p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{file.lastGenerated}</span>
        <span className="ml-auto">{file.fileSize}</span>
      </div>
    </button>
  );
}

/* ─── URL grid ─────────────────────────────────────────────────────────────── */

function UrlGrid({ fileId, isDark }: { fileId: string | null; isDark: boolean }) {
  const [search, setSearch] = useState("");
  const [freqFilter, setFreqFilter] = useState("all");

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return sitemapUrlsSeed.filter((u) => {
      if (fileId && u.sitemapFile !== fileId) return false;
      if (q && !u.loc.includes(q)) return false;
      if (freqFilter !== "all" && u.changefreq !== freqFilter) return false;
      return true;
    });
  }, [fileId, search, freqFilter]);

  const colDefs = useMemo<ColDef<SitemapUrl>[]>(() => [
    {
      field: "loc", headerName: "URL", flex: 1, minWidth: 180, pinned: "left",
      resizable: true, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SitemapUrl>) => p.data ? (
        <div className="flex items-center gap-1.5">
          {!p.data.indexable && (
            <span className="rounded bg-red-100 px-1 text-[9px] font-bold text-red-600 dark:bg-red-950/30 dark:text-red-400">NOINDEX</span>
          )}
          <span className="font-mono text-[12px]">{p.data.loc}</span>
          {p.data.hasImage && <Image className="h-3 w-3 shrink-0 text-blue-400" />}
        </div>
      ) : null,
    },
    {
      field: "priority", headerName: "Priority", width: 110, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SitemapUrl>) => p.data ? <PriorityBar value={p.data.priority} /> : null,
    },
    {
      field: "changefreq", headerName: "Changefreq", width: 115, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SitemapUrl>) => p.data ? (
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", FREQ_COLOR[p.data.changefreq])}>
          {p.data.changefreq}
        </span>
      ) : null,
    },
    {
      field: "lastmod", headerName: "Last modified", width: 120, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SitemapUrl>) => p.data
        ? <span className="text-[11px] text-muted-foreground">{p.data.lastmod}</span>
        : null,
    },
    {
      colId: "actions", headerName: "", width: 44, maxWidth: 44, pinned: "right",
      resizable: false, suppressMovable: true, sortable: false, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SitemapUrl>) => p.data ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info("Edit URL settings — prototype")}>Edit priority/freq</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(`https://urbanwear.com${p.data!.loc}`); toast.success("Copied!"); }}>Copy URL</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onClick={() => toast.success("Removed from sitemap — prototype")}>Remove from sitemap</DropdownMenuItem>
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
          <Input placeholder="Filter URLs…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-[200px] pl-8" />
        </div>
        <select value={freqFilter} onChange={(e) => setFreqFilter(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-sm">
          <option value="all">All frequencies</option>
          {FREQ_ORDER.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <span className="ml-auto text-xs text-muted-foreground">{rows.length} URLs</span>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => toast.success("Exporting — prototype")}>
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
      </div>
      <div className={cn("ag-theme-quartz control-border w-full rounded-md bg-card", isDark && "ag-theme-quartz-dark")}>
        <AgGridReact
         theme="legacy"
          domLayout="autoHeight"
          rowData={rows}
          columnDefs={colDefs}
          defaultColDef={{ sortable: true, resizable: true, filter: false, suppressHeaderMenuButton: true, minWidth: 60 }}
          animateRows
          pagination
          paginationPageSize={15}
        />
      </div>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */

export function SitemapManager() {
  const isDark = useIsDark();
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const activeFileMeta = sitemapFilesSeed.find((f) => f.id === activeFile);

  const handleRegenerate = () => {
    setRegenerating(true);
    setTimeout(() => { setRegenerating(false); toast.success("Sitemap regenerated — prototype"); }, 2000);
  };

  const okCount      = sitemapFilesSeed.filter((f) => f.status === "ok").length;
  const warningCount = sitemapFilesSeed.filter((f) => f.status === "warning").length;
  const errorCount   = sitemapFilesSeed.filter((f) => f.status === "error").length;

  return (
    <div className="flex flex-col gap-5">

      {/* ── Index overview ── */}
      <div className="rounded-2xl border border-input bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sitemap Index</p>
            <p className="mt-0.5 flex items-center gap-1.5 font-mono text-sm font-medium">
              <Globe className="h-4 w-4 text-muted-foreground" />
              https://urbanwear.com/sitemap-index.xml
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => toast.info("Opening — prototype")}>
              <ExternalLink className="h-3.5 w-3.5" /> View
            </Button>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => toast.info("Submitting to Google — prototype")}>
              <Send className="h-3.5 w-3.5" /> Submit to Google
            </Button>
            <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={handleRegenerate} disabled={regenerating}>
              <RefreshCw className={cn("h-3.5 w-3.5", regenerating && "animate-spin")} />
              {regenerating ? "Regenerating…" : "Regenerate all"}
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-input pt-4 sm:grid-cols-5">
          {[
            { label: "Total URLs",   value: sitemapIndex.totalUrls.toLocaleString(), cls: "text-foreground" },
            { label: "Sitemap files", value: sitemapIndex.totalFiles,                cls: "text-foreground" },
            { label: "OK",            value: okCount,                                cls: "text-emerald-600" },
            { label: "Warnings",      value: warningCount,                           cls: warningCount > 0 ? "text-amber-500" : "text-muted-foreground" },
            { label: "Errors",        value: errorCount,                             cls: errorCount > 0 ? "text-red-500" : "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
              <p className={cn("mt-0.5 text-xl font-bold tabular-nums", s.cls)}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 rounded-lg bg-muted/30 px-3 py-2 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            Last generated: <span className="font-medium text-foreground">{sitemapIndex.lastGenerated}</span>
          </span>
          <span className="flex items-center gap-1.5">
            {sitemapIndex.submitStatus === "submitted"
              ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
            Google Search Console:
            <span className={cn("font-medium capitalize", sitemapIndex.submitStatus === "submitted" ? "text-emerald-600" : "text-amber-500")}>
              {sitemapIndex.submitStatus}
            </span>
          </span>
          <span className="text-muted-foreground">Last submitted: <span className="text-foreground">{sitemapIndex.lastSubmitted}</span></span>
        </div>
      </div>

      {/* ── Error / warning alerts ── */}
      {errorCount > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/20">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-600">Static Pages sitemap has errors</p>
            <p className="text-[11px] text-red-500">4 URLs return 404 and should be removed or fixed before next submission.</p>
          </div>
          <Button variant="outline" size="sm" className="h-7 shrink-0 border-red-200 text-red-600 hover:bg-red-100 text-xs"
            onClick={() => { setActiveFile("sm_006"); }}>
            View file
          </Button>
        </div>
      )}

      {/* ── Main layout: file list + URL grid ── */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">

        {/* File list */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Sitemap Files</p>
            <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs px-2"
              onClick={() => setActiveFile(null)}>
              {activeFile ? "Show all" : ""}
            </Button>
          </div>
          {/* All-URLs summary card */}
          <button
            type="button"
            onClick={() => setActiveFile(null)}
            className={cn(
              "w-full rounded-xl border p-3 text-left transition-colors",
              activeFile === null ? "border-primary bg-primary/5" : "border-input bg-card hover:bg-muted/30",
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-[13px] font-semibold">All URLs</span>
              </div>
              <span className="text-[13px] font-bold">{sitemapIndex.totalUrls.toLocaleString()}</span>
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Across all sitemap files</p>
          </button>

          {sitemapFilesSeed.map((file) => (
            <SitemapFileCard
              key={file.id}
              file={file}
              active={activeFile === file.id}
              onClick={() => setActiveFile((prev) => prev === file.id ? null : file.id)}
            />
          ))}
        </div>

        {/* URL grid */}
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {activeFileMeta ? activeFileMeta.name : "All URLs"}
            </p>
            {activeFileMeta && (
              <div className="flex items-center gap-2">
                <span className={cn("flex items-center gap-1 text-[11px] font-medium", STATUS_CFG[activeFileMeta.status].cls)}>
                  {STATUS_CFG[activeFileMeta.status].icon} {STATUS_CFG[activeFileMeta.status].label}
                </span>
                <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs px-2"
                  onClick={() => toast.info(`Regenerating ${activeFileMeta.name} — prototype`)}>
                  <RefreshCw className="h-3 w-3" /> Regenerate
                </Button>
                <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs px-2"
                  onClick={() => toast.info("Opening — prototype")}>
                  <ExternalLink className="h-3 w-3" /> View file
                </Button>
              </div>
            )}
          </div>
          <UrlGrid fileId={activeFile} isDark={isDark} />
        </div>
      </div>

      {/* ── Settings strip ── */}
      <div className="rounded-xl border border-input bg-card px-4 py-3">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Generation Settings</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Auto-regenerate",    value: "Daily at 06:00 AM" },
            { label: "Include images",     value: "Products only" },
            { label: "Exclude noindex",    value: "Yes" },
            { label: "Max URLs per file",  value: "50,000" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              <p className="mt-0.5 text-sm font-medium">{s.value}</p>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-3 gap-1.5 text-xs h-7"
          onClick={() => toast.info("Settings — prototype")}>
          Edit settings
        </Button>
      </div>
    </div>
  );
}
