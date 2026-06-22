"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/store/admin-auth-store";

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAdminAuth((s) => s._hasHydrated);
  const token = useAdminAuth((s) => s.token);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) router.replace("/login");
  }, [hasHydrated, token, router]);

  if (!hasHydrated) return null;
  if (!token) return null;
  return <>{children}</>;
}
