"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { ProductGrid } from "@/components/products/product-grid";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { ProductViewDialog } from "@/components/products/product-view-dialog";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/mock-data/products";
import { useCatalogProducts } from "@/lib/api/use-catalog-products";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { useViewerWriteUrlGuard } from "@/lib/hooks/use-viewer-write-url-guard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function buildProductsUrl(params: URLSearchParams) {
  const query = params.toString();
  return query ? `/catalog/products?${query}` : "/catalog/products";
}

function ProductListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, total, loading, error, refetch } = useCatalogProducts();
  const canWrite = useAdminCanWrite();

  const createOpen = searchParams.get("create") === "1";
  const editId = searchParams.get("edit");
  const viewId = searchParams.get("view");

  const editProduct = useMemo(
    () => (editId ? products.find((p) => p.id === editId) ?? null : null),
    [editId, products],
  );

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "catalog-products-api" });
    }
  }, [error]);

  const pushParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.push(buildProductsUrl(params), { scroll: false });
  };

  const openCreate = () => {
    pushParams((params) => {
      params.delete("edit");
      params.delete("view");
      params.set("create", "1");
    });
  };

  const handleEdit = (product: Product) => {
    pushParams((params) => {
      params.delete("create");
      params.delete("view");
      params.set("edit", product.id);
    });
  };

  const handleView = (product: Product) => {
    pushParams((params) => {
      params.delete("create");
      params.delete("edit");
      params.set("view", product.id);
    });
  };

  const handleEditFromView = (product: Product) => {
    handleEdit(product);
  };

  const closeForm = () => {
    pushParams((params) => {
      params.delete("create");
      params.delete("edit");
    });
  };

  useViewerWriteUrlGuard(createOpen || !!editId, closeForm);

  const closeView = () => {
    pushParams((params) => {
      params.delete("view");
    });
  };

  const handleSaved = () => {
    void refetch();
  };

  useEffect(() => {
    if (editId && !loading && !editProduct) {
      toast.error("Product not found");
      closeForm();
    }
  }, [editId, editProduct, loading]);

  const viewOpen = !!viewId && !createOpen && !editProduct;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Ecommerce › Catalog › Products</p>
          <h1 className="page-title">
            Products
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({loading ? "…" : total.toLocaleString()})
            </span>
          </h1>
          <div className="mt-1.5">
            <ApiConnectionBadge loading={loading} error={error} productCount={total} />
          </div>
        </div>
        <div className="hidden flex-wrap gap-2 sm:flex">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={loading}
            aria-label="Refresh products"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("Import — prototype")}>
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Export started (mock CSV)")}
          >
            Export
          </Button>
          {canWrite && (
            <Button size="sm" onClick={openCreate}>
              + Add Product
            </Button>
          )}
        </div>
      </div>

      {error && !loading ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm">
          <p className="font-medium text-destructive">Could not load products from API</p>
          <p className="mt-1 text-muted-foreground">{error}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Ensure FastAPI is running:{" "}
            <code className="rounded bg-muted px-1">uvicorn main:app --port 8000</code>
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <ProductGrid
          products={products}
          loading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onProductsChanged={() => void refetch()}
          className="min-h-0 flex-1"
        />
      )}

      {canWrite && (
        <Button
          size="sm"
          className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg md:hidden"
          onClick={openCreate}
          aria-label="Add product"
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}

      <ProductViewDialog
        open={viewOpen}
        onOpenChange={(open) => {
          if (!open) closeView();
        }}
        productId={viewId}
        onEdit={canWrite ? handleEditFromView : undefined}
      />

      {canWrite && (
        <ProductFormDialog
          open={createOpen || !!editProduct}
          onOpenChange={(open) => {
            if (!open) closeForm();
          }}
          mode={createOpen ? "create" : "edit"}
          product={editProduct}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default function ProductListPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense
        fallback={
          <p className="flex flex-1 items-center text-sm text-muted-foreground">
            Loading products…
          </p>
        }
      >
        <ProductListContent />
      </Suspense>
    </div>
  );
}
