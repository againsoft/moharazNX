"use client";

import { use, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { ReviewDetailWorkspace } from "@/components/reviews/review-detail-workspace";
import {
  updateCatalogReviewStatus,
  useCatalogReview,
} from "@/lib/api/use-catalog-reviews";
import type { ReviewStatus } from "@/lib/mock-data/reviews";

type Props = { params: Promise<{ id: string }> };

export default function ReviewDetailPage({ params }: Props) {
  const { id } = use(params);
  const { reviewRow, notes, loading, error, refetch } = useCatalogReview(id);

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "catalog-review-detail-api" });
    }
  }, [error]);

  const handleStatusChange = useCallback(
    async (reviewId: string, nextStatus: ReviewStatus) => {
      try {
        await updateCatalogReviewStatus(reviewId, nextStatus);
        await refetch();
        toast.success("Review status updated");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Status update failed");
      }
    },
    [refetch],
  );

  return (
    <div>
      <p className="page-subtitle">MoharazNX › Catalog › Reviews</p>
      <ReviewDetailWorkspace
        reviewId={id}
        review={reviewRow}
        adminNotes={notes}
        loading={loading}
        error={error}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
