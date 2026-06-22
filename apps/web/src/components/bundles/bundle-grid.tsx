"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Archive,
  Eye,
  Filter,
  MoreHorizontal,
  MousePointerClick,
  Pencil,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  BUNDLE_PRICING_LABELS,
  BUNDLE_STATUS_LABELS,
  bundleSavingsPercent,
  formatBdt,
  type BundleStatus,
  type ProductBundle,
} from "@/lib/mock-data/bundles";
import { useBundleStore } from "@/lib/store/bundle-store";
import { cn } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { BundleFormDialog } from "@/components/bundles/bundle-form-dialog";
import { BundleViewDrawer } from "@/components/bundles/bundle-view-drawer";
import { BundleMobileCards } from "@/components/bundles/bundle-mobile-cards";

const PAGE_SIZE = 25;

const COLUMN_KEYS = [
  "sku",
  "slug",
  "components",
  "retail",
  "savings",
  "pricing",
  "stock",
  "status",
  "updated",
] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];

const COLUMN_LABELS: Record<ColumnKey, string> = {
  sku: "SKU",
  slug: "Slug",
  components: "Components",
  retail: "Retail total",
  savings: "Savings",
  pricing: "Pricing",
  stock: "Stock",
  status: "Status",
  updated: "Updated",
};

const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = {
  sku: true,
  slug: false,
  components: true,
  retail: true,
  savings: true,
  pricing: false,
  stock: true,
  status: true,
  updated: true,
};

const LIVE_EDIT_TOGGLES = ["name", "status"] as const;
type LiveEditKey = (typeof LIVE_EDIT_TOGGLES)[number];

const LIVE_EDIT_LABELS: Record<LiveEditKey, string> = {
  name: "Name",
  status: "Status",
};

const LIVE_EDIT_HINTS: Record<LiveEditKey, string> = {
  name: "Double-click cell to edit in grid",
  status: "Click status badge to cycle",
};

const DEFAULT_LIVE_EDIT: Record<LiveEditKey, boolean> = {
  name: true,
  status: true,
};

