"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PromotionsList } from "@/components/marketing/promotions-list";
import { usePromotionStore } from "@/lib/store/promotion-store";

export default function PromotionsPage() {
  const [addTrigger, setAddTrigger] = useState(0);
  const count = usePromotionStore((s) => s.promotions.length);

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">
            <Link href="/marketing" className="hover:text-foreground">
              Marketing
            </Link>
            {" › Promotions"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Tag className="h-5 w-5 text-indigo-600" />
            <h1 className="page-title">
              Promotions
              <span className="ml-2 text-base font-normal text-muted-foreground">({count})</span>
            </h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Rule-based auto discounts — cart subtotal, product in cart, customer group, and category
            conditions. Evaluated at checkout without a coupon code.
          </p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button variant="outline" size="sm" asChild>
            <Link href="/marketing/special-offers">Special Offers</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/marketing/flash-sales">Flash Sales</Link>
          </Button>
          <Button size="sm" onClick={() => setAddTrigger((n) => n + 1)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create promotion
          </Button>
        </div>
      </div>

      <div className="mt-3 min-h-0 flex-1">
        <PromotionsList addTrigger={addTrigger} />
      </div>

      <Button
        size="sm"
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg sm:hidden"
        onClick={() => setAddTrigger((n) => n + 1)}
        aria-label="Create promotion"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}
