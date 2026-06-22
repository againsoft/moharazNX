"use client";

import { useCallback, useEffect, useState } from "react";
import type { AiApproval } from "@/lib/mock-data/ai-os";
import { apiFetch } from "@/lib/api/client";
import {
  aiApprovalUpdateToApiPayload,
  apiAiApprovalToApproval,
  buildAiApprovalQuery,
  type AiApprovalListParams,
  type ApiAiApprovalListResponse,
  type ApiAiApprovalResponse,
  type UpdateAiApprovalInput,
} from "@/lib/api/ai-approvals";

type UseAiApprovalsState = {
  approvals: AiApproval[];
  total: number;
  pendingCount: number;
  loading: boolean;
  error: string | null;
  refetch: (params?: AiApprovalListParams) => Promise<void>;
};

export function useAiApprovals(initialParams?: AiApprovalListParams): UseAiApprovalsState {
  const [approvals, setApprovals] = useState<AiApproval[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (params?: AiApprovalListParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = buildAiApprovalQuery(params ?? initialParams);
      const res = await apiFetch<ApiAiApprovalListResponse>(`/api/v1/ai/approvals${query}`);
      setApprovals(res.data.map(apiAiApprovalToApproval));
      setTotal(res.meta.count);
      setPendingCount(res.meta.pending_count);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load AI approvals";
      setError(message);
      setApprovals([]);
      setTotal(0);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  }, [initialParams]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { approvals, total, pendingCount, loading, error, refetch };
}

export function useAiApproval(approvalId: string) {
  const [approval, setApproval] = useState<AiApproval | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!approvalId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<ApiAiApprovalResponse>(`/api/v1/ai/approvals/${approvalId}`);
      setApproval(apiAiApprovalToApproval(res.data));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load approval";
      setError(message);
      setApproval(null);
    } finally {
      setLoading(false);
    }
  }, [approvalId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { approval, loading, error, refetch };
}

export async function updateAiApproval(id: string, input: UpdateAiApprovalInput): Promise<AiApproval> {
  const res = await apiFetch<ApiAiApprovalResponse>(`/api/v1/ai/approvals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(aiApprovalUpdateToApiPayload(input)),
  });
  return apiAiApprovalToApproval(res.data);
}
