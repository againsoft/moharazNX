"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/store/admin-auth-store";

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAdminAuth((s) => s.token);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  if (!token) return null;
  return <>{children}</>;
}
