"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  Filter,
  FolderOpen,
  GripVertical,
  Layers,
  Pencil,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { AttributeSpec } from "@/lib/mock-data/attribute-profiles";
import { useCatalogAttributeProfiles, saveAttributeProfileBulk } from "@/lib/api/use-catalog-attribute-profiles";
import { AttributeProfileEditDialog } from "@/components/attributes/attribute-profile-edit-dialog";
import { AttributeProfileFormDialog } from "@/components/attributes/attribute-profile-form-dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

export type CustomSpecGroup = { id: string; name: string };
export type CustomSpecAttr = { id: string; groupId: string; name: string };

export type ProductSpecsDraft = {
  profileId: string;
  valuesByAttributeId: Record<string, string>;
  customGroups?: CustomSpecGroup[];
  customAttrs?: CustomSpecAttr[];
};

type Props = {
  productId?: string;
  initialProfileId?: string | null;
  initialValues?: Record<string, string>;
  initialCustomGroups?: CustomSpecGroup[];
  initialCustomAttrs?: CustomSpecAttr[];
  onChange?: (draft: ProductSpecsDraft) => void;
};

export function ProductSpecEditor({ initialProfileId, initialValues, initialCustomGroups, initialCustomAttrs, onChange }: Props) {
  const { profiles, groups, attributes, loading, refetch: refetchProfiles } = useCatalogAttributeProfiles();

  const [profileId, setProfileId] = useState(initialProfileId ?? "");
  const [values, setValues] = useState<Record<string, string>>(initialValues ?? {});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [groupOrder, setGroupOrder] = useState<string[] | null>(null);
  const [attrOrder, setAttrOrder] = useState<Record<string, string[]>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  /* per-attribute predefined value overrides (local + saved to API) */
  const [localPredefined, setLocalPredefined] = useState<Record<string, string[]>>({});
  const [filterEditAttrId, setFilterEditAttrId] = useState<string | null>(null);
  /* product-only custom groups (not in profile) */
  const [customGroups, setCustomGroups] = useState<CustomSpecGroup[]>(initialCustomGroups ?? []);
  /* product-only local attributes: groupId → [{id, name}] */
  const [localAttrs, setLocalAttrs] = useState<Record<string, Array<{ id: string; name: string; saving?: boolean }>>>(() => {
    const init: Record<string, Array<{ id: string; name: string }>> = {};
    for (const a of initialCustomAttrs ?? []) {
      init[a.groupId] = [...(init[a.groupId] ?? []), { id: a.id, name: a.name }];
    }
    return init;
  });
  const [addingAttrGroupId, setAddingAttrGroupId] = useState<string | null>(null);
  const [addingGroup, setAddingGroup] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [addProfileOpen, setAddProfileOpen] = useState(false);
  /* attrs hidden for this product */
  const [hiddenAttrIds, setHiddenAttrIds] = useState<Set<string>>(new Set());
  const hideAttr = (id: string) => setHiddenAttrIds((s) => new Set([...s, id]));

  /* Keep onChange in a ref so we can call it without it being a dependency */
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  /* Load initial data from parent exactly once (for edit mode) */
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    if (!initialProfileId && (!initialValues || Object.keys(initialValues).length === 0)) return;
    loadedRef.current = true;
    if (initialProfileId) setProfileId(initialProfileId);
    if (initialValues) setValues(initialValues);
    if (initialCustomGroups?.length) setCustomGroups(initialCustomGroups);
    if (initialCustomAttrs?.length) {
      const byGroup: Record<string, Array<{ id: string; name: string }>> = {};
      for (const a of initialCustomAttrs) {
        byGroup[a.groupId] = [...(byGroup[a.groupId] ?? []), { id: a.id, name: a.name }];
      }
      setLocalAttrs(byGroup);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProfileId]);

  const profileGroups = useMemo(
    () => profileId ? groups.filter((g) => g.profileId === profileId).sort((a, b) => a.sortOrder - b.sortOrder) : [],
    [profileId, groups],
  );

  const defaultAttrOrder = useMemo(() => {
    const ao: Record<string, string[]> = {};
    for (const g of profileGroups) {
      ao[g.id] = attributes.filter((a) => a.groupId === g.id).sort((a, b) => a.sortOrder - b.sortOrder).map((a) => a.id);
    }
    return ao;
  }, [profileGroups, attributes]);

  const effectiveGroupOrder = useMemo(
    () => groupOrder ?? profileGroups.map((g) => g.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groupOrder, profileGroups.map((g) => g.id).join(",")],
  );
  const orderedGroups = useMemo(
    () => effectiveGroupOrder.map((id) => profileGroups.find((g) => g.id === id)).filter(Boolean) as typeof profileGroups,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveGroupOrder.join(","), profileGroups],
  );

  const effectiveAttrOrder = (gid: string) => attrOrder[gid] ?? defaultAttrOrder[gid] ?? [];

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const isGroup = (id: string) => effectiveGroupOrder.includes(id);

  const findAttrGroup = (id: string) => {
    for (const g of profileGroups) {
      if (effectiveAttrOrder(g.id).includes(id)) return g.id;
      if ((localAttrs[g.id] ?? []).some((a) => a.id === id)) return g.id;
    }
    return null;
  };

  /* combined sortable IDs per group (profile attrs + local attrs) */
  const combinedAttrIds = (gid: string): string[] => [
    ...effectiveAttrOrder(gid).filter((id) => !hiddenAttrIds.has(id)),
    ...(localAttrs[gid] ?? []).map((a) => a.id),
  ];

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const aid = String(active.id), oid = String(over.id);
    if (isGroup(aid)) {
      const cur = [...effectiveGroupOrder];
      if (!cur.includes(oid)) return;
      setGroupOrder(arrayMove(cur, cur.indexOf(aid), cur.indexOf(oid)));
    } else {
      /* attr reorder — combined profile + local list */
      const gid = findAttrGroup(aid);
      if (!gid) return;
      const profileIds = effectiveAttrOrder(gid).filter((id) => !hiddenAttrIds.has(id));
      const localIds = (localAttrs[gid] ?? []).map((a) => a.id);
      const combined = [...profileIds, ...localIds];
      if (!combined.includes(oid)) return;
      const next = arrayMove(combined, combined.indexOf(aid), combined.indexOf(oid));
      const newProfileIds = next.filter((id) => !id.startsWith("local-") || profileIds.includes(id));
      const newLocalIds = next.filter((id) => id.startsWith("local-") && localIds.includes(id));
      setAttrOrder((prev) => ({ ...prev, [gid]: newProfileIds }));
      setLocalAttrs((prev) => ({
        ...prev,
        [gid]: newLocalIds.map((id) => (prev[gid] ?? []).find((a) => a.id === id)!).filter(Boolean),
      }));
    }
  };

  const emitChange = (newValues: Record<string, string>, newCustomGroups?: CustomSpecGroup[], newLocalAttrs?: Record<string, Array<{ id: string; name: string }>>) => {
    const cg = newCustomGroups ?? customGroups;
    const la = newLocalAttrs ?? localAttrs;
    const customAttrs: CustomSpecAttr[] = Object.entries(la).flatMap(([gid, arr]) =>
      arr.map((a) => ({ id: a.id, groupId: gid, name: a.name })),
    );
    onChangeRef.current?.({ profileId, valuesByAttributeId: newValues, customGroups: cg, customAttrs });
  };

  const setValue = (attributeId: string, val: string) =>
    setValues((v) => {
      const next = { ...v, [attributeId]: val };
      emitChange(next);
      return next;
    });

  const toggleGroup = (gid: string) =>
    setCollapsed((c) => ({ ...c, [gid]: !c[gid] }));

  const handleProfileChange = (pid: string) => {
    setProfileId(pid);
    setValues({});
    setCollapsed({});
    setGroupOrder(null);
    setAttrOrder({});
    onChangeRef.current?.({ profileId: pid, valuesByAttributeId: {}, customGroups, customAttrs: [] });
  };

  /* get effective predefined values (local override first, then from API) */
  const getPredefined = (attr: AttributeSpec): string[] =>
    localPredefined[attr.id] ?? attr.predefinedValues ?? [];

  const handlePredefinedAdd = (attr: AttributeSpec, newVal: string) => {
    const trimmed = newVal.trim();
    if (!trimmed) return;
    const current = getPredefined(attr);
    if (current.includes(trimmed)) return;
    const next = [...current, trimmed];
    setLocalPredefined((p) => ({ ...p, [attr.id]: next }));
    /* fire-and-forget API save */
    const profile = profiles.find((p) => p.id === profileId);
    const profileGroups2 = groups.filter((g) => g.profileId === profileId);
    if (profile) {
      void saveAttributeProfileBulk({
        id: profile.id,
        name: profile.name,
        description: profile.description,
        groups: profileGroups2.map((g) => ({
          id: g.id,
          name: g.name,
          sortOrder: g.sortOrder,
          attributes: attributes
            .filter((a) => a.groupId === g.id)
            .map((a) => ({
              id: a.id,
              name: a.name,
              code: a.code,
              fieldType: a.fieldType,
              sortOrder: a.sortOrder,
              isRequired: a.isRequired,
              isFilterable: a.isFilterable,
              predefinedValues: a.id === attr.id ? next : (localPredefined[a.id] ?? a.predefinedValues ?? []),
            })),
        })),
      }).catch(() => {});
    }
  };

  const handlePredefinedRemove = (attr: AttributeSpec, val: string) => {
    const next = getPredefined(attr).filter((v) => v !== val);
    setLocalPredefined((p) => ({ ...p, [attr.id]: next }));
    /* also clear the selected value if it was the removed one */
    if (values[attr.id] === val) setValue(attr.id, "");
  };

  const addLocalAttr = (groupId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newId = `custom-${groupId}-${Date.now()}`;
    setLocalAttrs((prev) => {
      const next = { ...prev, [groupId]: [...(prev[groupId] ?? []), { id: newId, name: trimmed }] };
      emitChange(values, customGroups, next);
      return next;
    });
    setAddingAttrGroupId(null);
  };

  const removeLocalAttr = (groupId: string, id: string) => {
    setLocalAttrs((prev) => {
      const next = { ...prev, [groupId]: (prev[groupId] ?? []).filter((a) => a.id !== id) };
      setValues((v) => {
        const nv = { ...v }; delete nv[id];
        emitChange(nv, customGroups, next);
        return nv;
      });
      return next;
    });
  };

  const addGroup = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setAddingGroup(false);
    const newGroup: CustomSpecGroup = { id: `cgroup-${Date.now()}`, name: trimmed };
    setCustomGroups((prev) => {
      const next = [...prev, newGroup];
      emitChange(values, next, localAttrs);
      return next;
    });
  };

  const fillEmpty = () => {
    const next = { ...values };
    for (const g of profileGroups) {
      for (const a of attributes.filter((x) => x.groupId === g.id)) {
        if (!next[a.id]?.trim()) next[a.id] = a.predefinedValues?.[0] ?? "";
      }
    }
    setValues(next);
    toast.success("Filled empty fields");
  };

  const activeAttr = activeId ? attributes.find((a) => a.id === activeId) : null;
  const activeGroup = activeId ? profileGroups.find((g) => g.id === activeId) : null;
  const activeLocalAttr = activeId
    ? Object.values(localAttrs).flat().find((a) => a.id === activeId) ?? null
    : null;

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-2">
      {/* Profile row */}
      <div className="flex items-center gap-2">
        <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <ProfileCombobox
          profiles={profiles}
          value={profileId}
          onChange={handleProfileChange}
          onAdd={() => setAddProfileOpen(true)}
          onEdit={profileId ? () => setEditProfileOpen(true) : undefined}
        />
        {profileId && (
          <Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={fillEmpty}>
            <Sparkles className="mr-1 h-3 w-3" /> Fill
          </Button>
        )}
      </div>

      {/* Tree */}
      {!profileId ? (
        <p className="py-4 text-center text-xs text-muted-foreground">Select a profile to add specifications</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="rounded-md border border-input text-sm">
            {/* Profile header */}
            <div className="flex items-center gap-1.5 border-b border-input bg-muted/40 px-2 py-1">
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold">{profiles.find((p) => p.id === profileId)?.name}</span>
            </div>

            <SortableContext items={effectiveGroupOrder} strategy={verticalListSortingStrategy}>
              {orderedGroups.map((group) => {
                const orderedIds = effectiveAttrOrder(group.id);
                const groupAttrs = orderedIds.map((id) => attributes.find((a) => a.id === id)).filter(Boolean) as AttributeSpec[];
                const isOpen = !collapsed[group.id];
                const filled = groupAttrs.filter((a) => values[a.id]?.trim()).length;
                return (
                  <SortableGroupRow
                    key={group.id}
                    groupId={group.id}
                    groupName={group.name}
                    isOpen={isOpen}
                    filled={filled}
                    total={groupAttrs.length}
                    isDragActive={activeId === group.id}
                    onToggle={() => toggleGroup(group.id)}
                  >
                    {isOpen && (() => {
                      const visibleProfileIds = orderedIds.filter((id) => !hiddenAttrIds.has(id));
                      const localIds = (localAttrs[group.id] ?? []).map((a) => a.id);
                      const combinedIds = [...visibleProfileIds, ...localIds];
                      return (
                      <>
                        <SortableContext items={combinedIds} strategy={verticalListSortingStrategy}>
                          {visibleProfileIds.map((id) => {
                            const attr = attributes.find((a) => a.id === id);
                            if (!attr) return null;
                            return (
                              <SortableAttrRow
                                key={attr.id}
                                attr={attr}
                                value={values[attr.id] ?? ""}
                                onChange={(v) => setValue(attr.id, v)}
                                isDragActive={activeId === attr.id}
                                predefinedValues={getPredefined(attr)}
                                filterEditOpen={filterEditAttrId === attr.id}
                                onFilterEditToggle={() => setFilterEditAttrId((prev) => (prev === attr.id ? null : attr.id))}
                                onPredefinedAdd={(v) => handlePredefinedAdd(attr, v)}
                                onPredefinedRemove={(v) => handlePredefinedRemove(attr, v)}
                                onHide={() => hideAttr(attr.id)}
                              />
                            );
                          })}
                          {(localAttrs[group.id] ?? []).map((la) => (
                            <LocalAttrRow
                              key={la.id}
                              id={la.id}
                              name={la.name}
                              saving={la.saving}
                              value={values[la.id] ?? ""}
                              onChange={(v) => setValue(la.id, v)}
                              isDragActive={activeId === la.id}
                              onRemove={() => removeLocalAttr(group.id, la.id)}
                            />
                          ))}
                        </SortableContext>
                        {addingAttrGroupId === group.id ? (
                          <AddAttrInline
                            onSave={(name) => addLocalAttr(group.id, name)}
                            onCancel={() => setAddingAttrGroupId(null)}
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAddingAttrGroupId(group.id)}
                            className="flex w-full items-center gap-1 px-8 py-1 text-[10px] text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                          >
                            <Plus className="h-3 w-3" /> Add attribute
                          </button>
                        )}
                      </>
                    );
                    })()}
                  </SortableGroupRow>
                );
              })}
            </SortableContext>

            {/* Custom (product-only) groups — inside profile block but not saved to profile */}
            {customGroups.map((cg) => {
              const cgAttrs = localAttrs[cg.id] ?? [];
              const isOpen = !collapsed[cg.id];
              return (
                <div key={cg.id} className="border-t border-input">
                  <div
                    className="flex cursor-pointer items-center gap-1.5 px-2 py-1 hover:bg-muted/10"
                    onClick={() => setCollapsed((c) => ({ ...c, [cg.id]: !c[cg.id] }))}
                  >
                    <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition", !isOpen && "-rotate-90")} />
                    <FolderOpen className="h-3.5 w-3.5 text-orange-400" />
                    <span className="flex-1 text-xs font-medium">{cg.name}</span>
                    <span className="rounded bg-orange-500/15 px-1 py-px text-[9px] font-medium text-orange-500">this product only</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setCustomGroups((prev) => { const next = prev.filter((g) => g.id !== cg.id); emitChange(values, next, localAttrs); return next; }); }}
                      className="ml-1 rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  {isOpen && (
                    <>
                      {cgAttrs.map((la) => (
                        <LocalAttrRow
                          key={la.id}
                          id={la.id}
                          name={la.name}
                          value={values[la.id] ?? ""}
                          onChange={(v) => setValue(la.id, v)}
                          isDragActive={false}
                          onRemove={() => removeLocalAttr(cg.id, la.id)}
                        />
                      ))}
                      {addingAttrGroupId === cg.id ? (
                        <AddAttrInline
                          onSave={(name) => addLocalAttr(cg.id, name)}
                          onCancel={() => setAddingAttrGroupId(null)}
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAddingAttrGroupId(cg.id)}
                          className="flex w-full items-center gap-1 px-8 py-1 text-[10px] text-muted-foreground hover:bg-muted/20 hover:text-foreground"
                        >
                          <Plus className="h-3 w-3" /> Add attribute
                        </button>
                      )}
                    </>
                  )}
                </div>
              );
            })}

            {/* Add group */}
            {addingGroup ? (
              <AddGroupInline onSave={addGroup} onCancel={() => setAddingGroup(false)} />
            ) : (
              <button
                type="button"
                onClick={() => setAddingGroup(true)}
                className="flex w-full items-center gap-1 border-t border-input px-3 py-1.5 text-[10px] text-muted-foreground hover:bg-muted/20 hover:text-foreground"
              >
                <Plus className="h-3 w-3" /> Add group
              </button>
            )}
          </div>

          <DragOverlay>
            {activeGroup ? (
              <div className="flex items-center gap-1.5 rounded border border-primary/30 bg-muted/80 px-2 py-1 text-xs shadow-md">
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                <FolderOpen className="h-3.5 w-3.5 text-sky-500" />
                {activeGroup.name}
              </div>
            ) : activeAttr ? (
              <div className="flex items-center gap-2 rounded border border-primary/30 bg-background px-2 py-1 text-xs shadow-md">
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                {activeAttr.name}
              </div>
            ) : activeLocalAttr ? (
              <div className="flex items-center gap-2 rounded border border-primary/30 bg-background px-2 py-1 text-xs shadow-md">
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                {activeLocalAttr.name}
                <span className="rounded bg-muted px-1 py-px text-[8px] text-muted-foreground">custom</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {editProfileOpen && profileId && (
        <AttributeProfileEditDialog
          profileId={profileId}
          open={editProfileOpen}
          onClose={() => setEditProfileOpen(false)}
          onSaved={() => { /* useCatalogAttributeProfiles refetches automatically via SWR */ }}
        />
      )}
      <AttributeProfileFormDialog
        open={addProfileOpen}
        onOpenChange={(o) => setAddProfileOpen(o)}
        mode="create"
        profile={null}
        groups={groups}
        attributes={attributes}
        onSaved={(newProfileId) => {
          setAddProfileOpen(false);
          if (newProfileId) {
            void refetchProfiles().then(() => handleProfileChange(newProfileId));
          }
        }}
      />
    </div>
  );
}

