"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Puzzle,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react";
import type { SettingCategoryDef } from "@/lib/settings/types";
import { BUSINESS_SETTINGS_CATEGORIES } from "@/lib/settings/settings-schema";
import {
  BUSINESS_CATEGORY_GROUPS,
  BUSINESS_CATEGORY_THEME,
} from "@/lib/settings/settings-config";
import { PLUGIN_REGISTRY } from "@/lib/settings/plugins/registry";
import { useSettingsStore } from "@/lib/store/settings-store";
import { usePluginsStore } from "@/lib/store/plugins-store";
import { SettingsLayerNav } from "@/components/settings/settings-layer-nav";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function BusinessSettingsHome() {
  const [query, setQuery] = useState("");
  const history = useSettingsStore((s) => s.history);
  const plugins = usePluginsStore((s) => s.plugins);
  const installedPluginCount = PLUGIN_REGISTRY.filter((p) => plugins[p.id]?.installed).length;

  const filteredGroups = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return BUSINESS_CATEGORY_GROUPS;

    return BUSINESS_CATEGORY_GROUPS.map((group) => ({
      ...group,
      categoryIds: group.categoryIds.filter((id) => {
        const cat = BUSINESS_SETTINGS_CATEGORIES.find((c) => c.id === id);
        if (!cat) return false;
        return (
          cat.title.toLowerCase().includes(q) ||
          cat.description.toLowerCase().includes(q) ||
          cat.id.includes(q)
        );
      }),
    })).filter((g) => g.categoryIds.length > 0);
  }, [query]);

  const totalSettings = useMemo(
    () =>
      BUSINESS_SETTINGS_CATEGORIES.reduce(
        (n, c) => n + c.sections.reduce((s, sec) => s + sec.groups.reduce((g, grp) => g + grp.items.length, 0), 0),
        0,
      ),
    [],
  );

  const recentChanges = history.slice(0, 5);

  return (
    <div className="space-y-5">
      <SettingsLayerNav />

      <div className="settings-hero relative overflow-hidden rounded-2xl border border-input bg-card shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-violet-500/5" />
        <div className="relative flex flex-col gap-4 p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
          <div>
            <p className="page-subtitle">MoharazNX › System › Settings › Business</p>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight">Business Settings</h1>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
              Daily store configuration — identity, catalog, checkout, payments, and notifications.
              Changes are tracked with full audit history.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatPill label="Categories" value={String(BUSINESS_SETTINGS_CATEGORIES.length)} />
              <StatPill label="Settings" value={String(totalSettings)} />
              <StatPill label="Plugins" value={String(installedPluginCount)} />
              <StatPill label="Recent changes" value={String(history.length)} />
            </div>
          </div>
          <div className="relative w-full max-w-md shrink-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search settings…"
              className="h-10 border-input/80 bg-background/90 pl-9 text-sm shadow-sm backdrop-blur-sm"
            />
            <p className="mt-1.5 text-[10px] text-muted-foreground">Try &quot;checkout&quot;, &quot;payments&quot;, or &quot;SEO&quot;</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <AiEntryCard />
        <PluginsEntryCard installedCount={installedPluginCount} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <section key={group.id}>
              <div className="mb-3 flex items-end justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold">{group.title}</h2>
                  <p className="text-[11px] text-muted-foreground">{group.description}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{group.categoryIds.length} areas</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                {group.categoryIds.map((id) => {
                  const category = BUSINESS_SETTINGS_CATEGORIES.find((c) => c.id === id);
                  if (!category) return null;
                  return <BusinessCategoryCard key={id} category={category} />;
                })}
              </div>
            </section>
          ))}

          {filteredGroups.length === 0 && (
            <div className="rounded-xl border border-dashed border-input py-12 text-center">
              <p className="text-sm font-medium">No settings match your search</p>
              <p className="mt-1 text-xs text-muted-foreground">Try a different keyword or clear the search box</p>
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <div className="rounded-xl border border-input bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent Changes</h3>
            </div>
            {recentChanges.length === 0 ? (
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                No changes yet. Open a category and save a setting to see audit entries here.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {recentChanges.map((h) => (
                  <li key={h.id} className="rounded-lg border border-input/60 bg-muted/20 px-2.5 py-2">
                    <p className="text-[11px] font-medium leading-snug">{h.label}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {String(h.oldValue)} → <span className="font-medium text-foreground">{String(h.newValue)}</span>
                    </p>
                    <p className="mt-1 text-[9px] text-muted-foreground">
                      {h.changedBy} · {new Date(h.at).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-dashed border-primary/25 bg-primary/5 p-4">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-semibold">Activity & Audit</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Every category supports comments, notes, attachments, and change history per the platform architecture.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function AiEntryCard() {
  return (
    <Link
      href="/settings/ai"
      className="group flex items-center justify-between gap-4 rounded-2xl border border-violet-200/80 bg-gradient-to-r from-violet-50/80 via-card to-card p-4 shadow-sm transition-all hover:border-violet-300 hover:shadow-md dark:border-violet-900/50 dark:from-violet-950/30"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-violet-100 p-2.5 dark:bg-violet-950/60">
          <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-semibold">AI Settings</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Editor prompts (Preset), কোথায় AI পাবেন, AI OS লিংক
          </p>
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-medium text-violet-600 opacity-80 transition-opacity group-hover:opacity-100 dark:text-violet-400">
        Open <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}

function PluginsEntryCard({ installedCount }: { installedCount: number }) {
  return (
    <Link
      href="/settings/plugins"
      className="group flex items-center justify-between gap-4 rounded-2xl border border-violet-200/80 bg-gradient-to-r from-violet-50/80 via-card to-card p-4 shadow-sm transition-all hover:border-violet-300 hover:shadow-md dark:border-violet-900/50 dark:from-violet-950/30"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-violet-100 p-2.5 dark:bg-violet-950/60">
          <Puzzle className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <p className="font-semibold text-sm">Plugins & Integrations</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Pathao, bKash, Steadfast, WhatsApp — install and configure external services
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-full border border-input bg-background px-2.5 py-1 text-[10px]">
          <span className="font-semibold">{installedCount}</span> installed
        </span>
        <span className="inline-flex items-center gap-0.5 text-xs font-medium text-violet-600 opacity-80 transition-opacity group-hover:opacity-100 dark:text-violet-400">
          Open <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
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

function BusinessCategoryCard({ category }: { category: SettingCategoryDef }) {
  const theme = BUSINESS_CATEGORY_THEME[category.id];
  const Icon = theme?.icon ?? Settings2;
  const sectionCount = category.sections.length;
  const itemCount = category.sections.reduce(
    (n, s) => n + s.groups.reduce((m, g) => m + g.items.length, 0),
    0,
  );

  return (
    <Link
      href={`/settings/${category.id}`}
      className={cn(
        "settings-category-card group relative flex flex-col rounded-xl border border-input bg-card p-4 shadow-sm transition-all",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
        theme?.ring,
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("rounded-xl p-2.5 transition-transform group-hover:scale-105", theme?.iconBg)}>
          <Icon className={cn("h-5 w-5", theme?.accent)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm">{category.title}</p>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {category.description}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-input/60 pt-3">
        <p className="text-[10px] text-muted-foreground">
          {sectionCount} section{sectionCount !== 1 ? "s" : ""} · {itemCount} setting{itemCount !== 1 ? "s" : ""}
        </p>
        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Configure <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
