"use client";

import { Search } from "lucide-react";
import { SeoControlCenter } from "@/components/seo/seo-control-center";

export default function SeoPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0">
        <p className="page-subtitle">MoharazNX › SEO</p>
        <div className="flex flex-wrap items-center gap-2">
          <Search className="h-5 w-5 text-emerald-600" />
          <h1 className="page-title">SEO</h1>
        </div>
        <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
          Meta manager, redirects, sitemaps, keyword tracking, and automated audits for storefront
          visibility.
        </p>
      </div>

      <div className="mt-4 min-h-0 flex-1">
        <SeoControlCenter />
      </div>
    </div>
  );
}
