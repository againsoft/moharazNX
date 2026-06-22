"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/store/admin-auth-store";

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAdminAuth((s) => s.token);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
    }
  }, [ready, token, router, pathname]);

  if (!ready || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking session…
      </div>
    );
  }

  return <>{children}</>;
}
