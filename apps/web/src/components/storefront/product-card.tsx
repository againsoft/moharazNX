import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/storefront/wishlist/wishlist-button";
import { CompareButton } from "@/components/storefront/compare/compare-button";
import { compareInputFromStorefrontProduct } from "@/lib/mock-data/storefront-compare";
import { productPath } from "@/lib/url-slug/storefront-paths";
import { cn, formatCurrency } from "@/lib/utils";
import type { StorefrontProduct } from "@/lib/mock-data/storefront-home";

const badgeLabels: Record<NonNullable<StorefrontProduct["badge"]>, string> = {
  new: "New",
  sale: "Sale",
  bestseller: "Best seller",
  "ai-pick": "AI pick",
};

type ProductCardProps = {
  product: StorefrontProduct;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const offerLabel = product.offerLabels?.[0];

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card transition-shadow hover:shadow-sm",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={productPath(product.slug)} className="relative block h-full w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 45vw, 220px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product.badge && (
            <Badge
              variant="secondary"
              className={cn(
                "absolute left-2 top-2 text-[10px] shadow-sm",
                product.badge === "ai-pick" && "border-transparent bg-violet-600 text-white",
                product.badge === "sale" && "border-transparent bg-red-500 text-white",
              )}
            >
              {badgeLabels[product.badge]}
            </Badge>
          )}
          {discount && (
            <span className="absolute right-2 top-2 rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              -{discount}%
            </span>
          )}
        </Link>
        {offerLabel && (
          <Badge
            variant="secondary"
            title={offerLabel.text}
            className="absolute bottom-10 left-2 max-w-[calc(100%-3rem)] truncate text-[9px] shadow-sm border-transparent bg-violet-600 text-white"
          >
            {offerLabel.text}
          </Badge>
        )}
        <div className="absolute bottom-2 left-2 z-10">
          <CompareButton product={compareInputFromStorefrontProduct(product)} />
        </div>
        <div className="absolute bottom-2 right-2 z-10">
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
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{product.brand}</p>
        <Link href={productPath(product.slug)} className="line-clamp-2 text-xs font-medium leading-snug hover:text-primary">
          {product.name}
        </Link>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
          <span>({product.reviewCount})</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-sm font-semibold">{formatCurrency(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-[11px] text-muted-foreground line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100"
        >
          Add to cart
        </Button>
      </div>
    </article>
  );
}
