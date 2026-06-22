"use client";

import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { moharazPromoMessages } from "@/lib/mock-data/storefront-moharaz";

export function PromoTopBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % moharazPromoMessages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="border-b border-orange-600/20 bg-[#eb6626] text-white">
      <div className="sf-container flex h-8 items-center justify-center gap-2 px-3 text-[11px] font-medium sm:px-5 sm:text-xs">
        <Truck className="hidden h-3.5 w-3.5 shrink-0 sm:block" aria-hidden />
        <p key={index} className="truncate text-center animate-in fade-in duration-500">
          {moharazPromoMessages[index]}
        </p>
      </div>
    </div>
  );
}
