"use client";

import { useCallback, useEffect, useState } from "react";
import type { Review, ReviewStatus } from "@/lib/mock-data/reviews";
import { apiFetch } from "@/lib/api/client";
import {
  apiProductReviewToReview,
  buildReviewQuery,
  productReviewUpdateToApiPayload,
  type ApiProductReviewListResponse,
  type ApiProductReviewResponse,
  type ReviewListParams,
  type UpdateProductReviewInput,
} from "@/lib/api/catalog-reviews";

type UseCatalogReviewsState = {
  reviews: Review[];
  total: number;
  pendingCount: number;
  loading: boolean;
  error: string | null;
  refetch: (params?: ReviewListParams) => Promise<void>;
};

export function useCatalogReviews(initialParams?: ReviewListParams): UseCatalogReviewsState {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (params?: ReviewListParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildReviewQuery(params ?? initialParams);
      const res = await apiFetch<ApiProductReviewListResponse>(`/api/v1/catalog/reviews${query}`);
      setReviews(res.data.map(apiProductReviewToReview));
      setTotal(res.meta.count);
      setPendingCount(res.meta.pending_count);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load reviews";
      setError(message);
      setReviews([]);
      setTotal(0);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { reviews, total, pendingCount, loading, error, refetch };
}

export function useCatalogReview(reviewId: string) {
  const [reviewRow, setReviewRow] = useState<Review | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!reviewId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiProductReviewResponse>(`/api/v1/catalog/reviews/${reviewId}`);
      setReviewRow(apiProductReviewToReview(res.data));
      setNotes(res.data.notes);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load review";
      setError(message);
      setReviewRow(null);
      setNotes(null);
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { reviewRow, notes, loading, error, refetch };
}

export async function updateCatalogReview(id: string, input: UpdateProductReviewInput): Promise<Review> {
  const res = await apiFetch<ApiProductReviewResponse>(`/api/v1/catalog/reviews/${id}`, {
    method: "PATCH",
    body: JSON.stringify(productReviewUpdateToApiPayload(input)),
  });
  return apiProductReviewToReview(res.data);
}

export async function updateCatalogReviewStatus(id: string, status: ReviewStatus): Promise<Review> {
  return updateCatalogReview(id, { status });
}
