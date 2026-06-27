"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Reply } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/native-select";
import { useActivityStore } from "@/lib/store/activity-store";
import { useAdminAuth } from "@/lib/store/admin-auth-store";
import {
  ACTIVITY_ACTION_LABELS,
  type ActivityActionType,
  type ActivityComment,
  type ActivityEntry,
} from "@/lib/activity/types";
import {
  canViewAllActivities,
  filterActivities,
  type ActivityScope,
} from "@/lib/activity/access";
import { cn, formatTimeAgo } from "@/lib/utils";
import { ActivityAvatar } from "@/components/activity/activity-avatar";
import { CommentBody } from "@/components/activity/comment-body";
import { MentionCommentComposer } from "@/components/activity/mention-comment-composer";
import { useMentionableUsers } from "@/lib/api/use-mentionable-users";
import { resolveMentionedUserIds } from "@/lib/activity/mentions";

type TimelineItem =
  | { kind: "activity"; at: string; entry: ActivityEntry }
  | { kind: "comment"; at: string; comment: ActivityComment };

function actionIcon(type: ActivityActionType) {
  const base =
    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-bold text-foreground";
  const accent: Partial<Record<ActivityActionType, string>> = {
    create: "text-emerald-600",
    update: "text-blue-600",
    status_change: "text-violet-600",
    ai_action: "text-purple-600",
    comment: "text-foreground",
    delete: "text-red-600",
  };
  return (
    <span className={cn(base, accent[type])}>
      {ACTIVITY_ACTION_LABELS[type]?.[0] ?? "?"}
    </span>
  );
}

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  return (
    <div className="flex gap-2.5">
      {actionIcon(entry.actionType)}
      <div className="min-w-0 flex-1 rounded-lg border border-border bg-card px-2.5 py-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-[11px] font-semibold leading-tight text-foreground">{entry.title}</p>
          <Badge variant="outline" className="px-1 py-0 text-[8px] capitalize">
            {entry.actionType.replace("_", " ")}
          </Badge>
        </div>
        {entry.description ? (
          <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{entry.description}</p>
        ) : null}
        {entry.fieldChanges && entry.fieldChanges.length > 0 ? (
          <div className="mt-1.5 space-y-0.5 rounded-md border border-border bg-muted/50 p-1.5">
            {entry.fieldChanges.map((fc, i) => (
              <div key={i} className="text-[10px] leading-snug">
                <span className="font-medium text-foreground">{fc.field}: </span>
                <span className="text-muted-foreground line-through">{fc.oldValue}</span>
                <span className="mx-0.5 text-muted-foreground">→</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">{fc.newValue}</span>
              </div>
            ))}
          </div>
        ) : null}
        <p className="mt-1.5 text-[9px] text-muted-foreground">
          {entry.actor} · {formatTimeAgo(entry.at)}
        </p>
      </div>
    </div>
  );
}

function CommentBubble({
  comment,
  compact = false,
  active = false,
  onReply,
}: {
  comment: ActivityComment;
  compact?: boolean;
  active?: boolean;
  onReply?: () => void;
}) {
  return (
    <div className={cn("flex gap-2", compact ? "pt-2" : "")}>
      <ActivityAvatar initials={comment.authorInitials} name={comment.author} size={compact ? "sm" : "md"} />
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "rounded-lg border border-border bg-card px-2.5 py-2",
            active && "border-primary/50 ring-1 ring-primary/30",
          )}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[11px] font-semibold text-foreground">{comment.author}</span>
            <span className="shrink-0 text-[9px] text-muted-foreground">{formatTimeAgo(comment.at)}</span>
          </div>
          <CommentBody body={comment.body} className="mt-1" />
        </div>
        {!comment.parentId && onReply ? (
          <button
            type="button"
            className="mt-1 inline-flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onReply();
            }}
          >
            <Reply className="h-3 w-3" /> Reply
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CommentComposer({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder,
  submitLabel = "Send",
  userName = "You",
  userInitials = "YO",
  users,
  currentUserId,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  placeholder: string;
  submitLabel?: string;
  userName?: string;
  userInitials?: string;
  users: ReturnType<typeof useMentionableUsers>["users"];
  currentUserId?: string;
}) {
  return (
    <MentionCommentComposer
      value={value}
      onChange={onChange}
      onSubmit={onSubmit}
      onCancel={onCancel}
      placeholder={placeholder}
      submitLabel={submitLabel}
      userName={userName}
      userInitials={userInitials}
      users={users}
      currentUserId={currentUserId}
    />
  );
}

