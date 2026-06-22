"use client";

import { useState } from "react";
import {
  Banknote,
  CheckCircle2,
  FileText,
  MessageSquare,
  Package,
  Send,
  StickyNote,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import type { OrderComment, TimelineEvent } from "@/lib/mock-data/orders";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Tab = "message" | "note" | "activity";

type Props = {
  timeline: TimelineEvent[];
  comments: OrderComment[];
  followers: string[];
  onAddEntry?: (entry: TimelineEvent) => void;
  onAddComment?: (comment: OrderComment) => void;
};

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  created: Package,
  payment: Banknote,
  status: CheckCircle2,
  shipment: Truck,
  note: StickyNote,
  comment: MessageSquare,
};

const EVENT_COLORS: Record<string, string> = {
  created: "bg-blue-500",
  payment: "bg-emerald-500",
  status: "bg-violet-500",
  shipment: "bg-orange-500",
  note: "bg-amber-500",
  comment: "bg-sky-500",
};

export function OrderOdooChatter({
  timeline,
  comments,
  followers,
  onAddEntry,
  onAddComment,
}: Props) {
  const [tab, setTab] = useState<Tab>("message");
  const [draft, setDraft] = useState("");

  const mergedFeed = [
    ...timeline.map((t) => ({ kind: "timeline" as const, data: t, at: t.at })),
    ...comments.map((c) => ({ kind: "comment" as const, data: c, at: c.at })),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const submit = () => {
    if (!draft.trim()) return;
    const now = new Date().toISOString();
    if (tab === "message") {
      onAddComment?.({
        id: `cm_${Date.now()}`,
        author: "You",
        authorInitials: "YO",
        body: draft.trim(),
        isInternal: false,
        at: now,
      });
    } else {
      onAddEntry?.({
        id: `t_${Date.now()}`,
        type: tab === "note" ? "note" : "comment",
        title: tab === "note" ? "Log note" : "Activity logged",
        description: draft.trim(),
        actor: "You",
        actorInitials: "YO",
        at: now,
      });
    }
    setDraft("");
    toast.success(tab === "message" ? "Message posted" : "Note logged");
  };

  return (
    <div className="flex min-h-0 flex-col rounded-lg border border-input bg-card shadow-sm">
      <div className="border-b border-input px-4 py-3">
        <p className="text-sm font-semibold">Chatter</p>
        <p className="text-[10px] text-muted-foreground">Odoo-style timeline · messages & internal notes</p>
        {followers.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Followers:</span>
            {followers.map((f) => (
              <Badge key={f} variant="muted" className="text-[9px]">
                {f}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <ul className="space-y-4">
          {mergedFeed.map((item, i) => {
            if (item.kind === "comment") {
              const c = item.data;
              return (
                <li key={c.id} className="flex gap-3">
                  <Avatar initials={c.authorInitials} color="bg-sky-500" />
                  <div className="min-w-0 flex-1">
                    <div className="rounded-lg border border-input bg-muted/30 px-3 py-2">
                      <p className="text-xs font-medium">{c.author}</p>
                      <p className="mt-1 text-xs leading-relaxed">{c.body}</p>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {c.isInternal ? "Internal · " : ""}
                      {formatWhen(c.at)}
                    </p>
                  </div>
                </li>
              );
            }
            const ev = item.data;
            const Icon = EVENT_ICONS[ev.type] ?? FileText;
            const dotColor = EVENT_COLORS[ev.type] ?? "bg-muted-foreground";
            return (
              <li key={ev.id} className="relative flex gap-3 pb-1">
                {i < mergedFeed.length - 1 && (
                  <span className="absolute left-[15px] top-8 bottom-0 w-px bg-border" aria-hidden />
                )}
                <div className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white", dotColor)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="text-xs font-medium">{ev.title}</p>
                  {ev.description && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{ev.description}</p>
                  )}
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {ev.actor} · {formatWhen(ev.at)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-input p-3">
        <div className="mb-2 flex gap-1">
          {(
            [
              { id: "message" as Tab, label: "Send message", icon: MessageSquare },
              { id: "note" as Tab, label: "Log note", icon: StickyNote },
              { id: "activity" as Tab, label: "Log activity", icon: CheckCircle2 },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <t.icon className="h-3 w-3" />
              {t.label}
            </button>
          ))}
        </div>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            tab === "message"
              ? "Write a message to the customer…"
              : tab === "note"
                ? "Internal note (team only)…"
                : "Log an activity…"
          }
          rows={2}
          className="text-xs"
        />
        <Button size="sm" className="mt-2 h-8 w-full text-xs" onClick={submit} disabled={!draft.trim()}>
          <Send className="mr-1.5 h-3.5 w-3.5" />
          {tab === "message" ? "Send" : "Log"}
        </Button>
      </div>
    </div>
  );
}

function Avatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white", color)}>
      {initials}
    </div>
  );
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
