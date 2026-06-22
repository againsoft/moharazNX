"use client";

import { useCallback, useEffect, useState } from "react";
import type { AiTool } from "@/lib/mock-data/ai-os";
import { apiFetch } from "@/lib/api/client";
import {
  apiAiToolToTool,
  buildAiToolQuery,
  type AiToolListParams,
  type ApiAiToolListResponse,
  type ApiAiToolResponse,
} from "@/lib/api/ai-tools";

type UseAiToolsState = {
  tools: AiTool[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: (params?: AiToolListParams) => Promise<void>;
};

export function useAiTools(initialParams?: AiToolListParams): UseAiToolsState {
  const [tools, setTools] = useState<AiTool[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (params?: AiToolListParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildAiToolQuery(params ?? initialParams);
      const res = await apiFetch<ApiAiToolListResponse>(`/api/v1/ai/tools${query}`);
      setTools(res.data.map(apiAiToolToTool));
      setTotal(res.meta.count);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load AI tools";
      setError(message);
      setTools([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { tools, total, loading, error, refetch };
}

export function useAiTool(toolId: string) {
  const [tool, setTool] = useState<AiTool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!toolId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiAiToolResponse>(`/api/v1/ai/tools/${toolId}`);
      setTool(apiAiToolToTool(res.data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load tool";
      setError(message);
      setTool(null);
    } finally {
      setLoading(false);
    }
  }, [toolId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { tool, loading, error, refetch };
}
