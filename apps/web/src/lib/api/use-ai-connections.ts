"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import {
  aiConnectionUpdateToApiPayload,
  apiAiConnectionToConnection,
  type AiApiConnection,
  type ApiAiConnectionListResponse,
  type ApiAiConnectionResponse,
  type ApiAiDbConnection,
  type ApiAiDbConnectionResponse,
  type UpdateAiConnectionInput,
} from "@/lib/api/ai-connections";

type UseAiConnectionsState = {
  connections: AiApiConnection[];
  total: number;
  connectedCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useAiConnections(): UseAiConnectionsState {
  const [connections, setConnections] = useState<AiApiConnection[]>([]);
  const [total, setTotal] = useState(0);
  const [connectedCount, setConnectedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiAiConnectionListResponse>("/api/v1/ai/connections");
      setConnections(res.data.map(apiAiConnectionToConnection));
      setTotal(res.meta.count);
      setConnectedCount(res.meta.connected_count);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load AI connections";
      setError(message);
      setConnections([]);
      setTotal(0);
      setConnectedCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { connections, total, connectedCount, loading, error, refetch };
}

export function useAiDbConnection() {
  const [dbConnection, setDbConnection] = useState<ApiAiDbConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiAiDbConnectionResponse>("/api/v1/ai/connections/db");
      setDbConnection(res.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load database connection";
      setError(message);
      setDbConnection(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { dbConnection, loading, error, refetch };
}

export async function updateAiConnection(
  id: string,
  input: UpdateAiConnectionInput,
): Promise<AiApiConnection> {
  const res = await apiFetch<ApiAiConnectionResponse>(`/api/v1/ai/connections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(aiConnectionUpdateToApiPayload(input)),
  });
  return apiAiConnectionToConnection(res.data);
}
