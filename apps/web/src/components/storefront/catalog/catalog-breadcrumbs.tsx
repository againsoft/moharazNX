import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import type { Category } from "@/lib/mock-data/categories";
import { categoryPath, storefrontPaths } from "@/lib/url-slug/storefront-paths";

type CatalogBreadcrumbsProps = {
  crumbs: Category[];
  leafLabel?: string;
};

export function CatalogBreadcrumbs({ crumbs, leafLabel }: CatalogBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      <Link href={storefrontPaths.home} className="inline-flex items-center gap-1 hover:text-foreground">
        <Home className="h-3.5 w-3.5" />
        Home
      </Link>
      <ChevronRight className="h-3 w-3 shrink-0" />
      <Link href={storefrontPaths.products} className="hover:text-foreground">
        Catalog
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.id} className="inline-flex items-center gap-1">
          <ChevronRight className="h-3 w-3 shrink-0" />
          {i === crumbs.length - 1 && !leafLabel ? (
            <span className="font-medium text-foreground">{crumb.name}</span>
          ) : (
            <Link href={categoryPath(crumb.slug)} className="hover:text-foreground">
              {crumb.name}
            </Link>
          )}
        </span>
      ))}
      {leafLabel && (
        <>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="font-medium text-foreground">{leafLabel}</span>
        </>
      )}
    </nav>
  );
}
