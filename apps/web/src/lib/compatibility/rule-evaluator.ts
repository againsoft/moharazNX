import type {
  AttributeRef,
  BuildComponentContext,
  CompatibilityCondition,
  CompatibilityEvaluationResult,
  CompatibilityOperator,
  CompatibilityOutcome,
  CompatibilityRule,
  CompatibilityRuleBody,
  CompatibilityStatus,
  ConditionOperand,
  RuleEvaluationResult,
} from "@/lib/compatibility/types";
import { mergeStatuses } from "@/lib/compatibility/types";

function resolveAttributeRef(
  ref: AttributeRef,
  components: BuildComponentContext[],
): string | number | boolean | null {
  const comp = components.find((c) => c.componentProfileId === ref.profileId);
  if (!comp) return null;
  const val = comp.attributes[ref.fieldCode];
  return val === undefined ? null : val;
}

function resolveOperand(
  operand: ConditionOperand,
  components: BuildComponentContext[],
): string | number | boolean | null {
  if ("literal" in operand) return operand.literal;
  return resolveAttributeRef(operand, components);
}

function compareValues(
  left: string | number | boolean | null,
  operator: CompatibilityOperator,
  right: string | number | boolean | null,
): boolean {
  if (left === null || right === null) return false;

  switch (operator) {
    case "equals":
      return String(left) === String(right);
    case "not_equals":
      return String(left) !== String(right);
    case "contains":
      return String(left).toLowerCase().includes(String(right).toLowerCase());
    case "greater_than": {
      const l = Number(left);
      const r = Number(right);
      return !Number.isNaN(l) && !Number.isNaN(r) && l > r;
    }
    case "less_than": {
      const l = Number(left);
      const r = Number(right);
      return !Number.isNaN(l) && !Number.isNaN(r) && l < r;
    }
    default:
      return false;
  }
}

export function evaluateCondition(
  condition: CompatibilityCondition,
  components: BuildComponentContext[],
): boolean {
  const left = resolveAttributeRef(condition.left, components);
  const right = resolveOperand(condition.right, components);
  return compareValues(left, condition.operator, right);
}

export function evaluateRuleBody(
  body: CompatibilityRuleBody,
  components: BuildComponentContext[],
): { matched: boolean; outcome: CompatibilityOutcome; branch: "then" | "else" } {
  const matched =
    body.conditions.length === 0 ||
    body.conditions.every((c) => evaluateCondition(c, components));

  if (matched) {
    return { matched: true, outcome: body.then, branch: "then" };
  }
  return { matched: false, outcome: body.else, branch: "else" };
}

export function evaluateCompatibilityRules(
  rules: CompatibilityRule[],
  components: BuildComponentContext[],
  configuratorProfileId?: string,
): CompatibilityEvaluationResult {
  const active = rules
    .filter((r) => r.active)
    .filter((r) => !configuratorProfileId || r.configuratorProfileId === configuratorProfileId)
    .sort((a, b) => a.priority - b.priority);

  const results: RuleEvaluationResult[] = active.map((rule) => {
    const { matched, outcome, branch } = evaluateRuleBody(rule.body, components);
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      matched,
      status: outcome.status,
      message: outcome.message,
      branch,
    };
  });

  const status = mergeStatuses(results.map((r) => r.status));

  return {
    status,
    results,
    evaluatedAt: new Date().toISOString(),
    cached: false,
  };
}
