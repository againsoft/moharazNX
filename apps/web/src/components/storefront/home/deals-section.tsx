import Image from "next/image";
import Link from "next/link";
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { StorefrontProduct } from "@/lib/mock-data/storefront-home";
import { productPath, storefrontPaths } from "@/lib/url-slug/storefront-paths";

type DealsSectionProps = {
  products: StorefrontProduct[];
};

export function DealsSection({ products }: DealsSectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 p-5 text-white sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <Timer className="h-3.5 w-3.5" />
            Flash deals · Ends tonight
          </div>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Up to 40% off select items</h2>
          <p className="mt-2 text-sm text-white/90">Limited-time offers on top-rated products. While stocks last.</p>
          <Button asChild variant="secondary" className="mt-4 bg-white text-red-600 hover:bg-white/90">
            <Link href={storefrontPaths.deals}>Shop deals</Link>
          </Button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 lg:max-w-xl">
          {products.map((p) => (
            <Link
              key={p.id}
              href={productPath(p.slug)}
              className="flex min-w-[140px] shrink-0 flex-col overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm transition hover:bg-white/20"
            >
              <div className="relative aspect-square">
                <Image src={p.image} alt={p.name} fill sizes="140px" className="object-cover" />
              </div>
              <div className="p-2.5">
                <p className="line-clamp-1 text-xs font-medium">{p.name}</p>
                <p className="mt-0.5 text-sm font-bold">{formatCurrency(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
