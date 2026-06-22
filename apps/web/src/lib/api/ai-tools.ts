import type { AiRiskTier, AiTool } from "@/lib/mock-data/ai-os";

export type ApiAiTool = {
  id: string;
  company_id: string;
  name: string;
  agent: string;
  category: string;
  risk: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type ApiAiToolListResponse = {
  data: ApiAiTool[];
  meta: { count: number };
};

export type ApiAiToolResponse = {
  data: ApiAiTool;
};

export type AiToolListParams = {
  category?: string;
  agent?: string;
  risk?: AiRiskTier;
};

export function apiAiToolToTool(row: ApiAiTool): AiTool {
  return {
    id: row.id,
    name: row.name,
    agent: row.agent,
    category: row.category,
    risk: row.risk as AiRiskTier,
    description: row.description,
  };
}

export function buildAiToolQuery(params?: AiToolListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.category) q.set("category", params.category);
  if (params.agent) q.set("agent", params.agent);
  if (params.risk) q.set("risk", params.risk);
  const s = q.toString();
  return s ? `?${s}` : "";
}
