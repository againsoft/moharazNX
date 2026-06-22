import { ProductCard } from "@/components/storefront/product-card";
import type { StorefrontProduct } from "@/lib/mock-data/storefront-home";
import { cn } from "@/lib/utils";

type ProductRailProps = {
  products: StorefrontProduct[];
  className?: string;
  /** Desktop columns — home uses 6 per row */
  columns?: 4 | 6;
};

const GRID_BY_COLUMNS: Record<4 | 6, string> = {
  4: "sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 2xl:grid-cols-5",
  6: "sm:grid sm:grid-cols-2 sm:gap-2 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7",
};

export function ProductRail({ products, className, columns = 4 }: ProductRailProps) {
  return (
    <div
      className={cn(
        "-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-thin sm:mx-0",
        GRID_BY_COLUMNS[columns],
        className,
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          className={cn("min-w-[140px] shrink-0 sm:min-w-0", columns === 6 && "xl:min-w-0")}
        />
      ))}
    </div>
  );
}
