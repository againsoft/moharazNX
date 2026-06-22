"use client";

import { Suspense } from "react";
import { KeyRound } from "lucide-react";
import { KeywordTracker } from "@/components/seo/keyword-tracker";

function KeywordsContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › SEO › Keyword Tracking</p>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-violet-600" />
            <h1 className="page-title">Keyword Tracking</h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Monitor search rankings, position changes, and keyword opportunities for your storefront pages.
          </p>
        </div>
      </div>
      <KeywordTracker />
    </div>
  );
}

export default function KeywordsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <KeywordsContent />
      </Suspense>
    </div>
  );
}
