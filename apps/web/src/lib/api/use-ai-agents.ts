"use client";

import { useCallback, useEffect, useState } from "react";
import type { AiAgent } from "@/lib/mock-data/ai-os";
import { apiFetch } from "@/lib/api/client";
import {
  apiAiAgentToAgent,
  buildAiAgentQuery,
  type AiAgentListParams,
  type ApiAiAgentListResponse,
  type ApiAiAgentResponse,
} from "@/lib/api/ai-agents";

type UseAiAgentsState = {
  agents: AiAgent[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: (params?: AiAgentListParams) => Promise<void>;
};

export function useAiAgents(initialParams?: AiAgentListParams): UseAiAgentsState {
  const [agents, setAgents] = useState<AiAgent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (params?: AiAgentListParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildAiAgentQuery(params ?? initialParams);
      const res = await apiFetch<ApiAiAgentListResponse>(`/api/v1/ai/agents${query}`);
      setAgents(res.data.map(apiAiAgentToAgent));
      setTotal(res.meta.count);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load AI agents";
      setError(message);
      setAgents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { agents, total, loading, error, refetch };
}

export function useAiAgent(agentId: string) {
  const [agent, setAgent] = useState<AiAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!agentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiAiAgentResponse>(`/api/v1/ai/agents/${agentId}`);
      setAgent(apiAiAgentToAgent(res.data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load agent";
      setError(message);
      setAgent(null);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { agent, loading, error, refetch };
}
