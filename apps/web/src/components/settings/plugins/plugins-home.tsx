"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, Package, Puzzle, Search } from "lucide-react";
import { PLUGIN_CATEGORIES, PLUGIN_REGISTRY } from "@/lib/settings/plugins/registry";
import { usePluginsStore } from "@/lib/store/plugins-store";
import { SettingsLayerNav } from "@/components/settings/settings-layer-nav";
import { PluginBrandMark } from "@/components/settings/plugins/plugin-field-row";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PluginsHome() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "installed" | "available">("all");
  const plugins = usePluginsStore((s) => s.plugins);
  const installPlugin = usePluginsStore((s) => s.installPlugin);

  const installedCount = PLUGIN_REGISTRY.filter((p) => plugins[p.id]?.installed).length;

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return PLUGIN_REGISTRY.filter((plugin) => {
      const state = plugins[plugin.id];
      if (filter === "installed" && !state?.installed) return false;
      if (filter === "available" && state?.installed) return false;
      if (!q) return true;
      return (
        plugin.name.toLowerCase().includes(q) ||
        plugin.description.toLowerCase().includes(q) ||
        plugin.category.includes(q) ||
        PLUGIN_CATEGORIES[plugin.category].label.toLowerCase().includes(q)
      );
    });
  }, [query, filter, plugins]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof PLUGIN_REGISTRY>();
    for (const plugin of filtered) {
      const list = map.get(plugin.category) ?? [];
      list.push(plugin);
      map.set(plugin.category, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="space-y-5">
      <SettingsLayerNav />

      <div className="settings-hero relative overflow-hidden rounded-2xl border border-input bg-card shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/8 via-transparent to-primary/5" />
        <div className="relative flex flex-col gap-4 p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
          <div>
            <Link
              href="/settings"
              className="page-subtitle hover:text-foreground"
            >
              MoharazNX › System › Settings › Plugins
            </Link>
            <div className="mt-1 flex items-center gap-2">
              <Puzzle className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold tracking-tight">Plugins</h1>
            </div>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
              Add external integrations — shipping couriers, payment gateways, WhatsApp, and more.
              Install a plugin, then open it to configure API keys and automation rules.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatPill label="Available" value={String(PLUGIN_REGISTRY.length)} />
              <StatPill label="Installed" value={String(installedCount)} />
            </div>
          </div>
          <div className="relative w-full max-w-md shrink-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plugins… e.g. Pathao, bKash"
              className="h-10 border-input/80 bg-background/90 pl-9 text-sm shadow-sm backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "installed", "available"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              filter === tab
                ? "border-primary bg-primary/10 text-primary"
                : "border-input text-muted-foreground hover:bg-muted/50",
            )}
          >
            {tab === "all" ? "All Plugins" : tab === "installed" ? "Installed" : "Available"}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-xl border border-dashed py-12 text-center">
          <Package className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">No plugins match your search</p>
        </div>
      ) : (
        grouped.map(([category, list]) => (
          <section key={category}>
            <div className="mb-3">
              <h2 className="text-sm font-semibold">{PLUGIN_CATEGORIES[category as keyof typeof PLUGIN_CATEGORIES].label}</h2>
              <p className="text-[11px] text-muted-foreground">
                {PLUGIN_CATEGORIES[category as keyof typeof PLUGIN_CATEGORIES].description}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((plugin) => {
                const state = plugins[plugin.id];
                const installed = Boolean(state?.installed);
                const enabled = Boolean(state?.enabled);

                return (
                  <div
                    key={plugin.id}
                    className="group flex flex-col rounded-xl border border-input bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <PluginBrandMark name={plugin.name} color={plugin.brandColor} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-sm">{plugin.name}</p>
                          {installed ? (
                            <Badge variant={enabled ? "success" : "muted"}>{enabled ? "Active" : "Disabled"}</Badge>
                          ) : (
                            <Badge variant="outline">Not installed</Badge>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                          {plugin.description}
                        </p>
                        <p className="mt-2 text-[10px] text-muted-foreground">
                          v{plugin.version} · {plugin.author}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2 border-t border-input/60 pt-3">
                      {installed ? (
                        <Button size="sm" className="flex-1" asChild>
                          <Link href={`/settings/plugins/${plugin.id}`}>
                            Configure <ArrowRight className="ml-1 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => installPlugin(plugin.id)}
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Install
                        </Button>
                      )}
                      {plugin.website && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={plugin.website} target="_blank" rel="noreferrer">
                            Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-input bg-background/80 px-2.5 py-1 text-[10px]">
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}
