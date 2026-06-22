export type ApiAiConnection = {
  id: string;
  company_id: string;
  provider_id: string;
  provider_name: string;
  api_key_set: boolean;
  api_key_hint: string;
  base_url: string;
  status: string;
  last_connected_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiAiConnectionListResponse = {
  data: ApiAiConnection[];
  meta: { count: number; connected_count: number };
};

export type ApiAiConnectionResponse = {
  data: ApiAiConnection;
};

export type ApiAiDbConnection = {
  ok: boolean;
  version: string;
  database: string;
  host: string;
};

export type ApiAiDbConnectionResponse = {
  data: ApiAiDbConnection;
};

export type AiApiConnection = {
  id: string;
  providerId: string;
  providerName: string;
  apiKeySet: boolean;
  apiKeyHint: string;
  baseUrl: string;
  status: "connected" | "disconnected" | "error";
  lastConnectedAt: string | null;
};

export type UpdateAiConnectionInput = {
  apiKey?: string;
  baseUrl?: string;
  testConnect?: boolean;
};

export function apiAiConnectionToConnection(row: ApiAiConnection): AiApiConnection {
  return {
    id: row.id,
    providerId: row.provider_id,
    providerName: row.provider_name,
    apiKeySet: row.api_key_set,
    apiKeyHint: row.api_key_hint,
    baseUrl: row.base_url,
    status: row.status as AiApiConnection["status"],
    lastConnectedAt: row.last_connected_at,
  };
}

export function aiConnectionUpdateToApiPayload(input: UpdateAiConnectionInput) {
  return {
    api_key: input.apiKey,
    base_url: input.baseUrl,
    test_connect: input.testConnect ?? false,
  };
}
