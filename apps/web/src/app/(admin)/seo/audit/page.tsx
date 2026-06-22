"use client";

import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { AuditDashboard } from "@/components/seo/audit-dashboard";

function AuditContent() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › SEO › SEO Audit</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h1 className="page-title">SEO Audit</h1>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Full site health report — crawl issues, content gaps, technical errors, and performance signals.
          </p>
        </div>
      </div>
      <AuditDashboard />
    </div>
  );
}

export default function SeoAuditPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-1 flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <Suspense fallback={<p className="flex flex-1 items-center text-sm text-muted-foreground">Loading…</p>}>
        <AuditContent />
      </Suspense>
    </div>
  );
}
