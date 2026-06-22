"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  History,
  RotateCcw,
  Save,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { findPlugin, PLUGIN_CATEGORIES } from "@/lib/settings/plugins/registry";
import { usePluginsStore } from "@/lib/store/plugins-store";
import {
  installCloudflarePlugin,
  uninstallCloudflarePlugin,
  updateCloudflarePlugin,
  useCloudflarePlugin,
} from "@/lib/api/use-cloudflare-plugin";
import { SettingsLayerNav } from "@/components/settings/settings-layer-nav";
import { PluginBrandMark, PluginFieldRow } from "@/components/settings/plugins/plugin-field-row";
import { BankEmiBanksPanel } from "@/components/settings/plugins/bank-emi-banks-panel";
import { CloudflareConnectButton } from "@/components/settings/plugins/cloudflare-connect-button";
import { CloudflarePluginPanel } from "@/components/settings/plugins/cloudflare-plugin-panel";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = { pluginId: string };

export function PluginConfigWorkspace({ pluginId }: Props) {
  const plugin = findPlugin(pluginId);
  const pluginState = usePluginsStore((s) => s.plugins[pluginId]);
  const cloudflareState = useCloudflarePlugin();
  const cloudflareApi = pluginId === "cloudflare" ? cloudflareState.plugin : null;
  const history = usePluginsStore((s) => s.history);
  const installPlugin = usePluginsStore((s) => s.installPlugin);
  const uninstallPlugin = usePluginsStore((s) => s.uninstallPlugin);
  const setEnabled = usePluginsStore((s) => s.setEnabled);
  const savePluginConfig = usePluginsStore((s) => s.savePluginConfig);
  const resetPluginConfig = usePluginsStore((s) => s.resetPluginConfig);

  const [activeSection, setActiveSection] = useState("");
  const [draft, setDraft] = useState<Record<string, string | boolean | number>>({});
  const [showHistory, setShowHistory] = useState(false);

  const installed = Boolean(pluginState?.installed);
  const enabled = Boolean(pluginState?.enabled);

  useEffect(() => {
    if (plugin?.sections[0] && !activeSection) {
      setActiveSection(plugin.sections[0].id);
    }
  }, [plugin, activeSection]);

  const current = (key: string, defaultValue: string | boolean | number) => {
    if (key in draft) return draft[key];
    if (pluginState?.config && key in pluginState.config) return pluginState.config[key];
    return defaultValue;
  };

  const patchDraft = (key: string, value: string | boolean | number) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const dirtyCount = Object.keys(draft).length;
  const activeSectionDef = plugin?.sections.find((s) => s.id === activeSection);
  const pluginHistory = history.filter((h) => h.pluginId === pluginId).slice(0, 15);

  const fieldLabels = useMemo(() => {
    if (!plugin) return {};
    const labels: Record<string, string> = {};
    for (const section of plugin.sections) {
      for (const field of section.fields) labels[field.key] = field.label;
    }
    return labels;
  }, [plugin]);

  const handleSave = () => {
    if (!plugin || !installed) return;
    if (dirtyCount === 0) {
      toast.info("No changes to save");
      return;
    }
    savePluginConfig(pluginId, draft, { labels: fieldLabels });
    setDraft({});
    toast.success("Plugin configuration saved");
  };

  const handleReset = () => {
    resetPluginConfig(pluginId);
    setDraft({});
    toast.success("Configuration reset to defaults");
  };

  const handleInstall = () => {
    installPlugin(pluginId);
    if (pluginId === "cloudflare") {
      void installCloudflarePlugin().catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to register Cloudflare plugin");
      });
    }
    toast.success(`${plugin?.name} installed`);
  };

  const handleUninstall = () => {
    uninstallPlugin(pluginId);
    if (pluginId === "cloudflare") {
      void uninstallCloudflarePlugin().catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to uninstall Cloudflare plugin");
      });
    }
    setDraft({});
    toast.success(`${plugin?.name} uninstalled`);
  };

  if (!plugin) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm font-medium">Plugin not found</p>
        <Button variant="ghost" size="sm" asChild className="mt-2">
          <Link href="/settings/plugins">Back to Plugins</Link>
        </Button>
      </div>
    );
  }

  if (!installed) {
    return (
      <div className="space-y-5">
        <SettingsLayerNav compact />
        <div className="rounded-xl border border-dashed border-input bg-muted/20 p-8 text-center">
          <PluginBrandMark name={plugin.name} color={plugin.brandColor} />
          <h1 className="mt-4 page-title">{plugin.name}</h1>
          <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">{plugin.longDescription ?? plugin.description}</p>
          <div className="mt-4 flex justify-center gap-2">
            <Badge variant="outline">{PLUGIN_CATEGORIES[plugin.category].label}</Badge>
            <Badge variant="muted">v{plugin.version}</Badge>
          </div>
          {pluginId === "cloudflare" ? (
            <div className="mx-auto mt-6 max-w-sm">
              <CloudflareConnectButton
                oauthAvailable={cloudflareApi?.oauthAvailable ?? false}
                size="default"
              />
              <p className="mt-4 text-[11px] text-muted-foreground">অথবা আগে plugin install করুন</p>
            </div>
          ) : null}
          <Button className={pluginId === "cloudflare" ? "mt-3" : "mt-6"} onClick={handleInstall}>
            Install Plugin
          </Button>
          <p className="mt-3">
            <Link href="/settings/plugins" className="text-xs text-muted-foreground hover:text-foreground">
              ← Back to all plugins
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pb-20">
      <SettingsLayerNav compact />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <PluginBrandMark name={plugin.name} color={plugin.brandColor} />
          <div>
            <Link
              href="/settings/plugins"
              className="mb-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Plugins
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="page-title">{plugin.name}</h1>
              <Badge variant={enabled ? "success" : "muted"}>{enabled ? "Active" : "Disabled"}</Badge>
            </div>
            <p className="page-subtitle">{plugin.description}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {PLUGIN_CATEGORIES[plugin.category].label} · v{plugin.version} · {plugin.author}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {pluginId === "cloudflare" && (
            <CloudflareConnectButton
              oauthAvailable={cloudflareApi?.oauthAvailable ?? false}
              connected={cloudflareApi?.accountStatus === "connected"}
            />
          )}
          <ActivityTriggerButton
            entity={{
              type: "settings",
              id: `plugin:${pluginId}`,
              label: `${plugin.name} Plugin`,
            }}
          />
          {plugin.docsUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={plugin.docsUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Docs
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
            <History className="mr-1.5 h-3.5 w-3.5" /> History
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
          </Button>
          <Button variant="outline" size="sm" onClick={handleUninstall}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Uninstall
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-input bg-card px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Zap className={cn("h-4 w-4", enabled ? "text-emerald-500" : "text-muted-foreground")} />
          <div>
            <p className="text-sm font-medium">Plugin Status</p>
            <p className="text-[11px] text-muted-foreground">
              {enabled ? "Integration is active and processing orders" : "Plugin is installed but disabled"}
            </p>
          </div>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2">
          <span className="text-xs text-muted-foreground">{enabled ? "Enabled" : "Disabled"}</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => {
              const next = e.target.checked;
              setEnabled(pluginId, next);
              if (pluginId === "cloudflare") {
                void updateCloudflarePlugin({ enabled: next }).catch((err) => {
                  toast.error(err instanceof Error ? err.message : "Failed to update plugin status");
                });
              }
              toast.success(next ? "Plugin enabled" : "Plugin disabled");
            }}
            className="h-4 w-4 rounded border-input"
          />
        </label>
      </div>

      {showHistory && (
        <div className="mt-4 rounded-xl border border-input bg-muted/20 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Change History</p>
          {pluginHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground">No configuration changes yet.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {pluginHistory.map((h) => (
                <li key={h.id} className="rounded-lg border border-input bg-card px-3 py-2 text-[11px]">
                  <p className="font-semibold">{h.label}</p>
                  <p className="mt-0.5 text-muted-foreground">
                    <span className="line-through">{String(h.oldValue)}</span>
                    {" → "}
                    <span className="font-medium text-foreground">{String(h.newValue)}</span>
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {h.changedBy} · {new Date(h.at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[220px_1fr]">
        <nav className="lg:sticky lg:top-4 lg:self-start">
          <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Configuration
          </p>
          <ul className="space-y-0.5 rounded-xl border border-input bg-card p-1 shadow-sm">
            {plugin.sections.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs transition-colors",
                    activeSection === section.id
                      ? "bg-primary/10 font-semibold text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <span>{section.title}</span>
                  <span className="text-[10px] tabular-nums opacity-70">{section.fields.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-4">
          {pluginId === "bank-emi" && activeSection === "banks" ? (
            <BankEmiBanksPanel pluginId={pluginId} />
          ) : pluginId === "cloudflare" ? (
            <CloudflarePluginPanel activeSection={activeSection as "account" | "media" | "r2" | "images"} />
          ) : (
            activeSectionDef && (
            <div className="overflow-hidden rounded-xl border border-input bg-card shadow-sm">
              <div className="border-b border-input bg-muted/30 px-4 py-3">
                <p className="text-sm font-semibold">{activeSectionDef.title}</p>
                {activeSectionDef.description && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{activeSectionDef.description}</p>
                )}
              </div>
              <div>
                {activeSectionDef.fields.map((field) => (
                  <PluginFieldRow
                    key={field.key}
                    field={field}
                    value={current(field.key, field.defaultValue)}
                    dirty={field.key in draft}
                    onChange={(v) => patchDraft(field.key, v)}
                  />
                ))}
              </div>
            </div>
            )
          )}
        </div>
      </div>

      {dirtyCount > 0 && (
        <div className="settings-save-bar print-hide fixed inset-x-0 bottom-0 z-40 border-t border-input bg-card/95 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{dirtyCount}</span> unsaved change
              {dirtyCount !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setDraft({})}>
                Discard
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-1.5 h-3.5 w-3.5" /> Save Configuration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
