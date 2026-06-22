"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** M2 — legacy route redirects to Business Partners vendor directory. */
export default function AllSuppliersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/partners/directory?role=vendor");
  }, [router]);

  return (
    <p className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      Redirecting to Business Partners vendor directory…
    </p>
  );
}
