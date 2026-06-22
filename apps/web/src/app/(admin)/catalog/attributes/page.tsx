"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AttributeProfileGrid } from "@/components/attributes/attribute-profile-grid";
import { AttributeProfileFormDialog } from "@/components/attributes/attribute-profile-form-dialog";
import { AttributeProfileViewSheet } from "@/components/attributes/attribute-profile-view-sheet";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import type { AttributeProfile } from "@/lib/mock-data/attribute-profiles";
import { useCatalogAttributeProfiles } from "@/lib/api/use-catalog-attribute-profiles";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { useViewerWriteUrlGuard } from "@/lib/hooks/use-viewer-write-url-guard";
import { cn } from "@/lib/utils";

function buildUrl(params: URLSearchParams) {
  const q = params.toString();
  return q ? `/catalog/attributes?${q}` : "/catalog/attributes";
}

function AttributeListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profiles, groups, attributes, total, loading, error, refetch } = useCatalogAttributeProfiles();
  const canWrite = useAdminCanWrite();

  const createOpen = searchParams.get("create") === "1";
  const editId = searchParams.get("edit");
  const viewId = searchParams.get("view");

  const editProfile = useMemo(
    () => (editId ? profiles.find((p) => p.id === editId) ?? null : null),
    [editId, profiles],
  );
  const viewProfile = useMemo(
    () => (viewId ? profiles.find((p) => p.id === viewId) ?? null : null),
    [viewId, profiles],
  );

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "catalog-attributes-api" });
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

  const handleEdit = (profile: AttributeProfile) =>
    pushParams((p) => {
      p.delete("create");
      p.delete("view");
      p.set("edit", profile.id);
    });

  const handleView = (profile: AttributeProfile) =>
    pushParams((p) => {
      p.delete("create");
      p.delete("edit");
      p.set("view", profile.id);
    });

  const closeForm = () =>
    pushParams((p) => {
      p.delete("create");
      p.delete("edit");
    });

  useViewerWriteUrlGuard(createOpen || !!editId, closeForm);

  const closeView = () => pushParams((p) => p.delete("view"));

  useEffect(() => {
    if (editId && !loading && !editProfile) {
      toast.error("Profile not found");
      closeForm();
    }
  }, [editId, editProfile, loading]);

  useEffect(() => {
    if (viewId && !viewProfile && !editId && !createOpen && !loading) {
      toast.error("Profile not found");
      closeView();
    }
  }, [viewId, viewProfile, editId, createOpen, loading]);

  const handleSaved = () => {
    void refetch();
    closeForm();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Ecommerce › Catalog › Attributes</p>
          <h1 className="page-title">
            Attributes
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
              + Add Profile
            </Button>
          )}
        </div>
      </div>

      <AttributeProfileGrid
        className="min-h-0 flex-1"
        profiles={profiles}
        groups={groups}
        attributes={attributes}
        loading={loading}
        onProfilesChanged={() => void refetch()}
        onView={handleView}
        onEdit={handleEdit}
      />

      {canWrite && (
        <Button
          size="sm"
          className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full p-0 shadow-lg sm:hidden"
          onClick={openCreate}
          aria-label="Add attribute profile"
        >
          <Plus className="h-5 w-5" />
        </Button>
      )}

      <AttributeProfileViewSheet
        open={!!viewProfile && !createOpen && !editProfile}
        onOpenChange={(open) => {
          if (!open) closeView();
        }}
        profile={viewProfile}
        groups={groups}
        attributes={attributes}
        onEdit={canWrite ? handleEdit : undefined}
      />

      {canWrite && (
        <AttributeProfileFormDialog
          open={createOpen || !!editProfile}
          onOpenChange={(open) => {
            if (!open) closeForm();
          }}
          mode={createOpen ? "create" : "edit"}
          profile={editProfile}
          groups={groups}
          attributes={attributes}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default function AttributesPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense
        fallback={
          <p className="flex flex-1 items-center text-sm text-muted-foreground">
            Loading attributes…
          </p>
        }
      >
        <AttributeListContent />
      </Suspense>
    </div>
  );
}
