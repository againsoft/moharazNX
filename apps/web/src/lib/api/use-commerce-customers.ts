"use client";

import { useCallback, useEffect, useState } from "react";
import type { Customer, CustomerStatus } from "@/lib/mock-data/customers";
import { apiFetch } from "@/lib/api/client";
import {
  apiCustomerToCustomer,
  buildCustomerQuery,
  customerUpdateToApiPayload,
  type ApiCustomerListResponse,
  type ApiCustomerResponse,
  type CustomerListParams,
  type UpdateCustomerInput,
} from "@/lib/api/commerce-customers";

type UseCommerceCustomersState = {
  customers: Customer[];
  total: number;
  totalSpend: number;
  loading: boolean;
  error: string | null;
  refetch: (params?: CustomerListParams) => Promise<void>;
};

export function useCommerceCustomers(initialParams?: CustomerListParams): UseCommerceCustomersState {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (params?: CustomerListParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildCustomerQuery(params ?? initialParams);
      const res = await apiFetch<ApiCustomerListResponse>(`/api/v1/commerce/customers${query}`);
      setCustomers(res.data.map(apiCustomerToCustomer));
      setTotal(res.meta.count);
      setTotalSpend(Number(res.meta.total_spend));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load customers";
      setError(message);
      setCustomers([]);
      setTotal(0);
      setTotalSpend(0);
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { customers, total, totalSpend, loading, error, refetch };
}

export function useCommerceCustomer(customerId: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiCustomerResponse>(`/api/v1/commerce/customers/${customerId}`);
      setCustomer(apiCustomerToCustomer(res.data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load customer";
      setError(message);
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { customer, loading, error, refetch };
}

export async function updateCommerceCustomer(id: string, input: UpdateCustomerInput): Promise<Customer> {
  const res = await apiFetch<ApiCustomerResponse>(`/api/v1/commerce/customers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(customerUpdateToApiPayload(input)),
  });
  return apiCustomerToCustomer(res.data);
}

export async function updateCommerceCustomerStatus(id: string, status: CustomerStatus): Promise<Customer> {
  return updateCommerceCustomer(id, { status });
}
