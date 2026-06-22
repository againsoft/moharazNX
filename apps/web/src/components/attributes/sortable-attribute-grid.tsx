"use client";

import { useRef, useState } from "react";
import { Filter, GripVertical, Plus, Trash2, X } from "lucide-react";
import { createEmptyBulkAttribute, type BulkAttributeRow } from "@/lib/mock-data/attribute-profiles";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

function reorderByKey<T extends { key: string }>(items: T[], fromKey: string, toKey: string): T[] {
  const from = items.findIndex((i) => i.key === fromKey);
  const to = items.findIndex((i) => i.key === toKey);
  if (from < 0 || to < 0 || from === to) return items;
  const copy = [...items];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

type Props = {
  attributes: BulkAttributeRow[];
  onChange: (attributes: BulkAttributeRow[]) => void;
};

export function SortableAttributeGrid({ attributes, onChange }: Props) {
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const [valueDrafts, setValueDrafts] = useState<Record<string, string>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const update = (key: string, patch: Partial<BulkAttributeRow>) =>
    onChange(attributes.map((a) => (a.key === key ? { ...a, ...patch } : a)));

  const remove = (key: string) => onChange(attributes.filter((a) => a.key !== key));

  const add = () => onChange([...attributes, createEmptyBulkAttribute()]);

  const handleDrop = (targetKey: string) => {
    if (!dragKey || dragKey === targetKey) return;
    onChange(reorderByKey(attributes, dragKey, targetKey));
    setDragKey(null);
    setOverKey(null);
  };

  const addValue = (key: string) => {
    const draft = (valueDrafts[key] ?? "").trim();
    if (!draft) return;
    const attr = attributes.find((a) => a.key === key);
    if (!attr) return;
    if (attr.predefinedValues.includes(draft)) {
      setValueDrafts((d) => ({ ...d, [key]: "" }));
      return;
    }
    update(key, { predefinedValues: [...attr.predefinedValues, draft] });
    setValueDrafts((d) => ({ ...d, [key]: "" }));
    inputRefs.current[key]?.focus();
  };

  const removeValue = (attrKey: string, val: string) => {
    const attr = attributes.find((a) => a.key === attrKey);
    if (!attr) return;
    update(attrKey, { predefinedValues: attr.predefinedValues.filter((v) => v !== val) });
  };

  return (
    <div className="space-y-0.5 py-0.5">
      {attributes.map((attr) => (
        <div
          key={attr.key}
          onDragOver={(e) => { e.preventDefault(); setOverKey(attr.key); }}
          onDragLeave={() => setOverKey((k) => (k === attr.key ? null : k))}
          onDrop={() => handleDrop(attr.key)}
          className={cn(
            overKey === attr.key && dragKey !== attr.key && "rounded-md ring-2 ring-primary/30",
          )}
        >
          {/* Attribute name row */}
          <div
            draggable
            onDragStart={() => setDragKey(attr.key)}
            onDragEnd={() => { setDragKey(null); setOverKey(null); }}
            className={cn(
              "flex cursor-grab items-center gap-1.5 rounded-md px-1 py-0.5 hover:bg-muted/40 active:cursor-grabbing",
              dragKey === attr.key && "opacity-50",
            )}
          >
            <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50" />
            <Input
              value={attr.name}
              onChange={(e) => update(attr.key, { name: e.target.value })}
              placeholder="Attribute name"
              className="h-6 min-w-0 flex-1 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
            />
            <button
              type="button"
              onClick={() => update(attr.key, { filterable: !attr.filterable })}
              className={cn(
                "flex shrink-0 items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium transition-colors",
                attr.filterable
                  ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                  : "text-muted-foreground/60 hover:bg-muted hover:text-muted-foreground",
              )}
              aria-pressed={attr.filterable}
            >
              <Filter className="h-2.5 w-2.5" />
              Filter
            </button>
            <button
              type="button"
              onClick={() => remove(attr.key)}
              className="h-5 w-5 shrink-0 rounded p-0 text-muted-foreground/40 hover:text-destructive"
              aria-label="Remove"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>

          {/* Predefined values — indented under attribute when filterable */}
          {attr.filterable && (
            <div className="ml-4 border-l border-input pl-2.5 py-1">
              <div className="flex flex-wrap gap-1">
                {attr.predefinedValues.map((val) => (
                  <span
                    key={val}
                    className="inline-flex items-center gap-0.5 rounded border border-sky-200 bg-sky-100/80 px-1.5 py-0.5 text-[10px] font-medium text-sky-800 dark:border-sky-800 dark:bg-sky-900/50 dark:text-sky-200"
                  >
                    {val}
                    <button
                      type="button"
                      onClick={() => removeValue(attr.key, val)}
                      className="ml-0.5 rounded-full hover:text-destructive"
                      aria-label={`Remove ${val}`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                <input
                  ref={(el) => { inputRefs.current[attr.key] = el; }}
                  type="text"
                  value={valueDrafts[attr.key] ?? ""}
                  onChange={(e) => setValueDrafts((d) => ({ ...d, [attr.key]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addValue(attr.key); }
                  }}
                  placeholder={attr.predefinedValues.length === 0 ? "Type a value, press Enter…" : "Add more…"}
                  className="h-6 min-w-[120px] flex-1 rounded border border-dashed border-sky-300 bg-transparent px-1.5 text-[11px] placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-sky-400 dark:border-sky-700"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add attribute */}
      <button
        type="button"
        onClick={add}
        className="flex w-full items-center gap-1.5 rounded-md px-1 py-0.5 text-[11px] text-muted-foreground hover:bg-muted/40 hover:text-foreground"
      >
        <Plus className="h-3 w-3" />
        Add attribute
      </button>
    </div>
  );
}

export function reorderGroupsByKey<T extends { key: string }>(
  groups: T[],
  fromKey: string,
  toKey: string,
): T[] {
  return reorderByKey(groups, fromKey, toKey);
}
