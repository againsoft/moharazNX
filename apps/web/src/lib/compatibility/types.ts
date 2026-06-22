/** Compatibility rule engine types — IF / THEN / ELSE */

export const COMPATIBILITY_OPERATORS = [
  "equals",
  "not_equals",
  "contains",
  "greater_than",
  "less_than",
] as const;

export type CompatibilityOperator = (typeof COMPATIBILITY_OPERATORS)[number];

export const COMPATIBILITY_STATUSES = ["compatible", "warning", "incompatible"] as const;

export type CompatibilityStatus = (typeof COMPATIBILITY_STATUSES)[number];

export const OPERATOR_LABELS: Record<CompatibilityOperator, string> = {
  equals: "equals",
  not_equals: "not equals",
  contains: "contains",
  greater_than: "greater than",
  less_than: "less than",
};

export const STATUS_LABELS: Record<CompatibilityStatus, string> = {
  compatible: "Compatible",
  warning: "Warning",
  incompatible: "Incompatible",
};

/** Reference to a component attribute: Profile.fieldCode */
export type AttributeRef = {
  profileId: string;
  fieldCode: string;
};

export type ConditionOperand =
  | AttributeRef
  | { literal: string | number | boolean };

export type CompatibilityCondition = {
  id: string;
  left: AttributeRef;
  operator: CompatibilityOperator;
  right: ConditionOperand;
};

export type CompatibilityOutcome = {
  status: CompatibilityStatus;
  message: string;
};

/** IF conditions (AND) → THEN → ELSE */
export type CompatibilityRuleBody = {
  conditions: CompatibilityCondition[];
  then: CompatibilityOutcome;
  else: CompatibilityOutcome;
};

export type CompatibilityRule = {
  id: string;
  name: string;
  code: string;
  configuratorProfileId: string;
  configuratorProfileName: string;
  description?: string;
  priority: number;
  active: boolean;
  body: CompatibilityRuleBody;
  updatedAt: string;
};

/** Component in a build with resolved attribute values */
export type BuildComponentContext = {
  componentProfileId: string;
  componentName?: string;
  productId?: string;
  attributes: Record<string, string | number | boolean>;
};

export type RuleEvaluationResult = {
  ruleId: string;
  ruleName: string;
  matched: boolean;
  status: CompatibilityStatus;
  message: string;
  branch: "then" | "else";
};

export type CompatibilityEvaluationResult = {
  status: CompatibilityStatus;
  results: RuleEvaluationResult[];
  evaluatedAt: string;
  cached: boolean;
};

export function describeCondition(cond: CompatibilityCondition, profileNames: Map<string, string>): string {
  const left = `${profileNames.get(cond.left.profileId) ?? cond.left.profileId}.${cond.left.fieldCode}`;
  const op = OPERATOR_LABELS[cond.operator];
  const right =
    "literal" in cond.right
      ? String(cond.right.literal)
      : `${profileNames.get(cond.right.profileId) ?? cond.right.profileId}.${cond.right.fieldCode}`;
  return `${left} ${op} ${right}`;
}

export function describeRuleBody(
  body: CompatibilityRuleBody,
  profileNames: Map<string, string>,
): string {
  const when = body.conditions.map((c) => describeCondition(c, profileNames)).join(" AND ");
  return `IF ${when} → ${body.then.status.toUpperCase()} ELSE ${body.else.status.toUpperCase()}`;
}

/** Worst status wins: incompatible > warning > compatible */
export function mergeStatuses(statuses: CompatibilityStatus[]): CompatibilityStatus {
  if (statuses.includes("incompatible")) return "incompatible";
  if (statuses.includes("warning")) return "warning";
  return "compatible";
}
