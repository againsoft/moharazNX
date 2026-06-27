"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  Eye,
  Globe,
  Filter,
  SlidersHorizontal,
  MousePointerClick,
  MoreHorizontal,
  Image as ImageIcon,
  X,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  metaRecordsSeed,
  ENTITY_TYPE_LABELS,
  SCHEMA_TYPES,
  type SeoEntityType,
  type SeoMetaRecord,
  type SchemaType,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── Column keys ─────────────────────────────────────────────────────────── */

const COLUMN_KEYS = [
  "entityType",
  "url",
  "metaTitle",
  "metaDescription",
  "ogImage",
  "indexable",
  "schemaType",
  "score",
  "issues",
] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];

const COLUMN_LABELS: Record<ColumnKey, string> = {
  entityType: "Type",
  url: "Slug / URL",
  metaTitle: "Meta Title",
  metaDescription: "Meta Description",
  ogImage: "OG Image",
  indexable: "Index",
  schemaType: "Schema",
  score: "SEO Score",
  issues: "Issues",
};

const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = {
  entityType: true,
  url: true,
  metaTitle: true,
  metaDescription: true,
  ogImage: true,
  indexable: false,
  schemaType: false,
  score: true,
  issues: true,
};

/* ─── Filter visibility ───────────────────────────────────────────────────── */

const FILTER_VISIBILITY_KEYS = ["search", "entityType", "score", "indexable"] as const;
type FilterVisibilityKey = (typeof FILTER_VISIBILITY_KEYS)[number];

const FILTER_LABELS: Record<FilterVisibilityKey, string> = {
  search: "Search",
  entityType: "Entity type",
  score: "SEO score",
  indexable: "Indexing",
};

const FILTER_HINTS: Record<FilterVisibilityKey, string> = {
  search: "Search by title or URL",
  entityType: "Product / Category / Brand / Page",
  score: "Complete / Partial / Missing",
  indexable: "Indexed / No-index",
};

const DEFAULT_VISIBLE_FILTERS: Record<FilterVisibilityKey, boolean> = {
  search: true,
  entityType: true,
  score: true,
  indexable: false,
};

/* ─── Live edit ───────────────────────────────────────────────────────────── */

const LIVE_EDIT_KEYS = ["metaTitle", "metaDescription", "schemaType"] as const;
type LiveEditKey = (typeof LIVE_EDIT_KEYS)[number];

const LIVE_EDIT_LABELS: Record<LiveEditKey, string> = {
  metaTitle: "Meta Title",
  metaDescription: "Meta Description",
  schemaType: "Schema Type",
};

const LIVE_EDIT_HINTS: Record<LiveEditKey, string> = {
  metaTitle: "Double-click Meta Title cell to edit in grid",
  metaDescription: "Double-click Meta Description cell to edit in grid",
  schemaType: "Double-click Schema cell · pick from list",
};

const DEFAULT_LIVE_EDIT: Record<LiveEditKey, boolean> = {
  metaTitle: true,
  metaDescription: false,
  schemaType: false,
};

const FORM_ONLY_FIELDS = ["OG Image", "Canonical URL", "Index / No-index toggle", "SERP preview"] as const;

/* ─── Filters ─────────────────────────────────────────────────────────────── */

type FilterState = {
  search: string;
  entityType: string;
  score: string;
  indexable: string;
};

const DEFAULT_FILTERS: FilterState = {
  search: "",
  entityType: "all",
  score: "all",
  indexable: "all",
};

function applyFilters(rows: SeoMetaRecord[], f: FilterState) {
  const q = f.search.toLowerCase().trim();
  return rows.filter((r) => {
    if (q && !r.title.toLowerCase().includes(q) && !r.url.toLowerCase().includes(q)) return false;
    if (f.entityType !== "all" && r.entityType !== f.entityType) return false;
    if (f.score === "complete" && r.score < 80) return false;
    if (f.score === "partial" && (r.score < 50 || r.score >= 80)) return false;
    if (f.score === "missing" && r.score >= 50) return false;
    if (f.indexable === "yes" && !r.indexable) return false;
    if (f.indexable === "no" && r.indexable) return false;
    return true;
  });
}

