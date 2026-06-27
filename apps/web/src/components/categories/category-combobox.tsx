"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryAncestorNames } from "@/lib/category-utils";
import type { Category } from "@/lib/mock-data/categories";

type Props = {
  categories: Category[];
  value: string;
  onChange: (id: string, name: string) => void;
  onAdd?: () => void;
  placeholder?: string;
  className?: string;
};

export function CategoryCombobox({ categories, value, onChange, onAdd, placeholder = "Select category", className }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = categories.find((c) => c.id === value);

  const filtered = categories.filter((c) => {
    if (!c.active) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const ancestors = getCategoryAncestorNames(c, categories);
    return (
      c.name.toLowerCase().includes(q) ||
      ancestors.some((a) => a.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else setSearch("");
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function getParentPath(cat: Category): string | null {
    const ancestors = getCategoryAncestorNames(cat, categories);
    return ancestors.length ? ancestors.join(" › ") : null;
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm hover:bg-accent/30",
          !selected && "text-muted-foreground",
        )}
      >
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition", open && "rotate-180")} />
        <span className="flex-1 truncate text-left">{selected ? selected.name : placeholder}</span>
        <div className="flex shrink-0 items-center gap-1">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onChange("", ""); }}
              onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onChange("", ""))}
              className="rounded p-0.5 hover:bg-muted"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          {onAdd && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onAdd(); }}
              onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onAdd())}
              className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              title="Add category"
            >
              +
            </span>
          )}
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <div className="flex items-center border-b px-2 py-1.5">
            <Search className="mr-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">No categories found</p>
            ) : (
              filtered.map((cat) => {
                const parentPath = getParentPath(cat);
                const isSelected = cat.id === value;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { onChange(cat.id, cat.name); setOpen(false); }}
                    className={cn(
                      "flex w-full flex-col items-start px-3 py-1.5 text-left text-sm hover:bg-accent",
                      isSelected && "bg-accent/60 font-medium",
                    )}
                  >
                    <span>{cat.name}</span>
                    {parentPath && (
                      <span className="text-[10px] text-muted-foreground">{parentPath}</span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
