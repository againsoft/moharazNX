"use client";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  Plus, Search, CheckCircle2, AlertTriangle, XCircle, Clock,
  MoreHorizontal, Code2, RefreshCw, ExternalLink, ChevronDown,
  Layers, Globe, Package, List, HelpCircle, FileText,
  Building2, Star, LayoutGrid,
} from "lucide-react";
import { toast } from "sonner";
import { schemaSeed, type SchemaRecord, type SchemaMarkupType, type SchemaStatus } from "@/lib/mock-data/seo";
import { cn } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─── Config ───────────────────────────────────────────────────────────────── */

const TYPE_ICONS: Record<SchemaMarkupType, React.ReactNode> = {
  Product:        <Package className="h-3.5 w-3.5" />,
  BreadcrumbList: <List className="h-3.5 w-3.5" />,
  Organization:   <Building2 className="h-3.5 w-3.5" />,
  WebSite:        <Globe className="h-3.5 w-3.5" />,
  FAQPage:        <HelpCircle className="h-3.5 w-3.5" />,
  Article:        <FileText className="h-3.5 w-3.5" />,
  LocalBusiness:  <Building2 className="h-3.5 w-3.5" />,
  Review:         <Star className="h-3.5 w-3.5" />,
  CollectionPage: <LayoutGrid className="h-3.5 w-3.5" />,
};

const TYPE_COLORS: Record<SchemaMarkupType, string> = {
  Product:        "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
  BreadcrumbList: "text-slate-500 bg-slate-100 dark:bg-slate-800/40",
  Organization:   "text-violet-500 bg-violet-50 dark:bg-violet-950/30",
  WebSite:        "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
  FAQPage:        "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
  Article:        "text-orange-500 bg-orange-50 dark:bg-orange-950/30",
  LocalBusiness:  "text-rose-500 bg-rose-50 dark:bg-rose-950/30",
  Review:         "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30",
  CollectionPage: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30",
};

const STATUS_CFG: Record<SchemaStatus, { icon: React.ReactNode; cls: string; label: string }> = {
  active:  { icon: <CheckCircle2 className="h-3.5 w-3.5" />, cls: "text-emerald-600", label: "Active"  },
  draft:   { icon: <Clock className="h-3.5 w-3.5" />,        cls: "text-blue-500",    label: "Draft"   },
  error:   { icon: <XCircle className="h-3.5 w-3.5" />,      cls: "text-red-500",     label: "Error"   },
  warning: { icon: <AlertTriangle className="h-3.5 w-3.5" />, cls: "text-amber-500",  label: "Warning" },
};

/* ─── Example JSON-LD templates ────────────────────────────────────────────── */

const SCHEMA_TEMPLATES: Record<SchemaMarkupType, string> = {
  Product: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "{{product.name}}",
    "description": "{{product.description}}",
    "image": "{{product.image}}",
    "brand": { "@type": "Brand", "name": "{{product.brand}}" },
    "offers": {
      "@type": "Offer",
      "price": "{{product.price}}",
      "priceCurrency": "BDT",
      "availability": "https://schema.org/InStock",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "{{product.rating}}",
      "reviewCount": "{{product.reviewCount}}",
    },
  }, null, 2),
  Organization: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "UrbanWear",
    "url": "https://urbanwear.com",
    "logo": "https://urbanwear.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+880-1700-000000",
      "contactType": "customer service",
    },
    "sameAs": ["https://facebook.com/urbanwear", "https://instagram.com/urbanwear"],
  }, null, 2),
  WebSite: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "UrbanWear",
    "url": "https://urbanwear.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://urbanwear.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  }, null, 2),
  FAQPage: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "How long does shipping take?", "acceptedAnswer": { "@type": "Answer", "text": "3–5 business days" } },
      { "@type": "Question", "name": "Can I return items?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, within 30 days of purchase" } },
    ],
  }, null, 2),
  BreadcrumbList: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [] }, null, 2),
  Article: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", "headline": "{{article.title}}", "author": { "@type": "Person", "name": "{{author.name}}" } }, null, 2),
  LocalBusiness: JSON.stringify({ "@context": "https://schema.org", "@type": "LocalBusiness", "name": "UrbanWear", "address": { "@type": "PostalAddress", "addressLocality": "Dhaka", "addressCountry": "BD" } }, null, 2),
  Review: JSON.stringify({ "@context": "https://schema.org", "@type": "Review", "itemReviewed": { "@type": "Product", "name": "{{product.name}}" }, "reviewRating": { "@type": "Rating", "ratingValue": "5" } }, null, 2),
  CollectionPage: JSON.stringify({ "@context": "https://schema.org", "@type": "CollectionPage", "name": "{{category.name}}", "description": "{{category.description}}" }, null, 2),
};

/* ─── Schema Sheet ─────────────────────────────────────────────────────────── */

