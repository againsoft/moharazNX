"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  Search,
  Filter,
  SlidersHorizontal,
  MousePointerClick,
  MoreHorizontal,
  ExternalLink,
  ArrowRight,
  Copy,
  Pencil,
  X,
  Globe,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  FileText,
  BarChart2,
} from "lucide-react";
import { toast } from "sonner";
import {
  urlRecordsSeed,
  ENTITY_TYPE_LABELS,
  URL_STATUS_LABELS,
  type SeoEntityType,
  type UrlRecord,
  type UrlStatus,
} from "@/lib/mock-data/seo";
import { cn } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── Column keys ─────────────────────────────────────────────────────────── */

const COLUMN_KEYS = ["entityType", "slug", "canonicalUrl", "status", "indexable", "views30d", "updatedAt"] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];

const COLUMN_LABELS: Record<ColumnKey, string> = {
  entityType:   "Type",
  slug:         "Slug / URL",
  canonicalUrl: "Canonical",
  status:       "Status",
  indexable:    "Index",
  views30d:     "Views (30d)",
  updatedAt:    "Last updated",
};

const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = {
  entityType:   true,
  slug:         true,
  canonicalUrl: false,
  status:       true,
  indexable:    false,
  views30d:     true,
  updatedAt:    true,
};

/* ─── Filter visibility ───────────────────────────────────────────────────── */

const FILTER_VISIBILITY_KEYS = ["search", "entityType", "status"] as const;
type FilterVisibilityKey = (typeof FILTER_VISIBILITY_KEYS)[number];

const FILTER_LABELS: Record<FilterVisibilityKey, string> = {
  search:     "Search",
  entityType: "Entity type",
  status:     "Status",
};

const FILTER_HINTS: Record<FilterVisibilityKey, string> = {
  search:     "Search by title or slug",
  entityType: "Product / Category / Brand / Page",
  status:     "Active / Redirect / No-index / Draft",
};

const DEFAULT_VISIBLE_FILTERS: Record<FilterVisibilityKey, boolean> = {
  search:     true,
  entityType: true,
  status:     true,
};

/* ─── Live edit ───────────────────────────────────────────────────────────── */

const LIVE_EDIT_KEYS = ["slug", "canonicalUrl"] as const;
type LiveEditKey = (typeof LIVE_EDIT_KEYS)[number];

const LIVE_EDIT_LABELS: Record<LiveEditKey, string> = {
  slug:         "Slug / URL",
  canonicalUrl: "Canonical URL",
};

const LIVE_EDIT_HINTS: Record<LiveEditKey, string> = {
  slug:         "Double-click slug cell to edit inline",
  canonicalUrl: "Double-click canonical cell to edit inline",
};

const DEFAULT_LIVE_EDIT: Record<LiveEditKey, boolean> = {
  slug:         false,
  canonicalUrl: false,
};

/* ─── Filters ─────────────────────────────────────────────────────────────── */

type FilterState = {
  search:     string;
  entityType: string;
  status:     string;
};

const DEFAULT_FILTERS: FilterState = { search: "", entityType: "all", status: "all" };

function applyFilters(rows: UrlRecord[], f: FilterState) {
  const q = f.search.toLowerCase().trim();
  return rows.filter((r) => {
    if (q && !r.title.toLowerCase().includes(q) && !r.slug.toLowerCase().includes(q)) return false;
    if (f.entityType !== "all" && r.entityType !== f.entityType) return false;
    if (f.status !== "all" && r.status !== f.status) return false;
    return true;
  });
}

/* ─── Status pill ─────────────────────────────────────────────────────────── */

