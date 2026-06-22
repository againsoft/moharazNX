import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { DealProduct } from "@/lib/mock-data/storefront-deals";
import { productPath } from "@/lib/url-slug/storefront-paths";

type DealProductCardProps = {
  product: DealProduct;
  className?: string;
};

export function DealProductCard({ product, className }: DealProductCardProps) {
  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-red-200/40 bg-card transition-shadow hover:shadow-md dark:border-red-900/30",
        className,
      )}
    >
      <Link href={productPath(product.slug)} className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 45vw, 220px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
          -{product.discountPercent}%
        </span>
        {product.flashSaleName && (
          <span className="absolute bottom-2 left-2 right-2 truncate rounded bg-black/60 px-2 py-0.5 text-center text-[10px] text-white">
            {product.flashSaleName}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{product.brand}</p>
        <Link
          href={productPath(product.slug)}
          className="line-clamp-2 text-sm font-medium leading-snug hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
        </div>
        <div className="mt-auto space-y-0.5 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
          <p className="text-[11px] font-medium text-emerald-600">Save {formatCurrency(product.savings)}</p>
        </div>
        <Button variant="outline" size="sm" className="mt-2 w-full border-red-200 hover:bg-red-50 dark:border-red-900/40">
          Grab deal
        </Button>
      </div>
    </article>
  );
}