/* ── Profile combobox ── */
function ProfileCombobox({
  profiles, value, onChange, onAdd, onEdit,
}: {
  profiles: { id: string; name: string }[];
  value: string;
  onChange: (id: string) => void;
  onAdd: () => void;
  onEdit?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = profiles.find((p) => p.id === value);
  const filtered = profiles.filter((p) =>
    !search.trim() || p.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 w-full items-center gap-1.5 rounded-md border border-input bg-background px-2 text-xs shadow-sm hover:bg-accent/30"
      >
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground transition", open && "rotate-180")} />
        <span className={cn("flex-1 truncate text-left", !selected && "text-muted-foreground")}>
          {selected ? selected.name : "— Select profile —"}
        </span>
        {selected && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onChange(""))}
            className="rounded p-0.5 hover:bg-muted"
          >
            <X className="h-3 w-3" />
          </span>
        )}
        {selected && onEdit && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onEdit())}
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Edit profile"
          >
            <Pencil className="h-3 w-3" />
          </span>
        )}
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onAdd())}
          className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          title="Add profile"
        >
          +
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="flex items-center border-b px-2 py-1">
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search profiles…"
              className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">No profiles found</p>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { onChange(p.id); setOpen(false); }}
                  className={cn("flex w-full items-center px-3 py-1.5 text-left text-xs hover:bg-accent", p.id === value && "bg-accent/60 font-medium")}
                >
                  {p.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Local (product-only) attribute row ── */
function LocalAttrRow({ id, name, value, onChange, isDragActive, saving, onRemove }: {
  id: string; name: string; value: string; saving?: boolean;
  onChange: (v: string) => void; isDragActive: boolean; onRemove: () => void;
}) {
  const { attributes: dndAttrs, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-1.5 border-b border-input/50 px-2 py-1 last:border-0 hover:bg-muted/10", isDragActive && "opacity-40")}
    >
      <div
        className="cursor-grab touch-none active:cursor-grabbing"
        {...dndAttrs}
        {...listeners}
        onPointerDown={(e) => { e.stopPropagation(); (listeners as any)?.onPointerDown?.(e); }}
      >
        <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40 hover:text-muted-foreground" />
      </div>
      <div className="flex w-44 shrink-0 items-center gap-1 overflow-hidden">
        <span className={cn("truncate text-xs", saving && "text-muted-foreground")}>{name}</span>
        <span className={cn("shrink-0 rounded px-1 py-px text-[8px]", saving ? "bg-muted text-muted-foreground" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300")}>
          {saving ? "saving…" : "custom"}
        </span>
      </div>
      {/* value — takes the rest */}
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <div className="flex-1">
          <ExpandableTextInput value={value} onChange={onChange} placeholder="Enter value…" />
        </div>
        <button type="button" onClick={onRemove} className="shrink-0 text-muted-foreground/30 hover:text-destructive" title="Remove attribute">
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/* ── Inline new attribute input ── */
function AddAttrInline({ onSave, onCancel }: { onSave: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="flex items-center gap-1.5 border-b border-input/50 bg-muted/20 px-2 py-1">
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground/20" />
      <input
        ref={ref}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); onSave(name); }
          if (e.key === "Escape") { e.preventDefault(); onCancel(); }
        }}
        onBlur={() => { if (name.trim()) onSave(name); else onCancel(); }}
        placeholder="Attribute name… (Enter to save, Esc to cancel)"
        className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
      />
    </div>
  );
}

function AddGroupInline({ onSave, onCancel }: { onSave: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="flex items-center gap-1.5 border-t border-input bg-muted/20 px-3 py-1.5">
      <FolderOpen className="h-3.5 w-3.5 shrink-0 text-sky-500/60" />
      <input
        ref={ref}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); onSave(name); }
          if (e.key === "Escape") { e.preventDefault(); onCancel(); }
        }}
        onBlur={() => { if (name.trim()) onSave(name); else onCancel(); }}
        placeholder="Group name… (Enter to save, Esc to cancel)"
        className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
      />
    </div>
  );
}

