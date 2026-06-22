"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  CATALOG_BRANDS,
  CATALOG_PRICE_BOUNDS,
  type CatalogFilters,
} from "@/lib/mock-data/storefront-catalog";

type CatalogFiltersPanelProps = {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  onClear: () => void;
  className?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toFilterPrice(value: number, bound: number, isMax: boolean) {
  if (isMax ? value >= bound : value <= bound) return undefined;
  return value;
}

type PriceRangeFilterProps = {
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
};

function PriceRangeFilter({ filters, onChange }: PriceRangeFilterProps) {
  const { min: boundMin, max: boundMax, step } = CATALOG_PRICE_BOUNDS;
  const [activeThumb, setActiveThumb] = useState<"min" | "max" | null>(null);

  const rangeMin = filters.priceMin ?? boundMin;
  const rangeMax = filters.priceMax ?? boundMax;

  const span = boundMax - boundMin || 1;
  const minPercent = ((rangeMin - boundMin) / span) * 100;
  const maxPercent = ((rangeMax - boundMin) / span) * 100;

  const applyRange = (nextMin: number, nextMax: number) => {
    const low = clamp(Math.min(nextMin, nextMax), boundMin, boundMax);
    const high = clamp(Math.max(nextMin, nextMax), boundMin, boundMax);
    onChange({
      ...filters,
      priceMin: toFilterPrice(low, boundMin, false),
      priceMax: toFilterPrice(high, boundMax, true),
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Price range
      </h3>

      <div className="relative h-6 px-1">
        <div className="absolute left-1 right-1 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-muted">
          <div
            className="absolute h-full rounded-full bg-primary/70"
            style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
          />
        </div>
        <input
          type="range"
          min={boundMin}
          max={rangeMax}
          step={step}
          value={rangeMin}
          aria-label="Minimum price"
          onPointerDown={() => setActiveThumb("min")}
          onPointerUp={() => setActiveThumb(null)}
          onPointerCancel={() => setActiveThumb(null)}
          onChange={(e) => applyRange(Number(e.target.value), rangeMax)}
          className={cn(
            "catalog-price-range-thumb catalog-price-range-min absolute inset-x-1 top-1/2 w-[calc(100%-0.5rem)] -translate-y-1/2 appearance-none bg-transparent",
            activeThumb === "min" ? "z-30" : "z-10",
          )}
        />
        <input
          type="range"
          min={rangeMin}
          max={boundMax}
          step={step}
          value={rangeMax}
          aria-label="Maximum price"
          onPointerDown={() => setActiveThumb("max")}
          onPointerUp={() => setActiveThumb(null)}
          onPointerCancel={() => setActiveThumb(null)}
          onChange={(e) => applyRange(rangeMin, Number(e.target.value))}
          className={cn(
            "catalog-price-range-thumb catalog-price-range-max absolute inset-x-1 top-1/2 w-[calc(100%-0.5rem)] -translate-y-1/2 appearance-none bg-transparent",
            activeThumb === "max" ? "z-30" : "z-20",
          )}
        />
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={boundMin}
          max={rangeMax}
          step={step}
          placeholder={`${boundMin}`}
          value={filters.priceMin ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (!raw) {
              onChange({ ...filters, priceMin: undefined });
              return;
            }
            applyRange(Number(raw), rangeMax);
          }}
          className="h-8 text-xs"
        />
        <span className="text-muted-foreground">–</span>
        <Input
          type="number"
          min={rangeMin}
          max={boundMax}
          step={step}
          placeholder={`${boundMax}`}
          value={filters.priceMax ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (!raw) {
              onChange({ ...filters, priceMax: undefined });
              return;
            }
            applyRange(rangeMin, Number(raw));
          }}
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
}

export function CatalogFiltersPanel({ filters, onChange, onClear, className }: CatalogFiltersPanelProps) {
  const toggleBrand = (brand: string) => {
    const brands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onChange({ ...filters, brands });
  };

  return (
    <aside className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onClear}>
          Clear all
        </Button>
      </div>

      <PriceRangeFilter filters={filters} onChange={onChange} />

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Brand</h3>
        <ul className="max-h-48 space-y-2 overflow-y-auto">
          {CATALOG_BRANDS.map((brand) => (
            <li key={brand}>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => toggleBrand(brand)}
                  className="h-3.5 w-3.5 rounded border-input accent-primary"
                />
                {brand}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Availability</h3>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
            className="h-3.5 w-3.5 rounded border-input accent-primary"
          />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.onSaleOnly}
            onChange={(e) => onChange({ ...filters, onSaleOnly: e.target.checked })}
            className="h-3.5 w-3.5 rounded border-input accent-primary"
          />
          On sale
        </label>
      </div>
    </aside>
  );
}

function countActiveFilters(filters: CatalogFilters) {
  let n = 0;
  if (filters.brands.length) n += filters.brands.length;
  if (filters.priceMin != null || filters.priceMax != null) n += 1;
  if (filters.inStockOnly) n += 1;
  if (filters.onSaleOnly) n += 1;
  return n;
}

export { countActiveFilters };
