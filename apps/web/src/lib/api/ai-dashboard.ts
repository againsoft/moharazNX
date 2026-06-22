export type AiDashboardKpi = {
  label: string;
  value: string;
  sub: string;
  pct?: number;
  alert?: boolean;
  up?: boolean;
};

export type AiDashboardTokenDay = {
  day: string;
  tokens: number;
};

export type AiDashboardAgentActivity = {
  agent: string;
  runs: number;
};

export type ApiAiDashboardData = {
  kpis: AiDashboardKpi[];
  token_usage_chart: AiDashboardTokenDay[];
  agent_activity_chart: AiDashboardAgentActivity[];
};

export type ApiAiDashboardResponse = {
  data: ApiAiDashboardData;
};

export function apiDashboardToView(data: ApiAiDashboardData) {
  return {
    kpis: data.kpis,
    tokenUsageChart: data.token_usage_chart.map((row) => ({
      day: row.day,
      tokens: row.tokens,
    })),
    agentActivityChart: data.agent_activity_chart.map((row) => ({
      agent: row.agent,
      runs: row.runs,
    })),
  };
}
