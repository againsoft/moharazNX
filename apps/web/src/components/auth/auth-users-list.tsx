"use client";

import { toast } from "sonner";
import type { AdminUser } from "@/lib/store/admin-auth-store";
import { Badge } from "@/components/ui/badge";
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
  onRoleChange?: (userId: string, role: string) => Promise<void>;
};

export function AuthUsersList({ users, loading = false, canEdit = false, onRoleChange }: AuthUsersListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-input">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Name</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Role</th>
            <th className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">Loading…</td>
            </tr>
          )}
          {!loading && users.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">No users found</td>
            </tr>
          )}
          {!loading &&
            users.map((user) => (
              <tr key={user.id} className="border-t border-input/60 hover:bg-muted/20">
                <td className="px-3 py-2.5 font-medium">{user.name}</td>
                <td className="px-3 py-2.5 text-muted-foreground">{user.email}</td>
                <td className="px-3 py-2.5">
                  {canEdit && onRoleChange ? (
                    <Select
                      value={user.role}
                      onChange={(e) => {
                        const role = e.target.value;
                        if (role === user.role) return;
                        void onRoleChange(user.id, role).catch((err) => {
                          toast.error(err instanceof Error ? err.message : "Failed to update role");
                        });
                      }}
                      className="h-8 w-[120px] text-xs"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </Select>
                  ) : (
                    <Badge variant={roleVariant(user.role)} className="text-[10px] capitalize">
                      {user.role}
                    </Badge>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <Badge
                    variant={user.is_active ? "success" : "muted"}
                    className={cn("text-[10px]", !user.is_active && "opacity-70")}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      <p className="border-t border-input/60 px-3 py-2 text-[11px] text-muted-foreground">
        Roles: admin (full) · staff (read/write) · viewer (read-only on admin writes)
      </p>
    </div>
  );
}
