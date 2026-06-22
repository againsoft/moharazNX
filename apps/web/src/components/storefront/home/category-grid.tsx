import Image from "next/image";
import Link from "next/link";
import type { StorefrontCategory } from "@/lib/mock-data/storefront-home";
import { categoryPath } from "@/lib/url-slug/storefront-paths";

type CategoryGridProps = {
  categories: StorefrontCategory[];
};

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={categoryPath(cat.slug)}
          className="group flex flex-col items-center gap-1.5 rounded-lg border border-border/60 bg-card p-2.5 text-center transition-colors hover:border-primary/30 hover:bg-accent/50"
        >
          <div className="relative h-14 w-14 overflow-hidden rounded-full bg-muted sm:h-16 sm:w-16">
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              sizes="80px"
              className="object-cover transition-transform group-hover:scale-110"
            />
          </div>
          <span className="text-xs font-medium leading-tight">{cat.name}</span>
          <span className="text-[10px] text-muted-foreground">{cat.productCount} items</span>
        </Link>
      ))}
    </div>
  );
}
