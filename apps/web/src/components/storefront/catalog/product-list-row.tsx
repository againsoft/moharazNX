import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/storefront/wishlist/wishlist-button";
import { CompareButton } from "@/components/storefront/compare/compare-button";
import { formatCurrency } from "@/lib/utils";
import type { CatalogProductWithMeta } from "@/lib/mock-data/storefront-catalog";
import { compareInputFromStorefrontProduct } from "@/lib/mock-data/storefront-compare";
import { productPath } from "@/lib/url-slug/storefront-paths";

type ProductListRowProps = {
  product: CatalogProductWithMeta;
};

export function ProductListRow({ product }: ProductListRowProps) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <article className="group flex gap-4 rounded-xl border border-border/60 bg-card p-3 transition-shadow hover:shadow-sm sm:gap-5 sm:p-4">
      <Link href={productPath(product.slug)} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-28">
        <Image src={product.image} alt={product.name} fill sizes="112px" className="object-cover" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{product.brand}</p>
            {product.badge && (
              <Badge variant="secondary" className="text-[10px]">
                {product.badge === "ai-pick" ? "AI pick" : product.badge.replace("_", " ")}
              </Badge>
            )}
            {discount && (
              <span className="text-[10px] font-semibold text-red-500">-{discount}%</span>
            )}
          </div>
          <Link href={productPath(product.slug)} className="mt-0.5 block text-sm font-semibold hover:text-primary sm:text-base">
            {product.name}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">{product.category}</p>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
            <span>({product.reviewCount})</span>
            <span className="mx-1">·</span>
            <span className={product.stock > 0 ? "text-emerald-600" : "text-red-500"}>
              {product.stock > 0 ? "In stock" : "Out of stock"}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 sm:mt-0 sm:flex-col sm:items-end">
          <div className="text-right">
            <p className="text-lg font-bold">{formatCurrency(product.price)}</p>
            {product.compareAtPrice && (
              <p className="text-xs text-muted-foreground line-through">{formatCurrency(product.compareAtPrice)}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <CompareButton
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.image,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                brand: product.brand,
                category: product.category,
                stock: product.stock,
                rating: product.rating,
                reviewCount: product.reviewCount,
              }}
            />
            <WishlistButton
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: product.image,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                brand: product.brand,
              }}
            />
            <Button variant="outline" size="sm" className="shrink-0">
              Add to cart
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
