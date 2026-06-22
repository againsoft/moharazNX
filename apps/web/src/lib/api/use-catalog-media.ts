"use client";

import { useCallback, useEffect, useState } from "react";
import type { MediaLibraryItem } from "@/lib/mock-data/media-library";
import { apiFetch, getApiBaseUrl, ApiError } from "@/lib/api/client";
import { getStoredAuthToken } from "@/lib/store/admin-auth-store";
import {
  apiMediaToItem,
  mediaItemToApiCreate,
  mediaPatchToApi,
  type ApiMediaListResponse,
  type ApiMediaResponse,
} from "@/lib/api/catalog-media";

type UseCatalogMediaState = {
  items: MediaLibraryItem[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: (params?: { query?: string; type?: string }) => Promise<void>;
};

export function useCatalogMedia(): UseCatalogMediaState {
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (params?: { query?: string; type?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params?.query?.trim()) query.set("query", params.query.trim());
      if (params?.type) query.set("type", params.type);
      const suffix = query.toString() ? `?${query.toString()}` : "";
      const data = await apiFetch<ApiMediaListResponse>(`/api/v1/media${suffix}`);
      setItems(data.data.map(apiMediaToItem));
      setTotal(data.meta.count);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load media";
      setError(message);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { items, total, loading, error, refetch };
}

export async function patchCatalogMediaItem(
  id: string,
  patch: Partial<Pick<MediaLibraryItem, "name" | "title" | "alt">>,
): Promise<MediaLibraryItem> {
  const data = await apiFetch<ApiMediaResponse>(`/api/v1/media/${id}`, {
    method: "PATCH",
    body: JSON.stringify(mediaPatchToApi(patch)),
  });
  return apiMediaToItem(data.data);
}

export async function createCatalogMediaBatch(
  items: MediaLibraryItem[],
): Promise<MediaLibraryItem[]> {
  const data = await apiFetch<ApiMediaListResponse>(`/api/v1/media/batch`, {
    method: "POST",
    body: JSON.stringify({ items: items.map(mediaItemToApiCreate) }),
  });
  return data.data.map(apiMediaToItem);
}

export async function uploadCatalogMediaFiles(files: File[]): Promise<MediaLibraryItem[]> {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  const token = getStoredAuthToken();

  const res = await fetch(`${getApiBaseUrl()}/api/v1/media/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  if (!res.ok) {
    let detail = "Upload failed";
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch { /* ignore */ }
    throw new ApiError(detail, res.status);
  }
  const data = (await res.json()) as ApiMediaListResponse;
  return data.data.map(apiMediaToItem);
}

export async function deleteCatalogMediaItem(id: string): Promise<void> {
  await apiFetch(`/api/v1/media/${id}`, { method: "DELETE" });
}

export async function deleteCatalogMediaBulk(ids: string[]): Promise<void> {
  await apiFetch(`/api/v1/media/bulk`, {
    method: "DELETE",
    body: JSON.stringify(ids),
  });
}
