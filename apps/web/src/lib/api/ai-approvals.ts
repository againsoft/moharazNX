import type { AiApproval, AiApprovalStatus, AiRiskTier } from "@/lib/mock-data/ai-os";

export type ApiAiApproval = {
  id: string;
  company_id: string;
  agent: string;
  tool: string;
  summary: string;
  reason: string;
  risk: string;
  status: string;
  entity: string;
  requested_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiAiApprovalListResponse = {
  data: ApiAiApproval[];
  meta: { count: number; pending_count: number };
};

export type ApiAiApprovalResponse = {
  data: ApiAiApproval;
};

export type AiApprovalListParams = {
  status?: AiApprovalStatus;
  risk?: AiRiskTier;
};

function formatRequestedAt(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 16).replace("T", " ");
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function apiAiApprovalToApproval(row: ApiAiApproval): AiApproval {
  return {
    id: row.id,
    agent: row.agent,
    tool: row.tool,
    summary: row.summary,
    reason: row.reason,
    risk: row.risk as AiRiskTier,
    status: row.status as AiApprovalStatus,
    requestedAt: formatRequestedAt(row.requested_at),
    entity: row.entity,
    resolvedAt: row.resolved_at ?? undefined,
    resolvedBy: row.resolved_by ?? undefined,
  };
}

export function buildAiApprovalQuery(params?: AiApprovalListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.risk) q.set("risk", params.risk);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export type UpdateAiApprovalInput = {
  status: "approved" | "rejected";
};

export function aiApprovalUpdateToApiPayload(input: UpdateAiApprovalInput) {
  return { status: input.status };
}
