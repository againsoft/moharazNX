"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/mock-data/products";
import { apiFetch } from "@/lib/api/client";
import {
  apiProductToProduct,
  productToApiPayload,
  productToApiUpdatePayload,
  type ApiProductListResponse,
  type ApiProductResponse,
  type CreateCatalogProductInput,
  type UpdateCatalogProductInput,
} from "@/lib/api/catalog-products";

type UseCatalogProductsState = {
  products: Product[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useCatalogProducts(): UseCatalogProductsState {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiProductListResponse>(
        "/api/v1/catalog/products?per_page=200",
      );
      setProducts(res.data.map(apiProductToProduct));
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

export async function fetchCatalogProduct(id: string): Promise<Product> {
  const res = await apiFetch<ApiProductResponse>(`/api/v1/catalog/products/${id}`);
  return apiProductToProduct(res.data);
}

export async function createCatalogProduct(input: CreateCatalogProductInput): Promise<Product> {
  const res = await apiFetch<ApiProductResponse>("/api/v1/catalog/products", {
    method: "POST",
    body: JSON.stringify(productToApiPayload(input)),
  });
  return apiProductToProduct(res.data);
}

export async function updateCatalogProduct(
  id: string,
  input: UpdateCatalogProductInput,
): Promise<Product> {
  const res = await apiFetch<ApiProductResponse>(`/api/v1/catalog/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(productToApiUpdatePayload(input)),
  });
  return apiProductToProduct(res.data);
}

export async function archiveCatalogProducts(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) =>
      updateCatalogProduct(id, { status: "archived" }),
    ),
  );
}

export async function deleteCatalogProduct(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/catalog/products/${id}`, { method: "DELETE" });
}
