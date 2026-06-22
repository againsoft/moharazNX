"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AdminUser } from "@/lib/store/admin-auth-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ROLES = ["admin", "staff", "viewer"] as const;

function roleVariant(role: string) {
  if (role === "admin") return "default" as const;
  if (role === "staff") return "secondary" as const;
  return "outline" as const;
}

type AuthUsersListProps = {
  users: AdminUser[];
  loading?: boolean;
  canEdit?: boolean;
  currentUserId?: string;
  onRowClick?: (user: AdminUser) => void;
  onRoleChange?: (userId: string, role: string) => Promise<void>;
  onStatusChange?: (userId: string, is_active: boolean) => Promise<void>;
  onDelete?: (userId: string) => Promise<void>;
};

export function AuthUsersList({
  users,
  loading = false,
  canEdit = false,
  currentUserId,
  onRowClick,
  onRoleChange,
  onStatusChange,
  onDelete,
}: AuthUsersListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleDelete(user: AdminUser) {
    if (!onDelete) return;
    if (!window.confirm(`Remove ${user.name} from the team?`)) return;
    setDeletingId(user.id);
    try {
      await onDelete(user.id);
      toast.success(`${user.name} removed`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove user");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleStatusToggle(user: AdminUser) {
    if (!onStatusChange) return;
    setTogglingId(user.id);
    try {
      await onStatusChange(user.id, !user.is_active);
      toast.success(user.is_active ? `${user.name} deactivated` : `${user.name} activated`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-input">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2.5">Name</th>
            <th className="px-3 py-2.5">Email</th>
            <th className="px-3 py-2.5">Role</th>
            <th className="px-3 py-2.5">Status</th>
            {canEdit && <th className="px-3 py-2.5 w-10" />}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={canEdit ? 5 : 4} className="px-3 py-10 text-center text-muted-foreground">
                Loading…
              </td>
            </tr>
          )}
          {!loading && users.length === 0 && (
            <tr>
              <td colSpan={canEdit ? 5 : 4} className="px-3 py-10 text-center text-muted-foreground">
                No team members yet
              </td>
            </tr>
          )}
          {!loading &&
            users.map((user) => {
              const isSelf = user.id === currentUserId;
              const isToggling = togglingId === user.id;
              return (
                <tr
                  key={user.id}
                  className="border-t border-input/60 hover:bg-muted/20 cursor-pointer"
                  onClick={() => onRowClick?.(user)}
                >
                  <td className="px-3 py-2.5 font-medium">
                    <span>{user.name}</span>
                    {isSelf && (
                      <span className="ml-1.5 text-[10px] text-muted-foreground">(you)</span>
                    )}
                    <div className="text-[11px] text-muted-foreground">@{user.username}</div>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">{user.email}</td>

                  {/* Role */}
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    {canEdit && onRoleChange && !isSelf ? (
                      <Select
                        value={user.role}
                        onChange={(e) => {
                          const role = e.target.value;
                          if (role === user.role) return;
                          void onRoleChange(user.id, role).catch((err) => {
                            toast.error(err instanceof Error ? err.message : "Failed to update role");
                          });
                        }}
                        className="h-7 w-[110px] text-xs"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </Select>
                    ) : (
                      <Badge variant={roleVariant(user.role)} className="text-[10px] capitalize">
                        {user.role}
                      </Badge>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    {canEdit && onStatusChange && !isSelf ? (
                      <button
                        disabled={isToggling}
                        onClick={() => void handleStatusToggle(user)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors",
                          user.is_active
                            ? "bg-green-500/15 text-green-600 hover:bg-red-500/15 hover:text-red-600"
                            : "bg-muted text-muted-foreground hover:bg-green-500/15 hover:text-green-600",
                          isToggling && "opacity-50 cursor-not-allowed"
                        )}
                        title={user.is_active ? "Click to deactivate" : "Click to activate"}
                      >
                        <span className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          user.is_active ? "bg-green-500" : "bg-muted-foreground"
                        )} />
                        {isToggling ? "…" : user.is_active ? "Active" : "Inactive"}
                      </button>
                    ) : (
                      <Badge
                        variant={user.is_active ? "success" : "muted"}
                        className={cn("text-[10px]", !user.is_active && "opacity-70")}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    )}
                  </td>

                  {canEdit && (
                    <td className="px-3 py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                      {!isSelf && onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          disabled={deletingId === user.id}
                          onClick={() => void handleDelete(user)}
                          title="Remove user"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>
      <p className="border-t border-input/60 px-3 py-2 text-[11px] text-muted-foreground">
        Roles: admin (full access) · staff (day-to-day ops) · viewer (read-only)
      </p>
    </div>
  );
}
