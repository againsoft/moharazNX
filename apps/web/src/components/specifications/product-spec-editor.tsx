"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { FIELD_TYPE_LABELS, type AttributeSpec } from "@/lib/mock-data/attribute-profiles";
import { useAttributeProfileStore } from "@/lib/store/attribute-profile-store";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const DEMO_VALUES: Record<string, string> = {
  cpu_brand: "Intel",
  cpu_model: "Core i7-13700H",
  cpu_generation: "13th Gen",
  cpu_core: "14",
  display_size: '15.6"',
  display_type: "IPS",
  resolution: "1920×1080",
  refresh_rate: "144Hz",
  ram: "16GB",
  ram_type: "DDR5",
  storage_type: "NVMe SSD",
  storage_capacity: "512GB",
};

export function ProductSpecEditor() {
  const profiles = useAttributeProfileStore((s) => s.profiles);
  const getGroupsForProfile = useAttributeProfileStore((s) => s.getGroupsForProfile);
  const attributes = useAttributeProfileStore((s) => s.attributes);

  const [profileId, setProfileId] = useState(profiles[0]?.id ?? "");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [values, setValues] = useState<Record<string, string>>(() => ({ ...DEMO_VALUES }));

  const groups = useMemo(
    () => (profileId ? getGroupsForProfile(profileId) : []),
    [profileId, getGroupsForProfile],
  );

  const fieldsByGroup = useMemo(() => {
    const q = search.toLowerCase().trim();
    const map = new Map<string, AttributeSpec[]>();
    for (const g of groups) {
      const fields = attributes
        .filter((a) => a.groupId === g.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .filter((a) => !q || a.name.toLowerCase().includes(q) || a.code.includes(q));
      if (fields.length) map.set(g.id, fields);
    }
    return map;
  }, [groups, attributes, search]);

  const toggleGroup = (id: string) => {
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));
  };

  const setValue = (code: string, val: string) => {
    setValues((v) => ({ ...v, [code]: val }));
  };

  const fillWithAi = () => {
    const next = { ...values };
    for (const g of groups) {
      for (const a of attributes.filter((x) => x.groupId === g.id)) {
        if (!next[a.code]?.trim()) {
          next[a.code] = DEMO_VALUES[a.code] ?? `Sample ${a.name}`;
        }
      }
    }
    setValues(next);
    toast.success("AI filled empty specification fields");
  };

  const profile = profiles.find((p) => p.id === profileId);

  return (
    <div className="space-y-4">
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
          <Sparkles className="mr-1.5 h-3.5 w-3.5" /> AI fill empty
        </Button>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">Select a profile with groups and fields.</p>
      ) : (
        groups.map((g) => {
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
                      value={values[f.code] ?? ""}
                      onChange={(v) => setValue(f.code, v)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      <div className="rounded-lg border border-dashed border-input p-4">
        <p className="text-xs font-semibold text-muted-foreground">Product-only customization</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          Add groups/fields that apply only to this product — profile template stays unchanged
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => toast.info("Add product-only group (mock)")}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add group
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => toast.info("Add product-only field (mock)")}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Add field
          </Button>
        </div>
      </div>
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
    return (
      <div>
        {label}
        <Select value={value} onChange={(e) => onChange(e.target.value)} className="text-sm">
          <option value="">Select…</option>
          <option value="Intel">Intel</option>
          <option value="AMD">AMD</option>
          <option value="Apple">Apple</option>
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
