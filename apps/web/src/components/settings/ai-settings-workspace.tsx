"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Database,
  Link2,
  MessageSquare,
  RotateCcw,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import {
  EDITOR_AI_PRE_PROMPTS,
  type EditorAiContextId,
} from "@/lib/editor/editor-ai-prompts";
import {
  updateAiConnection,
  useAiConnections,
  useAiDbConnection,
} from "@/lib/api/use-ai-connections";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { useAiPromptsStore } from "@/lib/store/ai-prompts-store";
import { SettingsLayerNav } from "@/components/settings/settings-layer-nav";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const CONTEXT_LABELS: Record<EditorAiContextId, string> = {
  "product.description": "Product description",
  "product.short_description": "Product short description",
  "category.description": "Category description",
  "brand.description": "Brand description",
  generic: "Generic rich text",
};

const WHERE_TO_FIND = [
  {
    title: "Product editor — Chat & Preset",
    path: "Catalog → Products → Edit → General",
    detail:
      "Description ও Short description editor-এর toolbar-এ Visual/Code-র পাশে Chat (আলোচনা) ও Preset (সরাসরি লেখা) বাটন।",
    icon: MessageSquare,
  },
  {
    title: "Product form — AI Tools",
    path: "Catalog → Products → Edit → বাম sidebar (✨)",
    detail: "Generate description, SEO meta, tags, translate — quick actions।",
    icon: Wand2,
  },
  {
    title: "AI OS",
    path: "Sidebar → AI OS",
    detail: "Agents, providers, approvals — পুরো প্ল্যাটফর্ম AI control।",
    icon: Bot,
  },
];

