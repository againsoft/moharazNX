"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DealsHero } from "@/components/storefront/deals/deals-hero";
import { DealSpotlight } from "@/components/storefront/deals/deal-spotlight";
import { DealProductCard } from "@/components/storefront/deals/deal-product-card";
import { CatalogBreadcrumbs } from "@/components/storefront/catalog/catalog-breadcrumbs";
import { useAdminDealProducts } from "@/hooks/use-storefront-offers";
import {
  DEAL_CATEGORIES,
  DEAL_SORT_OPTIONS,
  DEAL_TIERS,
  parseDealSort,
  parseDealTier,
  type DealSort,
  type DealTier,
} from "@/lib/mock-data/storefront-deals";
import { products } from "@/lib/mock-data/products";
import { cn } from "@/lib/utils";

export function DealsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tier = parseDealTier(searchParams.get("tier"));
  const category = searchParams.get("category") ?? "all";
  const sort = parseDealSort(searchParams.get("sort"));
  const page = Number(searchParams.get("page") ?? "1") || 1;

  const allDeals = useAdminDealProducts();

  const result = useMemo(() => {
    const tierMin = DEAL_TIERS.find((t) => t.value === tier)?.minPercent ?? 0;
    let items = allDeals.filter((p) => p.discountPercent >= tierMin);

    if (category !== "all") {
      const cat = DEAL_CATEGORIES.find((c) => c.slug === category);
      if (cat?.name) {
        items = items.filter((p) => {
          const product = products.find((x) => x.id === p.id);
          return product?.category === cat.name;
        });
      }
    }

    switch (sort) {
      case "price_asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        items.sort((a, b) => {
          const pa = products.find((x) => x.id === a.id);
          const pb = products.find((x) => x.id === b.id);
          return (pb?.updatedAt ?? "").localeCompare(pa?.updatedAt ?? "");
        });
        break;
      default:
        items.sort((a, b) => b.discountPercent - a.discountPercent);
    }

    const perPage = 12;
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * perPage;

    return {
      products: items.slice(start, start + perPage),
      total,
      page: safePage,
      totalPages,
      spotlight: allDeals.slice(0, 3),
    };
  }, [allDeals, tier, category, sort, page]);

  const pushParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value == null || value === "") params.delete(key);
      else params.set(key, value);
    });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-10">
      <CatalogBreadcrumbs crumbs={[]} leafLabel="Deals" />
      <DealsHero />

      <DealSpotlight products={result.spotlight} />

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">All deals</h2>
            <p className="text-sm text-muted-foreground">{result.total} products on sale</p>
          </div>
          <Select
            value={sort}
            onChange={(e) => pushParams({ sort: e.target.value as DealSort, page: "1" })}
            className="h-8 min-w-[160px] text-xs"
            aria-label="Sort deals"
          >
            {DEAL_SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {DEAL_TIERS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => pushParams({ tier: t.value === "all" ? null : t.value, page: "1" })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                tier === t.value
                  ? "border-red-500 bg-red-500 text-white"
                  : "border-border/60 bg-card hover:border-red-300",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {DEAL_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() => pushParams({ category: cat.slug === "all" ? null : cat.slug, page: "1" })}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
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
          <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
            <p className="text-sm font-medium">No deals match these filters</p>
            <p className="mt-1 text-xs text-muted-foreground">Try a different category or discount tier.</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => pushParams({ tier: null, category: null, page: "1" })}
            >
              Show all deals
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {result.products.map((product) => (
              <DealProductCard key={product.id} product={product} />
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
      </section>
    </div>
  );
}
