"use client";

import { StoreList } from "@/components/settings/store-list";

export default function SettingsPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="mb-1 shrink-0">
        <p className="page-subtitle">MoharazNX › System › Settings</p>
        <h1 className="page-title">Store List</h1>
      </div>
      <StoreList />
    </div>
  );
}
