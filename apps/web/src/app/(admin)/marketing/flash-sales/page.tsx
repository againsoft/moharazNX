"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FlashSalesList } from "@/components/marketing/flash-sales-list";
import { useFlashSaleStore } from "@/lib/store/flash-sale-store";

export default function FlashSalesPage() {
  const [addTrigger, setAddTrigger] = useState(0);
  const count = useFlashSaleStore((s) => s.sales.length);

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">
            <Link href="/marketing" className="hover:text-foreground">
              Marketing
            </Link>
            {" › Flash Sales"}
          </p>
          <h1 className="page-title">
            Flash Sales
            <span className="ml-2 text-base font-normal text-muted-foreground">({count})</span>
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Schedule time-boxed offers for a single product or many products. Prices sync
            automatically at start and end time — shown on storefront deals and product pages.
          </p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button variant="outline" size="sm" asChild>
            <Link href="/deals" target="_blank">
              View storefront
            </Link>
          </Button>
          <Button size="sm" onClick={() => setAddTrigger((n) => n + 1)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create flash sale
          </Button>
        </div>
      </div>

      <div className="mt-3 min-h-0 flex-1">
        <FlashSalesList addTrigger={addTrigger} />
      </div>

      <Button
        size="sm"
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg sm:hidden"
        onClick={() => setAddTrigger((n) => n + 1)}
        aria-label="Create flash sale"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}
