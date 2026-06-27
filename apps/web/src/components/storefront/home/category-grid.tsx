import Image from "next/image";
import Link from "next/link";
import type { StorefrontCategory } from "@/lib/mock-data/storefront-home";
import { categoryPath } from "@/lib/url-slug/storefront-paths";

type CategoryGridProps = {
  categories: StorefrontCategory[];
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-2 scrollbar-thin sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={categoryPath(cat.slug)}
          className="group flex shrink-0 flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm transition-all hover:border-red-200 hover:shadow-md sm:shrink"
          style={{ minWidth: "120px" }}
        >
          <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-gray-50 transition-transform duration-300 group-hover:scale-105 sm:h-24 sm:w-24">
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <span className="text-xs font-bold leading-tight text-gray-800">{cat.name}</span>
        </Link>
      ))}
    </div>
  );
}
