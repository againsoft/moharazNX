"use client";

import { Sparkles } from "lucide-react";
import { AiOsControlCenter } from "@/components/ai-os/ai-os-control-center";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { useAiAgents } from "@/lib/api/use-ai-agents";
import { useAiApprovals } from "@/lib/api/use-ai-approvals";
import { useAiAuditLogs } from "@/lib/api/use-ai-audit-logs";
import { useAiConnections, useAiDbConnection } from "@/lib/api/use-ai-connections";
import { useAiProviders } from "@/lib/api/use-ai-providers";
import { useAiDashboard } from "@/lib/api/use-ai-dashboard";
import { useAiTools } from "@/lib/api/use-ai-tools";

export default function AiOsPage() {
  const {
    approvals,
    total: approvalsTotal,
    pendingCount,
    loading: approvalsLoading,
    error: approvalsError,
    refetch: refetchApprovals,
  } = useAiApprovals();
  const {
    auditLogs,
    total: auditLogsTotal,
    loading: auditLogsLoading,
    error: auditLogsError,
  } = useAiAuditLogs();
  const {
    providers,
    total: providersTotal,
    loading: providersLoading,
    error: providersError,
  } = useAiProviders();
  const {
    agents,
    total: agentsTotal,
    loading: agentsLoading,
    error: agentsError,
  } = useAiAgents();
  const {
    tools,
    total: toolsTotal,
    loading: toolsLoading,
    error: toolsError,
  } = useAiTools();
  const {
    kpis: dashboardKpis,
    tokenUsageChart,
    agentActivityChart,
    loading: dashboardLoading,
    error: dashboardError,
  } = useAiDashboard();
  const {
    connections,
    connectedCount: apiConnectedCount,
    loading: connectionsLoading,
    error: connectionsError,
  } = useAiConnections();
  const {
    dbConnection,
    loading: dbLoading,
    error: dbError,
  } = useAiDbConnection();

  const loading =
    approvalsLoading ||
    auditLogsLoading ||
    providersLoading ||
    agentsLoading ||
    toolsLoading ||
    dashboardLoading ||
    connectionsLoading ||
    dbLoading;
  const errors = [
    approvalsError,
    auditLogsError,
    providersError,
    agentsError,
    toolsError,
    dashboardError,
    connectionsError,
    dbError,
  ].filter(Boolean);
  const error = errors.length === 8 ? errors[0] : null;
  const connectedCount = error
    ? undefined
    : approvalsTotal + auditLogsTotal + providersTotal + agentsTotal + toolsTotal;

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0">
        <p className="page-subtitle">MoharazNX › AI OS</p>
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-600" />
          <h1 className="page-title">AI Control Center</h1>
        </div>
        <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
          Chief Agent orchestration, domain agents, approvals, providers, and audit — governed
          intelligence layer for all modules.
        </p>
        <div className="mt-2">
          <ApiConnectionBadge loading={loading} error={error} productCount={connectedCount} />
          {!error && !loading && (
            <span className="ml-2 text-xs text-muted-foreground">
              {pendingCount} pending · {agentsTotal} agents · {toolsTotal} tools · {providersTotal}{" "}
              providers · {auditLogsTotal} audit logs
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1">
        <AiOsControlCenter
          approvals={approvals}
          pendingCount={pendingCount}
          approvalsLoading={approvalsLoading}
          approvalsError={approvalsError}
          refetchApprovals={refetchApprovals}
          auditLogs={auditLogs}
          auditLogsTotal={auditLogsTotal}
          auditLogsLoading={auditLogsLoading}
          auditLogsError={auditLogsError}
          providers={providers}
          providersTotal={providersTotal}
          providersLoading={providersLoading}
          providersError={providersError}
          agents={agents}
          agentsTotal={agentsTotal}
          agentsLoading={agentsLoading}
          agentsError={agentsError}
          tools={tools}
          toolsTotal={toolsTotal}
          toolsLoading={toolsLoading}
          toolsError={toolsError}
          dashboardKpis={dashboardKpis}
          tokenUsageChart={tokenUsageChart}
          agentActivityChart={agentActivityChart}
          dashboardLoading={dashboardLoading}
          dashboardError={dashboardError}
          dbConnection={dbConnection}
          dbLoading={dbLoading}
          dbError={dbError}
          connections={connections}
          apiConnectedCount={apiConnectedCount}
          connectionsLoading={connectionsLoading}
          connectionsError={connectionsError}
        />
      </div>
    </div>
  );
}
