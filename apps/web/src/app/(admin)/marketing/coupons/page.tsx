"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Tag } from "lucide-react";
import { toast } from "sonner";
import { CouponsList } from "@/components/marketing/coupons-list";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import { useMarketingCoupons } from "@/lib/api/use-marketing-coupons";
import { cn } from "@/lib/utils";

export default function CouponsPage() {
  const { coupons, total, activeCount, loading, error, refetch } = useMarketingCoupons();

  useEffect(() => {
    if (error) toast.error(`API: ${error}`, { id: "marketing-coupons-api" });
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="page-subtitle">
            <Link href="/marketing" className="hover:text-foreground">Marketing</Link>
            {" › Coupons"}
          </p>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-indigo-600" />
            <h1 className="page-title">
              Coupons
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({loading ? "…" : total} · {activeCount} active)
              </span>
            </h1>
          </div>
          <div className="mt-1.5">
            <ApiConnectionBadge loading={loading} error={error} productCount={total} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>
      <div className="mt-3 min-h-0 flex-1">
        <CouponsList coupons={coupons} loading={loading} />
      </div>
    </div>
  );
}
