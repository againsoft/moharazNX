import type { AiAgent, AiAgentStatus } from "@/lib/mock-data/ai-os";

export type ApiAiAgent = {
  id: string;
  company_id: string;
  name: string;
  domain: string;
  status: string;
  tools: number;
  runs_today: number;
  model: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type ApiAiAgentListResponse = {
  data: ApiAiAgent[];
  meta: { count: number };
};

export type ApiAiAgentResponse = {
  data: ApiAiAgent;
};

export type AiAgentListParams = {
  status?: AiAgentStatus;
  domain?: string;
};

export function apiAiAgentToAgent(row: ApiAiAgent): AiAgent {
  return {
    id: row.id,
    name: row.name,
    domain: row.domain,
    status: row.status as AiAgentStatus,
    tools: row.tools,
    runsToday: row.runs_today,
    model: row.model,
    description: row.description,
  };
}

export function buildAiAgentQuery(params?: AiAgentListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.status) q.set("status", params.status);
  if (params.domain) q.set("domain", params.domain);
  const s = q.toString();
  return s ? `?${s}` : "";
}
