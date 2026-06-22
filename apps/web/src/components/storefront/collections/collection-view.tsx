"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ProductCard } from "@/components/storefront/product-card";
import { CatalogBreadcrumbs } from "@/components/storefront/catalog/catalog-breadcrumbs";
import { CollectionHero } from "@/components/storefront/collections/collection-hero";
import {
  COLLECTION_CATEGORIES,
  COLLECTION_SORT_OPTIONS,
  parseCollectionSort,
  queryCollection,
  type CollectionSort,
  type CollectionType,
} from "@/lib/mock-data/storefront-collections";
import { cn } from "@/lib/utils";

type CollectionViewProps = {
  type: CollectionType;
};

export function CollectionView({ type }: CollectionViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "all";
  const sort = parseCollectionSort(type, searchParams.get("sort"));
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const result = useMemo(
    () => queryCollection(type, { category, sort, page }),
    [type, category, sort, page, searchParams.toString()],
  );

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value == null || value === "") params.delete(key);
      else params.set(key, value);
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const sortOptions = COLLECTION_SORT_OPTIONS[type];

  return (
    <div className="space-y-6">
      <CatalogBreadcrumbs crumbs={[]} leafLabel={result.config.breadcrumb} />
      <CollectionHero type={type} />

      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{result.total}</span> products
          </p>
          <Select
            value={sort}
            onChange={(e) => pushParams({ sort: e.target.value as CollectionSort, page: "1" })}
            className="h-8 min-w-[140px] text-xs"
            aria-label="Sort products"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {COLLECTION_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => pushParams({ category: cat.slug === "all" ? null : cat.slug, page: "1" })}
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                category === cat.slug
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-card hover:border-primary/40",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {result.products.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 py-12 text-center">
            <p className="text-sm font-medium">No products in this category</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => pushParams({ category: null, page: "1" })}>
              Show all
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {result.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {result.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={result.page <= 1}
              onClick={() => pushParams({ page: String(result.page - 1) })}
            >
              Previous
            </Button>
            <span className="px-2 text-xs text-muted-foreground">
              Page {result.page} of {result.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={result.page >= result.totalPages}
              onClick={() => pushParams({ page: String(result.page + 1) })}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
