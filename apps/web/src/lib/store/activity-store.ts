import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ActivityAiAction,
  ActivityApproval,
  ActivityAttachment,
  ActivityComment,
  ActivityEntityRef,
  ActivityEntry,
  ActivityFollower,
  ActivityNote,
  EntityActivityBundle,
} from "@/lib/activity/types";
import {
  activityAiActionsSeed,
  activityApprovalsSeed,
  activityAttachmentsSeed,
  activityCommentsSeed,
  activityEntriesSeed,
  activityFollowersSeed,
  activityNotesSeed,
  filterByEntity,
  getSeedActivitiesForEntity,
} from "@/lib/mock-data/activities";

type ActivityStore = {
  entries: ActivityEntry[];
  comments: ActivityComment[];
  notes: ActivityNote[];
  attachments: ActivityAttachment[];
  followers: ActivityFollower[];
  aiActions: ActivityAiAction[];
  approvals: ActivityApproval[];

  drawerOpen: boolean;
  drawerEntity: ActivityEntityRef | null;

  openDrawer: (entity: ActivityEntityRef) => void;
  closeDrawer: () => void;

  getBundle: (type: ActivityEntityRef["type"], id: string) => EntityActivityBundle;
  addComment: (type: ActivityEntityRef["type"], id: string, body: string, author?: string) => void;
  addNote: (type: ActivityEntityRef["type"], id: string, body: string, author?: string) => void;
  toggleFollow: (type: ActivityEntityRef["type"], id: string, user: { userId: string; name: string; initials: string }) => void;
  logActivity: (entry: Omit<ActivityEntry, "id">) => void;
};

const CURRENT_USER = { userId: "me", name: "You", initials: "YO" };

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      entries: activityEntriesSeed,
      comments: activityCommentsSeed,
      notes: activityNotesSeed,
      attachments: activityAttachmentsSeed,
      followers: activityFollowersSeed,
      aiActions: activityAiActionsSeed,
      approvals: activityApprovalsSeed,

      drawerOpen: false,
      drawerEntity: null,

      openDrawer: (entity) => set({ drawerOpen: true, drawerEntity: entity }),
      closeDrawer: () => set({ drawerOpen: false, drawerEntity: null }),

      getBundle: (type, id) => {
        const state = get();
        const seeded = getSeedActivitiesForEntity(type, id);
        const stored = state.entries.filter((e) => e.entityType === type && e.entityId === id);
        const entries = stored.length > 0 ? stored : seeded;

        return {
          entries: [...entries].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
          comments: filterByEntity(state.comments, type, id).sort(
            (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
          ),
          notes: filterByEntity(state.notes, type, id).sort(
            (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
          ),
          attachments: filterByEntity(state.attachments, type, id),
          followers: filterByEntity(state.followers, type, id),
          aiActions: filterByEntity(state.aiActions, type, id).sort(
            (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
          ),
          approvals: filterByEntity(state.approvals, type, id).sort(
            (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
          ),
        };
      },

      addComment: (type, id, body, author = CURRENT_USER.name) =>
        set((s) => ({
          comments: [
            {
              id: `cmt_${Date.now()}`,
              entityType: type,
              entityId: id,
              author,
              authorInitials: author.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
              body,
              at: new Date().toISOString(),
            },
            ...s.comments,
          ],
        })),

      addNote: (type, id, body, author = CURRENT_USER.name) =>
        set((s) => ({
          notes: [
            {
              id: `note_${Date.now()}`,
              entityType: type,
              entityId: id,
              author,
              authorInitials: author.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
              body,
              at: new Date().toISOString(),
            },
            ...s.notes,
          ],
        })),

      toggleFollow: (type, id, user) =>
        set((s) => {
          const exists = s.followers.some(
            (f) => f.entityType === type && f.entityId === id && f.userId === user.userId,
          );
          if (exists) {
            return {
              followers: s.followers.filter(
                (f) => !(f.entityType === type && f.entityId === id && f.userId === user.userId),
              ),
            };
          }
          return {
            followers: [
              ...s.followers,
              { entityType: type, entityId: id, ...user },
            ],
          };
        }),

      logActivity: (entry) =>
        set((s) => ({
          entries: [{ id: `act_${Date.now()}`, ...entry }, ...s.entries],
        })),
    }),
    {
      name: "againerp-activity",
      partialize: (s) => ({
        entries: s.entries,
        comments: s.comments,
        notes: s.notes,
        followers: s.followers,
      }),
    },
  ),
);
