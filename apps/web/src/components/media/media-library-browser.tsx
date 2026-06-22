"use client";

import {
  Check,
  FileText,
  Image as ImageIcon,
  Search,
  Video,
} from "lucide-react";
import type { MediaLibraryItem, MediaLibraryItemType } from "@/lib/mock-data/media-library";
import {
  getMediaUsageCount,
  getMediaUsageRefs,
  useMediaUsageMap,
  type MediaUsageFilter,
} from "@/lib/media/media-usage";
import { getDocumentKindLabel } from "@/lib/media/safe-upload-types";
import { isTypeAllowedForPicker } from "@/lib/media/picker-accept";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { MediaLibraryDetailPanel } from "@/components/media/media-library-detail-panel";
import { MediaLibraryUploadPanel } from "@/components/media/media-library-upload-panel";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";

export type MediaLibraryTab = "library" | "upload";

export type MediaLibraryMode = "single" | "multiple" | "replace";

type Props = {
  items: MediaLibraryItem[];
  query: string;
  onQueryChange: (query: string) => void;
  usageFilter?: MediaUsageFilter;
  onUsageFilterChange?: (filter: MediaUsageFilter) => void;
  activeTab: MediaLibraryTab;
  onTabChange: (tab: MediaLibraryTab) => void;
  selectedIds: string[];
  focusedId: string | null;
  onItemClick: (item: MediaLibraryItem) => void;
  onItemUpdate: (id: string, patch: Partial<Pick<MediaLibraryItem, "name" | "title" | "alt">>) => void;
  mode?: MediaLibraryMode;
  onUpload?: (files: FileList) => void;
  onImport?: (items: MediaLibraryItem[]) => void;
  accept?: MediaLibraryItemType[];
  compact?: boolean;
};

function typeIcon(type: MediaLibraryItemType) {
  if (type === "video") return Video;
  if (type === "document") return FileText;
  return ImageIcon;
}

