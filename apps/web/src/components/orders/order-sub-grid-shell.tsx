"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { Download, Filter, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { OrdersNav } from "@/components/orders/orders-nav";

type FilterDef = {
  key: string;
  label: string;
  hint: string;
  defaultVisible: boolean;
};

type ColumnDef = {
  key: string;
  label: string;
  hint: string;
  defaultVisible: boolean;
};

type Props<T> = {
  title?: string;
  className?: string;
  rowData: T[];
  columnDefs: ColDef<T>[];
  filterDefs: FilterDef[];
  columnDefs_meta: ColumnDef[];
  defaultFilters: Record<string, string>;
  filterFn: (row: T, filters: Record<string, string>) => boolean;
  filterWidgets: (filters: Record<string, string>, setFilters: (f: Record<string, string>) => void, visible: Record<string, boolean>) => ReactNode;
  onExport?: () => void;
  createLabel?: string;
  onCreate?: () => void;
  onRowClicked?: (row: T) => void;
  loading?: boolean;
};

export function OrderSubGridShell<T>({
  className,
  rowData,
  columnDefs,
  filterDefs,
  columnDefs_meta,
  defaultFilters,
  filterFn,
  filterWidgets,
  onExport,
  createLabel,
  onCreate,
  onRowClicked,
  loading = false,
}: Props<T>) {
  const isDark = useIsDark();
  const [filters, setFilters] = useState(defaultFilters);
  const [visibleFilters, setVisibleFilters] = useState(
    Object.fromEntries(filterDefs.map((f) => [f.key, f.defaultVisible])),
  );
  const [visibleColumns, setVisibleColumns] = useState(
    Object.fromEntries(columnDefs_meta.map((c) => [c.key, c.defaultVisible])),
  );
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  const rows = useMemo(
    () => rowData.filter((r) => filterFn(r, filters)),
    [rowData, filters, filterFn],
  );

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => v !== "all" && v !== "" && defaultFilters[k] !== undefined,
  ).length;

  const toggleVisibleFilter = (key: string, enabled: boolean) => {
    setVisibleFilters((v) => ({ ...v, [key]: enabled }));
    if (!enabled) setFilters((f) => ({ ...f, [key]: defaultFilters[key] ?? "all" }));
  };

  const resetAll = () => {
    setFilters(defaultFilters);
    setVisibleFilters(Object.fromEntries(filterDefs.map((f) => [f.key, f.defaultVisible])));
  };

  const finalColumnDefs = useMemo(() => {
    return columnDefs.map((col) => {
      const colId = col.colId ?? col.field;
      if (colId && colId in visibleColumns) {
        return { ...col, hide: !visibleColumns[colId as string] };
      }
      return col;
    });
  }, [columnDefs, visibleColumns]);

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}>
      <OrdersNav />

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {filterWidgets(filters, setFilters, visibleFilters)}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={resetAll}>
            <X className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
        )}
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => setFilterSheetOpen(true)}>
            <Filter className="mr-1.5 h-3.5 w-3.5" /> Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">{activeFilterCount}</span>
            )}
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => setColumnSheetOpen(true)}>
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> Columns
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => (onExport ? onExport() : toast.success("Export started"))}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Export
          </Button>
          {createLabel && onCreate && (
            <Button size="sm" onClick={onCreate}>{createLabel}</Button>
          )}
        </div>
      </div>

      <div className={cn("ag-theme-quartz hidden min-h-[420px] flex-1 lg:block", isDark && "ag-theme-quartz-dark")}>
        <AgGridReact
          theme="legacy"
          rowData={rows}
          columnDefs={finalColumnDefs}
          defaultColDef={{ resizable: true, sortable: true }}
          headerHeight={36}
          rowHeight={44}
          animateRows
          loading={loading}
          onRowClicked={(e) => e.data && onRowClicked?.(e.data)}
        />
      </div>
      <p className="shrink-0 text-xs text-muted-foreground">Showing {rows.length} of {rowData.length} records</p>

      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="w-full max-w-sm">
          <h2 className="pr-8 text-base font-semibold">Filters</h2>
          <p className="mt-1 text-xs text-muted-foreground">Choose which filters appear in the toolbar.</p>
          <div className="mt-4 space-y-3">
            {filterDefs.map((f) => (
              <label key={f.key} className="flex cursor-pointer gap-2 text-sm">
                <input type="checkbox" checked={visibleFilters[f.key]} onChange={(e) => toggleVisibleFilter(f.key, e.target.checked)} className="mt-0.5 rounded border-input" />
                <span><span className="font-medium">{f.label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{f.hint}</span></span>
              </label>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={resetAll}>Reset filters</Button>
        </SheetContent>
      </Sheet>

      <Sheet open={columnSheetOpen} onOpenChange={setColumnSheetOpen}>
        <SheetContent side="right" className="w-full max-w-xs">
          <h2 className="pr-8 text-base font-semibold">Columns</h2>
          <div className="mt-4 space-y-3">
            {columnDefs_meta.map((c) => (
              <label key={c.key} className="flex cursor-pointer gap-2 text-sm">
                <input type="checkbox" checked={visibleColumns[c.key]} onChange={(e) => setVisibleColumns((v) => ({ ...v, [c.key]: e.target.checked }))} className="mt-0.5 rounded border-input" />
                <span><span className="font-medium">{c.label}</span><span className="mt-0.5 block text-xs text-muted-foreground">{c.hint}</span></span>
              </label>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
