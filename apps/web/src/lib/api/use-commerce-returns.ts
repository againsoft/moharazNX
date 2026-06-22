"use client";

import { useCallback, useEffect, useState } from "react";
import type { OrderReturn, ReturnStatus } from "@/lib/mock-data/order-modules";
import { apiFetch } from "@/lib/api/client";
import {
  apiOrderReturnToOrderReturn,
  buildReturnQuery,
  orderReturnUpdateToApiPayload,
  type ApiOrderReturnListResponse,
  type ApiOrderReturnResponse,
  type ReturnListParams,
  type UpdateOrderReturnInput,
} from "@/lib/api/commerce-returns";

type UseCommerceReturnsState = {
  returns: OrderReturn[];
  total: number;
  totalAmount: number;
  loading: boolean;
  error: string | null;
  refetch: (params?: ReturnListParams) => Promise<void>;
};

export function useCommerceReturns(initialParams?: ReturnListParams): UseCommerceReturnsState {
  const [returns, setReturns] = useState<OrderReturn[]>([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (params?: ReturnListParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildReturnQuery(params ?? initialParams);
      const res = await apiFetch<ApiOrderReturnListResponse>(`/api/v1/commerce/returns${query}`);
      setReturns(res.data.map(apiOrderReturnToOrderReturn));
      setTotal(res.meta.count);
      setTotalAmount(Number(res.meta.total_amount));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load returns";
      setError(message);
      setReturns([]);
      setTotal(0);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { returns, total, totalAmount, loading, error, refetch };
}

export function useCommerceReturn(returnId: string) {
  const [returnRow, setReturnRow] = useState<OrderReturn | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!returnId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiOrderReturnResponse>(`/api/v1/commerce/returns/${returnId}`);
      setReturnRow(apiOrderReturnToOrderReturn(res.data));
      setNotes(res.data.notes);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load return";
      setError(message);
      setReturnRow(null);
      setNotes(null);
    } finally {
      setLoading(false);
    }
  }, [returnId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { returnRow, notes, loading, error, refetch };
}

export async function updateCommerceReturn(id: string, input: UpdateOrderReturnInput): Promise<OrderReturn> {
  const res = await apiFetch<ApiOrderReturnResponse>(`/api/v1/commerce/returns/${id}`, {
    method: "PATCH",
    body: JSON.stringify(orderReturnUpdateToApiPayload(input)),
  });
  return apiOrderReturnToOrderReturn(res.data);
}

export async function updateCommerceReturnStatus(id: string, status: ReturnStatus): Promise<OrderReturn> {
  return updateCommerceReturn(id, { status });
}
