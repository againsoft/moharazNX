"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CATALOG_SORT_OPTIONS, type CatalogSort } from "@/lib/mock-data/storefront-catalog";

export type CatalogViewMode = "grid" | "list";

type CatalogToolbarProps = {
  total: number;
  sort: CatalogSort;
  view: CatalogViewMode;
  onSortChange: (sort: CatalogSort) => void;
  onViewChange: (view: CatalogViewMode) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
};

export function CatalogToolbar({
  total,
  sort,
  view,
  onSortChange,
  onViewChange,
  onOpenFilters,
  activeFilterCount,
}: CatalogToolbarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-3 py-2.5 sm:px-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{total}</span> products
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={onOpenFilters}
        >
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <Select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as CatalogSort)}
          className="h-8 min-w-[160px] text-xs"
          aria-label="Sort products"
        >
          {CATALOG_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <div className="hidden items-center rounded-md border border-input p-0.5 sm:flex">
          {(["grid", "list"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewChange(mode)}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                view === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
