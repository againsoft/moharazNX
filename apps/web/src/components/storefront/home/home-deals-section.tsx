"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";
import { ProductCard } from "@/components/storefront/product-card";
import {
  moharazBestSellers,
  moharazFeaturedProducts,
  moharazNewArrivals,
  getMoharazHomepageDeals,
} from "@/lib/mock-data/storefront-moharaz";

const TABS = [
  { id: "featured", label: "Featured", products: moharazFeaturedProducts },
  { id: "bestsellers", label: "Best Sellers", products: moharazBestSellers },
  { id: "new", label: "New Arrivals", products: moharazNewArrivals },
  { id: "deals", label: "On Sale 🔥", products: getMoharazHomepageDeals(6) },
] as const;

export function HomeDealsSection() {
  const [active, setActive] = useState<string>("featured");
  const tab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <section>
      {/* Header — centered like Monarch IT */}
      <div className="mb-5 text-center">
        <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">Most Wanted</h2>
        <p className="mt-1 text-sm text-gray-500">Explore Our Best-Selling Deals</p>

        {/* Tabs row with arrows */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            aria-label="Previous tab"
            onClick={() => {
              const idx = TABS.findIndex((t) => t.id === active);
              setActive(TABS[(idx - 1 + TABS.length) % TABS.length].id);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:border-red-300 hover:bg-red-50"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-180 text-gray-500" />
          </button>

          <div className="flex gap-1.5 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors",
                  active === t.id
                    ? "border-[#dc2626] bg-[#dc2626] text-white"
                    : "border-gray-200 bg-white text-gray-500 hover:border-[#dc2626]/40 hover:text-gray-900",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-label="Next tab"
            onClick={() => {
              const idx = TABS.findIndex((t) => t.id === active);
              setActive(TABS[(idx + 1) % TABS.length].id);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:border-red-300 hover:bg-red-50"
          >
            <ArrowRight className="h-3.5 w-3.5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {tab.products.slice(0, 6).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
