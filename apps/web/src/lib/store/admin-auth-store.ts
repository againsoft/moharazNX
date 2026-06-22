"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
};

type AdminAuthState = {
  user: AdminUser | null;
  token: string | null;
  expiresAt: string | null;
  setSession: (payload: { user: AdminUser; token: string; expiresAt: string }) => void;
  clearSession: () => void;
};

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      expiresAt: null,
      setSession: ({ user, token, expiresAt }) => set({ user, token, expiresAt }),
      clearSession: () => set({ user: null, token: null, expiresAt: null }),
    }),
    {
      name: "moharaznx-admin-auth",
      partialize: (s) => ({ user: s.user, token: s.token, expiresAt: s.expiresAt }),
    },
  ),
);

export function getStoredAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("moharaznx-admin-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}
