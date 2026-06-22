"use client";

import Image from "next/image";
import { Check, GitCompare, Package } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { PcBuilderProduct } from "@/lib/builder/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  product: PcBuilderProduct;
  selected: boolean;
  allowMultiple?: boolean;
  inCompare: boolean;
  onSelect: () => void;
  onToggleCompare: () => void;
  disabled?: boolean;
};

function stockVariant(status: PcBuilderProduct["stockStatus"]) {
  if (status === "In Stock") return "success" as const;
  if (status === "Low Stock") return "warning" as const;
  return "outline" as const;
}

export function BuilderProductCard({
  product,
  selected,
  allowMultiple,
  inCompare,
  onSelect,
  onToggleCompare,
  disabled,
}: Props) {
  const outOfStock = product.stockStatus === "Out of Stock";

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all",
        selected ? "border-indigo-500 ring-2 ring-indigo-500/30" : "border-border/60 hover:border-border hover:shadow-sm",
        disabled && "opacity-60",
      )}
    >
      {selected && (
        <div className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
          <Check className="h-3.5 w-3.5" />
        </div>
      )}

      <div className="relative aspect-[4/3] bg-muted">
        <Image src={product.image} alt={product.name} fill sizes="(max-width:640px) 50vw, 200px" className="object-cover" />
        <Badge variant={stockVariant(product.stockStatus)} className="absolute left-2 top-2 text-[9px]">
          {product.stockStatus}
        </Badge>
        {product.stock > 0 && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-background/90 px-1.5 py-0.5 text-[9px] text-muted-foreground backdrop-blur">
            <Package className="h-2.5 w-2.5" />
            {product.stock} in stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="text-[10px] text-muted-foreground">{product.brand}</p>
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{product.name}</h3>

        <ul className="mt-2 space-y-0.5">
          {product.specs.slice(0, 2).map((spec) => (
            <li key={spec.label} className="text-[10px] text-muted-foreground">
              {spec.label}: <span className="text-foreground">{spec.value}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            <p className="text-base font-bold">{formatCurrency(product.price)}</p>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="text-[10px] text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant={inCompare ? "default" : "outline"}
              size="sm"
              className="h-7 px-2"
              onClick={(e) => { e.stopPropagation(); onToggleCompare(); }}
              title="Compare"
            >
              <GitCompare className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-7 text-xs"
              disabled={outOfStock || disabled}
              onClick={onSelect}
            >
              {allowMultiple ? (selected ? "Add again" : "Add") : selected ? "Selected" : "Select"}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
