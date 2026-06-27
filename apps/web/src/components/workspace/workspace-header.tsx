"use client";

import Link from "next/link";
import { TopNavigation } from "@/components/navigation/top-navigation";
import { BRAND_NAME } from "@/lib/brand";
import { useAppStore } from "@/lib/store/app-store";

/** WS-HEADER-* — Zone A global header (56px). */
export function WorkspaceHeader() {
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return (
    <div data-zone="A" data-component="WS-HEADER">
      <TopNavigation
        onMobileMenuClick={() => setMobileSidebarOpen(true)}
        onDesktopMenuClick={toggleSidebar}
        leading={
          <Link
            href="/dashboard"
            className="shrink-0 text-sm font-semibold tracking-tight text-foreground sm:hidden"
          >
            {BRAND_NAME}
          </Link>
        }
      />
    </div>
  );
}