export function MediaLibraryBrowser({
  items,
  query,
  onQueryChange,
  usageFilter = "all",
  onUsageFilterChange,
  activeTab,
  onTabChange,
  selectedIds,
  focusedId,
  onItemClick,
  onItemUpdate,
  mode = "multiple",
  onUpload,
  onImport,
  accept,
  compact,
}: Props) {
  const canWrite = useAdminCanWrite();
  const focusedItem = items.find((item) => item.id === focusedId) ?? null;
  const usageMap = useMediaUsageMap();
  const focusedUsageCount = focusedItem ? getMediaUsageCount(usageMap, focusedItem.id) : 0;
  const focusedUsageRefs = focusedItem ? getMediaUsageRefs(usageMap, focusedItem.id) : [];

  const usageFilters: { id: MediaUsageFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "used", label: "Used" },
    { id: "unused", label: "Unused" },
  ];

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", compact ? "gap-2" : "gap-3")}>
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-input pb-2">
        <div className="flex overflow-hidden rounded-md border border-input bg-muted/30 p-0.5 text-xs">
          {canWrite && (
            <button
              type="button"
              onClick={() => onTabChange("upload")}
              className={cn(
                "rounded px-3 py-1.5 transition-colors",
                activeTab === "upload"
                  ? "bg-background font-medium text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Upload files
            </button>
          )}
          <button
            type="button"
            onClick={() => onTabChange("library")}
            className={cn(
              "rounded px-3 py-1.5 transition-colors",
              activeTab === "library"
                ? "bg-background font-medium text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Media Library
          </button>
        </div>

        {activeTab === "library" && (
          <>
            <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                className="h-8 pl-8 text-xs"
                placeholder="Search media…"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
              />
            </div>
            {onUsageFilterChange && (
              <div className="flex overflow-hidden rounded-md border border-input bg-muted/30 p-0.5 text-xs">
                {usageFilters.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => onUsageFilterChange(filter.id)}
                    className={cn(
                      "rounded px-2.5 py-1.5 transition-colors",
                      usageFilter === filter.id
                        ? "bg-background font-medium text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex min-h-0 flex-1 gap-3">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          {activeTab === "upload" && canWrite ? (
            <MediaLibraryUploadPanel
              onUploadFiles={onUpload}
              onImport={onImport}
              compact={compact}
            />
          ) : activeTab === "upload" ? null : items.length === 0 ? (
            <div className="flex min-h-[180px] flex-1 items-center justify-center rounded-lg border border-dashed border-input px-4 text-center text-sm text-muted-foreground">
              {usageFilter === "unused"
                ? "No unused media — every file is referenced on the site."
                : usageFilter === "used"
                  ? "No used media found for this filter."
                  : "No media found. Upload new files or try a different search."}
            </div>
          ) : (
            <div className="grid flex-1 grid-cols-5 content-start gap-3 overflow-y-auto p-1">
              {items.map((item) => {
                const selected = selectedIds.includes(item.id);
                const focused = focusedId === item.id;
                const Icon = typeIcon(item.type);
                const usageCount = getMediaUsageCount(usageMap, item.id);
                const selectable = isTypeAllowedForPicker(item.type, accept);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onItemClick(item)}
                    className={cn(
                      "group relative aspect-square w-full overflow-hidden rounded-lg border text-left transition",
                      !selectable && "opacity-75",
                      selected || focused
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-input hover:border-primary/40 hover:ring-1 hover:ring-primary/20",
                    )}
                  >
                    {item.type === "image" || item.type === "video" ? (
                      <img
                        src={item.url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-muted text-muted-foreground">
                        <Icon className="h-8 w-8" />
                        <span className="text-[10px] font-medium uppercase">
                          {getDocumentKindLabel(item.name, item.mimeType)}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-2 pb-2 pt-6">
                      <p className="truncate text-[11px] font-medium text-white">
                        {item.title || item.name}
                      </p>
                      <p className="truncate text-[10px] text-white/75">{item.name}</p>
                    </div>

                    {item.folder === "Banners" && item.type === "image" && (
                      <span className="absolute right-1.5 top-8 rounded bg-amber-600 px-1 text-[9px] font-medium text-white">
                        BANNER
                      </span>
                    )}

                    {item.type === "document" && (
                      <span className="absolute right-1.5 top-8 rounded bg-black/70 px-1 text-[9px] font-medium text-white">
                        {getDocumentKindLabel(item.name, item.mimeType)}
                      </span>
                    )}

                    {item.provider === "youtube" && (
                      <span className="absolute right-1.5 top-8 rounded bg-red-600 px-1 text-[9px] font-medium text-white">
                        YOUTUBE
                      </span>
                    )}

                    {item.type === "video" && item.provider !== "youtube" && (
                      <span className="absolute right-1.5 top-8 rounded bg-black/70 px-1 text-[9px] font-medium text-white">
                        VIDEO
                      </span>
                    )}

                    {item.importedBy === "url" && (
                      <span className="absolute left-1.5 top-8 rounded bg-sky-600 px-1 text-[9px] font-medium text-white">
                        URL
                      </span>
                    )}

                    {item.importedBy === "ai" && (
                      <span className="absolute left-1.5 top-8 rounded bg-violet-600 px-1 text-[9px] font-medium text-white">
                        AI
                      </span>
                    )}

                    <span
                      className={cn(
                        "absolute right-1.5 top-1.5 z-10 rounded px-1.5 py-0.5 text-[9px] font-semibold leading-none",
                        usageCount > 0
                          ? "bg-emerald-600 text-white"
                          : "bg-muted-foreground/80 text-white",
                      )}
                    >
                      {usageCount > 0 ? `${usageCount}×` : "0"}
                    </span>

                    <span
                      className={cn(
                        "absolute left-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center border-2 bg-background/90 transition",
                        !selectable && "hidden",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40 opacity-0 group-hover:opacity-100",
                        mode === "single" ? "rounded-full" : "rounded-sm",
                      )}
                    >
                      {selected && <Check className="h-3 w-3" />}
                    </span>

                    {!selectable && (
                      <span className="absolute left-1.5 top-1.5 z-10 rounded bg-amber-600 px-1 text-[8px] font-medium text-white">
                        SAVED
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="flex min-h-0 w-56 shrink-0 flex-col border-l border-input pl-3 sm:w-72">
          <div className="shrink-0">
            <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Attachment details
            </p>
            <p className="mb-2 px-1 text-[10px] text-muted-foreground">Actual ratio preview</p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <MediaLibraryDetailPanel
              item={focusedItem}
              usageCount={focusedUsageCount}
              usageRefs={focusedUsageRefs}
              onUpdate={canWrite ? (patch) => {
                if (!focusedItem) return;
                onItemUpdate(focusedItem.id, patch);
              } : undefined}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
