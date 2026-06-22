"use client";

import { AiSettingsWorkspace } from "@/components/settings/ai-settings-workspace";

export default function AiSettingsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <AiSettingsWorkspace />
    </div>
  );
}
