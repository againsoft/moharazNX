"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";
import { AuthUsersList } from "@/components/auth/auth-users-list";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import { useAuthUsers } from "@/lib/api/use-auth-users";
import { useAdminAuth } from "@/lib/store/admin-auth-store";
import { cn } from "@/lib/utils";

export default function SystemUsersPage() {
  const role = useAdminAuth((s) => s.user?.role);
  const isAdmin = role === "admin";
  const { users, total, loading, error, refetch, patchUser } = useAuthUsers();

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

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="page-subtitle">
            <Link href="/system" className="hover:text-foreground">System</Link>
            {" › Team users"}
          </p>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-600" />
            <h1 className="page-title">
              Team users
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({loading ? "…" : total})
              </span>
            </h1>
          </div>
          <div className="mt-1.5">
            <ApiConnectionBadge loading={loading} error={error} productCount={total} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>
      <div className="mt-3 min-h-0 flex-1">
        <AuthUsersList
          users={users}
          loading={loading}
          canEdit={isAdmin}
          onRoleChange={async (userId, role) => {
            await patchUser(userId, role);
          }}
        />
      </div>
    </div>
  );
}
