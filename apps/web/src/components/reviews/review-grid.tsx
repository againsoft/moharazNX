"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { CheckCircle2, Download, Eye, Filter, Loader2, MoreHorizontal, Plus, SlidersHorizontal, Star, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { REVIEW_STATUS_LABELS, countReviewsByStatus, type Review, type ReviewStatus, type ReviewType } from "@/lib/mock-data/reviews";
import { useReviewStore } from "@/lib/store/review-store";
import { cn } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ReviewsNav } from "@/components/reviews/reviews-nav";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";

// ─── Status tabs ──────────────────────────────────────────────────────────────
const STATUS_TABS: { value: ReviewStatus | "all"; label: string }[] = [
  { value: "all", label: "All Reviews" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "spam", label: "Spam" },
  { value: "archived", label: "Archived" },
];

// ─── Columns ──────────────────────────────────────────────────────────────────
const COLUMN_KEYS = ["reviewId", "type", "rating", "sentiment", "helpfulVotes", "verifiedPurchase", "moderatedBy", "updatedAt"] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];
const COLUMN_LABELS: Record<ColumnKey, string> = {
  reviewId: "Review ID", type: "Type", rating: "Rating", sentiment: "Sentiment",
  helpfulVotes: "Helpful Votes", verifiedPurchase: "Verified", moderatedBy: "Moderated By", updatedAt: "Updated",
};
const COLUMN_HINTS: Record<ColumnKey, string> = {
  reviewId: "Unique review identifier", type: "Text / Photo / Video / Verified",
  rating: "Star rating 1–5", sentiment: "AI sentiment: Positive / Negative / Neutral / Mixed",
  helpfulVotes: "Customer helpful vote count", verifiedPurchase: "Confirmed purchase badge",
  moderatedBy: "Staff who moderated this review", updatedAt: "Last updated date",
};
const DEFAULT_VISIBLE_COLUMNS: Record<ColumnKey, boolean> = {
  reviewId: false, type: true, rating: true, sentiment: true,
  helpfulVotes: true, verifiedPurchase: true, moderatedBy: false, updatedAt: true,
};

// ─── Filters ──────────────────────────────────────────────────────────────────
const FILTER_KEYS = ["search", "rating", "type", "sentiment"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];
const FILTER_LABELS: Record<FilterKey, string> = {
  search: "Search", rating: "Rating", type: "Review Type", sentiment: "Sentiment",
};
const FILTER_HINTS: Record<FilterKey, string> = {
  search: "Product name, customer name, or review title diye search",
  rating: "1–5 star filter",
  type: "Text / Photo / Video diye filter",
  sentiment: "AI sentiment diye filter",
};
const DEFAULT_VISIBLE_FILTERS: Record<FilterKey, boolean> = { search: true, rating: false, type: false, sentiment: false };
type FilterState = { search: string; rating: string; type: string; sentiment: string };
const DEFAULT_FILTERS: FilterState = { search: "", rating: "all", type: "all", sentiment: "all" };

// ─── Component ────────────────────────────────────────────────────────────────
type Props = {
  className?: string;
  reviews?: Review[];
  loading?: boolean;
  onStatusChange?: (id: string, status: ReviewStatus) => void | Promise<void>;
};

