"use client";

import { Suspense } from "react";
import { ArrowRightLeft } from "lucide-react";
import { RedirectManager } from "@/components/seo/redirect-manager";

function RedirectsContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › SEO › Redirects</p>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-amber-600" />
            <h1 className="page-title">Redirect Manager</h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Manage 301/302/410 redirect rules, track hit counts, and keep your URL structure clean.
          </p>
        </div>
      </div>
      <RedirectManager />
    </div>
  );
}

export default function RedirectsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <RedirectsContent />
      </Suspense>
    </div>
  );
}
