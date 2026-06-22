import type { AiAuditLog } from "@/lib/mock-data/ai-os";

export type ApiAiAuditLog = {
  id: string;
  company_id: string;
  action: string;
  agent: string;
  user: string;
  summary: string;
  tokens: number;
  logged_at: string;
  created_at: string;
};

export type ApiAiAuditLogListResponse = {
  data: ApiAiAuditLog[];
  meta: { count: number };
};

export type ApiAiAuditLogResponse = {
  data: ApiAiAuditLog;
};

export type AiAuditLogListParams = {
  action?: string;
  agent?: string;
};

function formatLoggedAt(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 19).replace("T", " ");
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function apiAiAuditLogToAuditLog(row: ApiAiAuditLog): AiAuditLog {
  return {
    id: row.id,
    action: row.action,
    agent: row.agent,
    user: row.user,
    summary: row.summary,
    tokens: row.tokens,
    at: formatLoggedAt(row.logged_at),
  };
}

export function buildAiAuditLogQuery(params?: AiAuditLogListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  if (params.action) q.set("action", params.action);
  if (params.agent) q.set("agent", params.agent);
  const s = q.toString();
  return s ? `?${s}` : "";
}
