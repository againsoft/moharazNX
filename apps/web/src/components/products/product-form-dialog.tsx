"use client";

import type { Product } from "@/lib/mock-data/products";
import { ProductForm } from "@/components/products/product-form";
import { Sheet, SheetContent } from "@/components/ui/sheet";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  product?: Product | null;
  productName?: string;
  onSaved?: () => void;
};

export function ProductFormDialog({
  open,
  onOpenChange,
  mode = "create",
  product,
  productName,
  onSaved,
}: Props) {
  const initialProduct =
    product ?? (productName ? ({ name: productName } as Product) : undefined);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl [&>button.absolute]:hidden"
        aria-describedby={undefined}
      >
        <p className="sr-only">
          {mode === "create" ? "Add product" : `Edit product${initialProduct?.name ? ` · ${initialProduct.name}` : ""}`}
        </p>
        <div className="flex h-full min-h-0 flex-col px-4 pb-4 pt-3">
          <ProductForm
            mode={mode}
            initialProduct={initialProduct}
            compact
            inDialog
            onClose={() => onOpenChange(false)}
            onSaved={onSaved}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
