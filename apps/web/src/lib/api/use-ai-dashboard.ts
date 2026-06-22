"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiDashboardToView,
  type AiDashboardAgentActivity,
  type AiDashboardKpi,
  type AiDashboardTokenDay,
  type ApiAiDashboardResponse,
} from "@/lib/api/ai-dashboard";
import { apiFetch } from "@/lib/api/client";

type UseAiDashboardState = {
  kpis: AiDashboardKpi[];
  tokenUsageChart: AiDashboardTokenDay[];
  agentActivityChart: AiDashboardAgentActivity[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useAiDashboard(): UseAiDashboardState {
  const [kpis, setKpis] = useState<AiDashboardKpi[]>([]);
  const [tokenUsageChart, setTokenUsageChart] = useState<AiDashboardTokenDay[]>([]);
  const [agentActivityChart, setAgentActivityChart] = useState<AiDashboardAgentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiAiDashboardResponse>("/api/v1/ai/dashboard");
      const view = apiDashboardToView(res.data);
      setKpis(view.kpis);
      setTokenUsageChart(view.tokenUsageChart);
      setAgentActivityChart(view.agentActivityChart);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load AI dashboard";
      setError(message);
      setKpis([]);
      setTokenUsageChart([]);
      setAgentActivityChart([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { kpis, tokenUsageChart, agentActivityChart, loading, error, refetch };
}
