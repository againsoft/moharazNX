import type { AiProvider, AiProviderStatus } from "@/lib/mock-data/ai-os";

export type ApiAiProvider = {
  id: string;
  company_id: string;
  name: string;
  models: string[];
  status: string;
  latency_ms: number;
  spend_pct: number;
  created_at: string;
  updated_at: string;
};

export type ApiAiProviderListResponse = {
  data: ApiAiProvider[];
  meta: { count: number };
};

export type ApiAiProviderResponse = {
  data: ApiAiProvider;
};

export type AiProviderListParams = {
  status?: AiProviderStatus;
};

export function apiAiProviderToProvider(row: ApiAiProvider): AiProvider {
  return {
    id: row.id,
    name: row.name,
    models: row.models,
    status: row.status as AiProviderStatus,
    latencyMs: row.latency_ms,
    spendPct: row.spend_pct,
  };
}

export function buildAiProviderQuery(params?: AiProviderListParams): string {
  if (!params?.status) return "";
  const q = new URLSearchParams();
  q.set("status", params.status);
  const s = q.toString();
  return s ? `?${s}` : "";
}