/* ── Sortable group row ── */
function SortableGroupRow({
  groupId, groupName, isOpen, filled, total, isDragActive, onToggle, children,
}: {
  groupId: string;
  groupName: string;
  isOpen: boolean;
  filled: number;
  total: number;
  isDragActive: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: groupId });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("border-b border-input last:border-0", isDragActive && "opacity-40")}
    >
      <div className="flex w-full items-center gap-1.5 bg-muted/20 px-2 py-1 hover:bg-muted/40">
        {/* Drag handle for group */}
        <div
          className="cursor-grab touch-none active:cursor-grabbing"
          {...attributes}
          {...listeners}
          onPointerDown={(e) => { e.stopPropagation(); (listeners as any)?.onPointerDown?.(e); }}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 hover:text-muted-foreground" />
        </div>
        {/* Toggle button */}
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center gap-1.5 text-left"
        >
          {isOpen ? <ChevronDown className="h-3 w-3 text-muted-foreground" /> : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
          <FolderOpen className="h-3.5 w-3.5 text-sky-500" />
          <span className="text-xs font-medium">{groupName}</span>
          <span className="ml-auto text-[10px] text-muted-foreground">{filled}/{total}</span>
        </button>
      </div>
      {children}
    </div>
  );
}

/* ── Sortable attr row ── */
function SortableAttrRow({
  attr, value, onChange, isDragActive,
  predefinedValues, filterEditOpen, onFilterEditToggle, onPredefinedAdd, onPredefinedRemove, onHide,
}: {
  attr: AttributeSpec;
  value: string;
  onChange: (v: string) => void;
  isDragActive: boolean;
  predefinedValues: string[];
  filterEditOpen: boolean;
  onFilterEditToggle: () => void;
  onPredefinedAdd: (v: string) => void;
  onPredefinedRemove: (v: string) => void;
  onHide: () => void;
}) {
  const { attributes: dndAttrs, listeners, setNodeRef, transform, transition } =
    useSortable({ id: attr.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "border-b border-input/50 last:border-0",
        isDragActive && "opacity-40",
      )}
    >
      {/* Main row */}
      <div className="flex items-center gap-1.5 px-2 py-1 hover:bg-muted/10">
        {/* Drag handle */}
        <div
          className="cursor-grab touch-none active:cursor-grabbing"
          {...dndAttrs}
          {...listeners}
          onPointerDown={(e) => { e.stopPropagation(); (listeners as any)?.onPointerDown?.(e); }}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 hover:text-muted-foreground" />
        </div>

        {/* Name */}
        <div className="flex w-44 shrink-0 items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
          <span className="truncate text-xs">
            {attr.name}
            {attr.isRequired && <span className="text-destructive"> *</span>}
          </span>
          {attr.isFilterable && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFilterEditToggle(); }}
              className={cn(
                "inline-flex shrink-0 items-center gap-0.5 rounded px-1 py-px text-[9px] font-medium transition-colors",
                filterEditOpen
                  ? "bg-sky-500 text-white"
                  : "bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-300",
              )}
            >
              <Filter className="h-2 w-2" /> Filter
            </button>
          )}
        </div>

        {/* Value input — hidden while editing filter list */}
        {!filterEditOpen && (
          <div className="flex flex-1 items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
            <div className="flex-1">
              <CompactValueInput
                attr={attr}
                value={value}
                onChange={onChange}
                predefinedValues={predefinedValues}
              />
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onHide(); }}
              className="shrink-0 text-muted-foreground/30 hover:text-destructive"
              title="Remove from this product"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* Inline filter list editor */}
      {filterEditOpen && attr.isFilterable && (
        <div
          className="border-t border-sky-200/60 bg-sky-50/40 px-3 py-2 dark:border-sky-900/40 dark:bg-sky-950/20"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <p className="mb-1.5 text-[10px] font-medium text-sky-700 dark:text-sky-400">
            Filter options — press Enter to add
          </p>
          <FilterListEditor
            values={predefinedValues}
            onAdd={onPredefinedAdd}
            onRemove={onPredefinedRemove}
          />
        </div>
      )}
    </div>
  );
}

