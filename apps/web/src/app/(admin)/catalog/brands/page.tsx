"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BrandGrid } from "@/components/brands/brand-grid";
import { BrandFormDialog } from "@/components/brands/brand-form-dialog";
import { BrandViewSheet } from "@/components/brands/brand-view-sheet";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import type { Brand } from "@/lib/mock-data/brands";
import {
  createCatalogBrand,
  patchCatalogBrand,
  updateCatalogBrand,
  useCatalogBrands,
} from "@/lib/api/use-catalog-brands";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { useViewerWriteUrlGuard } from "@/lib/hooks/use-viewer-write-url-guard";
import { cn } from "@/lib/utils";

function buildUrl(params: URLSearchParams) {
  const q = params.toString();
  return q ? `/catalog/brands?${q}` : "/catalog/brands";
}

function BrandListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { brands, total, loading, error, refetch } = useCatalogBrands();
  const canWrite = useAdminCanWrite();

  const createOpen = searchParams.get("create") === "1";
  const editId = searchParams.get("edit");
  const viewId = searchParams.get("view");

  const editBrand = useMemo(
    () => (editId ? brands.find((b) => b.id === editId) ?? null : null),
    [editId, brands],
  );
  const viewBrand = useMemo(
    () => (viewId ? brands.find((b) => b.id === viewId) ?? null : null),
    [viewId, brands],
  );

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "catalog-brands-api" });
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

  const handleEdit = (brand: Brand) =>
    pushParams((p) => {
      p.delete("create");
      p.delete("view");
      p.set("edit", brand.id);
    });

  const handleView = (brand: Brand) =>
    pushParams((p) => {
      p.delete("create");
      p.delete("edit");
      p.set("view", brand.id);
    });

  const closeForm = () =>
    pushParams((p) => {
      p.delete("create");
      p.delete("edit");
    });

  useViewerWriteUrlGuard(createOpen || !!editId, closeForm);

  const closeView = () => pushParams((p) => p.delete("view"));

  useEffect(() => {
    if (editId && !loading && !editBrand) {
      toast.error("Brand not found");
      closeForm();
    }
  }, [editId, editBrand, loading]);

  useEffect(() => {
    if (viewId && !viewBrand && !editId && !createOpen && !loading) {
      toast.error("Brand not found");
      closeView();
    }
  }, [viewId, viewBrand, editId, createOpen, loading]);

  const handleSave = async (data: Partial<Brand>) => {
    try {
      if (createOpen) {
        await createCatalogBrand({
          name: data.name ?? "New Brand",
          slug: data.slug ?? "new-brand",
          active: data.active ?? true,
          description: data.description,
          websiteUrl: data.websiteUrl,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
          logoUrl: data.logoUrl,
          bannerUrl: data.bannerUrl,
          logoMediaId: data.logoMediaId,
          bannerMediaId: data.bannerMediaId,
        });
        toast.success("Brand created");
      } else if (editBrand) {
        await updateCatalogBrand(editBrand.id, {
          name: data.name,
          slug: data.slug,
          active: data.active,
          description: data.description,
          websiteUrl: data.websiteUrl,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
          logoUrl: data.logoUrl,
          bannerUrl: data.bannerUrl,
          logoMediaId: data.logoMediaId,
          bannerMediaId: data.bannerMediaId,
        });
        toast.success("Brand updated");
      }
      await refetch();
      closeForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  const handleLiveChange = async (data: Partial<Brand> & { id: string }) => {
    try {
      await patchCatalogBrand(data.id, data);
      await refetch();
    } catch {
      // silent while form is open
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Ecommerce › Catalog › Brands</p>
          <h1 className="page-title">
            Brands
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
              + Add Brand
            </Button>
          )}
        </div>
      </div>

      <BrandGrid
        className="min-h-0 flex-1"
        brands={brands}
        loading={loading}
        onBrandsChanged={() => void refetch()}
        onView={handleView}
        onEdit={handleEdit}
      />

      {canWrite && (
        <Button
          size="sm"
          className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg sm:hidden"
          onClick={openCreate}
          aria-label="Add brand"
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}

      <BrandViewSheet
        open={!!viewBrand && !createOpen && !editBrand}
        onOpenChange={(open) => { if (!open) closeView(); }}
        brand={viewBrand}
        onEdit={canWrite ? handleEdit : undefined}
      />

      {canWrite && (
        <BrandFormDialog
          open={createOpen || !!editBrand}
          onOpenChange={(open) => { if (!open) closeForm(); }}
          mode={createOpen ? "create" : "edit"}
          brand={editBrand}
          onSave={(data) => void handleSave(data)}
          onLiveChange={(data) => void handleLiveChange(data)}
        />
      )}
    </div>
  );
}

export default function BrandsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading brands…</p>}>
        <BrandListContent />
      </Suspense>
    </div>
  );
}
