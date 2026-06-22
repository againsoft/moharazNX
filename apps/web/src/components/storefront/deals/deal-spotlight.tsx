import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import type { DealProduct } from "@/lib/mock-data/storefront-deals";
import { productPath } from "@/lib/url-slug/storefront-paths";

type DealSpotlightProps = {
  products: DealProduct[];
};

export function DealSpotlight({ products }: DealSpotlightProps) {
  if (products.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">Top deals right now</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {products.map((p, i) => (
          <Link
            key={p.id}
            href={productPath(p.slug)}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition hover:shadow-lg"
          >
            {i === 0 && (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                Best deal
              </span>
            )}
            <div className="relative aspect-[4/3] bg-muted">
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute right-3 top-3 rounded-lg bg-red-500 px-2 py-1 text-sm font-bold text-white">
                -{p.discountPercent}%
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <p className="text-[11px] font-medium uppercase text-muted-foreground">{p.brand}</p>
              <p className="mt-0.5 line-clamp-2 font-semibold group-hover:text-primary">{p.name}</p>
              <div className="mt-auto flex items-baseline gap-2 pt-3">
                <span className="text-xl font-bold">{formatCurrency(p.price)}</span>
                {p.compareAtPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCurrency(p.compareAtPrice)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs font-medium text-emerald-600">
                You save {formatCurrency(p.savings)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
