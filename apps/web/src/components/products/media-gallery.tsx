"use client";

import { useRef, useState } from "react";
import { ImagePlus, Play, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaLibraryItem } from "@/lib/mock-data/media-library";

type Props = {
  items: MediaLibraryItem[];
  onReorder: (items: MediaLibraryItem[]) => void;
  onRemove: (id: string) => void;
  onAddMore: () => void;
};

export function MediaGallery({ items, onReorder, onRemove, onAddMore }: Props) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragItem = useRef<number | null>(null);

  const onDragStart = (index: number) => {
    dragItem.current = index;
  };

  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const onDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = dragItem.current;
    if (sourceIndex === null || sourceIndex === targetIndex) {
      setDragOverId(null);
      return;
    }
    const reordered = [...items];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    onReorder(reordered);
    dragItem.current = null;
    setDragOverId(null);
  };

  const onDragEnd = () => {
    dragItem.current = null;
    setDragOverId(null);
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((item, index) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => onDragStart(index)}
          onDragOver={(e) => onDragOver(e, item.id)}
          onDrop={(e) => onDrop(e, index)}
          onDragEnd={onDragEnd}
          className={cn(
            "group relative aspect-square cursor-grab overflow-hidden rounded-md border border-input transition",
            dragOverId === item.id && "border-primary ring-2 ring-primary/40 scale-[1.02]",
          )}
        >
          <img src={item.url} alt={item.alt ?? item.name} className="h-full w-full object-cover" />
          {item.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="rounded-full bg-black/60 p-2">
                <Play className="h-5 w-5 fill-white text-white" />
              </div>
            </div>
          )}

          {/* Featured badge — first image */}
          {index === 0 && (
            <div className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-semibold text-white">
              <Star className="h-2.5 w-2.5 fill-current" />
              Featured
            </div>
          )}

          {/* Remove button */}
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100"
          >
            ✕
          </button>

          <p className="truncate px-1.5 py-1 text-[10px] text-muted-foreground">{item.name}</p>
        </div>
      ))}

      {/* Add more button */}
      <button
        type="button"
        onClick={onAddMore}
        className="flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed border-input text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
      >
        <ImagePlus className="h-5 w-5" />
        Add more
      </button>
    </div>
  );
}
