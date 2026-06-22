"use client";

import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/mock-data/categories";
import { resolveMediaUrl } from "@/lib/media/resolve-media";
import { categoryPath } from "@/lib/url-slug/storefront-paths";
import { cn } from "@/lib/utils";

type SubcategoryChipsProps = {
  subcategories: Category[];
  activeSlug?: string;
  className?: string;
};

export function SubcategoryChips({ subcategories, activeSlug, className }: SubcategoryChipsProps) {
  if (subcategories.length === 0) return null;

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-1 scrollbar-thin", className)}>
      {subcategories.map((cat) => {
        const active = activeSlug === cat.slug;
        const iconUrl = resolveMediaUrl(cat.iconMediaId, cat.iconUrl);
        return (
          <Link
            key={cat.id}
            href={categoryPath(cat.slug)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/60 bg-card hover:border-primary/40",
            )}
          >
            {iconUrl && (
              <span className="relative h-5 w-5 overflow-hidden rounded-full">
                <Image src={iconUrl} alt="" fill sizes="20px" className="object-cover" />
              </span>
            )}
            {cat.caption || cat.name}
          </Link>
        );
      })}
    </div>
  );
}
