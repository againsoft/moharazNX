"use client";

import { Suspense } from "react";
import { Braces } from "lucide-react";
import { SchemaManager } from "@/components/seo/schema-manager";

function SchemaContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › SEO › Schema Manager</p>
          <div className="flex items-center gap-2">
            <Braces className="h-5 w-5 text-violet-600" />
            <h1 className="page-title">Schema Manager</h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Manage JSON-LD structured data — Product, Organization, FAQ, Article and more — for rich search results.
          </p>
        </div>
      </div>
      <SchemaManager />
    </div>
  );
}

export default function SchemaPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <SchemaContent />
      </Suspense>
    </div>
  );
}
