"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/store/admin-auth-store";

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAdminAuth((s) => s.token);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) router.replace("/login");
  }, [mounted, token, router]);

  // TODO: re-enable auth gate
  // if (!mounted) return null;
  // if (!token) return null;
  return <>{children}</>;
}
