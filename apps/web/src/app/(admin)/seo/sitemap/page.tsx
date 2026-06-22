"use client";

import { Suspense } from "react";
import { Map } from "lucide-react";
import { SitemapManager } from "@/components/seo/sitemap-manager";

function SitemapContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › SEO › Sitemap</p>
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-emerald-600" />
            <h1 className="page-title">Sitemap Manager</h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Manage sitemap files, review URL priorities, regenerate on demand, and submit to Google Search Console.
          </p>
        </div>
      </div>
      <SitemapManager />
    </div>
  );
}

export default function SitemapPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <SitemapContent />
      </Suspense>
    </div>
  );
}
