"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { AuthUsersList } from "@/components/auth/auth-users-list";
import { UserDrawer } from "@/components/auth/user-drawer";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import { useAuthUsers } from "@/lib/api/use-auth-users";
import { useAdminAuth } from "@/lib/store/admin-auth-store";
import type { AdminUser } from "@/lib/store/admin-auth-store";
import { cn } from "@/lib/utils";

type DrawerState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; user: AdminUser };

export default function SystemUsersPage() {
  const currentUser = useAdminAuth((s) => s.user);
  const isAdmin = currentUser?.role === "admin";
  const { users, total, loading, error, refetch, createUser, patchUser, removeUser } = useAuthUsers();
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "closed" });

  useEffect(() => {
    if (error) toast.error(`API: ${error}`, { id: "auth-users-api" });
  }, [error]);

  if (!isAdmin) {
    return (
      <div className="rounded-lg border border-border/60 bg-card p-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Admin access required</p>
        <p className="mt-1">Only administrators can manage team roles.</p>
        <Button variant="outline" size="sm" asChild className="mt-4">
          <Link href="/system">Back to system hub</Link>
        </Button>
      </div>
    );
  }

  const drawerOpen = drawer.mode !== "closed";

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="page-subtitle">
            <Link href="/system" className="hover:text-foreground">System</Link>
            {" › Access › Users"}
          </p>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-600" />
            <h1 className="page-title">
              Team Users
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({loading ? "…" : total})
              </span>
            </h1>
          </div>
          <div className="mt-1.5">
            <ApiConnectionBadge loading={loading} error={error} productCount={total} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
            <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setDrawer({ mode: "create" })}>
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Add member
          </Button>
        </div>
      </div>

      <div className="mt-3 min-h-0 flex-1">
        <AuthUsersList
          users={users}
          loading={loading}
          canEdit={isAdmin}
          currentUserId={currentUser?.id}
          onRowClick={(user) => setDrawer({ mode: "edit", user })}
          onRoleChange={async (userId, role) => { await patchUser(userId, { role }); }}
          onStatusChange={async (userId, is_active) => { await patchUser(userId, { is_active }); }}
          onDelete={removeUser}
        />
      </div>

      {/* Create drawer */}
      {drawer.mode === "create" && (
        <UserDrawer
          mode="create"
          open={drawerOpen}
          onOpenChange={(open) => { if (!open) setDrawer({ mode: "closed" }); }}
          onAdd={async (payload) => {
            await createUser(payload);
          }}
        />
      )}

      {/* Edit drawer */}
      {drawer.mode === "edit" && (
        <UserDrawer
          mode="edit"
          user={drawer.user}
          open={drawerOpen}
          onOpenChange={(open) => { if (!open) setDrawer({ mode: "closed" }); }}
          isSelf={drawer.user.id === currentUser?.id}
          onSave={async (userId, patch) => {
            const updated = await patchUser(userId, patch);
            setDrawer({ mode: "edit", user: updated });
          }}
          onDelete={async (userId) => {
            await removeUser(userId);
            setDrawer({ mode: "closed" });
          }}
        />
      )}
    </div>
  );
}
