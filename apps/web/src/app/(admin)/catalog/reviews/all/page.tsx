"use client";

import { useCallback, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ReviewGrid } from "@/components/reviews/review-grid";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import {
  updateCatalogReviewStatus,
  useCatalogReviews,
} from "@/lib/api/use-catalog-reviews";
import type { ReviewStatus } from "@/lib/mock-data/reviews";
import { cn } from "@/lib/utils";

export default function AllReviewsPage() {
  const { reviews, total, loading, error, refetch } = useCatalogReviews();

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "catalog-reviews-list-api" });
    }
  }, [error]);

  const handleStatusChange = useCallback(
    async (id: string, nextStatus: ReviewStatus) => {
      try {
        await updateCatalogReviewStatus(id, nextStatus);
        await refetch();
        toast.success("Review status updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Status update failed");
      }
    },
    [refetch],
  );

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 mb-1 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Catalog › Reviews</p>
          <h1 className="page-title">All Reviews</h1>
          <div className="mt-1.5">
            <ApiConnectionBadge loading={loading} error={error} productCount={total} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>
      <ReviewGrid
        className="min-h-0 flex-1"
        reviews={reviews}
        loading={loading}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
