"use client";

import Image from "next/image";
import Link from "next/link";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { productPath, storefrontPaths } from "@/lib/url-slug/storefront-paths";
import { useHomepageDealProducts, usePrimaryFlashSale } from "@/hooks/use-storefront-offers";

export function HomeDealsSection() {
  const products = useHomepageDealProducts(6);
  const flashSale = usePrimaryFlashSale();

  if (products.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-xl bg-gradient-to-br from-[#c2410c] to-[#eb6626] p-4 text-white sm:p-6">
      <div className="max-w-md">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-medium">
          <Timer className="h-3 w-3" />
          {flashSale ? flashSale.name : "Flash deals"}
        </div>
        <h2 className="mt-2 text-lg font-semibold sm:text-xl">
          {flashSale?.description ?? "Limited-time offers on top products"}
        </h2>
        <p className="mt-1.5 text-xs text-white/90">
          Limited-time discounts on laptops, phones & PC parts.
        </p>
        <Button asChild variant="secondary" className="mt-4 bg-white text-red-600 hover:bg-white/90">
          <Link href={storefrontPaths.deals}>Shop deals</Link>
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {products.map((p) => (
            <Link
              key={p.id}
              href={productPath(p.slug)}
              className="flex flex-col overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm transition hover:bg-white/20"
            >
              <div className="relative aspect-square">
                <Image src={p.image} alt={p.name} fill sizes="140px" className="object-cover" />
                {p.compareAtPrice && p.compareAtPrice > p.price && (
                  <span className="absolute right-1 top-1 rounded bg-black/50 px-1 text-[9px] font-bold">
                    -{Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)}%
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <p className="line-clamp-1 text-xs font-medium">{p.name}</p>
                <p className="mt-0.5 text-sm font-bold">{formatCurrency(p.price)}</p>
                {p.compareAtPrice && (
                  <p className="text-[10px] text-white/70 line-through">
                    {formatCurrency(p.compareAtPrice)}
                  </p>
                )}
              </div>
            </Link>
          ))}
      </div>
    </section>
  );
}
