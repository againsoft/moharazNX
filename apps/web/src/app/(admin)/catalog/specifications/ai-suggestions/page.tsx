"use client";

import { SpecAiSuggestionsPanel } from "@/components/specifications/spec-ai-suggestions-panel";

export default function SpecificationAiSuggestionsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0">
        <p className="page-subtitle">MoharazNX › Catalog › Specifications</p>
        <h1 className="page-title">AI Suggestions</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Review missing fields, filter tips, normalization, and duplicates
        </p>
      </div>
      <div className="mt-4 min-h-0 flex-1">
        <SpecAiSuggestionsPanel />
      </div>
    </div>
  );
}
