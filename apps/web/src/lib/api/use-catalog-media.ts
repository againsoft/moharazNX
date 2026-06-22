"use client";

import { useCallback, useEffect, useState } from "react";
import type { MediaLibraryItem } from "@/lib/mock-data/media-library";
import { getApiBaseUrl, ApiError } from "@/lib/api/client";
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
      const res = await fetch(`${getApiBaseUrl()}/api/v1/media${suffix}`);
      if (!res.ok) {
        let detail = res.statusText;
        try {
          const body = (await res.json()) as { detail?: string };
          if (body.detail) detail = body.detail;
        } catch {
          /* ignore */
        }
        throw new ApiError(detail, res.status);
      }
      const data = (await res.json()) as ApiMediaListResponse;
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
  const res = await fetch(`${getApiBaseUrl()}/api/v1/media/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mediaPatchToApi(patch)),
  });
  if (!res.ok) {
    throw new ApiError("Update failed", res.status);
  }
  const data = (await res.json()) as ApiMediaResponse;
  return apiMediaToItem(data.data);
}

export async function createCatalogMediaBatch(
  items: MediaLibraryItem[],
): Promise<MediaLibraryItem[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/v1/media/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: items.map(mediaItemToApiCreate) }),
  });
  if (!res.ok) {
    throw new ApiError("Import failed", res.status);
  }
  const data = (await res.json()) as ApiMediaListResponse;
  return data.data.map(apiMediaToItem);
}

export async function uploadCatalogMediaFiles(files: File[]): Promise<MediaLibraryItem[]> {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));

  const res = await fetch(`${getApiBaseUrl()}/api/v1/media/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    let detail = "Upload failed";
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, res.status);
  }
  const data = (await res.json()) as ApiMediaListResponse;
  return data.data.map(apiMediaToItem);
}

export async function deleteCatalogMediaItem(id: string): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/api/v1/media/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    throw new ApiError("Delete failed", res.status);
  }
}
