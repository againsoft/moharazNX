"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Home } from "lucide-react";
import { CatalogView } from "@/components/storefront/catalog/catalog-view";
import { LiveSearch } from "@/components/storefront/search/live-search";

function SearchPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";

  return (
    <div>
      <nav className="mb-4 flex items-center gap-1 text-[11px] text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
          <Home className="h-3 w-3" />
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Search</span>
      </nav>

      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {q ? `Results for “${q}”` : "Search products"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {q
            ? "Refine your search or browse matching products below."
            : "Find products, brands, and categories across our store."}
        </p>
        <div className="mt-4 max-w-xl">
          <LiveSearch variant="page" defaultQuery={q} autoFocus={!q} />
        </div>
      </header>

      {q ? (
        <CatalogView variant="search" />
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
          <p className="text-sm font-medium">Start typing to search</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try &ldquo;wireless earbuds&rdquo; or &ldquo;UrbanWear&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

export function SearchView() {
  return (
    <Suspense fallback={<div className="py-12 text-sm text-muted-foreground">Loading search…</div>}>
      <SearchPageContent />
    </Suspense>
  );
}
