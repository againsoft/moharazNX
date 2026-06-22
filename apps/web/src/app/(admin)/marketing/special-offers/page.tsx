"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpecialOffersList } from "@/components/marketing/special-offers-list";
import { useSpecialOfferStore } from "@/lib/store/special-offer-store";

export default function SpecialOffersPage() {
  const [addTrigger, setAddTrigger] = useState(0);
  const count = useSpecialOfferStore((s) => s.offers.length);

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">
            <Link href="/marketing" className="hover:text-foreground">
              Marketing
            </Link>
            {" › Special Offers"}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Gift className="h-5 w-5 text-violet-600" />
            <h1 className="page-title">
              Special Offers
              <span className="ml-2 text-base font-normal text-muted-foreground">({count})</span>
            </h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            BOGO, product bundles, gift-with-purchase, and tiered quantity discounts — evaluated by
            the cart engine at checkout. Not the same as Flash Sales (scheduled price sync).
          </p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button variant="outline" size="sm" asChild>
            <Link href="/marketing/flash-sales">Flash Sales</Link>
          </Button>
          <Button size="sm" onClick={() => setAddTrigger((n) => n + 1)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create offer
          </Button>
        </div>
      </div>

      <div className="mt-3 min-h-0 flex-1">
        <SpecialOffersList addTrigger={addTrigger} />
      </div>

      <Button
        size="sm"
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg sm:hidden"
        onClick={() => setAddTrigger((n) => n + 1)}
        aria-label="Create special offer"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}
