"use client";

import { cn } from "@/lib/utils";
import { SEO_TAB_LABELS, SEO_TABS, type SeoTab } from "@/lib/mock-data/seo";

type Props = {
  active: SeoTab;
  onChange: (tab: SeoTab) => void;
  issueCount?: number;
};

export function SeoNav({ active, onChange, issueCount = 0 }: Props) {
  return (
    <nav className="flex flex-wrap gap-1 rounded-lg border border-input bg-muted/30 p-1">
      {SEO_TABS.map((tab) => (
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
          {SEO_TAB_LABELS[tab]}
          {tab === "audit" && issueCount > 0 && (
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {issueCount}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