function CommentThread({
  comment,
  replies,
  replying,
  replyDraft,
  onReplyDraftChange,
  onReply,
  onReplySubmit,
  onReplyCancel,
  userName,
  userInitials,
  users,
  currentUserId,
}: {
  comment: ActivityComment;
  replies: ActivityComment[];
  replying: boolean;
  replyDraft: string;
  onReplyDraftChange: (value: string) => void;
  onReply: () => void;
  onReplySubmit: () => void;
  onReplyCancel: () => void;
  userName: string;
  userInitials: string;
  users: ReturnType<typeof useMentionableUsers>["users"];
  currentUserId?: string;
}) {
  return (
    <div className="space-y-0">
      <CommentBubble comment={comment} active={replying} onReply={onReply} />
      {replies.length > 0 || replying ? (
        <div className="ml-3 border-l border-border pl-3">
          {replies.map((reply) => (
            <CommentBubble key={reply.id} comment={reply} compact />
          ))}
          {replying ? (
            <div className="pt-2">
              <CommentComposer
                value={replyDraft}
                onChange={onReplyDraftChange}
                onSubmit={onReplySubmit}
                onCancel={onReplyCancel}
                placeholder={`Reply to ${comment.author}…`}
                submitLabel="Reply"
                userName={userName}
                userInitials={userInitials}
                users={users}
                currentUserId={currentUserId}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function getTopLevelComments(comments: ActivityComment[]) {
  return comments.filter((comment) => !comment.parentId);
}

function getReplies(comments: ActivityComment[], parentId: string) {
  return comments
    .filter((comment) => comment.parentId === parentId)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export function ActivityDrawer() {
  const user = useAdminAuth((s) => s.user);
  const drawerOpen = useActivityStore((s) => s.drawerOpen);
  const drawerEntity = useActivityStore((s) => s.drawerEntity);
  const comments = useActivityStore((s) => s.comments);
  const closeDrawer = useActivityStore((s) => s.closeDrawer);
  const getBundle = useActivityStore((s) => s.getBundle);
  const addComment = useActivityStore((s) => s.addComment);
  const { users: mentionableUsers } = useMentionableUsers();

  const [scope, setScope] = useState<ActivityScope>("all");
  const [commentDraft, setCommentDraft] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  const canViewAll = canViewAllActivities(user?.role);
  const userName = user?.name ?? "You";
  const userInitials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const bundle = useMemo(() => {
    if (!drawerEntity) return null;
    return getBundle(drawerEntity.type, drawerEntity.id);
  }, [drawerEntity, getBundle, drawerOpen, comments]);

  const visibleActivities = useMemo(() => {
    if (!bundle) return [];
    return filterActivities(bundle.entries, user, scope);
  }, [bundle, user, scope]);

  const topLevelComments = useMemo(() => {
    if (!bundle) return [];
    return getTopLevelComments(bundle.comments);
  }, [bundle]);

  const activityTimeline = useMemo(() => {
    const items: TimelineItem[] = [
      ...visibleActivities.map((entry) => ({
        kind: "activity" as const,
        at: entry.at,
        entry,
      })),
      ...topLevelComments.map((comment) => ({
        kind: "comment" as const,
        at: comment.at,
        comment,
      })),
    ];
    return items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [visibleActivities, topLevelComments]);

  const submitComment = (body: string, parentId?: string) => {
    if (!body.trim() || !drawerEntity) return;
    const trimmed = body.trim();
    const mentions = resolveMentionedUserIds(trimmed, mentionableUsers);
    addComment(
      drawerEntity.type,
      drawerEntity.id,
      trimmed,
      user?.name ?? "You",
      user?.id,
      parentId,
      mentions,
      drawerEntity.label,
    );
    const mentionedOthers = mentions.filter((id) => id !== user?.id);
    toast.success(
      parentId
        ? mentionedOthers.length > 0
          ? "Reply added · mentions notified"
          : "Reply added"
        : mentionedOthers.length > 0
          ? "Comment added · mentions notified"
          : "Comment added",
    );
  };

  const handleSendComment = () => {
    submitComment(commentDraft);
    setCommentDraft("");
  };

  const handleSendReply = () => {
    if (!replyingToId || !replyDraft.trim()) return;
    submitComment(replyDraft, replyingToId);
    setReplyDraft("");
    setReplyingToId(null);
  };

  const resetState = () => {
    setScope("all");
    setCommentDraft("");
    setReplyDraft("");
    setReplyingToId(null);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      closeDrawer();
      resetState();
    }
  };

  return (
    <Sheet open={drawerOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className={cn(
          "flex h-[100dvh] w-full max-w-full flex-row gap-0 p-0 sm:max-w-[336px]",
          "[&>button:last-child]:hidden",
        )}
      >
        <button
          type="button"
          aria-label="Close activity panel"
          title="Close"
          onClick={() => handleClose(false)}
          className="flex w-7 shrink-0 touch-manipulation flex-col items-center justify-center border-r border-border bg-muted/30 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted/80 sm:w-6"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
        </button>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 border-b border-border px-2.5 py-2.5 sm:px-3">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
              Activity
            </p>
            {drawerEntity ? (
              <>
                <h2 className="truncate text-xs font-semibold">{drawerEntity.label}</h2>
                {drawerEntity.subtitle ? (
                  <p className="truncate text-[10px] capitalize text-muted-foreground">
                    {drawerEntity.subtitle}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-muted/30 px-2.5 py-1.5 sm:px-3">
          {canViewAll ? (
            <Select
              value={scope}
              onChange={(e) => setScope(e.target.value as ActivityScope)}
              className="h-7 w-full max-w-[140px] text-[10px]"
            >
              <option value="all">All activity</option>
              <option value="mine">My activity</option>
            </Select>
          ) : (
            <p className="text-[10px] text-muted-foreground">Your activity only</p>
          )}
        </div>

        {!bundle ? (
          <div className="flex-1 overflow-y-auto p-2.5 sm:p-3">
            <p className="text-[11px] text-muted-foreground">Select a record to view activity.</p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto bg-background p-2.5 sm:p-3">
              {activityTimeline.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">
                  {canViewAll && scope === "mine"
                    ? "You have not changed this record yet."
                    : "No activity yet. Add a comment below."}
                </p>
              ) : (
                <div className="space-y-2.5">
                  {activityTimeline.map((item) =>
                    item.kind === "activity" ? (
                      <div key={item.entry.id}>
                        <ActivityItem entry={item.entry} />
                      </div>
                    ) : (
                      <div key={item.comment.id}>
                        <CommentThread
                          comment={item.comment}
                          replies={getReplies(bundle.comments, item.comment.id)}
                          replying={replyingToId === item.comment.id}
                          replyDraft={replyDraft}
                          onReplyDraftChange={setReplyDraft}
                          onReply={() => {
                            setReplyingToId(item.comment.id);
                            setReplyDraft("");
                          }}
                          onReplySubmit={handleSendReply}
                          onReplyCancel={() => {
                            setReplyingToId(null);
                            setReplyDraft("");
                          }}
                          userName={userName}
                          userInitials={userInitials}
                          users={mentionableUsers}
                          currentUserId={user?.id}
                        />
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-border bg-muted/30 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-2.5">
              <CommentComposer
                value={commentDraft}
                onChange={setCommentDraft}
                onSubmit={handleSendComment}
                placeholder="Write a comment… (@ to mention)"
                userName={userName}
                userInitials={userInitials}
                users={mentionableUsers}
                currentUserId={user?.id}
              />
            </div>
          </div>
        )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
