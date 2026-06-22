"use client";

import { Suspense } from "react";
import { ReturnFromPoRedirect } from "@/components/purchase/return-from-po-redirect";

export default function CreateReturnPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="mb-1 shrink-0">
        <p className="page-subtitle">MoharazNX › Suppliers › Vendor Returns › Create</p>
      </div>
      <Suspense fallback={<p className="py-16 text-center text-sm text-muted-foreground">Creating vendor return…</p>}>
        <ReturnFromPoRedirect />
      </Suspense>
    </div>
  );
}
