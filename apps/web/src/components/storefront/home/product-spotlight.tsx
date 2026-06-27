"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp, Flame } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { productPath } from "@/lib/url-slug/storefront-paths";
import { moharazFeaturedProducts } from "@/lib/mock-data/storefront-moharaz";

export function ProductSpotlight() {
  const products = moharazFeaturedProducts;
  const [leftIdx, setLeftIdx] = useState(0);
  const [rightIdx, setRightIdx] = useState(1);

  const left = products[leftIdx % products.length];
  const right = products[rightIdx % products.length];

  if (!left || !right) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="grid grid-cols-2">
        {/* Left product */}
        <Link
          href={productPath(left.slug)}
          className="group flex flex-col items-center gap-3 p-6 transition-colors hover:bg-gray-50/60"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{left.brand}</p>
          <p className="text-center text-base font-extrabold leading-tight text-gray-900 sm:text-lg">
            {left.name.length > 24 ? left.name.slice(0, 24) + "…" : left.name}
          </p>
          <p className="text-xs text-gray-400">{formatCurrency(left.price)}</p>
          <div className="relative h-28 w-28 sm:h-40 sm:w-40">
            <Image
              src={left.image}
              alt={left.name}
              fill
              sizes="160px"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dc2626] text-[10px] font-bold text-white shadow">
            Buy
          </span>
        </Link>

        {/* Right product */}
        <Link
          href={productPath(right.slug)}
          className="group flex flex-col items-center gap-3 border-l border-gray-100 p-6 transition-colors hover:bg-gray-50/60"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{right.brand}</p>
          <p className="text-center text-base font-extrabold leading-tight text-gray-900 sm:text-lg">
            {right.name.length > 24 ? right.name.slice(0, 24) + "…" : right.name}
          </p>
          <p className="text-xs text-gray-400">{formatCurrency(right.price)}</p>
          <div className="relative h-28 w-28 sm:h-40 sm:w-40">
            <Image
              src={right.image}
              alt={right.name}
              fill
              sizes="160px"
              className="object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dc2626] text-[10px] font-bold text-white shadow">
            Buy
          </span>
        </Link>
      </div>

      {/* Center fire icon with up/down controls */}
      <div className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous left"
          onClick={() => setLeftIdx((i) => i - 1 + products.length)}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-red-50"
        >
          <ChevronUp className="h-3 w-3 text-gray-500" />
        </button>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dc2626] shadow-lg ring-4 ring-white">
          <Flame className="h-5 w-5 text-white" />
        </div>
        <button
          type="button"
          aria-label="Next right"
          onClick={() => setRightIdx((i) => i + 1)}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-red-50"
        >
          <ChevronDown className="h-3 w-3 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
