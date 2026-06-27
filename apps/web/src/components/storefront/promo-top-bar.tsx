"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Phone } from "lucide-react";
import { moharazPromoMessages, moharazStoreConfig } from "@/lib/mock-data/storefront-moharaz";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";

export function PromoTopBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % moharazPromoMessages.length), 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="border-b border-orange-100 bg-orange-50 text-slate-700">
      <div className="sf-container flex h-9 items-center justify-between gap-4 px-3 text-[11px] sm:px-5">
        <div className="hidden shrink-0 items-center gap-4 text-slate-600 sm:flex">
          <a
            href={`tel:${moharazStoreConfig.phone}`}
            className="flex items-center gap-1.5 transition-colors hover:text-[#dc2626]"
          >
            <Phone className="h-3 w-3" />
            {moharazStoreConfig.phone}
          </a>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {moharazStoreConfig.hours}
          </span>
        </div>

        <p
          key={index}
          className="min-w-0 truncate text-center text-slate-800 animate-in fade-in duration-500"
        >
          {moharazPromoMessages[index]}
        </p>

        <div className="hidden shrink-0 items-center gap-3 text-slate-600 sm:flex">
          <Link href={storefrontPaths.account} className="transition-colors hover:text-[#dc2626]">
            Login
          </Link>
          <span className="text-slate-300">|</span>
          <Link
            href={`${storefrontPaths.account}?tab=register`}
            className="transition-colors hover:text-[#dc2626]"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
