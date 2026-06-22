"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bot,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Link2,
  Shield,
  Sparkles,
  XCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  chiefAgentSuggestions,
  type AiAgent,
  type AiAgentStatus,
  type AiApproval,
  type AiAuditLog,
  type AiOsTab,
  type AiProvider,
  type AiProviderStatus,
  type AiRiskTier,
  type AiTool,
} from "@/lib/mock-data/ai-os";
import type {
  AiDashboardAgentActivity,
  AiDashboardKpi,
  AiDashboardTokenDay,
} from "@/lib/api/ai-dashboard";
import type { AiApiConnection } from "@/lib/api/ai-connections";
import type { ApiAiDbConnection } from "@/lib/api/ai-connections";
import { updateAiApproval } from "@/lib/api/use-ai-approvals";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { useAppStore } from "@/lib/store/app-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiOsNav } from "@/components/ai-os/ai-os-nav";
import { useState } from "react";

function riskVariant(risk: AiRiskTier): "warning" | "secondary" | "muted" {
  if (risk === "critical" || risk === "high") return "warning";
  if (risk === "medium") return "secondary";
  return "muted";
}

function agentStatusClass(status: AiAgentStatus) {
  if (status === "active") return "text-emerald-600";
  if (status === "idle") return "text-amber-600";
  return "text-muted-foreground";
}

function providerStatusClass(status: AiProviderStatus) {
  if (status === "healthy") return "text-emerald-600";
  if (status === "degraded") return "text-amber-600";
  return "text-red-500";
}