function SchemaSheet({ open, onClose, record }: { open: boolean; onClose: () => void; record?: SchemaRecord }) {
  const [json, setJson] = useState(record ? SCHEMA_TEMPLATES[record.type] : "");
  const [activeType, setActiveType] = useState<SchemaMarkupType>(record?.type ?? "Product");

  const handleTypeSelect = (t: SchemaMarkupType) => {
    setActiveType(t);
    setJson(SCHEMA_TEMPLATES[t]);
  };

  let jsonError = "";
  try { if (json) JSON.parse(json); } catch (e: any) { jsonError = e.message; }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-2xl">
        <div className="border-b border-input px-5 py-4">
          <p className="text-base font-semibold">{record ? `Edit: ${record.name}` : "Add schema markup"}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Type picker */}
          {!record && (
            <div>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Schema type</label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(TYPE_ICONS) as SchemaMarkupType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeSelect(t)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                      activeType === t
                        ? cn(TYPE_COLORS[t], "border-current/30")
                        : "border-input bg-muted/30 text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {TYPE_ICONS[t]} {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name & scope */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Name</label>
              <Input defaultValue={record?.name} placeholder="e.g. Product Schema" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Scope</label>
              <select className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
                <option value="global">Global (all pages)</option>
                <option value="template">Template</option>
                <option value="page">Single page</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Applied to</label>
            <Input defaultValue={record?.appliedTo} placeholder="e.g. /products/* or All product pages" />
          </div>

          {/* JSON-LD editor */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">JSON-LD</label>
              {jsonError
                ? <span className="flex items-center gap-1 text-[10px] text-red-500"><XCircle className="h-3 w-3" /> Invalid JSON</span>
                : json && <span className="flex items-center gap-1 text-[10px] text-emerald-600"><CheckCircle2 className="h-3 w-3" /> Valid JSON</span>
              }
            </div>
            <div className="relative rounded-xl border border-input overflow-hidden bg-[#1e1e2e] dark:bg-[#13131a]">
              <textarea
                value={json}
                onChange={(e) => setJson(e.target.value)}
                spellCheck={false}
                rows={14}
                className="w-full resize-none bg-transparent p-3 font-mono text-[12px] leading-5 text-slate-100 outline-none"
              />
            </div>
            {jsonError && <p className="mt-1 text-[11px] text-red-500 font-mono">{jsonError}</p>}
          </div>

          {/* Validation hint */}
          <div className="rounded-lg border border-input bg-muted/20 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground">
              Use <code className="rounded bg-muted px-1 text-[10px]">{"{{product.name}}"}</code> syntax for dynamic values — these are replaced at render time from your product/page data.
            </p>
          </div>
        </div>

        <div className="border-t border-input px-5 py-4 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="outline" className="gap-1.5" onClick={() => toast.info("Validate — prototype")}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Validate
          </Button>
          <Button className="flex-1" onClick={() => { toast.success(record ? "Schema updated — prototype" : "Schema created — prototype"); onClose(); }} disabled={!!jsonError}>
            {record ? "Save changes" : "Create schema"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */

export function SchemaManager() {
  const isDark = useIsDark();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<SchemaRecord | undefined>();
  const [selected, setSelected] = useState<SchemaRecord[]>([]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return schemaSeed.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.type.toLowerCase().includes(q) && !r.appliedTo.toLowerCase().includes(q)) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      return true;
    });
  }, [search, statusFilter]);

  const stats = useMemo(() => ({
    total:    schemaSeed.length,
    active:   schemaSeed.filter((r) => r.status === "active").length,
    errors:   schemaSeed.filter((r) => r.status === "error").length,
    warnings: schemaSeed.filter((r) => r.validationWarnings > 0).length,
    draft:    schemaSeed.filter((r) => r.status === "draft").length,
  }), []);

  const colDefs = useMemo<ColDef<SchemaRecord>[]>(() => [
    {
      headerCheckboxSelection: true, checkboxSelection: true,
      width: 40, maxWidth: 40, pinned: "left", resizable: false, sortable: false,
      suppressHeaderMenuButton: true, suppressMovable: true,
    },
    {
      field: "name", headerName: "Schema", width: 220, minWidth: 160, pinned: "left",
      resizable: true, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SchemaRecord>) => p.data ? (
        <div className="flex items-center gap-2">
          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", TYPE_COLORS[p.data.type])}>
            {TYPE_ICONS[p.data.type]}
          </span>
          <span className="text-sm font-medium truncate">{p.data.name}</span>
        </div>
      ) : null,
    },
    {
      field: "type", headerName: "Type", width: 140, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SchemaRecord>) => p.data
        ? <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", TYPE_COLORS[p.data.type])}>{p.data.type}</span>
        : null,
    },
    {
      field: "scope", headerName: "Scope", width: 100, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SchemaRecord>) => p.data ? (
        <span className="inline-flex items-center gap-1 text-[11px]">
          {p.data.scope === "global" && <Globe className="h-3 w-3 text-muted-foreground" />}
          {p.data.scope === "template" && <Layers className="h-3 w-3 text-muted-foreground" />}
          {p.data.scope === "page" && <FileText className="h-3 w-3 text-muted-foreground" />}
          <span className="capitalize text-muted-foreground">{p.data.scope}</span>
        </span>
      ) : null,
    },
    {
      field: "appliedTo", headerName: "Applied to", flex: 1, minWidth: 120,
      resizable: true, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SchemaRecord>) => p.data
        ? <span className="text-[11px] text-muted-foreground">{p.data.appliedTo}</span>
        : null,
    },
    {
      field: "status", headerName: "Status", width: 105, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SchemaRecord>) => p.data ? (
        <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium", STATUS_CFG[p.data.status].cls)}>
          {STATUS_CFG[p.data.status].icon}
          {STATUS_CFG[p.data.status].label}
        </span>
      ) : null,
    },
    {
      headerName: "Validation", width: 110, sortable: false, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SchemaRecord>) => p.data ? (
        <div className="flex items-center gap-2 text-[11px]">
          {p.data.validationErrors > 0
            ? <span className="flex items-center gap-0.5 text-red-500"><XCircle className="h-3 w-3" />{p.data.validationErrors} err</span>
            : <span className="text-emerald-600"><CheckCircle2 className="h-3 w-3 inline mr-0.5" />OK</span>
          }
          {p.data.validationWarnings > 0 && (
            <span className="flex items-center gap-0.5 text-amber-500"><AlertTriangle className="h-3 w-3" />{p.data.validationWarnings}</span>
          )}
        </div>
      ) : null,
    },
    {
      field: "lastValidated", headerName: "Validated", width: 100, sortable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SchemaRecord>) => p.data
        ? <span className="text-[11px] text-muted-foreground">{p.data.lastValidated}</span>
        : null,
    },
    {
      colId: "actions", headerName: "", width: 44, maxWidth: 44, pinned: "right",
      resizable: false, suppressMovable: true, sortable: false, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<SchemaRecord>) => p.data ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditRecord(p.data!); setSheetOpen(true); }}>
              <Code2 className="mr-2 h-3.5 w-3.5" /> Edit JSON-LD
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Validate — prototype")}>
              <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Validate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Test in Rich Results — prototype")}>
              <ExternalLink className="mr-2 h-3.5 w-3.5" /> Test in Google
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500" onClick={() => toast.success("Deleted — prototype")}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null,
    },
  ], []);

  return (
    <div className="flex flex-col gap-4">

      {/* ── KPI strip ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Total schemas",  value: stats.total,    cls: "" },
          { label: "Active",         value: stats.active,   cls: "text-emerald-600" },
          { label: "Errors",         value: stats.errors,   cls: stats.errors > 0 ? "text-red-500" : "text-muted-foreground" },
          { label: "Warnings",       value: stats.warnings, cls: stats.warnings > 0 ? "text-amber-500" : "text-muted-foreground" },
          { label: "Draft",          value: stats.draft,    cls: "text-blue-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-input bg-card px-4 py-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className={cn("mt-0.5 text-xl font-bold tabular-nums", s.cls)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Error alert ── */}
      {stats.errors > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/20">
          <XCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-600">Schema validation errors detected</p>
            <p className="text-[11px] text-red-500">Blog Article schema has 1 error — fix before Google can display rich results for blog posts.</p>
          </div>
          <Button variant="outline" size="sm" className="h-7 shrink-0 border-red-200 text-red-600 hover:bg-red-100 text-xs" onClick={() => toast.info("Navigating — prototype")}>
            Fix now
          </Button>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search schemas…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-[200px] pl-8" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-sm">
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
        </select>

        {selected.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-input bg-muted/40 px-3 py-1.5">
            <span className="text-xs font-medium">{selected.length} selected</span>
            <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs px-2" onClick={() => toast.info("Validating — prototype")}>Validate all</Button>
            <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs text-red-500 px-2" onClick={() => toast.success("Deleted — prototype")}>Delete</Button>
          </div>
        )}

        <Button variant="outline" size="sm" className="ml-auto gap-1.5 text-xs" onClick={() => toast.info("Running validation — prototype")}>
          <RefreshCw className="h-3.5 w-3.5" /> Validate all
        </Button>
        <Button size="sm" className="gap-1.5 text-xs" onClick={() => { setEditRecord(undefined); setSheetOpen(true); }}>
          <Plus className="h-3.5 w-3.5" /> Add schema
        </Button>
      </div>

      {/* ── Grid ── */}
      <div className={cn("ag-theme-quartz control-border w-full rounded-md bg-card", isDark && "ag-theme-quartz-dark")}>
        <AgGridReact
         theme="legacy"
          domLayout="autoHeight"
          rowData={filtered}
          columnDefs={colDefs}
          defaultColDef={{ sortable: true, resizable: true, filter: false, suppressHeaderMenuButton: true, minWidth: 60 }}
          rowSelection="multiple"
          suppressRowClickSelection
          onSelectionChanged={(e) => setSelected(e.api.getSelectedRows())}
          animateRows
        />
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} schema definitions</p>

      <SchemaSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); setEditRecord(undefined); }}
        record={editRecord}
      />
    </div>
  );
}
