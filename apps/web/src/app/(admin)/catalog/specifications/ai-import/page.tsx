"use client";

import { SpecAiImportPanel } from "@/components/specifications/spec-ai-import-panel";

export default function SpecificationAiImportPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0">
        <p className="page-subtitle">MoharazNX › Catalog › Specifications</p>
        <h1 className="page-title">AI Import</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Paste supplier specs → AI maps to profile groups, fields, and values
        </p>
      </div>
      <div className="mt-4 min-h-0 flex-1">
        <SpecAiImportPanel />
      </div>
    </div>
  );
}
