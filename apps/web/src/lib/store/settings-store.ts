import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SettingValue, SettingsChangeLog, SettingsLayer } from "@/lib/settings/types";
import {
  buildDefaultValues,
  BUSINESS_SETTINGS_CATEGORIES,
  PLATFORM_SETTINGS_CATEGORIES,
  WORKSPACE_SETTINGS_CATEGORIES,
} from "@/lib/settings/settings-schema";

type SettingsStore = {
  values: Record<string, SettingValue>;
  history: SettingsChangeLog[];
  setValue: (key: string, value: SettingValue, meta: { label: string; reason?: string }) => void;
  resetCategory: (keys: string[]) => void;
  getValue: (key: string) => SettingValue | undefined;
};

const defaults = {
  ...buildDefaultValues(BUSINESS_SETTINGS_CATEGORIES),
  ...buildDefaultValues(WORKSPACE_SETTINGS_CATEGORIES),
  ...buildDefaultValues(PLATFORM_SETTINGS_CATEGORIES),
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      values: defaults,
      history: [],
      getValue: (key) => get().values[key],
      setValue: (key, value, meta) => {
        const oldValue = get().values[key];
        if (oldValue === value) return;
        set((s) => ({
          values: { ...s.values, [key]: value },
          history: [
            {
              id: `sch_${Date.now()}`,
              key,
              label: meta.label,
              oldValue: oldValue ?? "",
              newValue: value,
              changedBy: "Admin",
              at: new Date().toISOString(),
              reason: meta.reason,
            },
            ...s.history,
          ].slice(0, 200),
        }));
      },
      resetCategory: (keys) =>
        set((s) => {
          const next = { ...s.values };
          for (const k of keys) {
            if (k in defaults) next[k] = defaults[k];
          }
          return { values: next };
        }),
    }),
    { name: "again-settings-v1" },
  ),
);

export function layerFromPath(path: string): SettingsLayer | null {
  if (path.startsWith("/settings")) return "business";
  if (path.startsWith("/workspace")) return "workspace";
  if (path.startsWith("/control-center")) return "platform";
  return null;
}
