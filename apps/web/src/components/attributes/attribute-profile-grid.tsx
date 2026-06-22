"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams, RowDragEndEvent } from "ag-grid-community";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Archive,
  ChevronDown,
  ChevronRight,
  Eye,
  ExternalLink,
  Filter,
  FolderOpen,
  GripVertical,
  Layers,
  MoreHorizontal,
  MousePointerClick,
  Pencil,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { AttributeProfile, AttributeGroup, AttributeSpec } from "@/lib/mock-data/attribute-profiles";
import {
  deleteAttributeProfiles,
  patchAttributeProfile,
  reorderAttributeProfiles,
} from "@/lib/api/use-catalog-attribute-profiles";
import { cn } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";
import { AttributeProfileFormDialog } from "@/components/attributes/attribute-profile-form-dialog";

const PAGE_SIZE = 25;

const COLUMN_KEYS = ["code", "categories", "products", "status", "updated"] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];

const COLUMN_LABELS: Record<ColumnKey, string> = {
  code: "Code",
  categories: "Categories",
  products: "Products",
  status: "Status",
  updated: "Updated",
};

const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = {
  code: true,
  categories: true,
  products: true,
  status: true,
  updated: true,
};

const LIVE_EDIT_TOGGLES = ["status"] as const;
type LiveEditKey = (typeof LIVE_EDIT_TOGGLES)[number];

const LIVE_EDIT_LABELS: Record<LiveEditKey, string> = {
  status: "Status",
};

const LIVE_EDIT_HINTS: Record<LiveEditKey, string> = {
  status: "Click On / Off in grid · Off = inactive",
};

const DEFAULT_LIVE_EDIT: Record<LiveEditKey, boolean> = {
  status: true,
};

const FORM_ONLY_FIELDS = [
  "Description",
  "Category mapping",
  "Groups & Attributes",
] as const;

const FILTER_KEYS = ["search", "status"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

const FILTER_LABELS: Record<FilterKey, string> = {
  search: "Search",
  status: "Status",
};

const FILTER_HINTS: Record<FilterKey, string> = {
  search: "Name or code",
  status: "Active / Inactive filter",
};

const DEFAULT_VISIBLE_FILTERS: Record<FilterKey, boolean> = {
  search: true,
  status: false,
};

type FilterState = {
  search: string;
  status: string;
};

const DEFAULT_FILTERS: FilterState = {
  search: "",
  status: "all",
};

function applyFilters(rows: AttributeProfile[], f: FilterState) {
  const q = f.search.toLowerCase().trim();
  return rows.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) {
      return false;
    }
    if (f.status === "on" && !p.active) return false;
    if (f.status === "off" && p.active) return false;
    return true;
  });
}

function reorderProfileIds(
  profiles: AttributeProfile[],
  draggedId: string,
  overId: string,
): string[] | null {
  if (draggedId === overId) return null;
  const sorted = [...profiles].sort((a, b) => a.sortOrder - b.sortOrder);
  const ids = sorted.map((p) => p.id);
  const from = ids.indexOf(draggedId);
  const to = ids.indexOf(overId);
  if (from < 0 || to < 0) return null;
  const next = [...ids];
  next.splice(from, 1);
  next.splice(to, 0, draggedId);
  return next;
}

type Props = {
  className?: string;
  addTrigger?: number;
  profiles: AttributeProfile[];
  groups: AttributeGroup[];
  attributes: AttributeSpec[];
  loading?: boolean;
  onProfilesChanged?: () => void;
  onView?: (profile: AttributeProfile) => void;
  onEdit?: (profile: AttributeProfile) => void;
};

