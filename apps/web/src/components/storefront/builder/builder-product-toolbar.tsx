"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PcBuilderStepId } from "@/lib/builder/types";
import { PC_BUILDER_STEPS } from "@/lib/builder/types";
import {
  BUILDER_SORT_OPTIONS,
  BUILDER_STEP_FACETS,
  type BuilderSortOption,
} from "@/lib/builder/product-list-utils";

type Props = {
  stepId: PcBuilderStepId;
  total: number;
  quickFilter: string;
  onQuickFilterChange: (value: string) => void;
  sort: BuilderSortOption;
  onSortChange: (sort: BuilderSortOption) => void;
  facetFilters: Record<string, string[]>;
  onFacetFiltersChange: (filters: Record<string, string[]>) => void;
  filterOpen: boolean;
  onFilterOpenChange: (open: boolean) => void;
  activeFilterCount: number;
};

export function BuilderProductToolbar({
  stepId,
  total,
  quickFilter,
  onQuickFilterChange,
  sort,
  onSortChange,
  facetFilters,
  onFacetFiltersChange,
  filterOpen,
  onFilterOpenChange,
  activeFilterCount,
}: Props) {
  const stepLabel = PC_BUILDER_STEPS.find((s) => s.id === stepId)?.label ?? stepId;
  const facets = BUILDER_STEP_FACETS[stepId] ?? [];

  const toggleFacet = (facetId: string, value: string) => {
    const current = facetFilters[facetId] ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFacetFiltersChange({ ...facetFilters, [facetId]: next });
  };

  const resetFilters = () => {
    onQuickFilterChange("");
    onFacetFiltersChange({});
  };

  return (
    <>
      <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-border/60 bg-card p-2 sm:p-2.5">
        <div className="relative min-w-0 flex-1">
          <Input
            value={quickFilter}
            onChange={(e) => onQuickFilterChange(e.target.value)}
            placeholder="Quick Filter"
            className="h-8 pr-8 text-xs"
            aria-label="Quick Filter"
          />
          <Search className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 shrink-0 px-2.5"
          onClick={() => onFilterOpenChange(true)}
        >
          <SlidersHorizontal className="mr-1 h-3.5 w-3.5" />
          <span className="text-xs">Filtering</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 min-w-4 px-1 text-[9px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        <Select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as BuilderSortOption)}
          className="h-8 w-[128px] shrink-0 text-xs sm:w-[148px]"
          aria-label="Sort products"
        >
          {BUILDER_SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <Sheet open={filterOpen} onOpenChange={onFilterOpenChange}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <div className="border-b border-border/60 pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filtering</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onFilterOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="secondary">{stepLabel}</Badge>
              <span className="text-xs text-muted-foreground">{total} results</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-medium">Quick Filter</label>
              <div className="relative">
                <Input
                  value={quickFilter}
                  onChange={(e) => onQuickFilterChange(e.target.value)}
                  placeholder="Quick Filter"
                  className="h-9 pr-9"
                />
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {facets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attribute filters for this step.</p>
            ) : (
              facets.map((facet) => (
                <div key={facet.id} className="mb-5">
                  <p className="mb-2 text-sm font-semibold">{facet.label}</p>
                  <ul className="space-y-2">
                    {facet.options.map((opt) => {
                      const checked = (facetFilters[facet.id] ?? []).includes(opt.value);
                      return (
                        <li key={opt.value}>
                          <label
                            className={cn(
                              "flex cursor-pointer items-center gap-2.5 rounded-md px-1 py-1 text-sm transition-colors hover:bg-muted/50",
                              checked && "text-primary",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleFacet(facet.id, opt.value)}
                              className="h-4 w-4 rounded border-input accent-primary"
                            />
                            {opt.label}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-border/60 pt-4">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              Reset
            </Button>
            <Button size="sm" onClick={() => onFilterOpenChange(false)}>
              Apply
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
