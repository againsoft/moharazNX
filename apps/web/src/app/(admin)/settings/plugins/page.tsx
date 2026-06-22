"use client";

import { PluginsHome } from "@/components/settings/plugins/plugins-home";

export default function PluginsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <PluginsHome />
    </div>
  );
}
