"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCatalogFilterStore } from "@/lib/store/catalog-filter-store";
import { Button } from "@/components/ui/button";
import { CatalogFilterGrid } from "@/components/filters/catalog-filter-grid";

export default function CatalogFiltersPage() {
  const [addTrigger, setAddTrigger] = useState(0);
  const count = useCatalogFilterStore((s) => s.filters.length);

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Ecommerce › Catalog › Filters</p>
          <h1 className="page-title">
            Filters
            <span className="ml-2 text-base font-normal text-muted-foreground">({count})</span>
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Faceted search configuration for storefront — multi-select, range, boolean, and dynamic
            attribute filters. Drag rows to set panel order.
          </p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button variant="outline" size="sm" onClick={() => toast.info("Preview storefront — prototype")}>
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("Export started (mock)")}>
            Export
          </Button>
          <Button size="sm" onClick={() => setAddTrigger((n) => n + 1)}>
            + Add Filter
          </Button>
        </div>
      </div>

      <CatalogFilterGrid className="mt-3 min-h-0 flex-1" addTrigger={addTrigger} />

      <Button
        size="sm"
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg sm:hidden"
        onClick={() => setAddTrigger((n) => n + 1)}
        aria-label="Add filter"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}
