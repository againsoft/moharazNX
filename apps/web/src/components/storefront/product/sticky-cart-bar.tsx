"use client";

import { ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type StickyCartBarProps = {
  price: number;
  inStock: boolean;
  productName: string;
  onAddToCart?: () => void;
  onBuyNow?: () => void;
};

export function StickyCartBar({
  price,
  inStock,
  productName,
  onAddToCart,
  onBuyNow,
}: StickyCartBarProps) {
  return (
    <div className="fixed bottom-14 left-0 right-0 z-40 border-t border-border/60 bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/90 sm:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">{productName}</p>
          <p className="text-base font-bold">{formatCurrency(price)}</p>
        </div>
        <Button
          variant="outline"
          className="h-9 shrink-0 px-3 text-xs"
          disabled={!inStock || !onAddToCart}
          onClick={onAddToCart}
        >
          <ShoppingBag className="mr-1 h-3.5 w-3.5" />
          Cart
        </Button>
        <Button
          className="h-9 shrink-0 px-3 text-xs"
          disabled={!inStock || !onBuyNow}
          onClick={onBuyNow}
        >
          <Zap className="mr-1 h-3.5 w-3.5" />
          Buy now
        </Button>
      </div>
    </div>
  );
}
