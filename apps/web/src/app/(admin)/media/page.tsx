"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Cloud, HardDrive, Upload, RefreshCw, Trash2 } from "lucide-react";
import {
  filterMediaLibraryItems,
  type MediaLibraryItem,
} from "@/lib/mock-data/media-library";
import { filterByMediaUsage, useMediaUsageMap, type MediaUsageFilter } from "@/lib/media/media-usage";
import { filterSafeUploadFiles } from "@/lib/media/safe-upload-types";
import { useMediaStore } from "@/lib/store/media-store";
import {
  useCatalogMedia,
  createCatalogMediaBatch,
  deleteCatalogMediaItem,
  deleteCatalogMediaBulk,
  patchCatalogMediaItem,
  uploadCatalogMediaFiles,
} from "@/lib/api/use-catalog-media";
import { useCloudflarePlugin } from "@/lib/api/use-cloudflare-plugin";
import {
  cloudflareStorageLabel,
  isCloudflarePluginActive,
} from "@/lib/plugins/cloudflare";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MediaLibraryBrowser } from "@/components/media/media-library-browser";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";

export default function MediaPage() {
  const canWrite = useAdminCanWrite();
  const { items, total, loading, error, refetch } = useCatalogMedia();
  const { plugin: cloudflarePlugin } = useCloudflarePlugin();
  const setItems = useMediaStore((state) => state.setItems);
  const patchMediaItemLocal = useMediaStore((state) => state.patchMediaItem);

  const [query, setQuery] = useState("");
  const [usageFilter, setUsageFilter] = useState<MediaUsageFilter>("all");
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  useEffect(() => {
    if (!canWrite && activeTab === "upload") {
      setActiveTab("library");
    }
  }, [canWrite, activeTab]);

  useEffect(() => {
    if (items.length) setItems(items);
  }, [items, setItems]);

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "catalog-media-api" });
    }
  }, [error]);

  const usageMap = useMediaUsageMap();

  const filtered = useMemo(() => {
    const searched = filterMediaLibraryItems(items, { query });
    return filterByMediaUsage(searched, usageMap, usageFilter);
  }, [items, query, usageMap, usageFilter]);

  const handleItemClick = (item: MediaLibraryItem) => {
    setFocusedId(item.id);
    setSelectedIds((prev) =>
      prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id],
    );
  };

  const applyImportedItems = (imported: MediaLibraryItem[]) => {
    setActiveTab("library");
    if (imported[0]) {
      setFocusedId(imported[0].id);
      setSelectedIds([imported[0].id]);
    }
    void refetch();
  };

  const handleUpload = async (files: FileList) => {
    const { allowed, rejected } = filterSafeUploadFiles(files);
    if (rejected.length) {
      toast.error(
        `${rejected.length} file${rejected.length === 1 ? "" : "s"} blocked — unsafe file type.`,
      );
    }
    if (!allowed.length) return;

    try {
      const uploaded = await uploadCatalogMediaFiles(allowed);
      toast.success(`Uploaded ${uploaded.length} file${uploaded.length === 1 ? "" : "s"}`);
      applyImportedItems(uploaded);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleImport = async (imported: MediaLibraryItem[]) => {
    try {
      const saved = await createCatalogMediaBatch(imported);
      toast.success(`Imported ${saved.length} item${saved.length === 1 ? "" : "s"}`);
      applyImportedItems(saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (!ids.length) return;
    const confirmed = window.confirm(
      `Delete ${ids.length} file${ids.length === 1 ? "" : "s"}? This will also remove them from Cloudflare R2.`,
    );
    if (!confirmed) return;
    try {
      if (ids.length === 1) {
        await deleteCatalogMediaItem(ids[0]);
      } else {
        await deleteCatalogMediaBulk(ids);
      }
      toast.success(`Deleted ${ids.length} file${ids.length === 1 ? "" : "s"}`);
      setSelectedIds([]);
      setFocusedId(null);
      void refetch({ query });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  const handleItemUpdate = async (
    id: string,
    patch: Partial<Pick<MediaLibraryItem, "name" | "title" | "alt">>,
  ) => {
    try {
      const updated = await patchCatalogMediaItem(id, patch);
      patchMediaItemLocal(id, {
        name: updated.name,
        title: updated.title,
        alt: updated.alt,
      });
      void refetch({ query });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">Media</p>
          <h1 className="page-title">
            Media Library
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({loading ? "…" : total.toLocaleString()})
            </span>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Browse all media, preview attachments, and edit title, file name, and alt text live.
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <ApiConnectionBadge loading={loading} error={error} productCount={total} />
            {isCloudflarePluginActive(cloudflarePlugin) && (
              <Badge variant="outline" className="gap-1">
                {cloudflarePlugin?.mediaStorage === "r2" ? (
                  <Cloud className="h-3 w-3 text-orange-500" />
                ) : (
                  <HardDrive className="h-3 w-3" />
                )}
                Uploads: {cloudflareStorageLabel(cloudflarePlugin)}
              </Badge>
            )}
          </div>
          {isCloudflarePluginActive(cloudflarePlugin) && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Storage preference:{" "}
              <Link href="/settings/plugins/cloudflare" className="text-primary hover:underline">
                Settings → Plugins → Cloudflare
              </Link>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {canWrite && selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => void handleDelete(selectedIds)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete ({selectedIds.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refetch({ query })}
            disabled={loading}
          >
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
          {canWrite && (
            <Button size="sm" onClick={() => setActiveTab("upload")}>
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-input bg-background p-4">
        <MediaLibraryBrowser
          items={filtered}
          query={query}
          onQueryChange={setQuery}
          usageFilter={usageFilter}
          onUsageFilterChange={setUsageFilter}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          selectedIds={selectedIds}
          focusedId={focusedId}
          onItemClick={handleItemClick}
          onItemUpdate={handleItemUpdate}
          onDelete={(ids) => void handleDelete(ids)}
          mode="multiple"
          onUpload={(files) => void handleUpload(files)}
          onImport={(imported) => void handleImport(imported)}
        />
      </div>
    </div>
  );
}
