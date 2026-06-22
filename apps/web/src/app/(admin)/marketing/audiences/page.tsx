"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";
import { AudiencesList } from "@/components/marketing/audiences-list";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import { useMarketingAudiences } from "@/lib/api/use-marketing-audiences";
import { cn } from "@/lib/utils";

export default function MarketingAudiencesPage() {
  const { audiences, total, totalMembers, loading, error, refetch } = useMarketingAudiences();

  useEffect(() => {
    if (error) toast.error(`API: ${error}`, { id: "marketing-audiences-api" });
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="page-subtitle">
            <Link href="/marketing" className="hover:text-foreground">Marketing</Link>
            {" › Audiences"}
          </p>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-600" />
            <h1 className="page-title">
              Audiences
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({loading ? "…" : total} segments · {loading ? "…" : totalMembers.toLocaleString()} members)
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
        <AudiencesList audiences={audiences} loading={loading} />
      </div>
    </div>
  );
}
