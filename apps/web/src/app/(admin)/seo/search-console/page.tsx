"use client";

import { Suspense } from "react";
import { SearchConsole } from "@/components/seo/search-console";

function SearchConsoleContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › SEO › Search Console</p>
          <div className="flex items-center gap-2">
            {/* Google Search Console colour logo mark */}
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#4285F4"/>
              <path d="M12 6a6 6 0 100 12A6 6 0 0012 6z" fill="#fff"/>
              <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" fill="#34A853"/>
              <path d="M12 10a2 2 0 100 4 2 2 0 000-4z" fill="#FBBC05"/>
              <circle cx="12" cy="12" r="1" fill="#EA4335"/>
            </svg>
            <h1 className="page-title">Search Console</h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Google Search Console data — clicks, impressions, CTR, average position, index coverage, and search queries.
          </p>
        </div>
      </div>
      <SearchConsole />
    </div>
  );
}

export default function SearchConsolePage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <SearchConsoleContent />
      </Suspense>
    </div>
  );
}