/* ─── Score helpers ────────────────────────────────────────────────────────── */

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-500";
}

const ENTITY_TYPE_STYLES: Record<SeoEntityType, { dot: string; text: string; label: string }> = {
  product:  { dot: "bg-blue-500",    text: "text-blue-700 dark:text-blue-400",    label: "Product"  },
  category: { dot: "bg-violet-500",  text: "text-violet-700 dark:text-violet-400", label: "Category" },
  brand:    { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", label: "Brand"  },
  page:     { dot: "bg-slate-400",   text: "text-slate-600 dark:text-slate-400",  label: "Page"     },
};

function EntityTypePill({ type }: { type: SeoEntityType }) {
  const s = ENTITY_TYPE_STYLES[type];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", s.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", s.dot)} />
      {s.label}
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const label = score >= 80 ? "Complete" : score >= 50 ? "Partial" : "Missing";
  const cls =
    score >= 80
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
      : score >= 50
        ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
        : "border-red-200 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/30";
  const Icon = score >= 80 ? CheckCircle2 : score >= 50 ? AlertCircle : XCircle;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", cls)}>
      <Icon className="h-3 w-3" />
      {score} · {label}
    </span>
  );
}

/* ─── Edit Sheet ──────────────────────────────────────────────────────────── */

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value.length;
  return (
    <span className={cn("text-[11px] tabular-nums", len > max ? "text-red-500" : len > max * 0.9 ? "text-amber-500" : "text-muted-foreground")}>
      {len}/{max}
    </span>
  );
}

function SerpPreview({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <div className="rounded-xl border border-input bg-card p-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Google SERP Preview</p>
      <p className="text-[11px] text-muted-foreground truncate">https://urbanwear.com{url}</p>
      <p className="mt-0.5 truncate text-base font-medium text-blue-700 dark:text-blue-400">
        {title || <span className="italic text-muted-foreground">No meta title</span>}
      </p>
      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
        {description || <span className="italic">No meta description. Google will auto-generate a snippet.</span>}
      </p>
    </div>
  );
}

