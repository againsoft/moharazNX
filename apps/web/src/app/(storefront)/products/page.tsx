import { Suspense } from "react";
import { CatalogView } from "@/components/storefront/catalog/catalog-view";

export default function ProductsCatalogPage() {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <CatalogView />
    </Suspense>
  );
}

function CatalogSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 w-48 rounded bg-muted" />
      <div className="h-10 w-64 rounded bg-muted" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
