"use client";

import { cn } from "@/lib/utils";
import { MARKETING_TAB_LABELS, MARKETING_TABS, type MarketingTab } from "@/lib/mock-data/marketing";

type Props = {
  active: MarketingTab;
  onChange: (tab: MarketingTab) => void;
  activeCampaigns?: number;
};

export function MarketingNav({ active, onChange, activeCampaigns = 0 }: Props) {
  return (
    <nav className="flex flex-wrap gap-1 rounded-lg border border-input bg-muted/30 p-1">
      {MARKETING_TABS.map((tab) => (
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
          {MARKETING_TAB_LABELS[tab]}
          {tab === "campaigns" && activeCampaigns > 0 && (
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">
              {activeCampaigns}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
