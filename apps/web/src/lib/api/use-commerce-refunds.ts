"use client";

import { useCallback, useEffect, useState } from "react";
import type { OrderRefund, RefundStatus } from "@/lib/mock-data/order-modules";
import { apiFetch } from "@/lib/api/client";
import {
  apiOrderRefundToOrderRefund,
  buildRefundQuery,
  orderRefundUpdateToApiPayload,
  type ApiOrderRefundListResponse,
  type ApiOrderRefundResponse,
  type RefundListParams,
  type UpdateOrderRefundInput,
} from "@/lib/api/commerce-refunds";

type UseCommerceRefundsState = {
  refunds: OrderRefund[];
  total: number;
  totalAmount: number;
  loading: boolean;
  error: string | null;
  refetch: (params?: RefundListParams) => Promise<void>;
};

export function useCommerceRefunds(initialParams?: RefundListParams): UseCommerceRefundsState {
  const [refunds, setRefunds] = useState<OrderRefund[]>([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (params?: RefundListParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildRefundQuery(params ?? initialParams);
      const res = await apiFetch<ApiOrderRefundListResponse>(`/api/v1/commerce/refunds${query}`);
      setRefunds(res.data.map(apiOrderRefundToOrderRefund));
      setTotal(res.meta.count);
      setTotalAmount(Number(res.meta.total_amount));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load refunds";
      setError(message);
      setRefunds([]);
      setTotal(0);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { refunds, total, totalAmount, loading, error, refetch };
}

export function useCommerceRefund(refundId: string) {
  const [refundRow, setRefundRow] = useState<OrderRefund | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!refundId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiOrderRefundResponse>(`/api/v1/commerce/refunds/${refundId}`);
      setRefundRow(apiOrderRefundToOrderRefund(res.data));
      setNotes(res.data.notes);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load refund";
      setError(message);
      setRefundRow(null);
      setNotes(null);
    } finally {
      setLoading(false);
    }
  }, [refundId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { refundRow, notes, loading, error, refetch };
}

export async function updateCommerceRefund(id: string, input: UpdateOrderRefundInput): Promise<OrderRefund> {
  const res = await apiFetch<ApiOrderRefundResponse>(`/api/v1/commerce/refunds/${id}`, {
    method: "PATCH",
    body: JSON.stringify(orderRefundUpdateToApiPayload(input)),
  });
  return apiOrderRefundToOrderRefund(res.data);
}

export async function updateCommerceRefundStatus(id: string, status: RefundStatus): Promise<OrderRefund> {
  return updateCommerceRefund(id, { status });
}
