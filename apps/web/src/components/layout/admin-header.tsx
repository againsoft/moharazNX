"use client";

import { TopNavigation } from "@/components/navigation/top-navigation";
import { useAppStore } from "@/lib/store/app-store";

export function AdminHeader() {
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);

  return <TopNavigation onMobileMenuClick={toggleSidebar} />;
}
