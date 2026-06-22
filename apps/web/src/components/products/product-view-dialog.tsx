"use client";

import { useRouter } from "next/navigation";
import type { Product } from "@/lib/mock-data/products";
import { ProductDetailContent } from "@/components/products/product-detail-content";
import { useCatalogProduct } from "@/lib/api/use-catalog-product";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Load from FastAPI when set */
  productId?: string | null;
  /** Legacy mock product (used when productId omitted) */
  product?: Product | null;
  onEdit?: (product: Product) => void;
};

export function ProductViewDialog({
  open,
  onOpenChange,
  productId,
  product: mockProduct,
  onEdit,
}: Props) {
  const router = useRouter();
  const useApi = Boolean(productId);
  const { product: apiProduct, loading, error } = useCatalogProduct(
    open && useApi ? productId : null,
  );
  const product = useApi ? apiProduct : mockProduct;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl [&>button.absolute]:hidden"
        aria-describedby={undefined}
      >
        <p className="sr-only">Product details{product ? ` · ${product.name}` : ""}</p>
        <div className="flex h-full min-h-0 flex-col px-4 pb-4 pt-3">
          {useApi && loading && (
            <p className="text-sm text-muted-foreground">Loading product from database…</p>
          )}
          {useApi && error && !loading && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          {product && !(useApi && loading) && (
            <ProductDetailContent
              product={product}
              simpleCatalog={useApi}
              inDialog
              onEdit={onEdit}
              onClose={() => onOpenChange(false)}
              onOpenFullPage={
                useApi
                  ? (p) => {
                      onOpenChange(false);
                      router.push(`/catalog/products/${p.id}`);
                    }
                  : undefined
              }
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
