"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchStorefrontProductBySlug,
  storefrontApiToProduct,
} from "@/lib/api/storefront-products";
import type { Product } from "@/lib/mock-data/products";

type UseStorefrontProductState = {
  product: Product | null;
  loading: boolean;
  error: string | null;
  apiEnabled: boolean;
  refetch: () => Promise<void>;
};

export function useStorefrontProduct(slug: string | null | undefined): UseStorefrontProductState {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState<string | null>(null);
  const [apiEnabled, setApiEnabled] = useState(false);

  const refetch = useCallback(async () => {
    if (!slug) {
      setProduct(null);
      setLoading(false);
      setError(null);
      setApiEnabled(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setProduct(storefrontApiToProduct(await fetchStorefrontProductBySlug(slug)));
      setApiEnabled(true);
    } catch (err) {
      setProduct(null);
      setError(err instanceof Error ? err.message : "Product not found");
      setApiEnabled(false);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { product, loading, error, apiEnabled, refetch };
}
