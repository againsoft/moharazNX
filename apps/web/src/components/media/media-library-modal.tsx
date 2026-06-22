"use client";

import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import {
  createUploadedMediaItemsFromFiles,
  filterMediaLibraryItems,
  type MediaLibraryItem,
  type MediaLibraryItemType,
} from "@/lib/mock-data/media-library";
import { filterByMediaUsage, useMediaUsageMap, type MediaUsageFilter } from "@/lib/media/media-usage";
import { describeAcceptTypes, isTypeAllowedForPicker } from "@/lib/media/picker-accept";
import { useMediaStore } from "@/lib/store/media-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  MediaLibraryBrowser,
  type MediaLibraryMode,
  type MediaLibraryTab,
} from "@/components/media/media-library-browser";

export type { MediaLibraryMode };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (items: MediaLibraryItem[]) => void;
  mode?: MediaLibraryMode;
  title?: string;
  accept?: MediaLibraryItemType[];
  initialSelectedIds?: string[];
};

export function MediaLibraryModal({
  open,
  onOpenChange,
  onSelect,
  mode = "multiple",
  title = "Add Media",
  accept,
  initialSelectedIds = [],
}: Props) {
  const items = useMediaStore((state) => state.items);
  const prependItems = useMediaStore((state) => state.prependItems);
  const patchMediaItem = useMediaStore((state) => state.patchMediaItem);

  const [query, setQuery] = useState("");
  const [usageFilter, setUsageFilter] = useState<MediaUsageFilter>("all");
  const [activeTab, setActiveTab] = useState<MediaLibraryTab>("library");
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setSelectedIds(initialSelectedIds);
    setQuery("");
    setUsageFilter("all");
    setActiveTab("library");
    setFocusedId(initialSelectedIds[0] ?? null);
    setPinnedIds([]);
  }, [open, initialSelectedIds]);

  const usageMap = useMediaUsageMap();

  const filtered = useMemo(() => {
    const searched = filterMediaLibraryItems(items, { query, types: accept });
    const usageFiltered = filterByMediaUsage(searched, usageMap, usageFilter);

    if (!accept?.length || !pinnedIds.length) return usageFiltered;

    const pinned = items.filter(
      (item) =>
        pinnedIds.includes(item.id) &&
        !usageFiltered.some((entry) => entry.id === item.id),
    );

    return [...pinned, ...usageFiltered];
  }, [items, query, accept, usageMap, usageFilter, pinnedIds]);

  const selectedItems = useMemo(
    () =>
      items.filter(
        (item) =>
          selectedIds.includes(item.id) && isTypeAllowedForPicker(item.type, accept),
      ),
    [items, selectedIds, accept],
  );

  const handleItemClick = (item: MediaLibraryItem) => {
    setFocusedId(item.id);

    if (!isTypeAllowedForPicker(item.type, accept)) {
      return;
    }

    setSelectedIds((prev) => {
      const isSelected = prev.includes(item.id);
      if (mode === "single" || mode === "replace") {
        return isSelected ? [] : [item.id];
      }
      return isSelected ? prev.filter((id) => id !== item.id) : [...prev, item.id];
    });
  };

  const applyImportedItems = (imported: MediaLibraryItem[]) => {
    if (!imported.length) return;

    prependItems(imported);

    const selectable = accept?.length
      ? imported.filter((item) => accept.includes(item.type))
      : imported;
    const savedOnly = accept?.length
      ? imported.filter((item) => !accept.includes(item.type))
      : [];

    if (savedOnly.length) {
      setPinnedIds((prev) => [
        ...savedOnly.map((item) => item.id),
        ...prev.filter((id) => !savedOnly.some((item) => item.id === id)),
      ]);
      toast.success(
        savedOnly.length === 1
          ? `${savedOnly[0].name} saved to Media Library`
          : `${savedOnly.length} files saved to Media Library`,
        {
          description: `This picker accepts ${describeAcceptTypes(accept)} only. Open Media page to use documents here.`,
        },
      );
    }

    setActiveTab("library");

    if (selectable.length) {
      setFocusedId(selectable[0].id);
      setSelectedIds((prev) => {
        const newIds = selectable.map((item) => item.id);
        if (mode === "single" || mode === "replace") return [selectable[0].id];
        return [...prev, ...newIds];
      });
      if (!savedOnly.length) {
        toast.success(
          `${selectable.length} file${selectable.length === 1 ? "" : "s"} added to Media Library`,
        );
      }
    } else if (savedOnly.length) {
      setFocusedId(savedOnly[0].id);
      setSelectedIds([]);
    }
  };

  const handleUpload = (files: FileList) => {
    const { items: uploaded, rejected } = createUploadedMediaItemsFromFiles(files);
    if (rejected.length) {
      toast.error(
        `${rejected.length} file${rejected.length === 1 ? "" : "s"} blocked — unsafe file type.`,
      );
    }
    if (uploaded.length) applyImportedItems(uploaded);
  };

  const handleImport = (imported: MediaLibraryItem[]) => {
    applyImportedItems(imported);
  };

  const handleInsert = () => {
    if (!selectedItems.length) return;
    onSelect(selectedItems);
    onOpenChange(false);
  };

  const insertLabel =
    mode === "single" || mode === "replace"
      ? accept?.includes("document") && !accept.includes("image")
        ? "Set file"
        : "Set image"
      : selectedItems.length
        ? `Insert (${selectedItems.length})`
        : "Insert";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/55 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[100] flex h-[min(88vh,720px)] w-[min(96vw,980px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-input bg-background shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-input px-4 py-3">
            <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-4 py-3">
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
              onItemUpdate={patchMediaItem}
              mode={mode}
              onUpload={handleUpload}
              onImport={handleImport}
              accept={accept}
              compact
            />
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-input px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {selectedItems.length
                ? `${selectedItems.length} item${selectedItems.length === 1 ? "" : "s"} selected`
                : accept?.length
                  ? `Select ${describeAcceptTypes(accept)} · uploads always save to library`
                  : "Select media, edit details on the right, then insert"}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" disabled={!selectedItems.length} onClick={handleInsert}>
                {insertLabel}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