/* ── Inline filter list editor ── */
function FilterListEditor({
  values: chips,
  onAdd,
  onRemove,
}: {
  values: string[];
  onAdd: (v: string) => void;
  onRemove: (v: string) => void;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const trimmed = input.trim();
    if (trimmed) { onAdd(trimmed); setInput(""); }
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {chips.map((chip) => (
        <span
          key={chip}
          className="inline-flex items-center gap-0.5 rounded-full border border-sky-300 bg-sky-100 px-1.5 py-px text-[10px] text-sky-800 dark:border-sky-700 dark:bg-sky-900/50 dark:text-sky-200"
        >
          {chip}
          <button
            type="button"
            onClick={() => onRemove(chip)}
            className="ml-0.5 rounded-full hover:text-destructive"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
        }}
        placeholder="Add option…"
        className="h-5 min-w-[80px] flex-1 rounded border border-dashed border-sky-300 bg-transparent px-1.5 text-[10px] outline-none placeholder:text-sky-400 focus:border-sky-500"
      />
    </div>
  );
}

/* ── Compact value input ── */
function CompactValueInput({ attr, value, onChange, predefinedValues }: { attr: AttributeSpec; value: string; onChange: (v: string) => void; predefinedValues?: string[] }) {
  const effectivePredefined = predefinedValues ?? attr.predefinedValues ?? [];
  const cls = "h-6 py-0 leading-6 text-[11px]";

  if ((attr.isFilterable || attr.fieldType === "dropdown" || attr.fieldType === "radio") && effectivePredefined.length) {
    return (
      <Select value={value} onChange={(e) => onChange(e.target.value)} className={cls}>
        <option value="">Select…</option>
        {effectivePredefined.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </Select>
    );
  }

  if (attr.fieldType === "multi_select" && effectivePredefined.length) {
    const selected = value ? value.split(",").filter(Boolean) : [];
    const toggle = (opt: string) => {
      const next = selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt];
      onChange(next.join(","));
    };
    return (
      <div className="flex flex-wrap gap-1">
        {effectivePredefined.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              "rounded border px-1.5 py-px text-[10px] transition-colors",
              selected.includes(opt)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background hover:border-primary/50",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  }

  if (attr.fieldType === "boolean" || attr.fieldType === "checkbox") {
    return (
      <label className="flex cursor-pointer items-center gap-1.5">
        <input
          type="checkbox"
          checked={value === "yes"}
          onChange={(e) => onChange(e.target.checked ? "yes" : "")}
          className="h-3.5 w-3.5 accent-primary"
        />
        <span className="text-xs text-muted-foreground">Yes</span>
      </label>
    );
  }

  if (attr.fieldType === "date") {
    return (
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cls}
      />
    );
  }

  /* text / number / textarea / url / color → expandable */
  return (
    <ExpandableTextInput
      value={value}
      onChange={onChange}
      placeholder={attr.unit ? `Value (${attr.unit})` : "Enter value…"}
      numeric={attr.fieldType === "number"}
    />
  );
}

/* ── Expandable text input ──
   Collapsed = single-line h-6 display.
   Focused   = absolute-positioned textarea that floats over rows below.
   Blur      = collapses back without changing row height.
*/
function ExpandableTextInput({
  value,
  onChange,
  placeholder,
  numeric,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expanded) return;
    if (wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      setOpenUp(window.innerHeight - rect.bottom < 120);
    }
    requestAnimationFrame(() => {
      taRef.current?.focus();
      const ta = taRef.current;
      if (ta) { ta.style.height = "auto"; ta.style.height = `${Math.max(ta.scrollHeight, 72)}px`; }
    });
  }, [expanded]);

  const autoResize = () => {
    const ta = taRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = `${Math.max(ta.scrollHeight, 72)}px`; }
  };

  const preview = value.split("\n")[0];
  const multiline = value.includes("\n") || value.length > 40;

  return (
    <div ref={wrapRef} className="relative">
      {/* Collapsed trigger — stays visible as placeholder when expanded */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded(true)}
        onFocus={() => setExpanded(true)}
        className={cn(
          "flex h-6 w-full cursor-text items-center truncate rounded border border-input bg-background px-2 text-xs",
          "hover:border-ring focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          expanded && "opacity-0 pointer-events-none",
          !value && "text-muted-foreground",
        )}
      >
        {preview || placeholder}
        {multiline && <span className="ml-1 shrink-0 text-[9px] text-muted-foreground">(+lines)</span>}
      </div>

      {/* Absolute floating textarea — opens above or below trigger */}
      {expanded && (
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => { onChange(e.target.value); autoResize(); }}
          onBlur={() => setExpanded(false)}
          onKeyDown={(e) => { if (e.key === "Escape") { e.preventDefault(); setExpanded(false); } }}
          inputMode={numeric ? "numeric" : undefined}
          placeholder={placeholder}
          className="absolute left-0 z-50 w-full resize-none overflow-hidden rounded border border-ring bg-background px-2 py-1 text-xs shadow-lg outline-none ring-1 ring-ring"
          style={openUp
            ? { bottom: "calc(100% + 2px)", top: "auto", minHeight: 72 }
            : { top: 0, minHeight: 72 }}
        />
      )}
    </div>
  );
}