export function ReviewGrid({
  className,
  reviews: reviewsProp,
  loading = false,
  onStatusChange,
}: Props) {
  const router = useRouter();
  const isDark = useIsDark();
  const canWrite = useAdminCanWrite();
  const storeReviews = useReviewStore((s) => s.reviews);
  const storeUpdateStatus = useReviewStore((s) => s.updateStatus);
  const reviews = reviewsProp ?? storeReviews;

  const updateStatus = useCallback(
    (id: string, status: ReviewStatus) => {
      if (onStatusChange) {
        void onStatusChange(id, status);
        return;
      }
      storeUpdateStatus(id, status);
    },
    [onStatusChange, storeUpdateStatus],
  );

  const [activeTab, setActiveTab] = useState<ReviewStatus | "all">("all");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [visibleFilters, setVisibleFilters] = useState(DEFAULT_VISIBLE_FILTERS);
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Review[]>([]);

  const counts = useMemo(() => countReviewsByStatus(reviews), [reviews]);

  const rows = useMemo(() => {
    return reviews.filter((r) => {
      if (activeTab !== "all" && r.status !== activeTab) return false;
      const q = filters.search.toLowerCase().trim();
      if (q && !r.product.name.toLowerCase().includes(q) && !r.customer.name.toLowerCase().includes(q) && !r.title.toLowerCase().includes(q)) return false;
      if (filters.rating !== "all" && r.rating !== parseInt(filters.rating)) return false;
      if (filters.type !== "all" && r.type !== filters.type) return false;
      if (filters.sentiment !== "all" && r.aiAnalysis.sentiment !== filters.sentiment) return false;
      return true;
    });
  }, [reviews, activeTab, filters]);

  const activeFilterCount = [filters.search !== "", filters.rating !== "all", filters.type !== "all", filters.sentiment !== "all"].filter(Boolean).length;

  const toggleVisibleFilter = (key: FilterKey, enabled: boolean) => {
    setVisibleFilters((v) => ({ ...v, [key]: enabled }));
    if (!enabled) setFilters((f) => ({ ...f, ...(key === "search" ? { search: "" } : {}), ...(key === "rating" ? { rating: "all" } : {}), ...(key === "type" ? { type: "all" } : {}), ...(key === "sentiment" ? { sentiment: "all" } : {}) }));
  };

  // ── Cell renderers ──────────────────────────────────────────────────────────
  const StarCell = useCallback(({ data }: ICellRendererParams<Review>) => {
    if (!data) return null;
    return (
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map((s) => (
          <Star key={s} className={cn("h-3 w-3", s <= data.rating ? "fill-yellow-400 text-yellow-400" : "text-muted")} />
        ))}
      </div>
    );
  }, []);

  const SentimentCell = useCallback(({ data }: ICellRendererParams<Review>) => {
    if (!data) return null;
    const colors = { positive: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", negative: "bg-destructive/10 text-destructive", neutral: "bg-muted text-muted-foreground", mixed: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" };
    return <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium capitalize", colors[data.aiAnalysis.sentiment])}>{data.aiAnalysis.sentiment}</span>;
  }, []);

  const StatusCell = useCallback(({ data }: ICellRendererParams<Review>) => {
    if (!data) return null;
    if (!canWrite) {
      return (
        <span className="text-[11px] font-medium capitalize">
          {REVIEW_STATUS_LABELS[data.status]}
        </span>
      );
    }
    return (
      <Select className="h-7 min-w-[100px] border-0 bg-transparent text-[11px] shadow-none" value={data.status}
        onChange={(e) => { updateStatus(data.id, e.target.value as ReviewStatus); if (!onStatusChange) toast.success(`${data.reviewId} → ${REVIEW_STATUS_LABELS[e.target.value as ReviewStatus]}`); }}
        onClick={(e) => e.stopPropagation()}
      >
        {Object.entries(REVIEW_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </Select>
    );
  }, [onStatusChange, updateStatus, canWrite]);

  const columnDefs = useMemo<ColDef<Review>[]>(() => {
    const cols: ColDef<Review>[] = [
      { headerCheckboxSelection: canWrite, checkboxSelection: canWrite, width: 44, pinned: "left", resizable: false, suppressMovable: true, suppressHeaderMenuButton: true },
    ];

    if (visibleColumns.reviewId) cols.push({ field: "reviewId", headerName: "ID", width: 88 });

    cols.push({
      colId: "product", headerName: "Product", width: 180,
      cellRenderer: (p: ICellRendererParams<Review>) => p.data ? (
        <div className="flex items-center gap-2">
          <img src={p.data.product.imageUrl} alt="" className="h-6 w-6 rounded object-cover" />
          <span className="truncate text-xs">{p.data.product.name}</span>
        </div>
      ) : null,
    });
    cols.push({ colId: "customer", headerName: "Customer", width: 130, valueGetter: (p) => p.data?.customer.name });
    cols.push({ colId: "title", headerName: "Title", width: 200, valueGetter: (p) => p.data?.title, cellRenderer: (p: ICellRendererParams<Review>) => p.data ? (
      <button type="button" className="w-full truncate text-left text-xs font-medium text-primary hover:underline" onClick={() => router.push(`/catalog/reviews/${p.data!.id}`)}>{p.data.title}</button>
    ) : null });

    if (visibleColumns.rating) cols.push({ colId: "rating", headerName: "Rating", width: 110, cellRenderer: StarCell });
    if (visibleColumns.type) cols.push({ field: "type", headerName: "Type", width: 72, cellRenderer: (p: ICellRendererParams<Review>) => p.data ? <Badge variant="outline" className="text-[9px] capitalize">{p.data.type}</Badge> : null });
    if (visibleColumns.sentiment) cols.push({ colId: "sentiment", headerName: "Sentiment", width: 96, cellRenderer: SentimentCell });
    if (visibleColumns.helpfulVotes) cols.push({ field: "helpfulVotes", headerName: "Helpful", width: 72 });
    if (visibleColumns.verifiedPurchase) cols.push({ field: "isVerifiedPurchase", headerName: "Verified", width: 72, cellRenderer: (p: ICellRendererParams<Review>) => p.data?.isVerifiedPurchase ? <span className="text-emerald-600 dark:text-emerald-400">✓</span> : <span className="text-muted-foreground">—</span> });

    cols.push({ colId: "status", headerName: "Status", width: 120, cellRenderer: StatusCell });
    cols.push({ colId: "date", headerName: "Date", width: 92, valueGetter: (p) => p.data ? new Date(p.data.createdAt).toLocaleDateString() : "" });

    if (visibleColumns.moderatedBy) cols.push({ field: "moderatedBy", headerName: "Moderated By", width: 120 });

    cols.push({
      colId: "activity",
      headerName: "Activity",
      width: 72,
      pinned: "right",
      sortable: false,
      resizable: false,
      suppressMovable: true,
      suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<Review>) =>
        p.data ? (
          <ActivityTriggerButton
            entity={{
              type: "review",
              id: p.data.id,
              label: p.data.reviewId,
              subtitle: p.data.product.name,
            }}
          />
        ) : null,
    });

    cols.push({ width: 44, pinned: "right", sortable: false, resizable: false, suppressMovable: true, suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<Review>) => p.data ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/catalog/reviews/${p.data!.id}`)}><Eye className="mr-2 h-3.5 w-3.5" /> View review</DropdownMenuItem>
            {canWrite && (
              <>
                <DropdownMenuItem onClick={() => { updateStatus(p.data!.id, "approved"); if (!onStatusChange) toast.success("Approved"); }}><CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Approve</DropdownMenuItem>
                <DropdownMenuItem onClick={() => { updateStatus(p.data!.id, "rejected"); if (!onStatusChange) toast.success("Rejected"); }} className="text-destructive"><XCircle className="mr-2 h-3.5 w-3.5" /> Reject</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null
    });

    return cols;
  }, [StarCell, SentimentCell, StatusCell, onStatusChange, router, visibleColumns, updateStatus, canWrite]);

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}>
      <ReviewsNav />

      {/* Status tabs */}
      <div className="flex flex-wrap gap-0.5 overflow-x-auto rounded-lg border border-input bg-muted/30 p-1">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === "all" ? counts.all : (counts[tab.value] ?? 0);
          const active = activeTab === tab.value;
          return (
            <button key={tab.value} type="button" onClick={() => setActiveTab(tab.value)}
              className={cn("whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
              )}>
              {tab.label}
              <span className={cn("ml-1.5 tabular-nums", active ? "text-foreground" : "text-muted-foreground/70")}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {visibleFilters.search && <Input placeholder="Search product, customer, title…" value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} className="max-w-[220px]" />}
        {visibleFilters.rating && <Select value={filters.rating} onChange={(e) => setFilters((f) => ({ ...f, rating: e.target.value }))} className="w-[120px]">
          <option value="all">All ratings</option>
          {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} stars</option>)}
        </Select>}
        {visibleFilters.type && <Select value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))} className="w-[120px]">
          <option value="all">All types</option>
          <option value="text">Text</option>
          <option value="photo">Photo</option>
          <option value="video">Video</option>
          <option value="verified">Verified</option>
        </Select>}
        {visibleFilters.sentiment && <Select value={filters.sentiment} onChange={(e) => setFilters((f) => ({ ...f, sentiment: e.target.value }))} className="w-[128px]">
          <option value="all">All sentiment</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="mixed">Mixed</option>
          <option value="negative">Negative</option>
        </Select>}
        {(activeFilterCount > 0 || activeTab !== "all") && <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => { setFilters(DEFAULT_FILTERS); setVisibleFilters(DEFAULT_VISIBLE_FILTERS); setActiveTab("all"); }}><X className="mr-1 h-3.5 w-3.5" /> Clear</Button>}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => setFilterSheetOpen(true)}>
            <Filter className="mr-1.5 h-3.5 w-3.5" /> Filters
            {activeFilterCount > 0 && <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{activeFilterCount}</span>}
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => setColumnSheetOpen(true)}><SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> Columns</Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => toast.success("Export started")}><Download className="mr-1.5 h-3.5 w-3.5" /> Export</Button>
          <Button size="sm" onClick={() => toast.info("Import reviews — prototype")}><Plus className="mr-1.5 h-3.5 w-3.5" /> Import</Button>
        </div>
      </div>

      {/* Bulk bar */}
      {selected.length > 0 && canWrite && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-xs font-medium">{selected.length} selected</span>
          <Button size="sm" variant="outline" className="h-7" onClick={() => { selected.forEach((r) => updateStatus(r.id, "approved")); toast.success(`Approved ${selected.length} reviews`); setSelected([]); }}><CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve all</Button>
          <Button size="sm" variant="outline" className="h-7 text-destructive" onClick={() => { selected.forEach((r) => updateStatus(r.id, "rejected")); toast.success(`Rejected ${selected.length} reviews`); setSelected([]); }}><XCircle className="mr-1 h-3.5 w-3.5" /> Reject all</Button>
          <Button variant="ghost" size="sm" className="ml-auto h-7 w-7 p-0" onClick={() => setSelected([])}><X className="h-4 w-4" /></Button>
        </div>
      )}

      {/* AG Grid */}
      <div className={cn("ag-theme-quartz relative hidden min-h-[420px] flex-1 lg:block", isDark && "ag-theme-quartz-dark", loading && "opacity-60")}>
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        <AgGridReact theme="legacy" rowData={rows} columnDefs={columnDefs} rowSelection="multiple" suppressRowClickSelection
          onSelectionChanged={(e) => setSelected(e.api.getSelectedRows())}
          onRowDoubleClicked={(e) => e.data && router.push(`/catalog/reviews/${e.data.id}`)}
          defaultColDef={{ resizable: true, sortable: true }} headerHeight={36} rowHeight={44} animateRows />
      </div>
      <p className="shrink-0 text-xs text-muted-foreground">Showing {rows.length} of {reviews.length} reviews · double-click to open</p>

      {/* Filters Sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="w-full max-w-sm">
          <h2 className="pr-8 text-base font-semibold">Filters</h2>
          <p className="mt-1 text-xs text-muted-foreground">Choose which filters appear in the toolbar.</p>
          <div className="mt-4 space-y-3">
            {FILTER_KEYS.map((key) => (
              <label key={key} className="flex cursor-pointer gap-2 text-sm">
                <input type="checkbox" checked={visibleFilters[key]} onChange={(e) => toggleVisibleFilter(key, e.target.checked)} className="mt-0.5 rounded border-input" />
                <span><span className="font-medium">{FILTER_LABELS[key]}</span><span className="mt-0.5 block text-xs text-muted-foreground">{FILTER_HINTS[key]}</span></span>
              </label>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { setVisibleFilters(DEFAULT_VISIBLE_FILTERS); setFilters(DEFAULT_FILTERS); }}>Reset filters</Button>
        </SheetContent>
      </Sheet>

      {/* Columns Sheet */}
      <Sheet open={columnSheetOpen} onOpenChange={setColumnSheetOpen}>
        <SheetContent side="right" className="w-full max-w-xs">
          <h2 className="pr-8 text-base font-semibold">Columns</h2>
          <p className="mt-1 text-xs text-muted-foreground">Product, Customer, Title, and Status always visible.</p>
          <div className="mt-4 space-y-3">
            {COLUMN_KEYS.map((key) => (
              <label key={key} className="flex cursor-pointer gap-2 text-sm">
                <input type="checkbox" checked={visibleColumns[key]} onChange={(e) => setVisibleColumns((v) => ({ ...v, [key]: e.target.checked }))} className="mt-0.5 rounded border-input" />
                <span><span className="font-medium">{COLUMN_LABELS[key]}</span><span className="mt-0.5 block text-xs text-muted-foreground">{COLUMN_HINTS[key]}</span></span>
              </label>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setVisibleColumns(DEFAULT_VISIBLE_COLUMNS)}>Reset columns</Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
