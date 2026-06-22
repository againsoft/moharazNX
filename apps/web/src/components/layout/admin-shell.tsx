"use client";

import { WorkspaceShell } from "@/components/workspace/workspace-shell";

/** @deprecated Use WorkspaceShell — kept for layout import stability. */
export function AdminShell({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}