export function AiSettingsWorkspace() {
  const prompts = useAiPromptsStore((s) => s.prompts);
  const updatePrompt = useAiPromptsStore((s) => s.updatePrompt);
  const resetPrompt = useAiPromptsStore((s) => s.resetPrompt);
  const resetAll = useAiPromptsStore((s) => s.resetAll);
  const canWrite = useAdminCanWrite();
  const {
    connections,
    connectedCount,
    loading: connectionsLoading,
    error: connectionsError,
    refetch: refetchConnections,
  } = useAiConnections();
  const {
    dbConnection,
    loading: dbLoading,
    error: dbError,
  } = useAiDbConnection();
  const [draftKeys, setDraftKeys] = useState<Record<string, string>>({});
  const [draftUrls, setDraftUrls] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const [active, setActive] = useState<EditorAiContextId>("product.description");
  const [draft, setDraft] = useState<{
    systemPrompt: string;
    userPromptTemplate: string;
  } | null>(null);

  const current = prompts.find((p) => p.context === active) ?? prompts[0];
  const systemValue = draft?.systemPrompt ?? current.systemPrompt;
  const userValue = draft?.userPromptTemplate ?? current.userPromptTemplate;
  const dirty =
    draft !== null &&
    (draft.systemPrompt !== current.systemPrompt ||
      draft.userPromptTemplate !== current.userPromptTemplate);

  const selectContext = (ctx: EditorAiContextId) => {
    setActive(ctx);
    setDraft(null);
  };

  const handleSave = () => {
    if (!draft) return;
    updatePrompt(active, {
      systemPrompt: draft.systemPrompt,
      userPromptTemplate: draft.userPromptTemplate,
    });
    setDraft(null);
    toast.success("Prompt saved — Preset button will use this template");
  };

  const handleSaveConnection = async (id: string, testConnect: boolean) => {
    const connection = connections.find((c) => c.id === id);
    if (!connection) return;
    setSavingId(id);
    try {
      const apiKey = draftKeys[id];
      const baseUrl = draftUrls[id] ?? connection.baseUrl;
      await updateAiConnection(id, {
        apiKey: apiKey || undefined,
        baseUrl: connection.providerId === "local" ? baseUrl : undefined,
        testConnect,
      });
      await refetchConnections();
      if (apiKey) {
        setDraftKeys((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
      toast.success(testConnect ? "Connected and saved to database" : "API connection saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save connection");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <SettingsLayerNav />

      <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-4 dark:border-violet-900/50 dark:bg-violet-950/20">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="page-subtitle">MoharazNX › System › Settings › AI</p>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600" />
              <h1 className="page-title">AI Settings</h1>
            </div>
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
              Editor pre-prompts (Preset বাটন), provider config, এবং admin-এ AI কোথায় পাবেন — সব
              এখানে।
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/ai-os">Open AI OS →</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-input bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-violet-600" />
              <h2 className="text-sm font-semibold">API &amp; Database Connections</h2>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Provider API keys PostgreSQL-এ save হয়। Connect বাটন credentials validate করে status update
              করে।
            </p>
          </div>
          <ApiConnectionBadge
            loading={connectionsLoading || dbLoading}
            error={connectionsError ?? dbError}
            productCount={connectedCount}
          />
        </div>

        <div className="mt-3 rounded-md border border-input bg-muted/20 p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Database className="h-4 w-4 text-emerald-600" />
            <span className="font-medium">PostgreSQL</span>
            {dbLoading ? (
              <span className="text-muted-foreground">Checking…</span>
            ) : dbError ? (
              <Badge variant="warning">Disconnected</Badge>
            ) : dbConnection?.ok ? (
              <>
                <Badge variant="success">Connected</Badge>
                <span className="text-muted-foreground">
                  {dbConnection.host} · {dbConnection.database}
                </span>
                {dbConnection.version && (
                  <span className="hidden text-muted-foreground sm:inline">
                    · {dbConnection.version.split(" on ")[0]}
                  </span>
                )}
              </>
            ) : (
              <Badge variant="warning">Disconnected</Badge>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {connectionsLoading ? (
            <p className="text-xs text-muted-foreground">Loading provider connections…</p>
          ) : connectionsError ? (
            <p className="text-xs text-destructive">{connectionsError}</p>
          ) : (
            connections.map((connection) => (
              <div key={connection.id} className="rounded-md border border-input p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{connection.providerName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {connection.apiKeySet
                        ? `Key saved ${connection.apiKeyHint}`
                        : "No API key saved yet"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      connection.status === "connected"
                        ? "success"
                        : connection.status === "error"
                          ? "warning"
                          : "muted"
                    }
                  >
                    {connection.status}
                  </Badge>
                </div>

                {connection.providerId === "local" ? (
                  <div className="mt-3">
                    <Label className="text-xs">Base URL</Label>
                    <Input
                      value={draftUrls[connection.id] ?? connection.baseUrl}
                      onChange={(e) =>
                        setDraftUrls((prev) => ({ ...prev, [connection.id]: e.target.value }))
                      }
                      placeholder="http://127.0.0.1:11434"
                      className="mt-1 h-8 text-xs"
                      disabled={!canWrite}
                    />
                  </div>
                ) : (
                  <div className="mt-3">
                    <Label className="text-xs">API Key</Label>
                    <Input
                      type="password"
                      value={draftKeys[connection.id] ?? ""}
                      onChange={(e) =>
                        setDraftKeys((prev) => ({ ...prev, [connection.id]: e.target.value }))
                      }
                      placeholder={connection.apiKeySet ? "Enter new key to replace" : "sk-…"}
                      className="mt-1 h-8 text-xs"
                      disabled={!canWrite}
                    />
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    disabled={!canWrite || savingId === connection.id}
                    onClick={() => void handleSaveConnection(connection.id, false)}
                  >
                    <Save className="mr-1 h-3 w-3" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs"
                    disabled={!canWrite || savingId === connection.id}
                    onClick={() => void handleSaveConnection(connection.id, true)}
                  >
                    <Link2 className="mr-1 h-3 w-3" />
                    Connect
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-lg border border-input bg-muted/20 p-3">
        <p className="text-xs font-medium">Admin-এ AI কোথায় পাবেন</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {WHERE_TO_FIND.map((item) => (
            <div key={item.title} className="rounded-md border border-input bg-card p-3">
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-violet-600" />
                <p className="text-xs font-semibold">{item.title}</p>
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">{item.path}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Editor prompts
          </p>
          {(Object.keys(CONTEXT_LABELS) as EditorAiContextId[]).map((ctx) => (
            <button
              key={ctx}
              type="button"
              onClick={() => selectContext(ctx)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-xs transition-colors",
                active === ctx
                  ? "bg-violet-100 font-medium text-violet-900 dark:bg-violet-950/50 dark:text-violet-200"
                  : "text-muted-foreground hover:bg-muted/50",
              )}
            >
              {CONTEXT_LABELS[ctx]}
              {active === ctx && (
                <Badge variant="secondary" className="text-[9px]">
                  Preset
                </Badge>
              )}
            </button>
          ))}
        </nav>

        <div className="rounded-lg border border-input bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">{CONTEXT_LABELS[active]}</h2>
              <p className="text-[11px] text-muted-foreground">
                Product editor-এর <strong>Preset</strong> (✨) বাটন এই prompt ব্যবহার করে।
              </p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  resetPrompt(active);
                  setDraft(null);
                  toast.success("Reset to default");
                }}
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Reset
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs"
                disabled={!dirty}
                onClick={handleSave}
              >
                <Save className="mr-1 h-3 w-3" />
                Save prompt
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <Label className="text-xs">System prompt</Label>
              <Textarea
                value={systemValue}
                onChange={(e) =>
                  setDraft((d) => ({
                    systemPrompt: e.target.value,
                    userPromptTemplate: d?.userPromptTemplate ?? current.userPromptTemplate,
                  }))
                }
                rows={4}
                className="mt-1 font-mono text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">
                User prompt template{" "}
                <span className="font-normal text-muted-foreground">
                  (variables: {"{{product_name}}"}, {"{{category}}"}, …)
                </span>
              </Label>
              <Textarea
                value={userValue}
                onChange={(e) =>
                  setDraft((d) => ({
                    systemPrompt: d?.systemPrompt ?? current.systemPrompt,
                    userPromptTemplate: e.target.value,
                  }))
                }
                rows={4}
                className="mt-1 font-mono text-xs"
              />
            </div>
          </div>

          <p className="mt-3 text-[10px] text-muted-foreground">
            Default templates: {EDITOR_AI_PRE_PROMPTS.length} contexts seeded. Changes persist in
            browser (prototype).
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => { resetAll(); setDraft(null); toast.success("All prompts reset"); }}>
          Reset all prompts
        </Button>
      </div>
    </div>
  );
}
