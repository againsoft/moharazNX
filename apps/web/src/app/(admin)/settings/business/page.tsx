"use client";

import { BusinessSettingsHome } from "@/components/settings/business-settings-home";

export default function BusinessSettingsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <BusinessSettingsHome />
    </div>
  );
}
