"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AuthProvider = "email" | "google" | "facebook" | "whatsapp";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  provider: AuthProvider;
};

type AuthState = {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  logout: () => void;
};

export const useStorefrontAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "storefront-auth",
      partialize: (s) => ({ user: s.user }),
    },
  ),
);

export function mockSocialUser(provider: AuthProvider): AuthUser {
  const names: Record<AuthProvider, { name: string; email: string }> = {
    email: { name: "Customer", email: "customer@example.com" },
    google: { name: "Google User", email: "user@gmail.com" },
    facebook: { name: "Facebook User", email: "user@facebook.com" },
    whatsapp: { name: "WhatsApp User", email: "user@whatsapp.com" },
  };
  const profile = names[provider];
  return {
    id: `auth_${provider}_${Date.now()}`,
    name: profile.name,
    email: profile.email,
    provider,
    phone: provider === "whatsapp" ? "+880 1712-345678" : undefined,
  };
}
