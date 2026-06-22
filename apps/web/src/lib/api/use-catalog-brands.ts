"use client";

import { useCallback, useEffect, useState } from "react";
import type { Brand } from "@/lib/mock-data/brands";
import { apiFetch } from "@/lib/api/client";
import {
  apiBrandToBrand,
  brandToApiCreatePayload,
  brandToApiUpdatePayload,
  partialBrandToApiUpdate,
  type ApiBrandListResponse,
  type ApiBrandResponse,
  type CreateCatalogBrandInput,
  type UpdateCatalogBrandInput,
} from "@/lib/api/catalog-brands";

type UseCatalogBrandsState = {
  brands: Brand[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useCatalogBrands(): UseCatalogBrandsState {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiBrandListResponse>("/api/v1/catalog/brands");
      setBrands(res.data.map(apiBrandToBrand));
      setTotal(res.meta.count);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load brands";
      setError(message);
      setBrands([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { brands, total, loading, error, refetch };
}

export async function fetchCatalogBrand(id: string): Promise<Brand> {
  const res = await apiFetch<ApiBrandResponse>(`/api/v1/catalog/brands/${id}`);
  return apiBrandToBrand(res.data);
}

export async function createCatalogBrand(input: CreateCatalogBrandInput): Promise<Brand> {
  const res = await apiFetch<ApiBrandResponse>("/api/v1/catalog/brands", {
    method: "POST",
    body: JSON.stringify(brandToApiCreatePayload(input)),
  });
  return apiBrandToBrand(res.data);
}

export async function updateCatalogBrand(
  id: string,
  input: UpdateCatalogBrandInput,
): Promise<Brand> {
  const res = await apiFetch<ApiBrandResponse>(`/api/v1/catalog/brands/${id}`, {
    method: "PATCH",
    body: JSON.stringify(brandToApiUpdatePayload(input)),
  });
  return apiBrandToBrand(res.data);
}

export async function patchCatalogBrand(id: string, patch: Partial<Brand>): Promise<Brand> {
  return updateCatalogBrand(id, partialBrandToApiUpdate(patch));
}

export async function reorderCatalogBrands(orderedIds: string[]): Promise<void> {
  await apiFetch<ApiBrandListResponse>("/api/v1/catalog/brands/reorder", {
    method: "PATCH",
    body: JSON.stringify({ ordered_ids: orderedIds }),
  });
}

export async function deleteCatalogBrand(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/catalog/brands/${id}`, { method: "DELETE" });
}

export async function deleteCatalogBrands(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteCatalogBrand(id)));
}

export async function bulkPatchCatalogBrands(
  targets: Brand[],
  patch: Partial<Brand>,
): Promise<void> {
  const payload = partialBrandToApiUpdate(patch);
  await Promise.all(targets.map((b) => updateCatalogBrand(b.id, payload)));
}
