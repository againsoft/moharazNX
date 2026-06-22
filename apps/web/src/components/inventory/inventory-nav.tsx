"use client";

import { cn } from "@/lib/utils";
import { INVENTORY_TAB_LABELS, INVENTORY_TABS, type InventoryTab } from "@/lib/mock-data/inventory";

type Props = {
  active: InventoryTab;
  onChange: (tab: InventoryTab) => void;
  lowStockCount?: number;
};

export function InventoryNav({ active, onChange, lowStockCount = 0 }: Props) {
  return (
    <nav className="flex flex-wrap gap-1 rounded-lg border border-input bg-muted/30 p-1">
      {INVENTORY_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={cn(
            "relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            active === tab
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
          )}
        >
          {INVENTORY_TAB_LABELS[tab]}
          {tab === "stock" && lowStockCount > 0 && (
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
              {lowStockCount}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
