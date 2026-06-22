"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/storefront/product-card";
import { CatalogBreadcrumbs } from "@/components/storefront/catalog/catalog-breadcrumbs";
import { CatalogFiltersPanel, countActiveFilters } from "@/components/storefront/catalog/catalog-filters-panel";
import { CatalogToolbar, type CatalogViewMode } from "@/components/storefront/catalog/catalog-toolbar";
import { ProductListRow } from "@/components/storefront/catalog/product-list-row";
import { SubcategoryChips } from "@/components/storefront/catalog/subcategory-chips";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { resolveMediaUrl } from "@/lib/media/resolve-media";
import { getCategoryBreadcrumbs } from "@/lib/mock-data/categories";
import {
  DEFAULT_FILTERS,
  getCatalogContext,
  parseFiltersFromParams,
  parseSortFromParams,
  queryCatalog,
  queryCatalogFromSource,
  type CatalogFilters,
  type CatalogSort,
} from "@/lib/mock-data/storefront-catalog";
import { useStorefrontProducts } from "@/lib/api/use-storefront-products";

type CatalogViewProps = {
  categorySlug?: string;
  brandSlug?: string;
  variant?: "catalog" | "search";
};

export function CatalogView({ categorySlug, brandSlug, variant = "catalog" }: CatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [view, setView] = useState<CatalogViewMode>("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = searchParams.get("q") ?? undefined;
  const sort = parseSortFromParams(searchParams);
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const filters = parseFiltersFromParams(searchParams);

  // If a brandSlug is provided, pre-inject it into filters
  const effectiveFilters = brandSlug
    ? { ...filters, brands: filters.brands.length ? filters.brands : [brandSlug] }
    : filters;

  const context = getCatalogContext(categorySlug);
  const breadcrumbs = categorySlug ? getCategoryBreadcrumbs(categorySlug) : [];
  const { products: apiProducts, total: apiTotal, loading: apiLoading, error: apiError } =
    useStorefrontProducts();

  const mockResult = useMemo(
    () => queryCatalog({ categorySlug, q, sort, page, filters: effectiveFilters }),
    [categorySlug, brandSlug, q, sort, page, searchParams.toString()],
  );

  const result = useMemo(() => {
    if (apiProducts.length > 0) {
      return queryCatalogFromSource(apiProducts, {
        categorySlug,
        q,
        sort,
        page,
        filters: effectiveFilters,
      });
    }
    return mockResult;
  }, [apiProducts, categorySlug, q, sort, page, effectiveFilters, mockResult]);

  const usingApi = apiProducts.length > 0;

  const activeFilterCount = countActiveFilters(filters);

  const pushParams = useCallback(
    (updates: Record<string, string | string[] | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        params.delete(key);
        if (value == null || value === "") return;
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      });
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const applyFilters = (next: CatalogFilters) => {
    pushParams({
      brand: next.brands.length ? next.brands : null,
      price_min: next.priceMin?.toString(),
      price_max: next.priceMax?.toString(),
      in_stock: next.inStockOnly ? "1" : null,
      on_sale: next.onSaleOnly ? "1" : null,
      page: "1",
    });
    setFiltersOpen(false);
  };

  const clearFilters = () => applyFilters(DEFAULT_FILTERS);

  const onSortChange = (next: CatalogSort) => pushParams({ sort: next, page: "1" });

  const isSearch = variant === "search";
  const categoryBannerUrl = context.category
    ? resolveMediaUrl(context.category.bannerMediaId, context.category.bannerUrl)
    : undefined;

  return (
    <div>
      {!isSearch && (
        <CatalogBreadcrumbs crumbs={breadcrumbs} leafLabel={!categorySlug ? "All products" : undefined} />
      )}

      {!isSearch && categoryBannerUrl && (
        <div className="relative mb-6 aspect-[3/1] overflow-hidden rounded-2xl bg-muted sm:aspect-[4/1]">
          <Image
            src={categoryBannerUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5 sm:p-8">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{context.title}</h1>
            {context.description && (
              <p className="mt-1 max-w-xl text-sm text-white/85">{context.description}</p>
            )}
          </div>
        </div>
      )}

      {!isSearch && !categoryBannerUrl && (
        <header className="mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{context.title}</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{context.description}</p>
            </div>
            {usingApi && (
              <ApiConnectionBadge loading={apiLoading} error={apiError} productCount={apiTotal} />
            )}
          </div>
        </header>
      )}

      {!isSearch && context.subcategories.length > 0 && (
        <SubcategoryChips
          subcategories={context.subcategories}
          activeSlug={categorySlug}
          className="mb-6"
        />
      )}

      <div className="flex gap-8">
        <div className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20 rounded-xl border border-border/60 bg-card p-4">
            <CatalogFiltersPanel filters={filters} onChange={applyFilters} onClear={clearFilters} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <CatalogToolbar
            total={result.total}
            sort={sort}
            view={view}
            onSortChange={onSortChange}
            onViewChange={setView}
            onOpenFilters={() => setFiltersOpen(true)}
            activeFilterCount={activeFilterCount}
          />

          {result.products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
              <p className="text-sm font-medium">
                {isSearch ? "No products match your search" : "No products match your filters"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isSearch ? "Try different keywords or check spelling." : "Try adjusting filters or browse all products."}
              </p>
              {!isSearch && (
                <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {result.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {result.products.map((product) => (
                <ProductListRow key={product.id} product={product} />
              ))}
            </div>
          )}

          {result.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
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

          {!isSearch && context.category?.description && categoryBannerUrl && (
            <div className="prose prose-sm mt-12 max-w-none rounded-xl border border-border/60 bg-muted/30 p-5 text-muted-foreground">
              <h2 className="text-base font-semibold text-foreground">About {context.category.name}</h2>
              <p className="mt-2 text-sm">{context.category.description}</p>
            </div>
          )}
        </div>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="left" className="w-[300px] overflow-y-auto">
          <h2 className="mb-4 text-lg font-semibold">Filters</h2>
          <CatalogFiltersPanel filters={filters} onChange={applyFilters} onClear={clearFilters} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
