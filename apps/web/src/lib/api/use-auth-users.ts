"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminUser } from "@/lib/store/admin-auth-store";
import { fetchAuthUsers, updateAuthUser } from "@/lib/api/auth-users";

export function useAuthUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAuthUsers();
      setUsers(data);
      setTotal(data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const patchUser = useCallback(async (userId: string, role: string) => {
    const updated = await updateAuthUser(userId, { role });
    setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    return updated;
  }, []);

  return { users, total, loading, error, refetch, patchUser };
}
