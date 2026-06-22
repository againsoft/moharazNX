"use client";

import { useCallback, useEffect, useState } from "react";
import type { AiProvider } from "@/lib/mock-data/ai-os";
import { apiFetch } from "@/lib/api/client";
import {
  apiAiProviderToProvider,
  buildAiProviderQuery,
  type AiProviderListParams,
  type ApiAiProviderListResponse,
  type ApiAiProviderResponse,
} from "@/lib/api/ai-providers";

type UseAiProvidersState = {
  providers: AiProvider[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: (params?: AiProviderListParams) => Promise<void>;
};

export function useAiProviders(initialParams?: AiProviderListParams): UseAiProvidersState {
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (params?: AiProviderListParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildAiProviderQuery(params ?? initialParams);
      const res = await apiFetch<ApiAiProviderListResponse>(`/api/v1/ai/providers${query}`);
      setProviders(res.data.map(apiAiProviderToProvider));
      setTotal(res.meta.count);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load AI providers";
      setError(message);
      setProviders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { providers, total, loading, error, refetch };
}

export function useAiProvider(providerId: string) {
  const [provider, setProvider] = useState<AiProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!providerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiAiProviderResponse>(`/api/v1/ai/providers/${providerId}`);
      setProvider(apiAiProviderToProvider(res.data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load provider";
      setError(message);
      setProvider(null);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { provider, loading, error, refetch };
}
