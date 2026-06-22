"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FIELD_TYPE_LABELS, type AttributeSpec } from "@/lib/mock-data/attribute-profiles";
import { useCatalogAttributeProfiles } from "@/lib/api/use-catalog-attribute-profiles";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type ProductSpecsDraft = {
  profileId: string;
  valuesByAttributeId: Record<string, string>;
};

type Props = {
  productId?: string;
  initialProfileId?: string | null;
  initialValues?: Record<string, string>;
  onChange?: (draft: ProductSpecsDraft) => void;
};

export function ProductSpecEditor({
  productId,
  initialProfileId,
  initialValues,
  onChange,
}: Props) {
  const { profiles, groups, attributes, loading } = useCatalogAttributeProfiles();
  const [profileId, setProfileId] = useState(initialProfileId ?? profiles[0]?.id ?? "");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [values, setValues] = useState<Record<string, string>>(initialValues ?? {});

  useEffect(() => {
    if (initialProfileId) setProfileId(initialProfileId);
  }, [initialProfileId]);

  useEffect(() => {
    if (initialValues) setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (!profileId && profiles[0]?.id) setProfileId(profiles[0].id);
  }, [profileId, profiles]);

  useEffect(() => {
    onChange?.({ profileId, valuesByAttributeId: values });
  }, [profileId, values, onChange]);

  const profileGroups = useMemo(
    () => (profileId ? groups.filter((g) => g.profileId === profileId) : []),
    [profileId, groups],
  );

  const fieldsByGroup = useMemo(() => {
    const q = search.toLowerCase().trim();
    const map = new Map<string, AttributeSpec[]>();
    for (const g of profileGroups) {
      const fields = attributes
        .filter((a) => a.groupId === g.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .filter((a) => !q || a.name.toLowerCase().includes(q) || a.code.includes(q));
      if (fields.length) map.set(g.id, fields);
    }
    return map;
  }, [profileGroups, attributes, search]);

  const toggleGroup = (id: string) => {
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  };

  const setValue = (attributeId: string, val: string) => {
    setValues((v) => ({ ...v, [attributeId]: val }));
  };

  const fillWithAi = () => {
    const next = { ...values };
    for (const g of profileGroups) {
      for (const a of attributes.filter((x) => x.groupId === g.id)) {
        if (!next[a.id]?.trim()) {
          next[a.id] = a.predefinedValues?.[0] ?? `Sample ${a.name}`;
        }
      }
    }
    setValues(next);
    toast.success("Filled empty specification fields");
  };

  const profile = profiles.find((p) => p.id === profileId);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading specification profiles…</p>;
  }

  return (
    <div className="space-y-4">
      {productId && (
        <p className="text-[11px] text-muted-foreground">
          Specifications save with the product (product ID: {productId.slice(0, 8)}…)
        </p>
      )}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-input bg-muted/30 p-4">
        <div className="min-w-[200px] flex-1">
          <Label>Specification profile</Label>
          <Select
            className="mt-1"
            value={profileId}
            onChange={(e) => {
              setProfileId(e.target.value);
              setValues({});
            }}
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          {profile && (
            <p className="mt-1 text-[10px] text-muted-foreground">{profile.description}</p>
          )}
        </div>
        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Quick search fields…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
        <Button type="button" variant="outline" size="sm" onClick={fillWithAi}>
          <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Fill empty
        </Button>
      </div>

      {profileGroups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Select a profile with groups and fields, or create one under Catalog → Attributes.
        </p>
      ) : (
        profileGroups.map((g) => {
          const fields = fieldsByGroup.get(g.id);
          if (!fields?.length && search) return null;
          const isOpen = !collapsed[g.id];
          return (
            <div key={g.id} className="overflow-hidden rounded-lg border border-input bg-card">
              <button
                type="button"
                className="flex w-full items-center gap-2 border-b border-input bg-muted/40 px-4 py-2.5 text-left"
                onClick={() => toggleGroup(g.id)}
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" />
                )}
                <span className="text-sm font-semibold">{g.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({fields?.length ?? attributes.filter((a) => a.groupId === g.id).length} fields)
                </span>
              </button>

              {isOpen && fields && fields.length > 0 && (
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  {fields.map((f) => (
                    <SpecFieldInput
                      key={f.id}
                      field={f}
                      value={values[f.id] ?? ""}
                      onChange={(v) => setValue(f.id, v)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function SpecFieldInput({
  field,
  value,
  onChange,
}: {
  field: AttributeSpec;
  value: string;
  onChange: (v: string) => void;
}) {
  const label = (
    <div className="mb-1 flex flex-wrap items-center gap-1.5">
      <Label className="text-xs">
        {field.name}
        {field.isRequired && <span className="text-destructive"> *</span>}
      </Label>
      {field.isFilterable && (
        <Badge variant="outline" className="text-[8px]">
          Filter
        </Badge>
      )}
      <span className="text-[10px] text-muted-foreground">{FIELD_TYPE_LABELS[field.fieldType]}</span>
    </div>
  );

  if (field.fieldType === "textarea") {
    return (
      <div>
        {label}
        <Textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} className="text-sm" />
      </div>
    );
  }

  if (field.fieldType === "dropdown" || field.fieldType === "radio") {
    const options = field.predefinedValues?.length ? field.predefinedValues : ["—"];
    return (
      <div>
        {label}
        <Select value={value} onChange={(e) => onChange(e.target.value)} className="text-sm">
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Select>
      </div>
    );
  }

  if (field.fieldType === "boolean" || field.fieldType === "checkbox") {
    return (
      <label className={cn("flex items-center gap-2 pt-5")}>
        <input type="checkbox" checked={value === "yes"} onChange={(e) => onChange(e.target.checked ? "yes" : "")} />
        <span className="text-sm">{field.name}</span>
      </label>
    );
  }

  return (
    <div>
      {label}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.helpText ?? `Enter ${field.name.toLowerCase()}`}
        className="text-sm"
      />
      {field.unit && (
        <p className="mt-0.5 text-[10px] text-muted-foreground">Unit: {field.unit}</p>
      )}
    </div>
  );
}
