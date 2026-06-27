"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Brand } from "@/lib/mock-data/brands";

type Props = {
  brands: Brand[];
  value: string;
  onChange: (id: string, name: string) => void;
  onAdd?: () => void;
  placeholder?: string;
  className?: string;
};

export function BrandCombobox({ brands, value, onChange, onAdd, placeholder = "Select brand", className }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = brands.find((b) => b.id === value);

  const filtered = brands.filter((b) => {
    if (!b.active) return false;
    if (!search.trim()) return true;
    return b.name.toLowerCase().includes(search.toLowerCase());
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
              title="Add brand"
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
              placeholder="Search brands…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">No brands found</p>
            ) : (
              filtered.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => { onChange(brand.id, brand.name); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center px-3 py-1.5 text-left text-sm hover:bg-accent",
                    brand.id === value && "bg-accent/60 font-medium",
                  )}
                >
                  {brand.logoUrl && (
                    <img src={brand.logoUrl} alt="" className="mr-2 h-4 w-4 shrink-0 rounded object-contain" />
                  )}
                  {brand.name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