export function AttributeProfileGrid({
  className,
  addTrigger = 0,
  profiles,
  groups,
  attributes,
  loading = false,
  onProfilesChanged,
  onView,
  onEdit: onEditProp,
}: Props) {
  const isDark = useIsDark();
  const canWrite = useAdminCanWrite();
  const gridRef = useRef<AgGridReact<AttributeProfile>>(null);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editProfile, setEditProfile] = useState<AttributeProfile | null>(null);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<AttributeProfile[]>([]);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE);
  const [liveEditSheetOpen, setLiveEditSheetOpen] = useState(false);
  const [liveEdit, setLiveEdit] = useState(DEFAULT_LIVE_EDIT);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [visibleFilters, setVisibleFilters] = useState(DEFAULT_VISIBLE_FILTERS);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState<AttributeProfile[]>([]);
  const [expandedProfiles, setExpandedProfiles] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleProfile = (id: string) =>
    setExpandedProfiles((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleGroup = (id: string) =>
    setExpandedGroups((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const ordered = useMemo(
    () => [...profiles].sort((a, b) => a.sortOrder - b.sortOrder),
    [profiles],
  );
  const filtered = useMemo(() => applyFilters(ordered, filters), [ordered, filters]);

  const openCreate = useCallback(() => {
    setFormMode("create");
    setEditProfile(null);
    setFormOpen(true);
  }, []);

  useEffect(() => {
    if (addTrigger > 0 && canWrite) openCreate();
  }, [addTrigger, openCreate, canWrite]);

  const openEdit = useCallback(
    (profile: AttributeProfile) => {
      if (onEditProp) {
        onEditProp(profile);
      } else {
        setFormMode("edit");
        setEditProfile(profile);
        setFormOpen(true);
      }
    },
    [onEditProp],
  );

  const turnOff = useCallback(
    async (profile: AttributeProfile) => {
      try {
        await patchAttributeProfile(profile.id, { active: false });
        toast.success(`Turned off ${profile.name}`);
        onProfilesChanged?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed");
      }
    },
    [onProfilesChanged],
  );

  const toggleActive = useCallback(
    async (profile: AttributeProfile) => {
      try {
        await patchAttributeProfile(profile.id, { active: !profile.active });
        onProfilesChanged?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed");
      }
    },
    [onProfilesChanged],
  );

  const openDeleteConfirm = useCallback((targets: AttributeProfile[]) => {
    setDeleteTargets(targets);
    setDeleteOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      await deleteAttributeProfiles(deleteTargets.map((t) => t.id));
      toast.success(
        `Deleted ${deleteTargets.length} profile${deleteTargets.length > 1 ? "s" : ""}`,
      );
      setDeleteOpen(false);
      setDeleteTargets([]);
      setSelected([]);
      onProfilesChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }, [deleteTargets, onProfilesChanged]);

  const handleSave = (data: Partial<AttributeProfile>) => {
    onProfilesChanged?.();
    void data;
  };

  const onRowDragEnd = useCallback(
    async (e: RowDragEndEvent<AttributeProfile>) => {
      const dragged = e.node.data;
      const over = e.overNode?.data;
      if (!dragged || !over) return;

      const orderedIds = reorderProfileIds(profiles, dragged.id, over.id);
      if (!orderedIds) {
        e.api.setGridOption("rowData", filtered);
        return;
      }

      try {
        await reorderAttributeProfiles(orderedIds);
        toast.success("Order updated");
        onProfilesChanged?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Reorder failed");
        e.api.setGridOption("rowData", filtered);
      }
    },
    [profiles, filtered, onProfilesChanged],
  );

  const StatusCell = useCallback(
    ({ data }: ICellRendererParams<AttributeProfile>) => {
      if (!data) return null;
      const on = data.active;
      if (!liveEdit.status) {
        return (
          <span className={cn("text-[10px]", on ? "text-emerald-600" : "text-muted-foreground")}>
            {on ? "On" : "Off"}
          </span>
        );
      }
      return (
        <button
          type="button"
          className={cn(
            "rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
            on
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
          onClick={(e) => {
            e.stopPropagation();
            toggleActive(data);
          }}
        >
          {on ? "On" : "Off"}
        </button>
      );
    },
    [liveEdit.status, toggleActive],
  );

  const RowActions = useCallback(
    ({ data }: ICellRendererParams<AttributeProfile>) => {
      if (!data) return null;
      return (
        <div className="flex items-center gap-0">
          <ActivityTriggerButton
            entity={{
              type: "attribute_profile",
              id: data.id,
              label: data.name,
              subtitle: `/${data.code}`,
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(data)}>
                  <Eye className="mr-2 h-3.5 w-3.5" /> View
                </DropdownMenuItem>
              )}
              {canWrite && (
                <>
                  <DropdownMenuItem onClick={() => openEdit(data)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={`/catalog/attributes/${data.id}`}>
                      <ExternalLink className="mr-2 h-3.5 w-3.5" /> Edit Groups &amp; Attributes
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => turnOff(data)} className="text-destructive">
                    <Archive className="mr-2 h-3.5 w-3.5" /> Turn off
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    [openEdit, turnOff, onView, canWrite],
  );

  const columnDefs = useMemo<ColDef<AttributeProfile>[]>(
    () => [
      {
        headerCheckboxSelection: canWrite,
        checkboxSelection: canWrite,
        width: 32,
        maxWidth: 32,
        pinned: "left",
        resizable: false,
        suppressMovable: true,
        suppressHeaderMenuButton: true,
      },
      {
        rowDrag: true,
        width: 32,
        maxWidth: 32,
        pinned: "left",
        resizable: false,
        suppressMovable: true,
        suppressHeaderMenuButton: true,
        headerComponent: () => (
          <GripVertical className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
        ),
      },
      {
        field: "name",
        headerName: "Name",
        width: 240,
        minWidth: 140,
        editable: false,
        tooltipField: "name",
        cellRenderer: (p: ICellRendererParams<AttributeProfile>) => {
          if (!p.data) return null;
          return (
            <button
              type="button"
              className="block w-full truncate text-left font-semibold text-foreground hover:underline focus-visible:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(p.data!);
              }}
            >
              {p.data.name}
            </button>
          );
        },
      },
      {
        field: "code",
        headerName: "Code",
        width: 140,
        hide: !visibleCols.code,
      },
      {
        colId: "categories",
        headerName: "Categories",
        width: 180,
        hide: !visibleCols.categories,
        valueGetter: (p) => p.data?.categoryLabels.join(", ") || "—",
      },
      {
        field: "productCount",
        headerName: "Products",
        width: 88,
        hide: !visibleCols.products,
      },
      {
        colId: "status",
        field: "active",
        headerName: "Status",
        width: 88,
        hide: !visibleCols.status,
        cellRenderer: StatusCell,
      },
      {
        field: "updatedAt",
        headerName: "Updated",
        width: 100,
        hide: !visibleCols.updated,
      },
      {
        colId: "actions",
        headerName: "Action",
        width: 72,
        maxWidth: 72,
        pinned: "right",
        resizable: false,
        suppressMovable: true,
        cellRenderer: RowActions,
        sortable: false,
        suppressHeaderMenuButton: true,
      },
    ],
    [RowActions, visibleCols, liveEdit, StatusCell, onView, openEdit],
  );

  const pageStart = page * PAGE_SIZE + 1;
  const pageEnd = Math.min((page + 1) * PAGE_SIZE, filtered.length);

  const toggleVisibleFilter = (key: FilterKey, enabled: boolean) => {
    setVisibleFilters((v) => ({ ...v, [key]: enabled }));
    if (!enabled) {
      setFilters((f) => ({
        ...f,
        ...(key === "search" ? { search: "" } : {}),
        ...(key === "status" ? { status: "all" } : {}),
      }));
    }
  };

  return (
    <div className={cn("flex min-h-0 flex-col gap-3", className)}>
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {visibleFilters.search && (
          <Input
            placeholder="Search name, code…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="max-w-[220px]"
          />
        )}
        {visibleFilters.status && (
          <Select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="w-[120px]"
          >
            <option value="all">All status</option>
            <option value="on">Active</option>
            <option value="off">Inactive</option>
          </Select>
        )}
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => setFilterSheetOpen(true)}
        >
          <Filter className="mr-1.5 h-3.5 w-3.5" />
          Filters
        </Button>
        {canWrite && (
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => setLiveEditSheetOpen(true)}
          >
            <MousePointerClick className="mr-1.5 h-3.5 w-3.5" />
            Live edit
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => setColumnSheetOpen(true)}
        >
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          Columns
        </Button>
      </div>

      {/* Bulk actions bar */}
      {selected.length > 0 && canWrite && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-xs font-medium">{selected.length} selected</span>
          <Button
            size="sm"
            onClick={() => {
              void (async () => {
                try {
                  await Promise.all(selected.map((p) => patchAttributeProfile(p.id, { active: true })));
                  toast.success(
                    `Activated ${selected.length} profile${selected.length > 1 ? "s" : ""}`,
                  );
                  setSelected([]);
                  onProfilesChanged?.();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Bulk update failed");
                }
              })();
            }}
          >
            Turn on (Active)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void (async () => {
                try {
                  await Promise.all(selected.map((p) => patchAttributeProfile(p.id, { active: false })));
                  toast.success(
                    `Deactivated ${selected.length} profile${selected.length > 1 ? "s" : ""}`,
                  );
                  setSelected([]);
                  onProfilesChanged?.();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Bulk update failed");
                }
              })();
            }}
          >
            Turn off (Inactive)
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openDeleteConfirm(selected)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 w-7 p-0"
            onClick={() => setSelected([])}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Tree list */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-input bg-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-sm font-medium">No profiles match your filters</p>
            <Button size="sm" className="mt-4" onClick={() => setFilters(DEFAULT_FILTERS)}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-input">
            {filtered.map((profile) => {
              const profileExpanded = expandedProfiles.has(profile.id);
              const profileGroups = groups
                .filter((g) => g.profileId === profile.id)
                .sort((a, b) => a.sortOrder - b.sortOrder);
              return (
                <div key={profile.id} className={cn(!profile.active && "opacity-50")}>
                  {/* Profile row */}
                  <div className="flex items-center gap-1.5 px-3 py-2 hover:bg-muted/30">
                    <input
                      type="checkbox"
                      checked={selected.some((s) => s.id === profile.id)}
                      onChange={(e) =>
                        setSelected((prev) =>
                          e.target.checked ? [...prev, profile] : prev.filter((s) => s.id !== profile.id)
                        )
                      }
                      className="shrink-0 rounded border-input"
                    />
                    <button
                      type="button"
                      onClick={() => toggleProfile(profile.id)}
                      className="shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      {profileExpanded
                        ? <ChevronDown className="h-3.5 w-3.5" />
                        : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                    <Layers className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <button
                      type="button"
                      className="min-w-0 flex-1 truncate text-left text-sm font-semibold hover:underline focus-visible:outline-none"
                      onClick={() => openEdit(profile)}
                    >
                      {profile.name}
                    </button>
                    <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground sm:block">
                      {profile.code}
                    </span>
                    <span className="hidden shrink-0 text-[11px] text-muted-foreground lg:block">
                      {profile.categoryLabels.join(", ") || "—"}
                    </span>
                    <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:block">
                      {profile.productCount} products
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleActive(profile); }}
                      className={cn(
                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                        profile.active
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {profile.active ? "On" : "Off"}
                    </button>
                    <div className="flex shrink-0 items-center gap-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onView && (
                            <DropdownMenuItem onClick={() => onView(profile)}>
                              <Eye className="mr-2 h-3.5 w-3.5" /> View
                            </DropdownMenuItem>
                          )}
                          {canWrite && (
                            <>
                              <DropdownMenuItem onClick={() => openEdit(profile)}>
                                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => turnOff(profile)} className="text-destructive">
                                <Archive className="mr-2 h-3.5 w-3.5" /> Turn off
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDeleteConfirm([profile])} className="text-destructive">
                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Groups tree — shown when profile expanded */}
                  {profileExpanded && (
                    <div className="ml-[30px] border-l border-input pl-3 pb-1">
                      {profileGroups.length === 0 ? (
                        <p className="py-1.5 text-[11px] text-muted-foreground">No groups yet</p>
                      ) : (
                        profileGroups.map((group) => {
                          const groupExpanded = expandedGroups.has(group.id);
                          const groupAttrs = attributes
                            .filter((a) => a.groupId === group.id)
                            .sort((a, b) => a.sortOrder - b.sortOrder);
                          return (
                            <div key={group.id}>
                              {/* Group row */}
                              <button
                                type="button"
                                onClick={() => toggleGroup(group.id)}
                                className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left hover:bg-muted/40"
                              >
                                {groupExpanded
                                  ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                  : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                                <FolderOpen className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                                <span className="flex-1 text-xs font-medium">{group.name}</span>
                                <span className="text-[10px] text-muted-foreground">{groupAttrs.length}</span>
                              </button>

                              {/* Attributes — shown when group expanded */}
                              {groupExpanded && (
                                <div className="ml-5 border-l border-input pl-3 py-0.5">
                                  {groupAttrs.map((attr) => (
                                    <div key={attr.id}>
                                      <div className="flex flex-wrap items-center gap-1.5 rounded-md px-1 py-0.5 text-[11px] hover:bg-muted/30">
                                        <span className="font-medium">{attr.name}</span>
                                        {attr.isFilterable && (
                                          <span className="inline-flex items-center gap-0.5 rounded bg-sky-100 px-1 py-0.5 text-[10px] font-medium text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                                            <Filter className="h-2.5 w-2.5" />
                                            Filter
                                          </span>
                                        )}
                                      </div>
                                      {attr.isFilterable && (attr.predefinedValues ?? []).length > 0 && (
                                        <div className="ml-3 border-l border-input pl-2.5 pb-0.5">
                                          <div className="flex flex-wrap gap-1 pt-0.5">
                                            {(attr.predefinedValues ?? []).map((v) => (
                                              <span key={v} className="rounded border border-input bg-muted/50 px-1 py-0.5 text-[10px] text-muted-foreground">{v}</span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile fallback */}
      <div className="md:hidden">
        <div className="space-y-2">
          {filtered.slice(0, 50).map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-lg border border-input bg-card px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <button
                  type="button"
                  className="block w-full truncate text-left text-sm font-semibold hover:underline"
                  onClick={() => openEdit(p)}
                >
                  {p.name}
                </button>
                <p className="truncate text-xs text-muted-foreground">{p.code}</p>
              </div>
              <span
                className={cn(
                  "shrink-0 text-[10px] font-medium",
                  p.active ? "text-emerald-600" : "text-muted-foreground",
                )}
              >
                {p.active ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
          {filtered.length > 50 && (
            <p className="text-center text-xs text-muted-foreground">
              Showing 50 of {filtered.length} — use desktop to reorder
            </p>
          )}
        </div>
      </div>

      {/* Internal form dialog (fallback when onEdit prop not provided) */}
      <AttributeProfileFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        profile={
          editProfile
            ? profiles.find((p) => p.id === editProfile.id) ?? editProfile
            : null
        }
        groups={groups}
        attributes={attributes}
        onSave={handleSave}
        onSaved={() => onProfilesChanged?.()}
      />

      {/* Columns sheet */}
      <Sheet open={columnSheetOpen} onOpenChange={setColumnSheetOpen}>
        <SheetContent side="right" className="w-full max-w-xs">
          <h2 className="pr-8 text-base font-semibold">Columns</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose which columns show in the list. Name, drag, and actions always stay visible.
          </p>
          <div className="mt-4 space-y-2">
            {COLUMN_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={visibleCols[key]}
                  onChange={(e) =>
                    setVisibleCols((v) => ({ ...v, [key]: e.target.checked }))
                  }
                  className="rounded border-input"
                />
                {COLUMN_LABELS[key]}
              </label>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setVisibleCols(DEFAULT_VISIBLE)}
          >
            Reset columns
          </Button>
        </SheetContent>
      </Sheet>

      {/* Filters sheet */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="w-full max-w-sm">
          <h2 className="pr-8 text-base font-semibold">Filters</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose which filters show in the toolbar above the list.
          </p>
          <div className="mt-4 space-y-3">
            {FILTER_KEYS.map((key) => (
              <label key={key} className="flex cursor-pointer gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={visibleFilters[key]}
                  onChange={(e) => toggleVisibleFilter(key, e.target.checked)}
                  className="mt-0.5 rounded border-input"
                />
                <span>
                  <span className="font-medium">{FILTER_LABELS[key]}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {FILTER_HINTS[key]}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
              setFilters(DEFAULT_FILTERS);
            }}
          >
            Reset filters
          </Button>
        </SheetContent>
      </Sheet>

      {/* Live edit sheet */}
      <Sheet open={liveEditSheetOpen} onOpenChange={setLiveEditSheetOpen}>
        <SheetContent side="right" className="w-full max-w-sm">
          <h2 className="pr-8 text-base font-semibold">Live edit</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose which fields you can edit directly in the list without opening the form.
          </p>
          <div className="mt-4 space-y-3">
            {LIVE_EDIT_TOGGLES.map((key) => (
              <label key={key} className="flex cursor-pointer gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={liveEdit[key]}
                  onChange={(e) =>
                    setLiveEdit((v) => ({ ...v, [key]: e.target.checked }))
                  }
                  className="mt-0.5 rounded border-input"
                />
                <span>
                  <span className="font-medium">{LIVE_EDIT_LABELS[key]}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {LIVE_EDIT_HINTS[key]}
                  </span>
                </span>
              </label>
            ))}
            <div className="rounded-md border border-input bg-muted/30 px-3 py-2">
              <p className="text-xs font-medium">Order</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Drag row handle to reorder</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Always enabled</p>
            </div>
          </div>
          <div className="mt-5 border-t border-input pt-4">
            <p className="text-xs font-medium text-muted-foreground">Edit form only</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {FORM_ONLY_FIELDS.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setLiveEdit(DEFAULT_LIVE_EDIT)}
          >
            Reset live edit
          </Button>
        </SheetContent>
      </Sheet>

      {/* Delete confirm dialog */}
      <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(420px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-input bg-background p-6 shadow-xl">
            <Dialog.Title className="text-base font-semibold">Delete profiles?</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              {deleteTargets.length === 1
                ? `"${deleteTargets[0]?.name}" and all its groups/attributes will be permanently deleted.`
                : `${deleteTargets.length} profiles will be permanently deleted.`}
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
