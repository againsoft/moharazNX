"use client";

import { useCallback, useEffect, useState } from "react";
import type { AiAuditLog } from "@/lib/mock-data/ai-os";
import { apiFetch } from "@/lib/api/client";
import {
  apiAiAuditLogToAuditLog,
  buildAiAuditLogQuery,
  type AiAuditLogListParams,
  type ApiAiAuditLogListResponse,
  type ApiAiAuditLogResponse,
} from "@/lib/api/ai-audit-logs";

type UseAiAuditLogsState = {
  auditLogs: AiAuditLog[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: (params?: AiAuditLogListParams) => Promise<void>;
};

export function useAiAuditLogs(initialParams?: AiAuditLogListParams): UseAiAuditLogsState {
  const [auditLogs, setAuditLogs] = useState<AiAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (params?: AiAuditLogListParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildAiAuditLogQuery(params ?? initialParams);
      const res = await apiFetch<ApiAiAuditLogListResponse>(`/api/v1/ai/audit-logs${query}`);
      setAuditLogs(res.data.map(apiAiAuditLogToAuditLog));
      setTotal(res.meta.count);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load AI audit logs";
      setError(message);
      setAuditLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { auditLogs, total, loading, error, refetch };
}

export function useAiAuditLog(logId: string) {
  const [auditLog, setAuditLog] = useState<AiAuditLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!logId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiAiAuditLogResponse>(`/api/v1/ai/audit-logs/${logId}`);
      setAuditLog(apiAiAuditLogToAuditLog(res.data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load audit log";
      setError(message);
      setAuditLog(null);
    } finally {
      setLoading(false);
    }
  }, [logId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { auditLog, loading, error, refetch };
}
