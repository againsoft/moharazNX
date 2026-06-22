"use client";

import { Suspense } from "react";
import { Bot } from "lucide-react";
import { RobotsEditor } from "@/components/seo/robots-editor";

function RobotsContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › SEO › Robots.txt</p>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-slate-600" />
            <h1 className="page-title">Robots.txt Manager</h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Edit your robots.txt file, control crawler access, test URLs, and declare sitemaps.
          </p>
        </div>
      </div>
      <RobotsEditor />
    </div>
  );
}

export default function RobotsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <RobotsContent />
      </Suspense>
    </div>
  );
}
