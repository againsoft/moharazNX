"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, History, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import type { SettingItemDef } from "@/lib/settings/types";
import { findCategory } from "@/lib/settings/settings-schema";
import { BUSINESS_CATEGORY_THEME } from "@/lib/settings/settings-config";
import { useSettingsStore } from "@/lib/store/settings-store";
import { SettingsLayerNav } from "@/components/settings/settings-layer-nav";
import { SettingFieldRow } from "@/components/settings/setting-field-row";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = { categoryId: string };

export function BusinessSettingsCategory({ categoryId }: Props) {
  const category = findCategory("business", categoryId);
  const values = useSettingsStore((s) => s.values);
  const history = useSettingsStore((s) => s.history);
  const setValue = useSettingsStore((s) => s.setValue);
  const resetCategory = useSettingsStore((s) => s.resetCategory);

  const [activeSection, setActiveSection] = useState("");
  const [draft, setDraft] = useState<Record<string, string | boolean | number>>({});
  const [reason, setReason] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const theme = BUSINESS_CATEGORY_THEME[categoryId];
  const Icon = theme?.icon;

  const allKeys = useMemo(() => {
    if (!category) return [] as string[];
    return category.sections.flatMap((s) => s.groups.flatMap((g) => g.items.map((i) => i.key)));
  }, [category]);

  useEffect(() => {
    if (category?.sections[0] && !activeSection) {
      setActiveSection(category.sections[0].id);
    }
  }, [category, activeSection]);

  const current = (item: SettingItemDef) => {
    if (item.key in draft) return draft[item.key];
    return values[item.key] ?? item.defaultValue;
  };

  const patchDraft = (key: string, value: string | boolean | number) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const dirtyCount = Object.keys(draft).length;

  const handleSave = () => {
    if (!category) return;
    const entries = Object.entries(draft);
    if (entries.length === 0) {
      toast.info("No changes to save");
      return;
    }
    for (const [key, value] of entries) {
      const item = category.sections
        .flatMap((s) => s.groups.flatMap((g) => g.items))
        .find((i) => i.key === key);
      if (item) setValue(key, value, { label: item.label, reason: reason || undefined });
    }
    setDraft({});
    setReason("");
    toast.success("Settings saved");
  };

  const handleReset = () => {
    resetCategory(allKeys);
    setDraft({});
    toast.success("Category reset to defaults");
  };

  const categoryHistory = history.filter((h) => allKeys.includes(h.key)).slice(0, 20);
  const activeSectionDef = category?.sections.find((s) => s.id === activeSection);

  if (!category) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm font-medium">Settings category not found</p>
        <Button variant="ghost" size="sm" asChild className="mt-2">
          <Link href="/settings/business">Back to Business Settings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative pb-20">
      <SettingsLayerNav compact />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className={cn("rounded-xl p-2.5", theme.iconBg)}>
              <Icon className={cn("h-5 w-5", theme.accent)} />
            </div>
          )}
          <div>
            <Link
              href="/settings/business"
              className="mb-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Business Settings
            </Link>
            <h1 className="page-title">{category.title}</h1>
            <p className="page-subtitle">{category.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActivityTriggerButton
            entity={{
              type: "settings",
              id: `business:${categoryId}`,
              label: `${category.title} Settings`,
            }}
          />
          <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
            <History className="mr-1.5 h-3.5 w-3.5" /> History
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      {showHistory && (
        <div className="mt-4 rounded-xl border border-input bg-muted/20 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Change History</p>
          {categoryHistory.length === 0 ? (
            <p className="text-xs text-muted-foreground">No changes recorded yet.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {categoryHistory.map((h) => (
                <li key={h.id} className="rounded-lg border border-input bg-card px-3 py-2 text-[11px]">
                  <p className="font-semibold">{h.label}</p>
                  <p className="mt-0.5 text-muted-foreground">
                    <span className="line-through">{String(h.oldValue)}</span>
                    {" → "}
                    <span className="font-medium text-foreground">{String(h.newValue)}</span>
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {h.changedBy} · {new Date(h.at).toLocaleString()}
                    {h.reason ? ` · ${h.reason}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[220px_1fr]">
        <nav className="lg:sticky lg:top-4 lg:self-start">
          <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Sections</p>
          <ul className="space-y-0.5 rounded-xl border border-input bg-card p-1 shadow-sm">
            {category.sections.map((section) => {
              const itemCount = section.groups.reduce((n, g) => n + g.items.length, 0);
              return (
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
                    <span className="text-[10px] tabular-nums opacity-70">{itemCount}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 space-y-4">
          {activeSectionDef && (
            <>
              <div className="rounded-xl border border-input bg-card p-3 shadow-sm">
                <label className="block text-xs font-medium text-muted-foreground">Change reason (optional)</label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Business requirement, seasonal policy…"
                  className="mt-1.5 h-9 text-xs"
                />
              </div>

              {activeSectionDef.groups.map((group) => (
                <div key={group.id} className="overflow-hidden rounded-xl border border-input bg-card shadow-sm">
                  <div className="border-b border-input bg-muted/30 px-4 py-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.title}</p>
                  </div>
                  <div>
                    {group.items.map((item) => (
                      <SettingFieldRow
                        key={item.key}
                        item={item}
                        value={current(item)}
                        dirty={item.key in draft}
                        onChange={(v) => patchDraft(item.key, v)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
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
                <Save className="mr-1.5 h-3.5 w-3.5" /> Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
