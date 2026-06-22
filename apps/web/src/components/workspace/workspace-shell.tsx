"use client";

import { ViewerReadOnlyBanner } from "@/components/auth/viewer-read-only-banner";
import { WorkspaceHeader } from "./workspace-header";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { WorkspaceModuleNav } from "./workspace-module-nav";
import { WorkspaceMainContent } from "./workspace-main-content";
import { WorkspaceUtilityPanel } from "./workspace-utility-panel";
import { WorkspaceMobileNav } from "./workspace-mobile-nav";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAppStore } from "@/lib/store/app-store";

type Props = {
  children: React.ReactNode;
};

/**
 * MoharazNX workspace shell — Zones A–F per WORKSPACE_UI_BLUEPRINT.
 * Modules render children inside Zone D only.
 */
export function WorkspaceShell({ children }: Props) {
  const mobileSidebarOpen = useAppStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <WorkspaceHeader />
      <ViewerReadOnlyBanner />

      <div className="flex min-h-0 flex-1">
        <div className="hidden lg:flex">
          <WorkspaceSidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <WorkspaceModuleNav />
          <div className="flex min-h-0 flex-1">
            <WorkspaceMainContent>{children}</WorkspaceMainContent>
            <WorkspaceUtilityPanel />
          </div>
        </div>
      </div>

      <WorkspaceMobileNav />

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[min(100vw,15rem)] gap-0 p-0">
          <WorkspaceSidebar
            className="h-full w-full border-0"
            onNavigate={() => setMobileSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
