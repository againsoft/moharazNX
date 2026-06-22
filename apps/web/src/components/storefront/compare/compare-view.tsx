"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { GitCompare, ShoppingBag, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductRail } from "@/components/storefront/home/product-rail";
import { SectionHeader } from "@/components/storefront/home/section-header";
import {
  buildCompareProductDetail,
  buildCompareRows,
  resolveCompareIds,
} from "@/lib/mock-data/storefront-compare";
import { featuredProducts } from "@/lib/mock-data/storefront-home";
import { useStorefrontCart } from "@/lib/store/storefront-cart-store";
import { productPath, storefrontPaths } from "@/lib/url-slug/storefront-paths";
import {
  MAX_COMPARE_ITEMS,
  useStorefrontCompare,
} from "@/lib/store/storefront-compare-store";
import { cn, formatCurrency } from "@/lib/utils";

export function CompareView() {
  const searchParams = useSearchParams();
  const { items, removeItem, clearCompare, addItem } = useStorefrontCompare();
  const addToCart = useStorefrontCart((s) => s.addItem);
  const [showDiffOnly, setShowDiffOnly] = useState(false);
  const [hydratedFromUrl, setHydratedFromUrl] = useState(false);

  useEffect(() => {
    if (hydratedFromUrl) return;
    const idsParam = searchParams.get("ids");
    if (!idsParam) {
      setHydratedFromUrl(true);
      return;
    }
    const resolved = resolveCompareIds(idsParam.split(",").filter(Boolean));
    for (const item of resolved) {
      addItem(item);
    }
    setHydratedFromUrl(true);
  }, [searchParams, addItem, hydratedFromUrl]);

  const products = useMemo(
    () =>
      items
        .map((item) => buildCompareProductDetail(item))
        .filter((p): p is NonNullable<typeof p> => p != null),
    [items],
  );

  const rows = useMemo(() => buildCompareRows(products), [products]);
  const visibleRows = showDiffOnly ? rows.filter((r) => r.differs) : rows;

  const suggestions = featuredProducts
    .filter((p) => !items.some((i) => i.productId === p.id))
    .slice(0, 8);

  const handleAddToCart = (product: (typeof products)[0]) => {
    addToCart({
      productId: product.productId,
      slug: product.slug,
      name: product.name,
      image: product.image,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      qty: 1,
    });
    toast.success("Added to cart");
  };

  if (items.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Compare products</h1>
        <div className="py-16 text-center">
          <GitCompare className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-xl font-semibold">Nothing to compare yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add up to {MAX_COMPARE_ITEMS} products and compare specs side by side.
          </p>
          <Button asChild className="mt-6">
            <Link href={storefrontPaths.products}>Browse products</Link>
          </Button>
        </div>
        {suggestions.length > 0 && (
          <section className="mt-12">
            <SectionHeader title="Popular picks" href={storefrontPaths.products} />
            <ProductRail products={suggestions} />
          </section>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Compare products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} of {MAX_COMPARE_ITEMS} products selected
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={showDiffOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowDiffOnly((v) => !v)}
          >
            {showDiffOnly ? "Show all specs" : "Show differences only"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => clearCompare()}>
            Clear all
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30">
              <th className="sticky left-0 z-10 min-w-[140px] bg-muted/30 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Product
              </th>
              {products.map((product) => (
                <th key={product.id} className="min-w-[180px] px-4 py-3 align-top">
                  <div className="relative mx-auto max-w-[160px] text-left">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -right-1 -top-1 h-7 w-7 text-muted-foreground"
                      aria-label="Remove from compare"
                      onClick={() => {
                        removeItem(product.productId);
                        toast.success("Removed from compare");
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                    <Link href={productPath(product.slug)} className="block">
                      <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-lg bg-muted">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs font-semibold leading-snug hover:text-primary">
                        {product.name}
                      </p>
                    </Link>
                    <p className="mt-1 text-sm font-bold">{formatCurrency(product.price)}</p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {product.rating.toFixed(1)}
                    </div>
                    <div className="mt-2 flex flex-col gap-1.5">
                      <Button size="sm" className="h-8 w-full text-xs" onClick={() => handleAddToCart(product)}>
                        <ShoppingBag className="mr-1 h-3.5 w-3.5" />
                        Add to cart
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-full text-xs" asChild>
                        <Link href={productPath(product.slug)}>View</Link>
                      </Button>
                    </div>
                  </div>
                </th>
              ))}
              {items.length < MAX_COMPARE_ITEMS && (
                <th className="min-w-[140px] px-4 py-3 align-top">
                  <Link
                    href={storefrontPaths.products}
                    className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-border/80 px-3 text-center text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                  >
                    <GitCompare className="mb-2 h-5 w-5" />
                    Add product
                  </Link>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr
                key={`${row.group ?? "row"}-${row.label}`}
                className={cn(
                  "border-b border-border/60",
                  index % 2 === 0 ? "bg-background" : "bg-muted/10",
                  row.differs && "bg-amber-50/40 dark:bg-amber-950/10",
                )}
              >
                <td className="sticky left-0 z-10 bg-inherit px-4 py-3 font-medium text-muted-foreground">
                  <div>{row.label}</div>
                  {row.group && row.group !== "Overview" && (
                    <div className="text-[10px] font-normal uppercase tracking-wide opacity-70">
                      {row.group}
                    </div>
                  )}
                </td>
                {row.values.map((value, i) => (
                  <td
                    key={`${row.label}-${i}`}
                    className={cn(
                      "px-4 py-3 text-center",
                      row.differs && "font-medium",
                    )}
                  >
                    {value}
                  </td>
                ))}
                {items.length < MAX_COMPARE_ITEMS && <td />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 sm:hidden">
        {products.map((product) => (
          <Button
            key={product.id}
            variant="outline"
            size="sm"
            onClick={() => {
              removeItem(product.productId);
              toast.success("Removed from compare");
            }}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Remove {product.name.slice(0, 18)}
            {product.name.length > 18 ? "…" : ""}
          </Button>
        ))}
      </div>

      {suggestions.length > 0 && items.length < MAX_COMPARE_ITEMS && (
        <section className="mt-12">
          <SectionHeader title="Add more to compare" href={storefrontPaths.products} />
          <ProductRail products={suggestions} />
        </section>
      )}
    </div>
  );
}
