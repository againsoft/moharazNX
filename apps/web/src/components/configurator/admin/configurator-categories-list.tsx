"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderTree, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { STATUS_LABELS, type ConfiguratorCategory } from "@/lib/configurator/types";
import { useConfiguratorCategoryStore } from "@/lib/store/configurator-category-store";
import { useConfiguratorProfileStore } from "@/lib/store/configurator-profile-store";
import {
  ConfiguratorAdminShell,
  ConfiguratorRowCheckbox,
} from "@/components/configurator/admin/configurator-admin-shell";
import { ConfiguratorCategoryFormSheet } from "@/components/configurator/admin/configurator-category-form-sheet";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function statusVariant(status: string) {
  if (status === "active") return "success" as const;
  if (status === "draft") return "warning" as const;
  return "muted" as const;
}

type Props = { addTrigger?: number };

export function ConfiguratorCategoriesList({ addTrigger = 0 }: Props) {
  const categories = useConfiguratorCategoryStore((s) => s.categories);
  const deleteMany = useConfiguratorCategoryStore((s) => s.deleteMany);
  const bulkSetStatus = useConfiguratorCategoryStore((s) => s.bulkSetStatus);
  const profiles = useConfiguratorProfileStore((s) => s.profiles);

  const [profileFilter, setProfileFilter] = useState(profiles[0]?.id ?? "cfg_pc");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "all", required: "all" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ConfiguratorCategory | null>(null);
  const [lastAddTrigger, setLastAddTrigger] = useState(addTrigger);

  useEffect(() => {
    if (addTrigger !== lastAddTrigger) {
      setLastAddTrigger(addTrigger);
      setEditing(null);
      setSheetOpen(true);
    }
  }, [addTrigger, lastAddTrigger]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories
      .filter((c) => c.profileId === profileFilter)
      .filter((c) => {
        if (filters.status !== "all" && c.status !== filters.status) return false;
        if (filters.required === "yes" && !c.isRequired) return false;
        if (filters.required === "no" && c.isRequired) return false;
        if (!q) return true;
        return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categories, profileFilter, search, filters]);

  const profileName = profiles.find((p) => p.id === profileFilter)?.name ?? "Profile";

  const toggleSelect = (id: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <>
      <ConfiguratorAdminShell
        workflow={["1. Select builder profile", "2. Define component slots", "3. Map catalog products", "4. Set required/optional", "5. Order display"]}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search categories…"
        filterFields={[
          { key: "status", label: "Status", type: "select", options: [
            { value: "all", label: "All" }, { value: "active", label: "Active" },
            { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" },
          ]},
          { key: "required", label: "Required", type: "select", options: [
            { value: "all", label: "All" }, { value: "yes", label: "Required" }, { value: "no", label: "Optional" },
          ]},
        ]}
        filterValues={filters}
        onFilterChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
        selectedCount={selected.size}
        onBulkActivate={() => { bulkSetStatus([...selected], "active"); toast.success("Activated"); setSelected(new Set()); }}
        onBulkArchive={() => { bulkSetStatus([...selected], "archived"); toast.success("Archived"); setSelected(new Set()); }}
        onBulkDelete={() => { deleteMany([...selected]); toast.success("Deleted"); setSelected(new Set()); }}
        onClearSelection={() => setSelected(new Set())}
        createLabel="Create category"
        onCreate={() => { setEditing(null); setSheetOpen(true); }}
        extraToolbar={
          <Select value={profileFilter} onChange={(e) => setProfileFilter(e.target.value)} className="h-8 w-[160px] text-xs">
            {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        }
      >
        <div className="overflow-hidden rounded-lg border border-input bg-card shadow-sm">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <FolderTree className="mx-auto h-8 w-8 text-indigo-500/70" />
              <p className="mt-2 text-sm font-medium">No categories for {profileName}</p>
            </div>
          ) : (
            filtered.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 border-b border-input px-3 py-3 last:border-0 hover:bg-muted/20">
                <ConfiguratorRowCheckbox checked={selected.has(cat.id)} onChange={(on) => toggleSelect(cat.id, on)} />
                <button type="button" className="min-w-0 flex-1 text-left" onClick={() => { setEditing(cat); setSheetOpen(true); }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{cat.name}</span>
                    <Badge variant="outline" className="text-[10px]">#{cat.sortOrder}</Badge>
                    <Badge variant={statusVariant(cat.status)} className="text-[10px]">{STATUS_LABELS[cat.status]}</Badge>
                    {cat.isRequired && <Badge variant="secondary" className="text-[10px]">Required</Badge>}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{cat.slug} · {cat.selectionMode} · {cat.productCount} products</p>
                </button>
                <ActivityTriggerButton entity={{ type: "configurator_category", id: cat.id, label: cat.name }} />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditing(cat); setSheetOpen(true); }}><Pencil className="mr-2 h-3.5 w-3.5" />Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => { deleteMany([cat.id]); toast.success("Deleted"); }}><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </ConfiguratorAdminShell>

      <ConfiguratorCategoryFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        category={editing}
        defaultProfileId={profileFilter}
        profileName={profileName}
      />
    </>
  );
}
