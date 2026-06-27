import Image from "next/image";
import Link from "next/link";
import type { StorefrontBrand } from "@/lib/mock-data/storefront-home";
import { brandPath } from "@/lib/url-slug/storefront-paths";

type BrandsStripProps = {
  brands: StorefrontBrand[];
};

export function BrandsStrip({ brands }: BrandsStripProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {brands.map((brand) => (
        <Link
          key={brand.id}
          href={brandPath(brand.slug)}
          className="group flex h-16 items-center justify-center rounded-xl border border-border/60 bg-card px-4 transition-all hover:border-[#dc2626]/40 hover:shadow-md"
        >
          <Image
            src={brand.logo}
            alt={brand.name}
            width={100}
            height={32}
            className="h-6 w-auto object-contain opacity-50 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
          />
        </Link>
      ))}
    </div>
  );
}
