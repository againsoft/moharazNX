"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCollectionStore } from "@/lib/store/collection-store";
import { Button } from "@/components/ui/button";
import { CollectionGrid } from "@/components/collections/collection-grid";

export default function CollectionsPage() {
  const [addTrigger, setAddTrigger] = useState(0);
  const count = useCollectionStore((s) => s.collections.length);

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Ecommerce › Catalog › Collections</p>
          <h1 className="page-title">
            Collections
            <span className="ml-2 text-base font-normal text-muted-foreground">({count})</span>
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Merchandising sets — featured, dynamic rules, or manual product picks. Drag rows to set
            storefront display order.
          </p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button variant="outline" size="sm" onClick={() => toast.info("Import — prototype")}>
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success("Export started (mock)")}>
            Export
          </Button>
          <Button size="sm" onClick={() => setAddTrigger((n) => n + 1)}>
            + Add Collection
          </Button>
        </div>
      </div>

      <CollectionGrid className="mt-3 min-h-0 flex-1" addTrigger={addTrigger} />

      <Button
        size="sm"
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg sm:hidden"
        onClick={() => setAddTrigger((n) => n + 1)}
        aria-label="Add collection"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}