const STATUS_STYLES: Record<UrlStatus, { cls: string; icon: React.ReactNode; label: string }> = {
  active:   { cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",  icon: <CheckCircle2 className="h-3 w-3" />, label: "Active"   },
  redirect: { cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",             icon: <ArrowRight className="h-3 w-3" />,   label: "Redirect" },
  noindex:  { cls: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700",            icon: <EyeOff className="h-3 w-3" />,       label: "No-index" },
  draft:    { cls: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",                   icon: <FileText className="h-3 w-3" />,     label: "Draft"    },
};

function StatusPill({ status }: { status: UrlStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", s.cls)}>
      {s.icon}
      {s.label}
    </span>
  );
}

/* ─── Entity type dot ─────────────────────────────────────────────────────── */

const ENTITY_DOT: Record<SeoEntityType, string> = {
  product:  "bg-blue-500",
  category: "bg-violet-500",
  brand:    "bg-emerald-500",
  page:     "bg-slate-400",
};

const ENTITY_TEXT: Record<SeoEntityType, string> = {
  product:  "text-blue-700 dark:text-blue-400",
  category: "text-violet-700 dark:text-violet-400",
  brand:    "text-emerald-700 dark:text-emerald-400",
  page:     "text-slate-600 dark:text-slate-400",
};

function EntityTypePill({ type }: { type: SeoEntityType }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", ENTITY_TEXT[type])}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", ENTITY_DOT[type])} />
      {ENTITY_TYPE_LABELS[type]}
    </span>
  );
}

/* ─── Edit Drawer ─────────────────────────────────────────────────────────── */

function UrlEditDrawer({ record, onClose }: { record: UrlRecord | null; onClose: () => void }) {
  const [slug, setSlug] = useState(record?.slug ?? "");
  const [canonical, setCanonical] = useState(record?.canonicalUrl ?? "");
  const [status, setStatus] = useState<UrlStatus>(record?.status ?? "active");
  const [indexable, setIndexable] = useState(record?.indexable ?? true);
  const [redirectTo, setRedirectTo] = useState(record?.redirectTo ?? "");

  if (!record) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {ENTITY_TYPE_LABELS[record.entityType]}
            </p>
            <h2 className="mt-0.5 truncate text-base font-semibold">{record.title}</h2>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <StatusPill status={record.status} />
          {record.views30d > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <BarChart2 className="h-3 w-3" />
              {record.views30d.toLocaleString()} views / 30d
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-5 px-5 py-5">
          {/* Slug */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Slug / URL</label>
            <div className="flex items-center gap-2 rounded-md border border-input bg-muted/40 px-3 py-2">
              <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 bg-transparent font-mono text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(`https://urbanwear.com${slug}`); toast.success("Copied to clipboard"); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">https://urbanwear.com<span className="font-mono">{slug}</span></p>
          </div>

          {/* Canonical */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Canonical URL <span className="font-normal text-muted-foreground">(optional)</span></label>
            <Input
              value={canonical}
              onChange={(e) => setCanonical(e.target.value)}
              placeholder="Leave blank to use page URL"
              className="font-mono text-sm"
            />
            <p className="text-[11px] text-muted-foreground">Points search engines to the preferred version of this page.</p>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Status</label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as UrlStatus)}
              className="h-9 text-sm"
            >
              {(Object.keys(URL_STATUS_LABELS) as UrlStatus[]).map((s) => (
                <option key={s} value={s}>{URL_STATUS_LABELS[s]}</option>
              ))}
            </Select>
          </div>

          {/* Redirect target */}
          {status === "redirect" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Redirect to</label>
              <div className="flex items-center gap-2">
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                <Input
                  value={redirectTo}
                  onChange={(e) => setRedirectTo(e.target.value)}
                  placeholder="/new-url-path"
                  className="font-mono text-sm"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">301 permanent redirect. Use full path starting with /</p>
            </div>
          )}

          {/* Indexable toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Indexing</label>
            <button
              type="button"
              onClick={() => setIndexable((v) => !v)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors",
                indexable
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400",
              )}
            >
              <span className="flex items-center gap-2">
                {indexable ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {indexable ? "Indexed by search engines" : "Hidden from search engines (no-index)"}
              </span>
              <span className={cn("h-4 w-8 rounded-full border-2 transition-colors", indexable ? "border-emerald-500 bg-emerald-500" : "border-slate-400 bg-slate-300")}>
                <span className={cn("block h-3 w-3 rounded-full bg-white transition-transform mt-px", indexable ? "translate-x-4" : "translate-x-0")} />
              </span>
            </button>
          </div>

          {/* Info strip */}
          <div className="rounded-lg border border-input bg-muted/30 px-3 py-2.5 text-[11px] text-muted-foreground space-y-1">
            <p><span className="font-medium text-foreground">Last updated:</span> {record.updatedAt}</p>
            <p><span className="font-medium text-foreground">Views (30d):</span> {record.views30d.toLocaleString()}</p>
            <p><span className="font-medium text-foreground">Entity:</span> {ENTITY_TYPE_LABELS[record.entityType]}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t bg-muted/20 px-5 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => toast.info("Open page — prototype")}
          >
            <ExternalLink className="h-3.5 w-3.5" /> View page
          </Button>
          <Button size="sm" className="ml-auto" onClick={() => { toast.success("URL settings saved"); onClose(); }}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile cards ────────────────────────────────────────────────────────── */

function UrlMobileCards({ rows, onOpen }: { rows: UrlRecord[]; onOpen: (id: string) => void }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-input bg-card py-10">
        <p className="text-sm font-medium">No URLs match your filters</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <button
          key={r.id}
          type="button"
          className="w-full rounded-xl border border-input bg-card p-3 text-left shadow-sm hover:bg-muted/30"
          onClick={() => onOpen(r.id)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <EntityTypePill type={r.entityType} />
                <StatusPill status={r.status} />
              </div>
              <p className="truncate font-medium text-sm">{r.title}</p>
              <p className="truncate font-mono text-[11px] text-muted-foreground">{r.slug}</p>
            </div>
            {r.views30d > 0 && (
              <span className="shrink-0 text-right text-[11px] text-muted-foreground">
                {r.views30d.toLocaleString()}<br />views
              </span>
            )}
          </div>
          {r.status === "redirect" && (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-600">
              <ArrowRight className="h-3 w-3 shrink-0" />
              <span className="truncate font-mono">{r.redirectTo}</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */

const PAGE_SIZE = 25;

export function UrlManager() {
  const isDark = useIsDark();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [rowData, setRowData] = useState<UrlRecord[]>(urlRecordsSeed);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [visibleFilters, setVisibleFilters] = useState(DEFAULT_VISIBLE_FILTERS);
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE);
  const [liveEdit, setLiveEdit] = useState(DEFAULT_LIVE_EDIT);
  const [selected, setSelected] = useState<UrlRecord[]>([]);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [liveEditSheetOpen, setLiveEditSheetOpen] = useState(false);
  const [page, setPage] = useState(0);

  const viewId = searchParams.get("view");
  const viewRecord = useMemo(() => rowData.find((r) => r.id === viewId) ?? null, [rowData, viewId]);

  const filtered = useMemo(() => applyFilters(rowData, filters), [rowData, filters]);

  const openRecord = (id: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("view", id);
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  };
  const closeRecord = () => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("view");
    router.push(`${pathname}?${p.toString()}`, { scroll: false });
  };

  const resetAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
  };

  const onCellValueChanged = useCallback(
    (e: { data: UrlRecord; colDef: { field?: string } }) => {
      setRowData((rows) => rows.map((r) => (r.id === e.data.id ? { ...e.data } : r)));
      toast.success(`Updated ${e.colDef.field} for "${e.data.title}"`);
    },
    [],
  );

  /* ── Row menu ── */
  const RowMenu = useCallback(
    ({ data }: { data: UrlRecord }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openRecord(data.id)}>
            <Pencil className="mr-2 h-3.5 w-3.5" /> Edit URL
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(`https://urbanwear.com${data.slug}`); toast.success("Copied!"); }}>
            <Copy className="mr-2 h-3.5 w-3.5" /> Copy URL
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info("Open page — prototype")}>
            <ExternalLink className="mr-2 h-3.5 w-3.5" /> View page
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-amber-600"
            onClick={() => toast.info("Add redirect — prototype")}
          >
            <ArrowRight className="mr-2 h-3.5 w-3.5" /> Add redirect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    [],
  );

  const ActionCell = useCallback(
    (p: ICellRendererParams<UrlRecord>) => {
      if (!p.data) return null;
      return (
        <div className="flex items-center justify-center">
          <RowMenu data={p.data} />
        </div>
      );
    },
    [RowMenu],
  );

  /* ── Column defs ── */
  const columnDefs = useMemo<ColDef<UrlRecord>[]>(
    () => [
      {
        headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 32,
        maxWidth: 32,
        pinned: "left",
        resizable: false,
        suppressMovable: true,
        suppressHeaderMenuButton: true,
        sortable: false,
      },
      {
        field: "title",
        headerName: "Page",
        width: 220,
        minWidth: 140,
        pinned: "left",
        resizable: true,
        sortable: true,
        suppressHeaderMenuButton: true,
        cellRenderer: (p: ICellRendererParams<UrlRecord>) =>
          p.data ? (
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => openRecord(p.data!.id)}
            >
              <span className="block truncate font-semibold text-foreground leading-tight hover:text-primary">
                {p.data.title}
              </span>
            </button>
          ) : null,
      },
      {
        colId: "entityType",
        field: "entityType",
        headerName: "Type",
        hide: !visibleCols.entityType,
        width: 100,
        resizable: true,
        suppressHeaderMenuButton: true,
        cellRenderer: (p: ICellRendererParams<UrlRecord>) =>
          p.data ? <EntityTypePill type={p.data.entityType} /> : null,
      },
      {
        colId: "slug",
        field: "slug",
        headerName: "Slug / URL",
        hide: !visibleCols.slug,
        editable: liveEdit.slug,
        width: 260,
        minWidth: 140,
        resizable: true,
        suppressHeaderMenuButton: true,
        cellRenderer: (p: ICellRendererParams<UrlRecord>) =>
          p.data ? (
            <div className="flex items-center gap-1.5 group">
              <span className="truncate font-mono text-[11px] text-muted-foreground">{p.data.slug}</span>
              <button
                type="button"
                className="hidden group-hover:block shrink-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(`https://urbanwear.com${p.data!.slug}`);
                  toast.success("Copied!");
                }}
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          ) : null,
      },
      {
        colId: "canonicalUrl",
        field: "canonicalUrl",
        headerName: "Canonical",
        hide: !visibleCols.canonicalUrl,
        editable: liveEdit.canonicalUrl,
        width: 200,
        resizable: true,
        suppressHeaderMenuButton: true,
        cellRenderer: (p: ICellRendererParams<UrlRecord>) =>
          p.data ? (
            p.data.canonicalUrl
              ? <span className="font-mono text-[11px] text-muted-foreground">{p.data.canonicalUrl}</span>
              : <span className="text-[11px] text-muted-foreground/50">— self</span>
          ) : null,
      },
      {
        colId: "status",
        field: "status",
        headerName: "Status",
        hide: !visibleCols.status,
        width: 110,
        resizable: false,
        suppressHeaderMenuButton: true,
        sortable: true,
        cellRenderer: (p: ICellRendererParams<UrlRecord>) =>
          p.data ? (
            <div className="space-y-0.5">
              <StatusPill status={p.data.status} />
              {p.data.status === "redirect" && p.data.redirectTo && (
                <div className="flex items-center gap-0.5 font-mono text-[10px] text-amber-600">
                  <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                  <span className="truncate">{p.data.redirectTo}</span>
                </div>
              )}
            </div>
          ) : null,
      },
      {
        colId: "indexable",
        field: "indexable",
        headerName: "Index",
        hide: !visibleCols.indexable,
        width: 80,
        maxWidth: 90,
        resizable: false,
        suppressHeaderMenuButton: true,
        cellRenderer: (p: ICellRendererParams<UrlRecord>) =>
          p.data ? (
            p.data.indexable
              ? <span className="flex items-center gap-1 text-[11px] text-emerald-600"><Eye className="h-3 w-3" /> Index</span>
              : <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><EyeOff className="h-3 w-3" /> No</span>
          ) : null,
      },
      {
        colId: "views30d",
        field: "views30d",
        headerName: "Views (30d)",
        hide: !visibleCols.views30d,
        width: 100,
        resizable: true,
        suppressHeaderMenuButton: true,
        sortable: true,
        cellRenderer: (p: ICellRendererParams<UrlRecord>) =>
          p.data ? (
            p.data.views30d > 0
              ? <span className="flex items-center gap-1 text-xs tabular-nums"><BarChart2 className="h-3 w-3 text-muted-foreground" />{p.data.views30d.toLocaleString()}</span>
              : <span className="text-[11px] text-muted-foreground/50">—</span>
          ) : null,
      },
      {
        colId: "updatedAt",
        field: "updatedAt",
        headerName: "Updated",
        hide: !visibleCols.updatedAt,
        width: 100,
        resizable: true,
        suppressHeaderMenuButton: true,
        sortable: true,
        cellRenderer: (p: ICellRendererParams<UrlRecord>) =>
          p.data ? <span className="text-[11px] text-muted-foreground">{p.data.updatedAt}</span> : null,
      },
      {
        colId: "actions",
        headerName: "",
        width: 44,
        maxWidth: 44,
        pinned: "right",
        resizable: false,
        suppressMovable: true,
        sortable: false,
        suppressHeaderMenuButton: true,
        cellRenderer: ActionCell,
      },
    ],
    [visibleCols, liveEdit, ActionCell],
  );

  const pageStart = page * PAGE_SIZE + 1;
  const pageEnd = Math.min((page + 1) * PAGE_SIZE, filtered.length);

  /* ── KPI counts ── */
  const activeCount   = rowData.filter((r) => r.status === "active").length;
  const redirectCount = rowData.filter((r) => r.status === "redirect").length;
  const noindexCount  = rowData.filter((r) => r.status === "noindex").length;
  const draftCount    = rowData.filter((r) => r.status === "draft").length;

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* KPI strip */}
        <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total URLs",  value: rowData.length, color: "text-foreground",    icon: <Globe className="h-4 w-4 text-muted-foreground" /> },
            { label: "Active",      value: activeCount,    color: "text-emerald-600",   icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
            { label: "Redirects",   value: redirectCount,  color: "text-amber-600",     icon: <ArrowRight className="h-4 w-4 text-amber-500" /> },
            { label: "No-index / Draft", value: noindexCount + draftCount, color: "text-slate-500", icon: <EyeOff className="h-4 w-4 text-slate-400" /> },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 rounded-xl border border-input bg-card px-4 py-3 shadow-sm">
              <div className="rounded-lg bg-muted/50 p-1.5">{s.icon}</div>
              <div>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
                <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {visibleFilters.search && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search title, slug…"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="h-8 w-[200px] pl-8"
              />
            </div>
          )}
          {visibleFilters.entityType && (
            <Select
              value={filters.entityType}
              onChange={(e) => setFilters((f) => ({ ...f, entityType: e.target.value }))}
              className="h-8 w-[140px] text-sm"
            >
              <option value="all">All types</option>
              {(Object.keys(ENTITY_TYPE_LABELS) as SeoEntityType[]).map((t) => (
                <option key={t} value={t}>{ENTITY_TYPE_LABELS[t]}</option>
              ))}
            </Select>
          )}
          {visibleFilters.status && (
            <Select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="h-8 w-[130px] text-sm"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="redirect">Redirect</option>
              <option value="noindex">No-index</option>
              <option value="draft">Draft</option>
            </Select>
          )}
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => setFilterSheetOpen(true)}>
            <Filter className="mr-1.5 h-3.5 w-3.5" /> Filters
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => setLiveEditSheetOpen(true)}>
            <MousePointerClick className="mr-1.5 h-3.5 w-3.5" /> Live edit
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => setColumnSheetOpen(true)}>
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> Columns
          </Button>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => toast.success("Export started (mock CSV)")}>
            Export
          </Button>
        </div>

        {/* Bulk bar */}
        {selected.length > 0 && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
            <span className="text-xs font-medium">{selected.length} selected</span>
            <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => toast.info("Bulk redirect — prototype")}>
              <ArrowRight className="h-3.5 w-3.5" /> Set redirect
            </Button>
            <Button size="sm" variant="secondary" className="gap-1.5" onClick={() => toast.info("Bulk no-index — prototype")}>
              <EyeOff className="h-3.5 w-3.5" /> No-index
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Export started")}>
              Export
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto h-7 w-7 p-0" onClick={() => setSelected([])}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Desktop AG Grid */}
        <div className="hidden flex-col md:flex">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-input bg-card py-16">
              <AlertTriangle className="mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-sm font-medium">No URLs match your filters</p>
              <Button size="sm" className="mt-4" onClick={resetAllFilters}>Clear filters</Button>
            </div>
          ) : (
            <div className={cn("ag-theme-quartz control-border w-full rounded-md bg-card", isDark && "ag-theme-quartz-dark")}>
              <AgGridReact
               theme="legacy"
                domLayout="autoHeight"
                rowData={filtered}
                columnDefs={columnDefs}
                defaultColDef={{
                  sortable: true,
                  resizable: true,
                  filter: false,
                  suppressHeaderMenuButton: true,
                  minWidth: 72,
                }}
                rowSelection="multiple"
                suppressRowClickSelection
                animateRows
                enableBrowserTooltips
                tooltipShowDelay={400}
                colResizeDefault="shift"
                onCellValueChanged={onCellValueChanged}
                onSelectionChanged={(e) => setSelected(e.api.getSelectedRows())}
                pagination
                paginationPageSize={PAGE_SIZE}
                onPaginationChanged={(e) => setPage(e.api.paginationGetCurrentPage())}
              />
            </div>
          )}
          {filtered.length > 0 && (
            <p className="shrink-0 pt-1 text-xs text-muted-foreground">
              Showing {pageStart}–{pageEnd} of {filtered.length}
              {filtered.length !== rowData.length && ` (filtered from ${rowData.length})`}
            </p>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          <UrlMobileCards rows={filtered.slice(0, 50)} onOpen={openRecord} />
        </div>
      </div>

      {/* Filters sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
          <h2 className="pr-8 text-base font-semibold">Filters</h2>
          <p className="mt-1 text-xs text-muted-foreground">Choose which filters show in the toolbar.</p>
          <div className="mt-4 space-y-2">
            {FILTER_VISIBILITY_KEYS.map((key) => (
              <label key={key} className="flex cursor-pointer gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={visibleFilters[key]}
                  onChange={(e) => {
                    setVisibleFilters((v) => ({ ...v, [key]: e.target.checked }));
                    if (!e.target.checked) {
                      setFilters((f) => ({
                        ...f,
                        ...(key === "search" ? { search: "" } : {}),
                        ...(key === "entityType" ? { entityType: "all" } : {}),
                        ...(key === "status" ? { status: "all" } : {}),
                      }));
                    }
                  }}
                  className="mt-0.5 rounded border-input"
                />
                <span>
                  <span className="font-medium">{FILTER_LABELS[key]}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{FILTER_HINTS[key]}</span>
                </span>
              </label>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={resetAllFilters}>Reset all filters</Button>
        </SheetContent>
      </Sheet>

      {/* Live edit sheet */}
      <Sheet open={liveEditSheetOpen} onOpenChange={setLiveEditSheetOpen}>
        <SheetContent side="right" className="w-full max-w-sm">
          <h2 className="pr-8 text-base font-semibold">Live edit</h2>
          <p className="mt-1 text-xs text-muted-foreground">Double-click enabled cells to edit inline.</p>
          <div className="mt-4 space-y-3">
            {LIVE_EDIT_KEYS.map((key) => (
              <label key={key} className="flex cursor-pointer gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={liveEdit[key]}
                  onChange={(e) => setLiveEdit((v) => ({ ...v, [key]: e.target.checked }))}
                  className="mt-0.5 rounded border-input"
                />
                <span>
                  <span className="font-medium">{LIVE_EDIT_LABELS[key]}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{LIVE_EDIT_HINTS[key]}</span>
                </span>
              </label>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setLiveEdit(DEFAULT_LIVE_EDIT)}>
            Reset
          </Button>
        </SheetContent>
      </Sheet>

      {/* Column visibility sheet */}
      <Sheet open={columnSheetOpen} onOpenChange={setColumnSheetOpen}>
        <SheetContent side="right" className="w-full max-w-xs">
          <h2 className="pr-8 text-base font-semibold">Columns</h2>
          <p className="mt-1 text-xs text-muted-foreground">Page column always stays visible.</p>
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
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setVisibleCols(DEFAULT_VISIBLE)}>
            Reset
          </Button>
        </SheetContent>
      </Sheet>

      {/* Edit drawer */}
      <Sheet open={!!viewRecord} onOpenChange={(open) => !open && closeRecord()}>
        <SheetContent
          side="right"
          className="w-full max-w-md gap-0 overflow-hidden p-0 sm:max-w-md [&>button.absolute]:hidden"
          aria-describedby={undefined}
        >
          <p className="sr-only">Edit URL · {viewRecord?.title}</p>
          <UrlEditDrawer key={viewRecord?.id} record={viewRecord} onClose={closeRecord} />
        </SheetContent>
      </Sheet>
    </>
  );
}