function ConnectionsPanel({
  dbConnection,
  dbLoading,
  dbError,
  connections,
  apiConnectedCount,
  connectionsLoading,
  connectionsError,
}: {
  dbConnection: ApiAiDbConnection | null;
  dbLoading: boolean;
  dbError: string | null;
  connections: AiApiConnection[];
  apiConnectedCount: number;
  connectionsLoading: boolean;
  connectionsError: string | null;
}) {
  return (
    <div className="rounded-lg border border-input bg-card p-3">
      <div className="mb-2 flex items-center gap-2">
        <Link2 className="h-4 w-4 text-violet-600" />
        <h2 className="text-sm font-medium">Platform connections</h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-md border border-input px-3 py-2">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-medium">PostgreSQL</p>
          </div>
          {dbLoading ? (
            <p className="mt-1 text-xs text-muted-foreground">Checking database…</p>
          ) : dbError ? (
            <p className="mt-1 text-xs text-destructive">{dbError}</p>
          ) : dbConnection?.ok ? (
            <>
              <p className="mt-1 text-xs text-emerald-600">Connected</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {dbConnection.host} · {dbConnection.database}
              </p>
            </>
          ) : (
            <p className="mt-1 text-xs text-amber-600">Disconnected</p>
          )}
        </div>
        <div className="rounded-md border border-input px-3 py-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-violet-600" />
            <p className="text-sm font-medium">AI provider APIs</p>
          </div>
          {connectionsLoading ? (
            <p className="mt-1 text-xs text-muted-foreground">Loading connections…</p>
          ) : connectionsError ? (
            <p className="mt-1 text-xs text-destructive">{connectionsError}</p>
          ) : (
            <>
              <p className="mt-1 text-xs text-muted-foreground">
                {apiConnectedCount} of {connections.length} connected
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {connections.map((c) => (
                  <Badge
                    key={c.id}
                    variant={c.status === "connected" ? "success" : "muted"}
                    className="text-[10px]"
                  >
                    {c.providerName}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardTab({
  onOpenChat,
  pendingApprovals,
  providers,
  kpis,
  tokenUsageChart,
  agentActivityChart,
  loading,
  error,
  dbConnection,
  dbLoading,
  dbError,
  connections,
  apiConnectedCount,
  connectionsLoading,
  connectionsError,
}: {
  onOpenChat: () => void;
  pendingApprovals: AiApproval[];
  providers: AiProvider[];
  kpis: AiDashboardKpi[];
  tokenUsageChart: AiDashboardTokenDay[];
  agentActivityChart: AiDashboardAgentActivity[];
  loading: boolean;
  error: string | null;
  dbConnection: ApiAiDbConnection | null;
  dbLoading: boolean;
  dbError: string | null;
  connections: AiApiConnection[];
  apiConnectedCount: number;
  connectionsLoading: boolean;
  connectionsError: string | null;
}) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading dashboard…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-4">
      <ConnectionsPanel
        dbConnection={dbConnection}
        dbLoading={dbLoading}
        dbError={dbError}
        connections={connections}
        apiConnectedCount={apiConnectedCount}
        connectionsLoading={connectionsLoading}
        connectionsError={connectionsError}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-input bg-card p-3 shadow-sm">
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <p className="mt-0.5 text-xl font-semibold">{kpi.value}</p>
            <p
              className={cn(
                "text-xs",
                kpi.alert ? "text-amber-600" : kpi.up ? "text-emerald-600" : "text-muted-foreground",
              )}
            >
              {kpi.sub}
            </p>
            {"pct" in kpi && kpi.pct !== undefined && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full", kpi.pct > 80 ? "bg-amber-500" : "bg-violet-500")}
                  style={{ width: `${kpi.pct}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-input bg-card p-3 lg:col-span-2">
          <h2 className="mb-2 text-sm font-medium">Token usage (7 days)</h2>
          <div className="h-44 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tokenUsageChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => [`${(Number(v) / 1000).toFixed(0)}k tokens`, "Usage"]} />
                <Area type="monotone" dataKey="tokens" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3 dark:border-violet-900 dark:bg-violet-950/20">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-600" />
            <h2 className="text-sm font-medium">Chief AI Agent</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Platform entry point — delegates to domain agents via governed tools.
          </p>
          <div className="mt-3 space-y-1.5">
            {chiefAgentSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={onOpenChat}
                className="block w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-left text-xs hover:bg-accent"
              >
                {s}
              </button>
            ))}
          </div>
          <Button size="sm" className="mt-3 w-full" onClick={onOpenChat}>
            Open AI Assistant
          </Button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-input bg-card p-3">
          <h2 className="mb-2 text-sm font-medium">Agent activity (today)</h2>
          <div className="h-40 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentActivityChart} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="agent" width={72} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="runs" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-input bg-card p-3">
          <h2 className="mb-2 text-sm font-medium">Pending approvals</h2>
          <div className="space-y-2">
            {pendingApprovals.length === 0 ? (
              <p className="text-xs text-muted-foreground">No pending approvals.</p>
            ) : (
              pendingApprovals.slice(0, 3).map((a) => (
                <div key={a.id} className="rounded-md border border-input px-3 py-2 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{a.summary}</p>
                    <Badge variant={riskVariant(a.risk)} className="shrink-0 text-[10px]">
                      {a.risk}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.agent} · {a.entity}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-input bg-card p-3">
        <h2 className="mb-2 text-sm font-medium">Provider health</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {providers.map((p) => (
            <div key={p.id} className="rounded-md border border-input px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{p.name}</p>
                <span className={cn("text-xs capitalize", providerStatusClass(p.status))}>
                  {p.status}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {p.latencyMs > 0 ? `${p.latencyMs}ms` : "—"} · {p.spendPct}% spend
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApprovalsTab({
  approvals,
  loading,
  error,
  canWrite,
  onResolve,
}: {
  approvals: AiApproval[];
  loading: boolean;
  error: string | null;
  canWrite: boolean;
  onResolve: (id: string, status: "approved" | "rejected") => Promise<void>;
}) {
  const pending = approvals.filter((a) => a.status === "pending");

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading approvals…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        High-risk AI proposals require human approval before module services execute changes.
      </p>
      {pending.length === 0 ? (
        <p className="rounded-lg border border-input bg-card p-4 text-sm text-muted-foreground">
          No pending approvals — all caught up.
        </p>
      ) : (
        pending.map((a) => (
          <div key={a.id} className="rounded-lg border border-input bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {a.agent}
                  </Badge>
                  <Badge variant={riskVariant(a.risk)} className="text-[10px]">
                    {a.risk} risk
                  </Badge>
                </div>
                <p className="mt-2 font-medium">{a.summary}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.reason}</p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">{a.tool}</p>
              </div>
              <p className="text-xs text-muted-foreground">{a.requestedAt}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-destructive"
                disabled={!canWrite}
                onClick={() => void onResolve(a.id, "rejected")}
              >
                <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
              </Button>
              <Button size="sm" variant="outline" onClick={() => toast.info("Review drawer — coming soon")}>
                Review
              </Button>
              <Button
                size="sm"
                disabled={!canWrite}
                onClick={() => void onResolve(a.id, "approved")}
              >
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AgentsTab({
  agents,
  loading,
  error,
}: {
  agents: AiAgent[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading agents…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (agents.length === 0) {
    return (
      <p className="rounded-lg border border-input bg-card p-4 text-sm text-muted-foreground">
        No domain agents configured.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {agents.map((agent) => (
        <div key={agent.id} className="rounded-lg border border-input bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-violet-600" />
              <h3 className="text-sm font-semibold">{agent.name}</h3>
            </div>
            <span className={cn("text-xs capitalize", agentStatusClass(agent.status))}>
              {agent.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{agent.domain}</p>
          <p className="mt-2 text-sm text-muted-foreground">{agent.description}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>{agent.tools} tools</span>
            <span>{agent.runsToday} runs today</span>
            <span className="font-mono">{agent.model}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full"
            disabled={agent.status === "disabled"}
            onClick={() => toast.info(`${agent.name} settings — prototype`)}
          >
            Configure
          </Button>
        </div>
      ))}
    </div>
  );
}

function ToolsTab({
  tools,
  loading,
  error,
  onOpenChat,
}: {
  tools: AiTool[];
  loading: boolean;
  error: string | null;
  onOpenChat: () => void;
}) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading tools…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (tools.length === 0) {
    return (
      <p className="rounded-lg border border-input bg-card p-4 text-sm text-muted-foreground">
        No AI tools configured.
      </p>
    );
  }

  const categories = [...new Set(tools.map((t) => t.category))];

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Governed AI capabilities — all tools route through module service APIs, never direct database access.
      </p>
      {categories.map((cat) => (
        <div key={cat}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {cat}
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tools
              .filter((t) => t.category === cat)
              .map((tool) => (
                <div
                  key={tool.id}
                  className="flex flex-col rounded-lg border border-input bg-card p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{tool.name}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {tool.agent}
                    </Badge>
                  </div>
                  <p className="mt-1 flex-1 text-xs text-muted-foreground">{tool.description}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={onOpenChat}
                  >
                    <Zap className="mr-1 h-3.5 w-3.5" /> Run tool
                  </Button>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProvidersTab({
  providers,
  loading,
  error,
}: {
  providers: AiProvider[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading providers…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (providers.length === 0) {
    return (
      <p className="rounded-lg border border-input bg-card p-4 text-sm text-muted-foreground">
        No AI providers configured.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {providers.map((p) => (
        <div key={p.id} className="rounded-lg border border-input bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">{p.name}</h3>
            </div>
            <Badge
              variant={
                p.status === "healthy" ? "success" : p.status === "degraded" ? "warning" : "muted"
              }
            >
              {p.status}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{p.models.join(" · ")}</p>
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <span>Latency: {p.latencyMs > 0 ? `${p.latencyMs}ms` : "N/A"}</span>
            <span>Spend share: {p.spendPct}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-violet-500" style={{ width: `${p.spendPct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AuditTab({
  auditLogs,
  loading,
  error,
}: {
  auditLogs: AiAuditLog[];
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading audit logs…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (auditLogs.length === 0) {
    return (
      <p className="rounded-lg border border-input bg-card p-4 text-sm text-muted-foreground">
        No audit logs yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-input">
      <table className="w-full text-sm">
        <thead className="border-b border-input bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Time</th>
            <th className="px-3 py-2 font-medium">Action</th>
            <th className="px-3 py-2 font-medium">Agent</th>
            <th className="px-3 py-2 font-medium">Summary</th>
            <th className="px-3 py-2 font-medium">Tokens</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {auditLogs.map((log) => (
            <tr key={log.id} className="hover:bg-muted/30">
              <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">{log.at}</td>
              <td className="px-3 py-2 font-mono text-[11px]">{log.action}</td>
              <td className="px-3 py-2 text-xs">{log.agent}</td>
              <td className="px-3 py-2 text-xs">{log.summary}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground">
                {log.tokens > 0 ? log.tokens.toLocaleString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AiOsControlCenter({
  approvals,
  pendingCount,
  approvalsLoading,
  approvalsError,
  refetchApprovals,
  auditLogs,
  auditLogsTotal,
  auditLogsLoading,
  auditLogsError,
  providers,
  providersTotal,
  providersLoading,
  providersError,
  agents,
  agentsTotal,
  agentsLoading,
  agentsError,
  tools,
  toolsTotal,
  toolsLoading,
  toolsError,
  dashboardKpis,
  tokenUsageChart,
  agentActivityChart,
  dashboardLoading,
  dashboardError,
  dbConnection,
  dbLoading,
  dbError,
  connections,
  apiConnectedCount,
  connectionsLoading,
  connectionsError,
}: {
  approvals: AiApproval[];
  pendingCount: number;
  approvalsLoading: boolean;
  approvalsError: string | null;
  refetchApprovals: () => Promise<void>;
  auditLogs: AiAuditLog[];
  auditLogsTotal: number;
  auditLogsLoading: boolean;
  auditLogsError: string | null;
  providers: AiProvider[];
  providersTotal: number;
  providersLoading: boolean;
  providersError: string | null;
  agents: AiAgent[];
  agentsTotal: number;
  agentsLoading: boolean;
  agentsError: string | null;
  tools: AiTool[];
  toolsTotal: number;
  toolsLoading: boolean;
  toolsError: string | null;
  dashboardKpis: AiDashboardKpi[];
  tokenUsageChart: AiDashboardTokenDay[];
  agentActivityChart: AiDashboardAgentActivity[];
  dashboardLoading: boolean;
  dashboardError: string | null;
  dbConnection: ApiAiDbConnection | null;
  dbLoading: boolean;
  dbError: string | null;
  connections: AiApiConnection[];
  apiConnectedCount: number;
  connectionsLoading: boolean;
  connectionsError: string | null;
}) {
  const [tab, setTab] = useState<AiOsTab>("dashboard");
  const toggleAiDrawer = useAppStore((s) => s.toggleAiDrawer);
  const canWrite = useAdminCanWrite();
  const pendingApprovals = approvals.filter((a) => a.status === "pending");

  const openChat = () => {
    toggleAiDrawer();
    toast.info("Chief Agent assistant opened");
  };

  const handleResolve = async (id: string, status: "approved" | "rejected") => {
    try {
      await updateAiApproval(id, { status });
      await refetchApprovals();
      toast.success(status === "approved" ? "Approval granted" : "Proposal rejected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update approval");
    }
  };

  const liveApis = [approvalsError, auditLogsError, providersError, agentsError, toolsError, dashboardError];
  const allOffline = liveApis.every(Boolean);
  const anyLoading =
    approvalsLoading ||
    auditLogsLoading ||
    providersLoading ||
    agentsLoading ||
    toolsLoading ||
    dashboardLoading;

  const apiStatus = allOffline
    ? "AI APIs offline"
    : anyLoading
      ? "Loading AI data…"
      : `Live · ${pendingCount} pending · ${agentsTotal} agents · ${toolsTotal} tools · ${providersTotal} providers · ${auditLogsTotal} audit entries`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-violet-200 bg-violet-50/40 px-4 py-2.5 text-xs dark:border-violet-900/50 dark:bg-violet-950/20">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-violet-600" />
          <span>
            AI is a <strong>platform service</strong> — acts through module APIs, permissions, workflows,
            and audit. No direct database access.
          </span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {apiStatus}
        </div>
      </div>

      <AiOsNav active={tab} onChange={setTab} pendingCount={pendingCount} />

      {tab === "dashboard" && (
        <DashboardTab
          onOpenChat={openChat}
          pendingApprovals={pendingApprovals}
          providers={providers}
          kpis={dashboardKpis}
          tokenUsageChart={tokenUsageChart}
          agentActivityChart={agentActivityChart}
          loading={dashboardLoading}
          error={dashboardError}
          dbConnection={dbConnection}
          dbLoading={dbLoading}
          dbError={dbError}
          connections={connections}
          apiConnectedCount={apiConnectedCount}
          connectionsLoading={connectionsLoading}
          connectionsError={connectionsError}
        />
      )}
      {tab === "approvals" && (
        <ApprovalsTab
          approvals={approvals}
          loading={approvalsLoading}
          error={approvalsError}
          canWrite={canWrite}
          onResolve={handleResolve}
        />
      )}
      {tab === "agents" && (
        <AgentsTab agents={agents} loading={agentsLoading} error={agentsError} />
      )}
      {tab === "tools" && (
        <ToolsTab
          tools={tools}
          loading={toolsLoading}
          error={toolsError}
          onOpenChat={openChat}
        />
      )}
      {tab === "providers" && (
        <ProvidersTab
          providers={providers}
          loading={providersLoading}
          error={providersError}
        />
      )}
      {tab === "audit" && (
        <AuditTab auditLogs={auditLogs} loading={auditLogsLoading} error={auditLogsError} />
      )}
    </div>
  );
}
