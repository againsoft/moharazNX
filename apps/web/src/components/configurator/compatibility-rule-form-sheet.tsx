"use client";

import { useEffect, useMemo, useState } from "react";
import { GitBranch, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  COMPATIBILITY_OPERATORS,
  COMPATIBILITY_STATUSES,
  OPERATOR_LABELS,
  STATUS_LABELS,
  type AttributeRef,
  type CompatibilityCondition,
  type CompatibilityRule,
  type CompatibilityRuleBody,
} from "@/lib/compatibility/types";
import { CONFIGURATOR_BUILDER_PROFILES } from "@/lib/mock-data/compatibility-rules";
import { useConfiguratorAttributeStore } from "@/lib/store/configurator-attribute-store";
import { useCompatibilityRuleStore } from "@/lib/store/compatibility-rule-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: CompatibilityRule | null;
  defaultConfiguratorProfileId?: string;
};

function newConditionId() {
  return `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function isLiteralOperand(
  operand: CompatibilityCondition["right"],
): operand is { literal: string | number | boolean } {
  return "literal" in operand;
}

function emptyBody(): CompatibilityRuleBody {
  return {
    conditions: [
      {
        id: newConditionId(),
        left: { profileId: "cap_cpu", fieldCode: "socket" },
        operator: "equals",
        right: { profileId: "cap_mobo", fieldCode: "socket" },
      },
    ],
    then: { status: "compatible", message: "All conditions met." },
    else: { status: "incompatible", message: "Condition not met." },
  };
}

export function CompatibilityRuleFormSheet({
  open,
  onOpenChange,
  rule,
  defaultConfiguratorProfileId = "cfg_pc",
}: Props) {
  const upsertRule = useCompatibilityRuleStore((s) => s.upsertRule);
  const profiles = useConfiguratorAttributeStore((s) => s.profiles);
  const fields = useConfiguratorAttributeStore((s) => s.fields);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [configuratorProfileId, setConfiguratorProfileId] = useState(defaultConfiguratorProfileId);
  const [priority, setPriority] = useState(10);
  const [active, setActive] = useState(true);
  const [body, setBody] = useState<CompatibilityRuleBody>(emptyBody);

  useEffect(() => {
    if (!open) return;
    setName(rule?.name ?? "");
    setDescription(rule?.description ?? "");
    setConfiguratorProfileId(rule?.configuratorProfileId ?? defaultConfiguratorProfileId);
    setPriority(rule?.priority ?? 10);
    setActive(rule?.active ?? true);
    setBody(
      rule?.body ?? {
        ...emptyBody(),
        conditions: emptyBody().conditions.map((c) => ({ ...c, id: newConditionId() })),
      },
    );
  }, [open, rule, defaultConfiguratorProfileId]);

  const builderName =
    CONFIGURATOR_BUILDER_PROFILES.find((p) => p.id === configuratorProfileId)?.name ?? "Builder";

  const profileOptions = useMemo(
    () => profiles.map((p) => ({ id: p.id, name: p.name })),
    [profiles],
  );

  const fieldsByProfile = useMemo(() => {
    const map = new Map<string, typeof fields>();
    for (const p of profiles) {
      map.set(p.id, fields.filter((f) => f.profileId === p.id));
    }
    return map;
  }, [profiles, fields]);

  const updateCondition = (id: string, patch: Partial<CompatibilityCondition>) => {
    setBody((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  };

  const addCondition = () => {
    const firstProfile = profiles[0]?.id ?? "cap_cpu";
    const firstField = fields.find((f) => f.profileId === firstProfile)?.code ?? "socket";
    setBody((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          id: newConditionId(),
          left: { profileId: firstProfile, fieldCode: firstField },
          operator: "equals",
          right: { literal: "" },
        },
      ],
    }));
  };

  const removeCondition = (id: string) => {
    setBody((prev) => ({
      ...prev,
      conditions: prev.conditions.length <= 1 ? prev.conditions : prev.conditions.filter((c) => c.id !== id),
    }));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Rule name is required");
      return;
    }
    if (body.conditions.length === 0) {
      toast.error("Add at least one IF condition");
      return;
    }

    upsertRule({
      id: rule?.id,
      name: name.trim(),
      code: rule?.code,
      configuratorProfileId,
      configuratorProfileName: builderName,
      description: description.trim() || undefined,
      priority,
      active,
      body,
    });

    toast.success(rule ? "Rule updated" : "Rule created");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-xl">
        <div className="flex items-center gap-2 border-b border-input pb-3">
          <GitBranch className="h-5 w-5 text-indigo-600" />
          <div>
            <h2 className="text-base font-semibold">{rule ? "Edit compatibility rule" : "Create compatibility rule"}</h2>
            <p className="text-[11px] text-muted-foreground">IF conditions → THEN outcome → ELSE outcome</p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Rule name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="CPU ↔ Motherboard Socket Match" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Optional explanation for admins"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Configurator profile</Label>
              <Select
                value={configuratorProfileId}
                onChange={(e) => setConfiguratorProfileId(e.target.value)}
                className="h-9 text-xs"
              >
                {CONFIGURATOR_BUILDER_PROFILES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Priority (lower = first)</Label>
              <Input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Switch checked={active} onCheckedChange={setActive} id="rule-active" />
              <Label htmlFor="rule-active" className="text-xs">
                Active
              </Label>
            </div>
          </div>

          <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/20">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px] font-semibold text-indigo-700">
                IF (all conditions must match)
              </Badge>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={addCondition}>
                <Plus className="mr-1 h-3 w-3" />
                Add condition
              </Button>
            </div>

            <div className="mt-3 space-y-3">
              {body.conditions.map((cond, idx) => (
                <ConditionRow
                  key={cond.id}
                  index={idx}
                  condition={cond}
                  profileOptions={profileOptions}
                  fieldsByProfile={fieldsByProfile}
                  onChange={(patch) => updateCondition(cond.id, patch)}
                  onRemove={() => removeCondition(cond.id)}
                  canRemove={body.conditions.length > 1}
                />
              ))}
            </div>
          </div>

          <OutcomeBlock
            label="THEN"
            variant="success"
            outcome={body.then}
            onChange={(then) => setBody((prev) => ({ ...prev, then }))}
          />

          <OutcomeBlock
            label="ELSE"
            variant="outline"
            outcome={body.else}
            onChange={(elseOutcome) => setBody((prev) => ({ ...prev, else: elseOutcome }))}
          />
        </div>

        <div className="mt-auto flex gap-2 border-t border-input pt-4">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            {rule ? "Save changes" : "Create rule"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

type ConditionRowProps = {
  index: number;
  condition: CompatibilityCondition;
  profileOptions: { id: string; name: string }[];
  fieldsByProfile: Map<string, ReturnType<typeof useConfiguratorAttributeStore.getState>["fields"]>;
  onChange: (patch: Partial<CompatibilityCondition>) => void;
  onRemove: () => void;
  canRemove: boolean;
};

function ConditionRow({
  index,
  condition,
  profileOptions,
  fieldsByProfile,
  onChange,
  onRemove,
  canRemove,
}: ConditionRowProps) {
  const rightIsLiteral = isLiteralOperand(condition.right);
  const rightAttr = rightIsLiteral ? null : (condition.right as AttributeRef);
  const leftFields = fieldsByProfile.get(condition.left.profileId) ?? [];
  const rightFields = rightAttr ? fieldsByProfile.get(rightAttr.profileId) ?? [] : [];

  return (
    <div className="rounded-md border border-input bg-background p-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground">Condition {index + 1}</span>
        {canRemove && (
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-5">
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-[10px]">Left attribute</Label>
          <div className="flex gap-1">
            <Select
              value={condition.left.profileId}
              onChange={(e) => {
                const profileId = e.target.value;
                const firstField = fieldsByProfile.get(profileId)?.[0]?.code ?? "";
                onChange({ left: { profileId, fieldCode: firstField } });
              }}
              className="h-8 flex-1 text-[10px]"
            >
              {profileOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
            <Select
              value={condition.left.fieldCode}
              onChange={(e) =>
                onChange({ left: { ...condition.left, fieldCode: e.target.value } })
              }
              className="h-8 flex-1 text-[10px]"
            >
              {leftFields.map((f) => (
                <option key={f.id} value={f.code}>
                  {f.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px]">Operator</Label>
          <Select
            value={condition.operator}
            onChange={(e) =>
              onChange({ operator: e.target.value as CompatibilityCondition["operator"] })
            }
            className="h-8 text-[10px]"
          >
            {COMPATIBILITY_OPERATORS.map((op) => (
              <option key={op} value={op}>
                {OPERATOR_LABELS[op]}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1 sm:col-span-2">
          <Label className="text-[10px]">Right operand</Label>
          <div className="flex gap-1">
            <Select
              value={rightIsLiteral ? "literal" : "attribute"}
              onChange={(e) => {
                if (e.target.value === "literal") {
                  onChange({ right: { literal: "" } });
                } else {
                  const profileId = profileOptions[0]?.id ?? "cap_cpu";
                  const fieldCode = fieldsByProfile.get(profileId)?.[0]?.code ?? "";
                  onChange({ right: { profileId, fieldCode } });
                }
              }}
              className="h-8 w-24 text-[10px]"
            >
              <option value="attribute">Attribute</option>
              <option value="literal">Literal</option>
            </Select>

            {rightIsLiteral ? (
              <Input
                value={String((condition.right as { literal: string | number | boolean }).literal ?? "")}
                onChange={(e) => {
                  const raw = e.target.value;
                  const num = Number(raw);
                  onChange({
                    right: {
                      literal: raw !== "" && !Number.isNaN(num) && raw.trim() !== "" ? num : raw,
                    },
                  });
                }}
                placeholder="Value"
                className="h-8 flex-1 text-[10px]"
              />
            ) : rightAttr ? (
              <>
                <Select
                  value={rightAttr.profileId}
                  onChange={(e) => {
                    const profileId = e.target.value;
                    const fieldCode = fieldsByProfile.get(profileId)?.[0]?.code ?? "";
                    onChange({ right: { profileId, fieldCode } });
                  }}
                  className="h-8 flex-1 text-[10px]"
                >
                  {profileOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
                <Select
                  value={rightAttr.fieldCode}
                  onChange={(e) =>
                    onChange({
                      right: {
                        profileId: rightAttr.profileId,
                        fieldCode: e.target.value,
                      },
                    })
                  }
                  className="h-8 flex-1 text-[10px]"
                >
                  {rightFields.map((f) => (
                    <option key={f.id} value={f.code}>
                      {f.name}
                    </option>
                  ))}
                </Select>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

type OutcomeBlockProps = {
  label: string;
  variant: "success" | "outline";
  outcome: CompatibilityRuleBody["then"];
  onChange: (outcome: CompatibilityRuleBody["then"]) => void;
};

function OutcomeBlock({ label, variant, outcome, onChange }: OutcomeBlockProps) {
  return (
    <div
      className={
        variant === "success"
          ? "rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20"
          : "rounded-lg border border-input bg-muted/20 p-3"
      }
    >
      <Badge variant={variant === "success" ? "success" : "outline"} className="text-[10px] font-semibold">
        {label}
      </Badge>
      <div className="mt-2 grid gap-2">
        <div className="space-y-1">
          <Label className="text-[10px]">Status</Label>
          <Select
            value={outcome.status}
            onChange={(e) =>
              onChange({ ...outcome, status: e.target.value as typeof outcome.status })
            }
            className="h-8 text-xs"
          >
            {COMPATIBILITY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px]">Message</Label>
          <Textarea
            value={outcome.message}
            onChange={(e) => onChange({ ...outcome, message: e.target.value })}
            rows={2}
            className="text-xs"
          />
        </div>
      </div>
    </div>
  );
}
