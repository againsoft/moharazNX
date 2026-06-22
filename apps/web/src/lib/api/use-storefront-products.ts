"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import {
  buildStorefrontProductQuery,
  storefrontApiToProduct,
  type ApiStorefrontProductListResponse,
} from "@/lib/api/storefront-products";
import type { Product } from "@/lib/mock-data/products";

type UseStorefrontProductsState = {
  products: Product[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useStorefrontProducts(): UseStorefrontProductsState {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiStorefrontProductListResponse>(
        `/api/v1/storefront/products${buildStorefrontProductQuery({ perPage: 200 })}`,
      );
      setProducts(res.data.map(storefrontApiToProduct));
      setTotal(res.meta.count);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load products";
      setError(message);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { products, total, loading, error, refetch };
}
