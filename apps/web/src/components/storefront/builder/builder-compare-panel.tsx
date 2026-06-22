"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { getPcProductById } from "@/lib/mock-data/pc-builder-products";
import { usePcBuilderStore } from "@/lib/store/pc-builder-store";
import type { PcBuilderStepId } from "@/lib/builder/types";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  stepId: PcBuilderStepId;
  className?: string;
};

const EMPTY_COMPARE: string[] = [];

export function BuilderComparePanel({ stepId, className }: Props) {
  const compareIds = usePcBuilderStore((s) => s.compareByStep[stepId] ?? EMPTY_COMPARE);
  const toggleCompare = usePcBuilderStore((s) => s.toggleCompare);
  const selectProduct = usePcBuilderStore((s) => s.selectProduct);

  if (compareIds.length === 0) return null;

  const products = compareIds.map((id) => getPcProductById(id)).filter(Boolean);

  return (
    <div className={cn("rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/20", className)}>
      <p className="text-xs font-semibold">Compare ({products.length}/3)</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        {products.map((product) => product && (
          <div key={product.id} className="relative rounded-lg border border-input bg-card p-2">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-6 w-6"
              onClick={() => toggleCompare(stepId, product.id)}
            >
              <X className="h-3 w-3" />
            </Button>
            <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-md bg-muted">
              <Image src={product.image} alt="" fill sizes="64px" className="object-cover" />
            </div>
            <p className="mt-1 line-clamp-2 text-center text-[10px] font-medium">{product.name}</p>
            <p className="text-center text-xs font-bold">{formatCurrency(product.price)}</p>
            <ul className="mt-1 space-y-0.5">
              {product.specs.map((s) => (
                <li key={s.label} className="text-[9px] text-muted-foreground">{s.label}: {s.value}</li>
              ))}
            </ul>
            <Button size="sm" className="mt-2 h-7 w-full text-[10px]" onClick={() => selectProduct(stepId, product.id)}>
              Select
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
