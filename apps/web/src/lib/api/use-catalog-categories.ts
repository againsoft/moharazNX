"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category } from "@/lib/mock-data/categories";
import { apiFetch } from "@/lib/api/client";
import {
  apiCategoryToCategory,
  categoryToApiCreatePayload,
  categoryToApiUpdatePayload,
  partialCategoryToApiUpdate,
  type ApiCategoryListResponse,
  type ApiCategoryResponse,
  type CreateCatalogCategoryInput,
  type UpdateCatalogCategoryInput,
} from "@/lib/api/catalog-categories";

type UseCatalogCategoriesState = {
  categories: Category[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useCatalogCategories(): UseCatalogCategoriesState {
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiCategoryListResponse>("/api/v1/catalog/categories");
      setCategories(res.data.map(apiCategoryToCategory));
      setTotal(res.meta.count);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load categories";
      setError(message);
      setCategories([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { categories, total, loading, error, refetch };
}

export async function fetchCatalogCategory(id: string): Promise<Category> {
  const res = await apiFetch<ApiCategoryResponse>(`/api/v1/catalog/categories/${id}`);
  return apiCategoryToCategory(res.data);
}

export async function createCatalogCategory(input: CreateCatalogCategoryInput): Promise<Category> {
  const res = await apiFetch<ApiCategoryResponse>("/api/v1/catalog/categories", {
    method: "POST",
    body: JSON.stringify(categoryToApiCreatePayload(input)),
  });
  return apiCategoryToCategory(res.data);
}

export async function updateCatalogCategory(
  id: string,
  input: UpdateCatalogCategoryInput,
): Promise<Category> {
  const res = await apiFetch<ApiCategoryResponse>(`/api/v1/catalog/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(categoryToApiUpdatePayload(input)),
  });
  return apiCategoryToCategory(res.data);
}

export async function patchCatalogCategory(id: string, patch: Partial<Category>): Promise<Category> {
  return updateCatalogCategory(id, partialCategoryToApiUpdate(patch));
}

export async function reorderCatalogCategories(
  parentId: string | null,
  orderedIds: string[],
): Promise<void> {
  await apiFetch<ApiCategoryListResponse>("/api/v1/catalog/categories/reorder", {
    method: "PATCH",
    body: JSON.stringify({ parent_id: parentId, ordered_ids: orderedIds }),
  });
}

export async function deleteCatalogCategory(id: string): Promise<void> {
  await apiFetch<void>(`/api/v1/catalog/categories/${id}`, { method: "DELETE" });
}

export async function deleteCatalogCategories(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id) => deleteCatalogCategory(id)));
}

export async function bulkPatchCatalogCategories(
  targets: Category[],
  patch: Partial<Category>,
): Promise<void> {
  const payload = partialCategoryToApiUpdate(patch);
  await Promise.all(targets.map((c) => updateCatalogCategory(c.id, payload)));
}
