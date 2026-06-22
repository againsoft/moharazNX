"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  CheckCircle2,
  Clock,
  FileText,
  History,
  MessageSquare,
  Paperclip,
  Send,
  StickyNote,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useActivityStore } from "@/lib/store/activity-store";
import { ACTIVITY_ACTION_LABELS, type ActivityActionType, type ActivityEntry } from "@/lib/activity/types";
import { cn } from "@/lib/utils";

// ─── Tab config ───────────────────────────────────────────────────────────────

type TabId = "overview" | "activities" | "comments" | "notes" | "attachments" | "followers" | "ai" | "history";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: Zap },
  { id: "activities", label: "Activities", icon: Clock },
  { id: "comments", label: "Comments", icon: MessageSquare },
  { id: "notes", label: "Notes", icon: StickyNote },
  { id: "attachments", label: "Files", icon: Paperclip },
  { id: "followers", label: "Followers", icon: Users },
  { id: "ai", label: "AI", icon: Bot },
  { id: "history", label: "History", icon: History },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function actionIcon(type: ActivityActionType) {
  const base = "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold";
  const map: Partial<Record<ActivityActionType, string>> = {
    create: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    update: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    status_change: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    ai_action: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    approval: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    rejection: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    assignment: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    comment: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
    note: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };
  return <span className={cn(base, map[type] ?? "bg-muted text-muted-foreground")}>{ACTIVITY_ACTION_LABELS[type]?.[0] ?? "?"}</span>;
}

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  return (
    <div className="flex gap-3">
      {actionIcon(entry.actionType)}
      <div className="min-w-0 flex-1 pb-4 border-b border-input last:border-0 last:pb-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold">{entry.title}</p>
          <Badge variant="outline" className="text-[9px] capitalize">{entry.actionType.replace("_", " ")}</Badge>
        </div>
        {entry.description && <p className="mt-0.5 text-[11px] text-muted-foreground">{entry.description}</p>}
        {entry.fieldChanges && entry.fieldChanges.length > 0 && (
          <div className="mt-2 space-y-1 rounded-lg border border-input bg-muted/30 p-2">
            {entry.fieldChanges.map((fc, i) => (
              <div key={i} className="text-[11px]">
                <span className="font-medium">{fc.field}: </span>
                <span className="text-muted-foreground line-through">{fc.oldValue}</span>
                <span className="mx-1 text-muted-foreground">→</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{fc.newValue}</span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-1 text-[10px] text-muted-foreground">{entry.actor} · {timeAgo(entry.at)}</p>
      </div>
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
      {initials}
    </div>
  );
}

// ─── Main drawer ──────────────────────────────────────────────────────────────

export function ActivityDrawer() {
  const drawerOpen = useActivityStore((s) => s.drawerOpen);
  const drawerEntity = useActivityStore((s) => s.drawerEntity);
  const closeDrawer = useActivityStore((s) => s.closeDrawer);
  const getBundle = useActivityStore((s) => s.getBundle);
  const addComment = useActivityStore((s) => s.addComment);
  const addNote = useActivityStore((s) => s.addNote);
  const toggleFollow = useActivityStore((s) => s.toggleFollow);

  const [tab, setTab] = useState<TabId>("overview");
  const [compose, setCompose] = useState<"comment" | "note" | null>(null);
  const [draft, setDraft] = useState("");

  const bundle = useMemo(() => {
    if (!drawerEntity) return null;
    return getBundle(drawerEntity.type, drawerEntity.id);
  }, [drawerEntity, getBundle, drawerOpen]);

  const isFollowing = bundle?.followers.some((f) => f.userId === "me") ?? false;

  const handleSend = () => {
    if (!draft.trim() || !drawerEntity) return;
    if (compose === "comment") {
      addComment(drawerEntity.type, drawerEntity.id, draft.trim());
      toast.success("Comment added");
    } else if (compose === "note") {
      addNote(drawerEntity.type, drawerEntity.id, draft.trim());
      toast.success("Internal note added");
    }
    setDraft("");
    setCompose(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      closeDrawer();
      setTab("overview");
      setCompose(null);
      setDraft("");
    }
  };

  return (
    <Sheet open={drawerOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full max-w-lg gap-0 p-0 sm:max-w-xl">
        {/* Header */}
        <div className="border-b border-input px-4 py-4 pr-12">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Activity & Chatter</p>
          {drawerEntity && (
            <>
              <h2 className="mt-0.5 text-base font-semibold truncate">{drawerEntity.label}</h2>
              {drawerEntity.subtitle && (
                <p className="text-xs text-muted-foreground capitalize">{drawerEntity.subtitle}</p>
              )}
            </>
          )}
        </div>

        {/* Compose bar */}
        <div className="flex gap-1 border-b border-input bg-muted/20 px-3 py-2">
          <Button
            size="sm"
            variant={compose === "comment" ? "default" : "outline"}
            className="h-7 gap-1 text-[11px]"
            onClick={() => setCompose(compose === "comment" ? null : "comment")}
          >
            <MessageSquare className="h-3 w-3" /> Comment
          </Button>
          <Button
            size="sm"
            variant={compose === "note" ? "default" : "outline"}
            className="h-7 gap-1 text-[11px]"
            onClick={() => setCompose(compose === "note" ? null : "note")}
          >
            <StickyNote className="h-3 w-3" /> Note
          </Button>
          {drawerEntity && (
            <Button
              size="sm"
              variant={isFollowing ? "default" : "outline"}
              className="ml-auto h-7 gap-1 text-[11px]"
              onClick={() => {
                toggleFollow(drawerEntity.type, drawerEntity.id, { userId: "me", name: "You", initials: "YO" });
                toast.success(isFollowing ? "Unfollowed" : "Following this record");
              }}
            >
              <UserPlus className="h-3 w-3" /> {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        {compose && (
          <div className="border-b border-input bg-muted/10 p-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder={compose === "comment" ? "Add a comment… Use @name to mention" : "Add an internal note…"}
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setCompose(null); setDraft(""); }}>Cancel</Button>
              <Button size="sm" className="h-7 gap-1 text-xs" onClick={handleSend}><Send className="h-3 w-3" /> Send</Button>
            </div>
          </div>
        )}

        {/* Tab bar — scrollable on mobile */}
        <div className="flex gap-0.5 overflow-x-auto border-b border-input bg-muted/30 px-2 py-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors",
                tab === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:bg-background/60",
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "calc(100vh - 220px)" }}>
          {!bundle ? (
            <p className="text-xs text-muted-foreground">Select a record to view activity.</p>
          ) : (
            <>
              {tab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { label: "Activities", value: bundle.entries.length, color: "text-blue-600" },
                      { label: "Comments", value: bundle.comments.length, color: "text-sky-600" },
                      { label: "Notes", value: bundle.notes.length, color: "text-amber-600" },
                      { label: "Followers", value: bundle.followers.length, color: "text-violet-600" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border border-input p-3 text-center">
                        <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold">Recent Activity</p>
                    <div className="space-y-3">
                      {bundle.entries.slice(0, 5).map((e) => (
                        <ActivityItem key={e.id} entry={e} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tab === "activities" && (
                <div className="space-y-3">
                  {bundle.entries.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No activities yet.</p>
                  ) : (
                    bundle.entries.map((e) => <ActivityItem key={e.id} entry={e} />)
                  )}
                </div>
              )}

              {tab === "comments" && (
                <div className="space-y-3">
                  {bundle.comments.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No comments yet.</p>
                  ) : (
                    bundle.comments.map((c) => (
                      <div key={c.id} className="flex gap-3">
                        <Avatar initials={c.authorInitials} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">{c.author}</span>
                            <span className="text-[10px] text-muted-foreground">{timeAgo(c.at)}</span>
                          </div>
                          <p className="mt-1 rounded-lg border border-input bg-muted/20 px-3 py-2 text-xs">{c.body}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "notes" && (
                <div className="space-y-3">
                  {bundle.notes.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No internal notes.</p>
                  ) : (
                    bundle.notes.map((n) => (
                      <div key={n.id} className="flex gap-3">
                        <Avatar initials={n.authorInitials} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold">{n.author}</span>
                            <Badge variant="outline" className="text-[9px]">Internal</Badge>
                            <span className="text-[10px] text-muted-foreground">{timeAgo(n.at)}</span>
                          </div>
                          <p className="mt-1 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs dark:border-yellow-800 dark:bg-yellow-950/20">{n.body}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "attachments" && (
                <div className="space-y-2">
                  {bundle.attachments.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No attachments.</p>
                  ) : (
                    bundle.attachments.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 rounded-lg border border-input p-3">
                        <FileText className="h-8 w-8 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">{a.name}</p>
                          <p className="text-[10px] text-muted-foreground">{a.size} · {a.uploadedBy} · {timeAgo(a.at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "followers" && (
                <div className="space-y-2">
                  {bundle.followers.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No followers.</p>
                  ) : (
                    bundle.followers.map((f) => (
                      <div key={f.userId} className="flex items-center gap-3 rounded-lg border border-input p-2.5">
                        <Avatar initials={f.initials} />
                        <span className="text-xs font-medium">{f.name}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "ai" && (
                <div className="space-y-3">
                  {bundle.aiActions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No AI actions logged.</p>
                  ) : (
                    bundle.aiActions.map((a) => (
                      <div key={a.id} className="rounded-lg border border-violet-200 bg-violet-50 p-3 dark:border-violet-800 dark:bg-violet-950/20">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-violet-500" />
                          <p className="text-xs font-semibold">{a.action}</p>
                          <span className="ml-auto text-[10px] text-muted-foreground">{timeAgo(a.at)}</span>
                        </div>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">{a.summary}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "history" && (
                <div className="space-y-3">
                  {bundle.approvals.length === 0 && bundle.entries.filter((e) => ["delete", "restore", "approval", "rejection"].includes(e.actionType)).length === 0 ? (
                    <p className="text-xs text-muted-foreground">No approval or audit history.</p>
                  ) : (
                    <>
                      {bundle.approvals.map((a) => (
                        <div key={a.id} className="flex gap-3 rounded-lg border border-input p-3">
                          <CheckCircle2 className={cn("h-5 w-5 shrink-0", a.status === "approved" ? "text-emerald-500" : a.status === "rejected" ? "text-destructive" : "text-orange-500")} />
                          <div>
                            <p className="text-xs font-semibold capitalize">{a.status === "requested" ? "Approval requested" : a.status}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {a.requestedBy}{a.actedBy ? ` → ${a.actedBy}` : ""} · {timeAgo(a.at)}
                            </p>
                            {a.reason && <p className="mt-1 text-[11px] italic text-muted-foreground">{a.reason}</p>}
                          </div>
                        </div>
                      ))}
                      {bundle.entries
                        .filter((e) => ["delete", "restore", "approval", "rejection", "import", "export"].includes(e.actionType))
                        .map((e) => (
                          <ActivityItem key={e.id} entry={e} />
                        ))}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
