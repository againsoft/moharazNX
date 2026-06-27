"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchCatalogProductDetail,
  fetchProductSpecs,
  type ProductDetail,
} from "@/lib/api/use-catalog-products";

type UseCatalogProductState = {
  product: ProductDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useCatalogProduct(id: string | null | undefined): UseCatalogProductState {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [detail, specs] = await Promise.all([
        fetchCatalogProductDetail(id),
        fetchProductSpecs(id).catch(() => undefined),
      ]);
      setProduct({ ...detail, specs: specs ?? undefined });
    } catch (err) {
      setProduct(null);
      setError(err instanceof Error ? err.message : "Product not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { product, loading, error, refetch };
}
