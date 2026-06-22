"use client";

import { Bot, Clock, MessageSquare, Paperclip, PanelRightOpen, Sparkles, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore, type UtilityPanelTab } from "@/lib/store/app-store";
import { Button } from "@/components/ui/button";

const activities = [
  { user: "Sadia", action: "updated price on SKU-0042", time: "5m ago" },
  { user: "Rahim", action: "published 3 products", time: "1h ago" },
  { user: "System", action: "low stock alert: Earbuds", time: "2h ago" },
  { user: "Finance Bot", action: "flagged duplicate vendor bill", time: "3h ago" },
];

const tabs: { id: UtilityPanelTab; label: string; icon: typeof Clock }[] = [
  { id: "ai", label: "AI", icon: Sparkles },
  { id: "activity", label: "Activity", icon: Clock },
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "files", label: "Files", icon: Paperclip },
];

function AiPlaceholder() {
  return (
    <div className="space-y-3 p-3" data-component="WS-CONTEXT-AI">
      <div className="flex items-center gap-2 text-xs font-medium">
        <Bot className="h-4 w-4 text-primary" aria-hidden />
        AI Assistant
      </div>
      <p className="text-xs text-muted-foreground">
        Ask about revenue, stock, or approvals. Prototype only — no live model connection.
      </p>
      <div className="rounded-md border bg-muted/30 p-2 text-xs">
        <p className="font-medium">Suggested</p>
        <ul className="mt-1 list-inside list-disc text-muted-foreground">
          <li>Summarize today&apos;s sales performance</li>
          <li>List overdue receivables</li>
          <li>Draft follow-up for top 3 deals</li>
        </ul>
      </div>
      <Button type="button" size="sm" className="w-full min-h-11">
        Open full AI panel
      </Button>
    </div>
  );
}

function ActivityPlaceholder() {
  return (
    <div className="space-y-2 p-3">
      {activities.map((a, i) => (
        <div key={i} className="rounded-md border bg-background p-2 text-xs">
          <p className="font-medium">{a.user}</p>
          <p className="text-muted-foreground">{a.action}</p>
          <p className="mt-1 text-[10px] text-muted-foreground">{a.time}</p>
        </div>
      ))}
    </div>
  );
}

/** WS-CONTEXT-* — Zone E right utility panel (320px). */
export function WorkspaceUtilityPanel() {
  const open = useAppStore((s) => s.utilityPanelOpen);
  const tab = useAppStore((s) => s.utilityPanelTab);
  const setTab = useAppStore((s) => s.setUtilityPanelTab);
  const toggle = useAppStore((s) => s.toggleUtilityPanel);
  const openPanel = useAppStore((s) => s.openUtilityPanel);

  if (!open) {
    return (
      <button
        type="button"
        data-zone="E"
        data-component="WS-CONTEXT"
        onClick={() => openPanel("activity")}
        title="Show utility panel"
        aria-label="Show utility panel"
        className="group hidden w-10 shrink-0 flex-col items-center gap-2 border-l border-input bg-muted/20 py-3 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground xl:flex"
      >
        <PanelRightOpen className="h-4 w-4 shrink-0 opacity-70 group-hover:opacity-100" />
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        <span className="text-[10px] font-medium leading-none [writing-mode:vertical-rl] rotate-180">
          Utility
        </span>
      </button>
    );
  }

  return (
    <aside
      data-zone="E"
      data-component="WS-CONTEXT"
      className="hidden w-80 shrink-0 flex-col border-l bg-muted/10 xl:flex"
    >
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-xs font-medium">Utility Panel</span>
        <button
          type="button"
          className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={toggle}
        >
          Hide
        </button>
      </div>
      <div className="flex border-b text-[10px]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 min-h-11",
              tab === t.id && "border-b-2 border-primary bg-accent/30",
            )}
            aria-selected={tab === t.id}
          >
            <t.icon className="h-3.5 w-3.5" aria-hidden />
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === "ai" && <AiPlaceholder />}
        {tab === "activity" && <ActivityPlaceholder />}
        {(tab === "comments" || tab === "notes" || tab === "files") && (
          <div className="p-4 text-xs text-muted-foreground">No {tab} yet — prototype placeholder.</div>
        )}
      </div>
    </aside>
  );
}
