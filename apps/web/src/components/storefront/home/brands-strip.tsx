import Image from "next/image";
import Link from "next/link";
import type { StorefrontBrand } from "@/lib/mock-data/storefront-home";
import { brandPath } from "@/lib/url-slug/storefront-paths";

type BrandsStripProps = {
  brands: StorefrontBrand[];
};

export function BrandsStrip({ brands }: BrandsStripProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {brands.map((brand) => (
        <Link
          key={brand.id}
          href={brandPath(brand.slug)}
          className="flex h-16 items-center justify-center rounded-xl border border-border/60 bg-card px-4 transition hover:border-primary/30 hover:shadow-sm"
        >
          <Image
            src={brand.logo}
            alt={brand.name}
            width={100}
            height={32}
            className="h-6 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
          />
        </Link>
      ))}
    </div>
  );
}
