"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getCategoryAncestorNames } from "@/lib/category-utils";
import { Button } from "@/components/ui/button";
import { CategoryGrid } from "@/components/categories/category-grid";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { CategoryViewSheet } from "@/components/categories/category-view-sheet";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import type { Category } from "@/lib/mock-data/categories";
import {
  createCatalogCategory,
  patchCatalogCategory,
  updateCatalogCategory,
  useCatalogCategories,
} from "@/lib/api/use-catalog-categories";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { useViewerWriteUrlGuard } from "@/lib/hooks/use-viewer-write-url-guard";
import { cn } from "@/lib/utils";

function buildUrl(params: URLSearchParams) {
  const q = params.toString();
  return q ? `/catalog/categories?${q}` : "/catalog/categories";
}

function CategoryListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories, total, loading, error, refetch } = useCatalogCategories();
  const canWrite = useAdminCanWrite();

  const createOpen = searchParams.get("create") === "1";
  const editId = searchParams.get("edit");
  const viewId = searchParams.get("view");

  const editCategory = useMemo(
    () => (editId ? categories.find((c) => c.id === editId) ?? null : null),
    [editId, categories],
  );
  const viewCategory = useMemo(
    () => (viewId ? categories.find((c) => c.id === viewId) ?? null : null),
    [viewId, categories],
  );

  const parentOptions = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        label: [...getCategoryAncestorNames(c, categories), c.name].join(" › "),
      })),
    [categories],
  );

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "catalog-categories-api" });
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
      p.delete("view");
      p.set("create", "1");
    });

  const handleEdit = (cat: Category) =>
    pushParams((p) => {
      p.delete("create");
      p.delete("view");
      p.set("edit", cat.id);
    });

  const handleView = (cat: Category) =>
    pushParams((p) => {
      p.delete("create");
      p.delete("edit");
      p.set("view", cat.id);
    });

  const closeForm = () =>
    pushParams((p) => {
      p.delete("create");
      p.delete("edit");
    });

  useViewerWriteUrlGuard(createOpen || !!editId, closeForm);

  const closeView = () => pushParams((p) => p.delete("view"));

  useEffect(() => {
    if (editId && !loading && !editCategory) {
      toast.error("Category not found");
      closeForm();
    }
  }, [editId, editCategory, loading]);

  useEffect(() => {
    if (viewId && !viewCategory && !editId && !createOpen && !loading) {
      toast.error("Category not found");
      closeView();
    }
  }, [viewId, viewCategory, editId, createOpen, loading]);

  const handleSave = async (data: Partial<Category>) => {
    try {
      if (createOpen) {
        await createCatalogCategory({
          name: data.name ?? "New Category",
          caption: data.caption ?? data.name ?? "New",
          slug: data.slug ?? "new-category",
          parentId: data.parentId ?? null,
          active: data.active ?? true,
          showInTopMenu: data.showInTopMenu ?? false,
          description: data.description,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
          iconUrl: data.iconUrl,
          bannerUrl: data.bannerUrl,
          iconMediaId: data.iconMediaId,
          bannerMediaId: data.bannerMediaId,
        });
        toast.success("Category created");
      } else if (editCategory) {
        await updateCatalogCategory(editCategory.id, {
          name: data.name,
          caption: data.caption,
          slug: data.slug,
          parentId: data.parentId,
          active: data.active,
          showInTopMenu: data.showInTopMenu,
          description: data.description,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
          iconUrl: data.iconUrl,
          bannerUrl: data.bannerUrl,
          iconMediaId: data.iconMediaId,
          bannerMediaId: data.bannerMediaId,
        });
        toast.success("Category updated");
      }
      await refetch();
      closeForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleLiveChange = async (data: Partial<Category> & { id: string }) => {
    try {
      await patchCatalogCategory(data.id, data);
      await refetch();
    } catch {
      // silent — form still open; user can retry on save
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Ecommerce › Catalog › Categories</p>
          <h1 className="page-title">
            Categories
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({loading ? "…" : total.toLocaleString()})
            </span>
          </h1>
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
          <Button variant="outline" size="sm" onClick={() => toast.info("Import — coming soon")}>
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("Export — coming soon")}>
            Export
          </Button>
          {canWrite && (
            <Button size="sm" onClick={openCreate}>
              + Add Category
            </Button>
          )}
        </div>
      </div>

      <CategoryGrid
        className="min-h-0 flex-1"
        categories={categories}
        loading={loading}
        onCategoriesChanged={() => void refetch()}
        onView={handleView}
        onEdit={handleEdit}
      />

      {canWrite && (
        <Button
          size="sm"
          className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg sm:hidden"
          onClick={openCreate}
          aria-label="Add category"
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}

      <CategoryViewSheet
        open={!!viewCategory && !createOpen && !editCategory}
        onOpenChange={(open) => { if (!open) closeView(); }}
        category={viewCategory}
        allCategories={categories}
        onEdit={canWrite ? handleEdit : undefined}
      />

      {canWrite && (
        <CategoryFormDialog
          open={createOpen || !!editCategory}
          onOpenChange={(open) => { if (!open) closeForm(); }}
          mode={createOpen ? "create" : "edit"}
          category={editCategory}
          parentOptions={parentOptions.filter((p) => p.id !== editCategory?.id)}
          defaultParentId={null}
          onSave={(data) => void handleSave(data)}
          onLiveChange={(data) => void handleLiveChange(data)}
        />
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense
        fallback={
          <p className="flex flex-1 items-center text-sm text-muted-foreground">
            Loading categories…
          </p>
        }
      >
        <CategoryListContent />
      </Suspense>
    </div>
  );
}
