"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CatalogFilterGrid } from "@/components/filters/catalog-filter-grid";
import { CatalogFilterFormDialog } from "@/components/filters/catalog-filter-form-dialog";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import type { CatalogFacetFilter } from "@/lib/mock-data/catalog-filters";
import {
  createCatalogFilter,
  patchCatalogFilter,
  updateCatalogFilter,
  useCatalogFilters,
} from "@/lib/api/use-catalog-filters";
import { useCatalogAttributeProfiles } from "@/lib/api/use-catalog-attribute-profiles";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { useViewerWriteUrlGuard } from "@/lib/hooks/use-viewer-write-url-guard";
import { cn } from "@/lib/utils";

function buildUrl(params: URLSearchParams) {
  const q = params.toString();
  return q ? `/catalog/filters?${q}` : "/catalog/filters";
}

function CatalogFiltersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, total, loading, error, refetch } = useCatalogFilters();
  const { attributes } = useCatalogAttributeProfiles();
  const canWrite = useAdminCanWrite();

  const createOpen = searchParams.get("create") === "1";
  const editId = searchParams.get("edit");

  const filterableAttributes = useMemo(
    () => attributes.filter((a) => a.isFilterable),
    [attributes],
  );

  const editFilter = useMemo(
    () => (editId ? filters.find((f) => f.id === editId) ?? null : null),
    [editId, filters],
  );

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "catalog-filters-api" });
    }
  }, [error]);

  const pushParams = (mutate: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(searchParams.toString());
    mutate(p);
    router.push(buildUrl(p), { scroll: false });
  };

  const openCreate = () =>
    pushParams((p) => {
      p.delete("edit");
      p.set("create", "1");
    });

  const handleEdit = (filter: CatalogFacetFilter) =>
    pushParams((p) => {
      p.delete("create");
      p.set("edit", filter.id);
    });

  const closeForm = () =>
    pushParams((p) => {
      p.delete("create");
      p.delete("edit");
    });

  useViewerWriteUrlGuard(createOpen || !!editId, closeForm);

  useEffect(() => {
    if (editId && !loading && !editFilter) {
      toast.error("Filter not found");
      closeForm();
    }
  }, [editId, editFilter, loading]);

  const handleSave = async (data: Partial<CatalogFacetFilter>) => {
    try {
      if (createOpen) {
        await createCatalogFilter({
          name: data.name ?? "New Filter",
          paramKey: data.paramKey ?? "new_filter",
          displayType: data.displayType ?? "multi_select",
          source: data.source ?? "attribute",
          attributeId: data.attributeId,
          attributeName: data.attributeName ?? "—",
          isActive: data.isActive ?? true,
          storefrontVisible: data.storefrontVisible ?? true,
          categoryScope: data.categoryScope ?? "All categories",
          urlExample: data.urlExample,
        });
        toast.success("Filter created");
      } else if (editFilter) {
        await updateCatalogFilter(editFilter.id, {
          name: data.name,
          paramKey: data.paramKey,
          displayType: data.displayType,
          source: data.source,
          attributeId: data.attributeId,
          attributeName: data.attributeName,
          isActive: data.isActive,
          storefrontVisible: data.storefrontVisible,
          categoryScope: data.categoryScope,
          urlExample: data.urlExample,
        });
        toast.success("Filter updated");
      }
      await refetch();
      closeForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleLiveChange = async (data: Partial<CatalogFacetFilter> & { id: string }) => {
    try {
      await patchCatalogFilter(data.id, data);
      await refetch();
    } catch {
      // silent while form is open
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Ecommerce › Catalog › Filters</p>
          <h1 className="page-title">
            Filters
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({loading ? "…" : total.toLocaleString()})
            </span>
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Faceted search configuration for storefront — multi-select, range, boolean, and dynamic
            attribute filters. Drag rows to set panel order.
          </p>
          <div className="mt-1.5">
            <ApiConnectionBadge loading={loading} error={error} productCount={total} />
          </div>
        </div>
        <div className="hidden gap-2 sm:flex">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={loading}
          >
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("Preview — coming soon")}>
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("Export — coming soon")}>
            Export
          </Button>
          {canWrite && (
            <Button size="sm" onClick={openCreate}>
              + Add Filter
            </Button>
          )}
        </div>
      </div>

      <CatalogFilterGrid
        className="mt-3 min-h-0 flex-1"
        filters={filters}
        filterableAttributes={filterableAttributes}
        loading={loading}
        onFiltersChanged={() => void refetch()}
        onEdit={handleEdit}
        onCreate={openCreate}
      />

      {canWrite && (
        <Button
          size="sm"
          className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg sm:hidden"
          onClick={openCreate}
          aria-label="Add filter"
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}

      {canWrite && (
        <CatalogFilterFormDialog
          open={createOpen || !!editFilter}
          onOpenChange={(open) => {
            if (!open) closeForm();
          }}
          mode={createOpen ? "create" : "edit"}
          filter={editFilter}
          attributeOptions={filterableAttributes.map((a) => ({ id: a.id, name: a.name }))}
          onSave={(data) => void handleSave(data)}
          onLiveChange={(data) => void handleLiveChange(data)}
        />
      )}
    </div>
  );
}

export default function CatalogFiltersPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Loading filters…</div>}>
      <CatalogFiltersContent />
    </Suspense>
  );
}
