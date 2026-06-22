"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/lib/mock-data/orders";
import { normalizeOrder } from "@/lib/mock-data/orders";
import { apiFetch } from "@/lib/api/client";
import {
  apiOrderToOrder,
  buildOrderQuery,
  orderUpdateToApiPayload,
  type ApiOrderListResponse,
  type ApiOrderResponse,
  type OrderListParams,
  type UpdateOrderInput,
} from "@/lib/api/commerce-orders";

type UseCommerceOrdersState = {
  orders: Order[];
  total: number;
  totalRevenue: number;
  loading: boolean;
  error: string | null;
  refetch: (params?: OrderListParams) => Promise<void>;
};

export function useCommerceOrders(initialParams?: OrderListParams): UseCommerceOrdersState {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (params?: OrderListParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildOrderQuery(params ?? initialParams);
      const res = await apiFetch<ApiOrderListResponse>(`/api/v1/commerce/orders${query}`);
      setOrders(res.data.map((row) => normalizeOrder(apiOrderToOrder(row))));
      setTotal(res.meta.count);
      setTotalRevenue(Number(res.meta.total_revenue));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load orders";
      setError(message);
      setOrders([]);
      setTotal(0);
      setTotalRevenue(0);
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { orders, total, totalRevenue, loading, error, refetch };
}

export function useCommerceOrder(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiOrderResponse>(`/api/v1/commerce/orders/${orderId}`);
      setOrder(normalizeOrder(apiOrderToOrder(res.data)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load order";
      setError(message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { order, loading, error, refetch };
}

export async function updateCommerceOrder(id: string, input: UpdateOrderInput): Promise<Order> {
  const res = await apiFetch<ApiOrderResponse>(`/api/v1/commerce/orders/${id}`, {
    method: "PATCH",
    body: JSON.stringify(orderUpdateToApiPayload(input)),
  });
  return normalizeOrder(apiOrderToOrder(res.data));
}

export async function updateCommerceOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return updateCommerceOrder(id, { status });
}
