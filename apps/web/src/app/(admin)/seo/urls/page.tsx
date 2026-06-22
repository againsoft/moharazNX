"use client";

import { Suspense } from "react";
import { Link2 } from "lucide-react";
import { UrlManager } from "@/components/seo/url-manager";

function UrlManagerContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › SEO › URL Manager</p>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-blue-600" />
            <h1 className="page-title">URL Manager</h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            View and manage all storefront URLs — slugs, canonical tags, redirect status, and indexing settings.
          </p>
        </div>
      </div>
      <UrlManager />
    </div>
  );
}

export default function UrlManagerPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <UrlManagerContent />
      </Suspense>
    </div>
  );
}