function MetaEditSheet({ record, onClose }: { record: SeoMetaRecord | null; onClose: () => void }) {
  const [metaTitle, setMetaTitle] = useState(record?.metaTitle ?? "");
  const [metaDesc, setMetaDesc] = useState(record?.metaDescription ?? "");
  const [ogImage, setOgImage] = useState(record?.ogImage ?? "");
  const [canonical, setCanonical] = useState(record?.canonicalUrl ?? "");
  const [indexable, setIndexable] = useState(record?.indexable ?? true);
  const [schemaType, setSchemaType] = useState<SchemaType>(record?.schemaType ?? "WebPage");

  if (!record) return null;

  const aiGenerate = () => {
    setMetaTitle(`${record.title} — UrbanWear`);
    setMetaDesc(`Shop ${record.title} at UrbanWear. Best prices, fast delivery across Bangladesh.`);
    toast.success("AI generated meta tags");
  };

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
            <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{record.url}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ScoreBadge score={record.score} />
          {!indexable && (
            <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:border-red-800 dark:bg-red-950/30">
              No-index
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="border-b px-5 py-4">
          <SerpPreview title={metaTitle} description={metaDesc} url={record.url} />
        </div>
        <div className="space-y-5 px-5 py-5">
          {/* Meta Title */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Meta Title</label>
              <CharCounter value={metaTitle} max={60} />
            </div>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Page title for search engines…"
              className="text-sm"
              maxLength={80}
            />
            {metaTitle.length > 60 && <p className="text-[11px] text-red-500">Exceeds 60 chars — Google may truncate</p>}
          </div>
          {/* Meta Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Meta Description</label>
              <CharCounter value={metaDesc} max={160} />
            </div>
            <textarea
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              placeholder="Brief summary shown in search results…"
              rows={3}
              maxLength={200}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {metaDesc.length > 160 && <p className="text-[11px] text-red-500">Exceeds 160 chars — Google may truncate</p>}
          </div>
          {/* OG Image */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">OG Image <span className="font-normal text-muted-foreground">(1200×630px recommended)</span></label>
            <div className="flex gap-2">
              <Input value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://…" className="text-sm" />
              <Button variant="outline" size="sm" className="h-9 shrink-0" onClick={() => toast.info("Media picker — prototype")}>
                <ImageIcon className="h-4 w-4" />
              </Button>
            </div>
            {ogImage && <img src={ogImage} alt="OG preview" className="mt-2 h-24 w-full rounded-lg border border-input object-cover" />}
          </div>
          {/* Canonical URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Canonical URL <span className="font-normal text-muted-foreground">(optional)</span></label>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input value={canonical} onChange={(e) => setCanonical(e.target.value)} placeholder="Leave blank to use page URL" className="text-sm" />
            </div>
          </div>
          {/* Index + Schema */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Indexing</label>
              <button
                type="button"
                onClick={() => setIndexable((v) => !v)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  indexable
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400",
                )}
              >
                {indexable ? "Index" : "No-index"}
                <span className={cn("h-4 w-8 rounded-full border-2 transition-colors", indexable ? "border-emerald-500 bg-emerald-500" : "border-red-400 bg-red-400")}>
                  <span className={cn("block h-3 w-3 rounded-full bg-white transition-transform mt-px", indexable ? "translate-x-4" : "translate-x-0")} />
                </span>
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Schema Type</label>
              <Select value={schemaType} onChange={(e) => setSchemaType(e.target.value as SchemaType)} className="h-9 text-xs">
                {SCHEMA_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
          </div>
          {/* Issues */}
          {record.issues.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5 dark:border-amber-800 dark:bg-amber-950/20">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Issues ({record.issues.length})</p>
              <ul className="mt-1 space-y-0.5">
                {record.issues.map((issue) => (
                  <li key={issue} className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
                    <AlertCircle className="h-3 w-3 shrink-0" /> {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t bg-muted/20 px-5 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/30"
            onClick={aiGenerate}
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Generate
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info("SERP preview — prototype")}>
            <Eye className="h-3.5 w-3.5" /> Preview
          </Button>
          <Button size="sm" className="ml-auto" onClick={() => { toast.success("Meta saved"); onClose(); }}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Mobile cards ────────────────────────────────────────────────────────── */

function MetaMobileCards({ rows, onOpen }: { rows: SeoMetaRecord[]; onOpen: (id: string) => void }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-input bg-card py-10">
        <p className="text-sm font-medium">No pages match your filters</p>
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
              <EntityTypePill type={r.entityType} />
              <p className="truncate font-medium text-sm">{r.title}</p>
              <p className="truncate font-mono text-[11px] text-muted-foreground">{r.url}</p>
            </div>
            <ScoreBadge score={r.score} />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <p className="truncate text-muted-foreground">{r.metaTitle || <span className="text-red-500">No title</span>}</p>
            <p className="truncate text-muted-foreground">{r.metaDescription || <span className="text-amber-600">No description</span>}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────────────────────── */

const PAGE_SIZE = 25;

export function MetaManager({
  records,
  loading = false,
}: {
  records?: SeoMetaRecord[];
  loading?: boolean;
}) {
  const isDark = useIsDark();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [rowData, setRowData] = useState<SeoMetaRecord[]>(records ?? metaRecordsSeed);

  useEffect(() => {
    if (records) setRowData(records);
  }, [records]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [visibleFilters, setVisibleFilters] = useState(DEFAULT_VISIBLE_FILTERS);
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE);
  const [liveEdit, setLiveEdit] = useState(DEFAULT_LIVE_EDIT);
  const [selected, setSelected] = useState<SeoMetaRecord[]>([]);
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

  const toggleVisibleFilter = (key: FilterVisibilityKey, enabled: boolean) => {
    setVisibleFilters((v) => ({ ...v, [key]: enabled }));
    if (!enabled) {
      setFilters((f) => ({
        ...f,
        ...(key === "search" ? { search: "" } : {}),
        ...(key === "entityType" ? { entityType: "all" } : {}),
        ...(key === "score" ? { score: "all" } : {}),
        ...(key === "indexable" ? { indexable: "all" } : {}),
      }));
    }
  };

  const resetAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
  };

  const onCellValueChanged = useCallback(
    (e: { data: SeoMetaRecord; colDef: { field?: string } }) => {
      setRowData((rows) => rows.map((r) => (r.id === e.data.id ? { ...e.data } : r)));
      toast.success(`Updated ${e.colDef.field} for "${e.data.title}"`);
    },
    [],
  );

  /* ── Row menu ── */
  const MetaRowMenu = useCallback(
    ({ data }: { data: SeoMetaRecord }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => openRecord(data.id)}>
            <Eye className="mr-2 h-3.5 w-3.5" /> Edit meta
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.success(`AI generating for "${data.title}"…`)}>
            <Sparkles className="mr-2 h-3.5 w-3.5 text-violet-600" /> AI Generate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info("SERP preview — prototype")}>
            <Eye className="mr-2 h-3.5 w-3.5" /> SERP preview
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => toast.info("Open page — prototype")}>
            <Globe className="mr-2 h-3.5 w-3.5" /> View page
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    [],
  );

  const ActionCell = useCallback(
    (p: ICellRendererParams<SeoMetaRecord>) => {
      if (!p.data) return null;
      return (
        <div className="flex items-center justify-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-1.5 text-[11px] text-violet-600"
            onClick={(e) => { e.stopPropagation(); toast.success(`AI generating for "${p.data!.title}"…`); }}
          >
            <Sparkles className="h-3.5 w-3.5" />
          </Button>
          <MetaRowMenu data={p.data} />
        </div>
      );
    },
    [MetaRowMenu],
  );

  /* ── Column defs ── */
  const columnDefs = useMemo<ColDef<SeoMetaRecord>[]>(
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
        suppressMovable: false,
        sortable: true,
        suppressHeaderMenuButton: true,
        cellRenderer: (p: ICellRendererParams<SeoMetaRecord>) =>
          p.data ? (
            <button
              type="button"
              className="block w-full text-left"
              onClick={() => openRecord(p.data!.id)}
            >
              <span className="block truncate font-semibold text-foreground leading-tight">{p.data.title}</span>
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
        cellRenderer: (p: ICellRendererParams<SeoMetaRecord>) =>
          p.data ? <EntityTypePill type={p.data.entityType} /> : null,
      },
      {
        colId: "url",
        field: "url",
        headerName: "URL / Slug",
        hide: !visibleCols.url,
        width: 200,
        minWidth: 120,
        resizable: true,
        suppressHeaderMenuButton: true,
        cellRenderer: (p: ICellRendererParams<SeoMetaRecord>) =>
          p.data ? (
            <span className="font-mono text-[11px] text-muted-foreground">{p.data.url}</span>
          ) : null,
      },
      {
        field: "metaTitle",
        headerName: "Meta Title",
        hide: !visibleCols.metaTitle,
        editable: liveEdit.metaTitle,
        width: 220,
        minWidth: 140,
        resizable: true,
        suppressHeaderMenuButton: true,
        tooltipField: "metaTitle",
        cellRenderer: (p: ICellRendererParams<SeoMetaRecord>) =>
          p.data ? (
            p.data.metaTitle ? (
              <div>
                <span className="block truncate text-xs">{p.data.metaTitle}</span>
                <span className="text-[10px] text-muted-foreground">{p.data.metaTitle.length}/60</span>
              </div>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-red-500"><XCircle className="h-3 w-3" /> Missing</span>
            )
          ) : null,
      },
      {
        field: "metaDescription",
        headerName: "Meta Description",
        hide: !visibleCols.metaDescription,
        editable: liveEdit.metaDescription,
        width: 240,
        minWidth: 140,
        resizable: true,
        suppressHeaderMenuButton: true,
        tooltipField: "metaDescription",
        cellRenderer: (p: ICellRendererParams<SeoMetaRecord>) =>
          p.data ? (
            p.data.metaDescription ? (
              <span className="block truncate text-xs text-muted-foreground">{p.data.metaDescription}</span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-amber-600"><AlertCircle className="h-3 w-3" /> Missing</span>
            )
          ) : null,
      },
      {
        colId: "ogImage",
        field: "ogImage",
        headerName: "OG Image",
        hide: !visibleCols.ogImage,
        width: 80,
        maxWidth: 90,
        resizable: false,
        suppressHeaderMenuButton: true,
        sortable: false,
        cellRenderer: (p: ICellRendererParams<SeoMetaRecord>) =>
          p.data ? (
            p.data.ogImage ? (
              <img src={p.data.ogImage} alt="" className="h-7 w-12 rounded object-cover border border-input" />
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <ImageIcon className="h-3.5 w-3.5" /> None
              </span>
            )
          ) : null,
      },
      {
        field: "indexable",
        headerName: "Index",
        hide: !visibleCols.indexable,
        width: 80,
        maxWidth: 90,
        resizable: false,
        suppressHeaderMenuButton: true,
        cellRenderer: (p: ICellRendererParams<SeoMetaRecord>) =>
          p.data ? (
            p.data.indexable ? (
              <Badge variant="success" className="text-[10px]">Index</Badge>
            ) : (
              <Badge variant="warning" className="text-[10px]">No-index</Badge>
            )
          ) : null,
      },
      {
        field: "schemaType",
        headerName: "Schema",
        hide: !visibleCols.schemaType,
        editable: liveEdit.schemaType,
        cellEditor: liveEdit.schemaType ? "agSelectCellEditor" : undefined,
        cellEditorParams: liveEdit.schemaType ? { values: SCHEMA_TYPES } : undefined,
        width: 120,
        resizable: true,
        suppressHeaderMenuButton: true,
        cellRenderer: (p: ICellRendererParams<SeoMetaRecord>) =>
          p.data ? <span className="text-xs">{p.data.schemaType}</span> : null,
      },
      {
        field: "score",
        headerName: "SEO Score",
        hide: !visibleCols.score,
        width: 140,
        resizable: true,
        suppressHeaderMenuButton: true,
        sortable: true,
        cellRenderer: (p: ICellRendererParams<SeoMetaRecord>) =>
          p.data ? <ScoreBadge score={p.data.score} /> : null,
      },
      {
        colId: "issues",
        headerName: "Issues",
        hide: !visibleCols.issues,
        width: 90,
        resizable: false,
        suppressHeaderMenuButton: true,
        sortable: true,
        valueGetter: (p) => p.data?.issues.length ?? 0,
        cellRenderer: (p: ICellRendererParams<SeoMetaRecord>) =>
          p.data ? (
            p.data.issues.length > 0 ? (
              <span className="text-[11px] text-amber-600">{p.data.issues.length} issue{p.data.issues.length > 1 ? "s" : ""}</span>
            ) : (
              <span className="text-[11px] text-muted-foreground">—</span>
            )
          ) : null,
      },
      {
        colId: "actions",
        headerName: "Action",
        width: 72,
        maxWidth: 72,
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

  /* ── Stats ── */
  const complete = rowData.filter((r) => r.score >= 80).length;
  const partial = rowData.filter((r) => r.score >= 50 && r.score < 80).length;
  const missing = rowData.filter((r) => r.score < 50).length;

  return (
    <>
      <div className={cn("flex min-h-0 flex-1 flex-col gap-3")}>
        {/* Summary strip */}
        <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total pages", value: rowData.length, color: "text-foreground" },
            { label: "Complete", value: complete, color: "text-emerald-600" },
            { label: "Partial", value: partial, color: "text-amber-600" },
            { label: "Missing", value: missing, color: "text-red-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-input bg-card px-4 py-3 shadow-sm">
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
              <p className={cn("mt-0.5 text-2xl font-bold", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {visibleFilters.search && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search title, URL…"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="h-8 pl-8 w-[200px]"
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
          {visibleFilters.score && (
            <Select
              value={filters.score}
              onChange={(e) => setFilters((f) => ({ ...f, score: e.target.value }))}
              className="h-8 w-[160px] text-sm"
            >
              <option value="all">All scores</option>
              <option value="complete">✅ Complete (80+)</option>
              <option value="partial">⚠️ Partial (50–79)</option>
              <option value="missing">❌ Missing (&lt;50)</option>
            </Select>
          )}
          {visibleFilters.indexable && (
            <Select
              value={filters.indexable}
              onChange={(e) => setFilters((f) => ({ ...f, indexable: e.target.value }))}
              className="h-8 w-[130px] text-sm"
            >
              <option value="all">All indexing</option>
              <option value="yes">Indexed</option>
              <option value="no">No-index</option>
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
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.success("Export started (mock CSV)")}>
              Export
            </Button>
            <Button
              size="sm"
              className="gap-1.5 border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-300"
              variant="outline"
              onClick={() => toast.info("Bulk AI Generate requires approval — prototype")}
            >
              <Sparkles className="h-3.5 w-3.5" /> Bulk AI Generate
            </Button>
          </div>
        </div>

        {/* Bulk action bar */}
        {selected.length > 0 && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
            <span className="text-xs font-medium">{selected.length} selected</span>
            <Button
              size="sm"
              variant="secondary"
              className="gap-1.5"
              onClick={() => { toast.success(`AI generating for ${selected.length} pages…`); setSelected([]); }}
            >
              <Sparkles className="h-3.5 w-3.5 text-violet-600" /> AI Generate All
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success("Export started (mock CSV)")}>
              Export selected
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
              <p className="text-sm font-medium">No pages match your filters</p>
              <Button size="sm" className="mt-4" onClick={resetAllFilters}>Clear filters</Button>
            </div>
          ) : (
            <div
              className={cn(
                "ag-theme-quartz control-border w-full rounded-md bg-card",
                isDark && "ag-theme-quartz-dark",
              )}
            >
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
                  suppressMovable: false,
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
                loading={loading}
              />
            </div>
          )}
          {filtered.length > 0 && (
            <p className="shrink-0 pt-1 text-xs text-muted-foreground">
              Showing {pageStart}–{pageEnd} of {filtered.length}
              {filtered.length !== rowData.length && ` (filtered from ${rowData.length})`}
              {" · "}drag column edges to resize · drag headers to reorder
            </p>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          <MetaMobileCards rows={filtered.slice(0, 50)} onOpen={openRecord} />
          {filtered.length > 50 && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Showing 50 of {filtered.length} — use desktop for full list
            </p>
          )}
        </div>
      </div>

      {/* ── Filters sheet ── */}
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
                  onChange={(e) => toggleVisibleFilter(key, e.target.checked)}
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

      {/* ── Live edit sheet ── */}
      <Sheet open={liveEditSheetOpen} onOpenChange={setLiveEditSheetOpen}>
        <SheetContent side="right" className="w-full max-w-sm">
          <h2 className="pr-8 text-base font-semibold">Live edit</h2>
          <p className="mt-1 text-xs text-muted-foreground">Choose which fields you can edit directly in the grid.</p>
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
          <div className="mt-5 border-t border-input pt-4">
            <p className="text-xs font-medium text-muted-foreground">Edit drawer only</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {FORM_ONLY_FIELDS.map((f) => <li key={f}>· {f}</li>)}
            </ul>
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setLiveEdit(DEFAULT_LIVE_EDIT)}>
            Reset live edit
          </Button>
        </SheetContent>
      </Sheet>

      {/* ── Column visibility sheet ── */}
      <Sheet open={columnSheetOpen} onOpenChange={setColumnSheetOpen}>
        <SheetContent side="right" className="w-full max-w-xs">
          <h2 className="pr-8 text-base font-semibold">Columns</h2>
          <p className="mt-1 text-xs text-muted-foreground">Page and Actions columns always stay visible.</p>
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
            Reset columns
          </Button>
        </SheetContent>
      </Sheet>

      {/* ── Edit drawer ── */}
      <Sheet open={!!viewRecord} onOpenChange={(open) => !open && closeRecord()}>
        <SheetContent
          side="right"
          className="w-full max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg [&>button.absolute]:hidden"
          aria-describedby={undefined}
        >
          <p className="sr-only">Edit SEO meta · {viewRecord?.title}</p>
          <MetaEditSheet key={viewRecord?.id} record={viewRecord} onClose={closeRecord} />
        </SheetContent>
      </Sheet>
    </>
  );
}
