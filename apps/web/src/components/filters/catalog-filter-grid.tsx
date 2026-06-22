"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Filter,
  GripVertical,
  Layers,
  MoreHorizontal,
  Pencil,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  FILTER_DISPLAY_LABELS,
  FILTER_SOURCE_LABELS,
  type CatalogFacetFilter,
  type FilterDisplayType,
  type FilterSource,
} from "@/lib/mock-data/catalog-filters";
import { useCatalogFilterStore } from "@/lib/store/catalog-filter-store";
import { useAttributeProfileStore } from "@/lib/store/attribute-profile-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CatalogFilterFormDialog } from "@/components/filters/catalog-filter-form-dialog";

type FilterState = { search: string; displayType: string };
const DEFAULT_FILTERS: FilterState = { search: "", displayType: "all" };

function applyFilters(rows: CatalogFacetFilter[], f: FilterState) {
  const q = f.search.toLowerCase().trim();
  return rows.filter((item) => {
    if (q && !item.name.toLowerCase().includes(q) && !item.paramKey.toLowerCase().includes(q) && !item.attributeName.toLowerCase().includes(q)) return false;
    if (f.displayType !== "all" && item.displayType !== f.displayType) return false;
    return true;
  });
}

const DISPLAY_TYPE_COLORS: Record<FilterDisplayType, string> = {
  multi_select: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  range: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  boolean: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  color: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  dynamic: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

type Props = { className?: string; addTrigger?: number };

export function CatalogFilterGrid({ className, addTrigger = 0 }: Props) {
  const catalogFilters = useCatalogFilterStore((s) => s.filters);
  const getDisplayOrder = useCatalogFilterStore((s) => s.getDisplayOrder);
  const upsertFilter = useCatalogFilterStore((s) => s.upsertFilter);
  const patchFilter = useCatalogFilterStore((s) => s.patchFilter);
  const deleteFilters = useCatalogFilterStore((s) => s.deleteFilters);

  const storeAttributes = useAttributeProfileStore((s) => s.attributes);

  // All filterable attributes from the attribute store
  const filterableAttrs = useMemo(
    () => storeAttributes.filter((a) => a.isFilterable),
    [storeAttributes],
  );

  // Filterable attributes that don't have a filter yet
  const suggestedAttrs = useMemo(() => {
    const linkedIds = new Set(catalogFilters.map((f) => f.attributeId).filter(Boolean));
    return filterableAttrs.filter((a) => !linkedIds.has(a.id));
  }, [filterableAttrs, catalogFilters]);

  const [toolbarFilters, setToolbarFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editFilter, setEditFilter] = useState<CatalogFacetFilter | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["builtin", "attribute"]));
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set());
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState<CatalogFacetFilter[]>([]);
  const [selected, setSelected] = useState<CatalogFacetFilter[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const ordered = useMemo(() => getDisplayOrder(), [catalogFilters, getDisplayOrder]);
  const filtered = useMemo(() => applyFilters(ordered, toolbarFilters), [ordered, toolbarFilters]);

  const builtIn = filtered.filter((f) => f.source === "built_in");
  const fromAttributes = filtered.filter((f) => f.source === "attribute");

  const toggleGroup = (key: string) =>
    setExpandedGroups((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const toggleFilter = (id: string) =>
    setExpandedFilters((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const openCreate = useCallback(() => { setFormMode("create"); setEditFilter(null); setFormOpen(true); }, []);
  const openEdit = useCallback((f: CatalogFacetFilter) => { setFormMode("edit"); setEditFilter(f); setFormOpen(true); }, []);

  useEffect(() => { if (addTrigger > 0) openCreate(); }, [addTrigger, openCreate]);

  const toggleActive = (f: CatalogFacetFilter) => patchFilter(f.id, { isActive: !f.isActive });
  const toggleStorefront = (f: CatalogFacetFilter) => patchFilter(f.id, { storefrontVisible: !f.storefrontVisible });

  const openDeleteConfirm = (targets: CatalogFacetFilter[]) => {
    const deletable = targets.filter((t) => !t.isSystem);
    if (!deletable.length) { toast.error("System filters cannot be deleted"); return; }
    setDeleteTargets(deletable);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    deleteFilters(deleteTargets.map((t) => t.id));
    toast.success(`Deleted ${deleteTargets.length} filter${deleteTargets.length > 1 ? "s" : ""}`);
    setDeleteOpen(false);
    setDeleteTargets([]);
    setSelected([]);
  };

  const handleSave = (data: Partial<CatalogFacetFilter>) => {
    if (formMode === "create") upsertFilter(data);
    else if (editFilter) upsertFilter({ id: editFilter.id, ...data });
  };

  // Auto-create a filter from a filterable attribute
  const createFromAttr = (attr: typeof filterableAttrs[0]) => {
    const isNumeric = attr.fieldType === "number";
    const hasValues = (attr.predefinedValues ?? []).length > 0;
    const displayType: FilterDisplayType = isNumeric ? "range" : hasValues ? "multi_select" : "dynamic";
    upsertFilter({
      name: attr.name,
      paramKey: attr.code.replace(/[^a-z0-9]/g, "_").toLowerCase(),
      displayType,
      source: "attribute",
      attributeId: attr.id,
      attributeName: attr.name,
      isActive: true,
      storefrontVisible: true,
      categoryScope: "All categories",
      valueCount: attr.predefinedValues?.length ?? 0,
      urlExample: `?${attr.code}=`,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
    toast.success(`Filter created for ${attr.name}`);
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = ordered.map((f) => f.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    // reorder via store
    const store = useCatalogFilterStore.getState();
    store.reorderFilters(next);
    toast.success("Filter order updated");
    setDragId(null);
    setOverId(null);
  };

  const FilterRow = ({ f }: { f: CatalogFacetFilter }) => {
    const expanded = expandedFilters.has(f.id);
    const chips = f.source === "attribute"
      ? (storeAttributes.find((a) => a.id === f.attributeId)?.predefinedValues ?? [])
      : [];
    return (
      <div
        key={f.id}
        onDragOver={(e) => { e.preventDefault(); setOverId(f.id); }}
        onDragLeave={() => setOverId((k) => k === f.id ? null : k)}
        onDrop={() => handleDrop(f.id)}
        className={cn(overId === f.id && dragId !== f.id && "rounded-md ring-2 ring-primary/30")}
      >
        <div
          draggable
          onDragStart={() => setDragId(f.id)}
          onDragEnd={() => { setDragId(null); setOverId(null); }}
          className={cn(
            "flex cursor-grab items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-muted/40 active:cursor-grabbing",
            dragId === f.id && "opacity-50",
            !f.isActive && "opacity-50",
          )}
        >
          <input
            type="checkbox"
            checked={selected.some((s) => s.id === f.id)}
            onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, f] : prev.filter((s) => s.id !== f.id))}
            className="shrink-0 rounded border-input"
            onClick={(e) => e.stopPropagation()}
          />
          <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50" />
          {chips.length > 0 && (
            <button type="button" onClick={() => toggleFilter(f.id)} className="shrink-0 text-muted-foreground hover:text-foreground">
              {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          )}
          {chips.length === 0 && <span className="w-3.5 shrink-0" />}
          <span className="min-w-0 flex-1 truncate text-xs font-medium">{f.name}</span>
          <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium", DISPLAY_TYPE_COLORS[f.displayType])}>
            {FILTER_DISPLAY_LABELS[f.displayType]}
          </span>
          {f.attributeName && f.source === "attribute" && (
            <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">{f.attributeName}</span>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleStorefront(f); }}
            className={cn("shrink-0", f.storefrontVisible ? "text-emerald-600" : "text-muted-foreground/40")}
            title={f.storefrontVisible ? "Visible on storefront" : "Hidden on storefront"}
          >
            {f.storefrontVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleActive(f); }}
            className={cn(
              "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
              f.isActive ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-muted text-muted-foreground",
            )}
          >
            {f.isActive ? "On" : "Off"}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 shrink-0 p-0">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEdit(f)}>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              {!f.isSystem && (
                <DropdownMenuItem onClick={() => openDeleteConfirm([f])} className="text-destructive">
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Predefined value chips when expanded */}
        {expanded && chips.length > 0 && (
          <div className="ml-10 border-l border-input pl-3 pb-1">
            <div className="flex flex-wrap gap-1 py-1">
              {chips.map((v) => (
                <span key={v} className="rounded border border-input bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">{v}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const GroupBlock = ({ label, icon, groupKey, rows, source }: {
    label: string; icon: React.ReactNode; groupKey: string; rows: CatalogFacetFilter[]; source: FilterSource;
  }) => {
    const open = expandedGroups.has(groupKey);
    return (
      <div>
        <button
          type="button"
          onClick={() => toggleGroup(groupKey)}
          className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left hover:bg-muted/40"
        >
          {open ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
          {icon}
          <span className="flex-1 text-xs font-semibold">{label}</span>
          <span className="text-[10px] text-muted-foreground">{rows.length}</span>
        </button>
        {open && (
          <div className="ml-5 border-l border-input pl-3 space-y-0.5 py-0.5">
            {rows.length === 0 ? (
              <p className="py-1.5 text-[11px] text-muted-foreground">No {label.toLowerCase()} filters</p>
            ) : (
              rows.map((f) => <FilterRow key={f.id} f={f} />)
            )}
            <button
              type="button"
              onClick={openCreate}
              className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <Plus className="h-3 w-3" />
              Add {source === "built_in" ? "built-in" : "attribute"} filter
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex min-h-0 flex-col gap-3", className)}>
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Input
          placeholder="Search name, param, attribute…"
          value={toolbarFilters.search}
          onChange={(e) => setToolbarFilters((f) => ({ ...f, search: e.target.value }))}
          className="max-w-[220px]"
        />
        <Select
          value={toolbarFilters.displayType}
          onChange={(e) => setToolbarFilters((f) => ({ ...f, displayType: e.target.value }))}
          className="w-[150px]"
        >
          <option value="all">All types</option>
          {(Object.keys(FILTER_DISPLAY_LABELS) as FilterDisplayType[]).map((t) => (
            <option key={t} value={t}>{FILTER_DISPLAY_LABELS[t]}</option>
          ))}
        </Select>
        <Button variant="outline" size="sm" onClick={() => setToolbarFilters(DEFAULT_FILTERS)}>
          <Filter className="mr-1.5 h-3.5 w-3.5" />
          Reset
        </Button>
        {selected.length > 0 && (
          <>
            <span className="text-xs text-muted-foreground">{selected.length} selected</span>
            <Button variant="outline" size="sm" onClick={() => { selected.forEach((f) => patchFilter(f.id, { isActive: true })); setSelected([]); toast.success("Activated"); }}>Activate</Button>
            <Button variant="outline" size="sm" onClick={() => { selected.forEach((f) => patchFilter(f.id, { isActive: false })); setSelected([]); toast.success("Deactivated"); }}>Deactivate</Button>
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => openDeleteConfirm(selected)}>
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
            </Button>
          </>
        )}
      </div>

      {/* Tree list */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-input bg-card px-3 py-3">
        {/* Root node */}
        <div className="mb-1 flex items-center gap-1.5 px-1 py-1">
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="text-xs font-semibold">Filters</span>
          <span className="ml-auto text-[10px] text-muted-foreground">{filtered.length} total</span>
        </div>

        <div className="ml-[7px] border-l border-input pl-3 space-y-0.5">
          {/* Built-in group */}
          <GroupBlock
            label="Built-in"
            icon={<Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
            groupKey="builtin"
            rows={builtIn}
            source="built_in"
          />

          {/* From Attributes group */}
          <GroupBlock
            label="From Attributes"
            icon={<Filter className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />}
            groupKey="attribute"
            rows={fromAttributes}
            source="attribute"
          />
        </div>

        {/* Suggested filters from filterable attributes */}
        {suggestedAttrs.length > 0 && (
          <div className="mt-4 rounded-lg border border-dashed border-input p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold">Suggested from filterable attributes</span>
              <span className="text-[10px] text-muted-foreground ml-1">({suggestedAttrs.length})</span>
            </div>
            <div className="space-y-0.5">
              {suggestedAttrs.map((attr) => {
                const isNumeric = attr.fieldType === "number";
                const hasValues = (attr.predefinedValues ?? []).length > 0;
                const displayType: FilterDisplayType = isNumeric ? "range" : hasValues ? "multi_select" : "dynamic";
                return (
                  <div key={attr.id} className="flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-muted/30">
                    <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{attr.name}</span>
                    <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium", DISPLAY_TYPE_COLORS[displayType])}>
                      {FILTER_DISPLAY_LABELS[displayType]}
                    </span>
                    <button
                      type="button"
                      onClick={() => createFromAttr(attr)}
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10"
                    >
                      + Add
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <CatalogFilterFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        filter={editFilter}
        onSave={handleSave}
        onLiveChange={(data) => patchFilter(data.id, data)}
      />

      <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(400px,95vw)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-input bg-background p-5 shadow-xl">
            <Dialog.Title className="text-base font-semibold">Delete filters?</Dialog.Title>
            <p className="mt-2 text-sm text-muted-foreground">
              {deleteTargets.length} filter{deleteTargets.length > 1 ? "s" : ""} will be removed. System filters are protected.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" className="absolute right-3 top-3 h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
