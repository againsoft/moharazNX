"use client";

import { useEffect, useState } from "react";
import { Flame, Timer } from "lucide-react";
import { usePrimaryFlashSale } from "@/hooks/use-storefront-offers";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function DealsHero() {
  const flashSale = usePrimaryFlashSale();
  const [remaining, setRemaining] = useState<number | null>(null);

  const endTime = flashSale ? new Date(flashSale.endsAt).getTime() : null;

  useEffect(() => {
    if (!endTime) {
      setRemaining(null);
      return;
    }
    const tick = () => setRemaining(Math.max(0, endTime - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  const hours = remaining != null ? Math.floor(remaining / 3600000) : 0;
  const mins = remaining != null ? Math.floor((remaining % 3600000) / 60000) : 0;
  const secs = remaining != null ? Math.floor((remaining % 60000) / 1000) : 0;

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 p-6 text-white sm:p-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <Flame className="h-3.5 w-3.5" />
            {flashSale ? flashSale.name : "Flash sale"}
          </div>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Deals & discounts</h1>
          <p className="mt-2 text-sm text-white/90 sm:text-base">
            {flashSale?.description ??
              "Limited-time price drops from admin Flash Sales — while stocks last."}
          </p>
        </div>

        {endTime && remaining != null && (
          <div className="rounded-2xl bg-black/20 px-5 py-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/80">
              <Timer className="h-4 w-4" />
              Ends in
            </div>
            <div className="mt-2 flex gap-2 font-mono text-2xl font-bold sm:text-3xl">
              <span className="rounded-lg bg-white/15 px-3 py-1">{pad(hours)}</span>
              <span className="py-1">:</span>
              <span className="rounded-lg bg-white/15 px-3 py-1">{pad(mins)}</span>
              <span className="py-1">:</span>
              <span className="rounded-lg bg-white/15 px-3 py-1">{pad(secs)}</span>
            </div>
            <p className="mt-2 text-center text-[11px] text-white/70">Hours · Min · Sec</p>
          </div>
        )}
      </div>
    </section>
  );
}
