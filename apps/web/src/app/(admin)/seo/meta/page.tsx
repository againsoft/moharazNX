"use client";

import { Suspense, useEffect } from "react";
import { RefreshCw, Tag } from "lucide-react";
import { toast } from "sonner";
import { MetaManager } from "@/components/seo/meta-manager";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import { useSeoMeta } from "@/lib/api/use-seo-meta";
import { cn } from "@/lib/utils";

function MetaManagerContent() {
  const { records, total, avgScore, loading, error, refetch } = useSeoMeta();

  useEffect(() => {
    if (error) toast.error(`API: ${error}`, { id: "seo-meta-api" });
  }, [error]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › SEO › Meta Manager</p>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-emerald-600" />
            <h1 className="page-title">
              Meta Manager
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({loading ? "…" : total} · avg {loading ? "…" : Math.round(avgScore)})
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
      <MetaManager records={records} loading={loading} />
    </div>
  );
}

export default function MetaManagerPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <MetaManagerContent />
      </Suspense>
    </div>
  );
}
