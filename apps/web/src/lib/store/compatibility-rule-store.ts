import { create } from "zustand";
import { persist } from "zustand/middleware";
import { evaluateCompatibilityRules } from "@/lib/compatibility/rule-evaluator";
import { evaluateWithCache, compatibilityCache } from "@/lib/compatibility/compatibility-cache";
import type {
  BuildComponentContext,
  CompatibilityEvaluationResult,
  CompatibilityRule,
  CompatibilityRuleBody,
} from "@/lib/compatibility/types";
import {
  compatibilityRulesSeed,
  slugifyRuleCode,
} from "@/lib/mock-data/compatibility-rules";

type State = {
  rules: CompatibilityRule[];
  getRuleById: (id: string) => CompatibilityRule | undefined;
  listByConfigurator: (configuratorProfileId: string) => CompatibilityRule[];
  upsertRule: (
    data: Partial<CompatibilityRule> & {
      id?: string;
      name: string;
      configuratorProfileId: string;
      configuratorProfileName: string;
      body: CompatibilityRuleBody;
    },
  ) => string;
  deleteRule: (id: string) => void;
  duplicateRule: (id: string) => string | null;
  evaluateBuild: (
    configuratorProfileId: string,
    components: BuildComponentContext[],
  ) => CompatibilityEvaluationResult;
  invalidateCache: (configuratorProfileId?: string) => void;
};

export const useCompatibilityRuleStore = create<State>()(
  persist(
    (set, get) => ({
      rules: compatibilityRulesSeed,

      getRuleById: (id) => get().rules.find((r) => r.id === id),

      listByConfigurator: (configuratorProfileId) =>
        get()
          .rules.filter((r) => r.configuratorProfileId === configuratorProfileId)
          .sort((a, b) => a.priority - b.priority),

      upsertRule: (data) => {
        const id = data.id ?? `cr_${Date.now().toString(36)}`;
        const existing = get().rules.find((r) => r.id === id);
        const rule: CompatibilityRule = {
          id,
          name: data.name,
          code: data.code ?? existing?.code ?? slugifyRuleCode(data.name),
          configuratorProfileId: data.configuratorProfileId,
          configuratorProfileName: data.configuratorProfileName,
          description: data.description ?? existing?.description,
          priority: data.priority ?? existing?.priority ?? 10,
          active: data.active ?? existing?.active ?? true,
          body: data.body,
          updatedAt: new Date().toISOString().slice(0, 10),
        };

        set((state) => ({
          rules: existing
            ? state.rules.map((r) => (r.id === id ? rule : r))
            : [rule, ...state.rules],
        }));

        compatibilityCache.invalidate(data.configuratorProfileId);
        return id;
      },

      deleteRule: (id) => {
        const rule = get().rules.find((r) => r.id === id);
        set((state) => ({ rules: state.rules.filter((r) => r.id !== id) }));
        if (rule) compatibilityCache.invalidate(rule.configuratorProfileId);
      },

      duplicateRule: (id) => {
        const source = get().rules.find((r) => r.id === id);
        if (!source) return null;
        const newId = `cr_${Date.now().toString(36)}`;
        const copy: CompatibilityRule = {
          ...source,
          id: newId,
          name: `${source.name} (copy)`,
          code: `${source.code}_copy`,
          active: false,
          body: {
            ...source.body,
            conditions: source.body.conditions.map((c) => ({ ...c, id: `${c.id}_copy` })),
          },
          updatedAt: new Date().toISOString().slice(0, 10),
        };
        set((state) => ({ rules: [copy, ...state.rules] }));
        return newId;
      },

      evaluateBuild: (configuratorProfileId, components) => {
        return evaluateWithCache(configuratorProfileId, components, () =>
          evaluateCompatibilityRules(get().rules, components, configuratorProfileId),
        );
      },

      invalidateCache: (configuratorProfileId) => {
        compatibilityCache.invalidate(configuratorProfileId);
      },
    }),
    { name: "againerp-compatibility-rules", version: 1 },
  ),
);