const FILTER_KEYS = ["search", "status", "pricing"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

const FILTER_LABELS: Record<FilterKey, string> = {
  search: "Search",
  status: "Status",
  pricing: "Pricing mode",
};

const FILTER_HINTS: Record<FilterKey, string> = {
  search: "Name, SKU, slug diye khujun",
  status: "Draft / published / archived",
  pricing: "Fixed or sum − discount",
};

const DEFAULT_VISIBLE_FILTERS: Record<FilterKey, boolean> = {
  search: true,
  status: true,
  pricing: false,
};

type FilterState = {
  search: string;
  status: string;
  pricing: string;
};

const DEFAULT_FILTERS: FilterState = {
  search: "",
  status: "all",
  pricing: "all",
};

const STATUS_CYCLE: BundleStatus[] = ["draft", "published", "archived"];

function applyFilters(rows: ProductBundle[], f: FilterState) {
  const q = f.search.toLowerCase().trim();
  return rows.filter((b) => {
    if (
      q &&
      !b.name.toLowerCase().includes(q) &&
      !b.sku.toLowerCase().includes(q) &&
      !b.slug.toLowerCase().includes(q)
    ) {
      return false;
    }
    if (f.status !== "all" && b.status !== f.status) return false;
    if (f.pricing !== "all" && b.pricingMode !== f.pricing) return false;
    return true;
  });
}

function statusBadgeClass(status: BundleStatus) {
  if (status === "published") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  if (status === "draft") return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  return "bg-muted text-muted-foreground";
}

type Props = {
  className?: string;
  addTrigger?: number;
};

export function BundleGrid({ className, addTrigger = 0 }: Props) {
  const isDark = useIsDark();
  const gridRef = useRef<AgGridReact<ProductBundle>>(null);
  const bundles = useBundleStore((s) => s.bundles);
  const upsertBundle = useBundleStore((s) => s.upsertBundle);
  const patchBundle = useBundleStore((s) => s.patchBundle);
  const deleteBundles = useBundleStore((s) => s.deleteBundles);

  const [toolbarFilters, setToolbarFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editBundle, setEditBundle] = useState<ProductBundle | null>(null);
  const [viewBundle, setViewBundle] = useState<ProductBundle | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<ProductBundle[]>([]);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE);
  const [liveEditSheetOpen, setLiveEditSheetOpen] = useState(false);
  const [liveEdit, setLiveEdit] = useState(DEFAULT_LIVE_EDIT);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [visibleFilters, setVisibleFilters] = useState(DEFAULT_VISIBLE_FILTERS);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState<ProductBundle[]>([]);

  const filtered = useMemo(
    () => applyFilters(bundles, toolbarFilters),
    [bundles, toolbarFilters],
  );

  const openCreate = useCallback(() => {
    setFormMode("create");
    setEditBundle(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((bundle: ProductBundle) => {
    setFormMode("edit");
    setEditBundle(bundle);
    setFormOpen(true);
    setViewOpen(false);
  }, []);

  const openView = useCallback((bundle: ProductBundle) => {
    setViewBundle(bundle);
    setViewOpen(true);
  }, []);

  useEffect(() => {
    if (addTrigger > 0) openCreate();
  }, [addTrigger, openCreate]);

  const cycleStatus = useCallback(
    (bundle: ProductBundle) => {
      const idx = STATUS_CYCLE.indexOf(bundle.status);
      const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
      patchBundle(bundle.id, { status: next });
    },
    [patchBundle],
  );

  const archiveBundle = useCallback(
    (bundle: ProductBundle) => {
      patchBundle(bundle.id, { status: "archived" });
      toast.success(`Archived ${bundle.name}`);
    },
    [patchBundle],
  );

  const bulkUpdateStatus = useCallback(
    (targets: ProductBundle[], status: BundleStatus, label: string) => {
      targets.forEach((t) => patchBundle(t.id, { status }));
      toast.success(`${label} (${targets.length})`);
      setSelected([]);
    },
    [patchBundle],
  );

  const openDeleteConfirm = useCallback((targets: ProductBundle[]) => {
    setDeleteTargets(targets);
    setDeleteOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    deleteBundles(deleteTargets.map((t) => t.id));
    toast.success(`Deleted ${deleteTargets.length} bundle${deleteTargets.length > 1 ? "s" : ""}`);
    setDeleteOpen(false);
    setDeleteTargets([]);
    setSelected([]);
  }, [deleteTargets, deleteBundles]);

  const onCellValueChanged = useCallback(
    (e: { data: ProductBundle; colDef: { field?: string } }) => {
      const field = e.colDef.field;
      if (!field || !e.data?.id) return;
      patchBundle(e.data.id, {
        [field]: e.data[field as keyof ProductBundle],
      } as Partial<ProductBundle>);
      toast.success(`Updated ${field}`);
    },
    [patchBundle],
  );

  const StatusCell = useCallback(
    ({ data }: ICellRendererParams<ProductBundle>) => {
      if (!data) return null;
      const label = BUNDLE_STATUS_LABELS[data.status];
      if (!liveEdit.status) {
        return (
          <span className={cn("text-[10px]", statusBadgeClass(data.status))}>{label}</span>
        );
      }
      return (
        <button
          type="button"
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
            statusBadgeClass(data.status),
          )}
          onClick={(e) => {
            e.stopPropagation();
            cycleStatus(data);
          }}
        >
          {label}
        </button>
      );
    },
    [liveEdit.status, cycleStatus],
  );

  const ImageCell = useCallback(
    ({ data }: ICellRendererParams<ProductBundle>) => {
      if (!data) return null;
      return (
        <button
          type="button"
          className="flex h-full w-full items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            openView(data);
          }}
        >
          {data.thumbnail ? (
            <img src={data.thumbnail} alt="" className="h-8 w-8 rounded object-cover" />
          ) : (
            <span className="h-8 w-8 rounded bg-muted" />
          )}
        </button>
      );
    },
    [openView],
  );

  const handleSave = (data: Partial<ProductBundle>) => {
    if (formMode === "create") {
      upsertBundle(data);
    } else if (editBundle) {
      upsertBundle({ id: editBundle.id, ...data });
    }
  };

  const RowActions = useCallback(
    ({ data }: ICellRendererParams<ProductBundle>) => {
      if (!data) return null;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openView(data)}>
              <Eye className="mr-2 h-3.5 w-3.5" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEdit(data)}>
              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            {data.status !== "archived" && (
              <DropdownMenuItem onClick={() => archiveBundle(data)} className="text-destructive">
                <Archive className="mr-2 h-3.5 w-3.5" /> Archive
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    [openView, openEdit, archiveBundle],
  );

  const columnDefs = useMemo<ColDef<ProductBundle>[]>(
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
      },
      {
        colId: "image",
        headerName: "",
        width: 44,
        maxWidth: 44,
        pinned: "left",
        resizable: false,
        suppressMovable: true,
        sortable: false,
        suppressHeaderMenuButton: true,
        cellRenderer: ImageCell,
      },
      {
        field: "name",
        headerName: "Name",
        width: 200,
        minWidth: 140,
        editable: liveEdit.name,
        tooltipField: "name",
        cellClass: "font-semibold text-foreground",
      },
      {
        field: "sku",
        headerName: "SKU",
        width: 120,
        hide: !visibleCols.sku,
        cellClass: "font-mono text-xs",
        tooltipField: "sku",
      },
      {
        field: "slug",
        headerName: "Slug",
        width: 160,
        hide: !visibleCols.slug,
        tooltipField: "slug",
        cellClass: "text-xs text-muted-foreground",
      },
      {
        colId: "components",
        field: "componentsSummary",
        headerName: "Components",
        width: 200,
        hide: !visibleCols.components,
        tooltipField: "componentsSummary",
        cellClass: "text-xs text-muted-foreground",
      },
      {
        colId: "retail",
        field: "retailTotal",
        headerName: "Retail",
        width: 100,
        hide: !visibleCols.retail,
        valueFormatter: (p) => formatBdt(Number(p.value ?? 0)),
      },
      {
        field: "bundlePrice",
        headerName: "Bundle price",
        width: 110,
        valueFormatter: (p) => formatBdt(Number(p.value ?? 0)),
        cellClass: "font-medium",
      },
      {
        colId: "savings",
        headerName: "Savings",
        width: 80,
        hide: !visibleCols.savings,
        valueGetter: (p) => (p.data ? bundleSavingsPercent(p.data) : 0),
        valueFormatter: (p) => `${p.value}%`,
        cellClass: "text-emerald-600 text-xs",
      },
      {
        colId: "pricing",
        field: "pricingMode",
        headerName: "Pricing",
        width: 120,
        hide: !visibleCols.pricing,
        valueFormatter: (p) =>
          p.value ? BUNDLE_PRICING_LABELS[p.value as keyof typeof BUNDLE_PRICING_LABELS] : "—",
      },
      {
        field: "stock",
        headerName: "Stock",
        width: 72,
        hide: !visibleCols.stock,
        cellClass: (p) => (p.data?.stock === 0 ? "text-destructive" : ""),
      },
      {
        colId: "status",
        field: "status",
        headerName: "Status",
        width: 96,
        hide: !visibleCols.status,
        cellRenderer: StatusCell,
        suppressHeaderMenuButton: true,
      },
      {
        colId: "updated",
        field: "updatedAt",
        headerName: "Updated",
        width: 100,
        hide: !visibleCols.updated,
      },
      {
        headerName: "Action",
        headerClass: "ag-header-cell-text",
        width: 56,
        pinned: "right",
        resizable: false,
        suppressMovable: true,
        cellRenderer: RowActions,
        sortable: false,
        suppressHeaderMenuButton: true,
      },
    ],
    [RowActions, visibleCols, liveEdit, StatusCell, ImageCell],
  );

  const pageStart = page * PAGE_SIZE + 1;
  const pageEnd = Math.min((page + 1) * PAGE_SIZE, filtered.length);

  const toggleVisibleFilter = (key: FilterKey, enabled: boolean) => {
    setVisibleFilters((v) => ({ ...v, [key]: enabled }));
    if (!enabled) {
      setToolbarFilters((f) => ({
        ...f,
        ...(key === "search" ? { search: "" } : {}),
        ...(key === "status" ? { status: "all" } : {}),
        ...(key === "pricing" ? { pricing: "all" } : {}),
      }));
    }
  };

  return (
    <div className={cn("flex min-h-0 flex-col gap-3", className)}>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {visibleFilters.search && (
          <Input
            placeholder="Search name, SKU, slug…"
            value={toolbarFilters.search}
            onChange={(e) => setToolbarFilters((f) => ({ ...f, search: e.target.value }))}
            className="max-w-[240px]"
          />
        )}
        {visibleFilters.status && (
          <Select
            value={toolbarFilters.status}
            onChange={(e) => setToolbarFilters((f) => ({ ...f, status: e.target.value }))}
            className="w-[140px]"
          >
            <option value="all">All status</option>
            {STATUS_CYCLE.map((s) => (
              <option key={s} value={s}>
                {BUNDLE_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        )}
        {visibleFilters.pricing && (
          <Select
            value={toolbarFilters.pricing}
            onChange={(e) => setToolbarFilters((f) => ({ ...f, pricing: e.target.value }))}
            className="w-[160px]"
          >
            <option value="all">All pricing</option>
            <option value="fixed">Fixed price</option>
            <option value="sum_discount">Sum − discount</option>
          </Select>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {selected.length > 0 && (
            <>
              <span className="text-xs text-muted-foreground">{selected.length} selected</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkUpdateStatus(selected, "published", "Published")}
              >
                Publish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => bulkUpdateStatus(selected, "archived", "Archived")}
              >
                Archive
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => openDeleteConfirm(selected)}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => setFilterSheetOpen(true)}>
            <Filter className="mr-1.5 h-3.5 w-3.5" /> Filters
          </Button>
          <Button variant="outline" size="sm" onClick={() => setColumnSheetOpen(true)}>
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> Columns
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLiveEditSheetOpen(true)}>
            <MousePointerClick className="mr-1.5 h-3.5 w-3.5" /> Live Edit
          </Button>
        </div>
      </div>

      <div className="hidden min-h-0 flex-1 lg:block">
        <div
          className={cn(
            "ag-theme-quartz h-full min-h-[320px] rounded-lg border border-input",
            isDark && "ag-theme-quartz-dark",
          )}
        >
          <AgGridReact<ProductBundle>
            theme="legacy"
            ref={gridRef}
            rowData={filtered}
            columnDefs={columnDefs}
            defaultColDef={{
              sortable: true,
              resizable: true,
              filter: false,
              suppressHeaderMenuButton: true,
            }}
            rowSelection="multiple"
            suppressRowClickSelection
            animateRows
            onCellValueChanged={onCellValueChanged}
            onSelectionChanged={() => {
              const rows: ProductBundle[] = [];
              gridRef.current?.api.forEachNodeAfterFilterAndSort((node) => {
                if (node.isSelected() && node.data) rows.push(node.data);
              });
              setSelected(rows);
            }}
            pagination
            paginationPageSize={PAGE_SIZE}
            onPaginationChanged={() => {
              const api = gridRef.current?.api;
              if (api) setPage(api.paginationGetCurrentPage());
            }}
            getRowId={(p) => p.data.id}
          />
        </div>
        {filtered.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Showing {pageStart}–{pageEnd} of {filtered.length} · Click image to view components
          </p>
        )}
      </div>

      <div className="lg:hidden">
        <BundleMobileCards
          bundles={filtered}
          onView={openView}
          onEdit={openEdit}
          onArchive={archiveBundle}
        />
      </div>

      <BundleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        bundle={editBundle}
        onSave={handleSave}
      />

      <BundleViewDrawer
        open={viewOpen}
        onOpenChange={setViewOpen}
        bundle={viewBundle}
        onEdit={openEdit}
      />

      <Sheet open={columnSheetOpen} onOpenChange={setColumnSheetOpen}>
        <SheetContent side="right" className="w-[min(320px,100vw)]">
          <h2 className="text-sm font-semibold">Columns</h2>
          <div className="mt-4 space-y-3">
            {COLUMN_KEYS.map((key) => (
              <label key={key} className="flex items-center justify-between gap-2 text-sm">
                {COLUMN_LABELS[key]}
                <input
                  type="checkbox"
                  checked={visibleCols[key]}
                  onChange={(e) => setVisibleCols((v) => ({ ...v, [key]: e.target.checked }))}
                  className="h-4 w-4 rounded border-input"
                />
              </label>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={liveEditSheetOpen} onOpenChange={setLiveEditSheetOpen}>
        <SheetContent side="right" className="w-[min(320px,100vw)]">
          <h2 className="text-sm font-semibold">Live Edit</h2>
          <div className="mt-4 space-y-4">
            {LIVE_EDIT_TOGGLES.map((key) => (
              <div key={key}>
                <label className="flex items-center justify-between gap-2 text-sm font-medium">
                  {LIVE_EDIT_LABELS[key]}
                  <input
                    type="checkbox"
                    checked={liveEdit[key]}
                    onChange={(e) => setLiveEdit((v) => ({ ...v, [key]: e.target.checked }))}
                    className="h-4 w-4 rounded border-input"
                  />
                </label>
                <p className="mt-0.5 text-xs text-muted-foreground">{LIVE_EDIT_HINTS[key]}</p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="w-[min(320px,100vw)]">
          <h2 className="text-sm font-semibold">Filters</h2>
          <div className="mt-4 space-y-4">
            {FILTER_KEYS.map((key) => (
              <div key={key}>
                <label className="flex items-center justify-between gap-2 text-sm font-medium">
                  {FILTER_LABELS[key]}
                  <input
                    type="checkbox"
                    checked={visibleFilters[key]}
                    onChange={(e) => toggleVisibleFilter(key, e.target.checked)}
                    className="h-4 w-4 rounded border-input"
                  />
                </label>
                <p className="mt-0.5 text-xs text-muted-foreground">{FILTER_HINTS[key]}</p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(400px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-input bg-background p-5 shadow-xl">
            <Dialog.Title className="text-base font-semibold">Delete bundles?</Dialog.Title>
            <p className="mt-2 text-sm text-muted-foreground">
              {deleteTargets.length} bundle{deleteTargets.length > 1 ? "s" : ""} will be removed.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" className="absolute right-3 top-3 h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
