import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
};

/** WS-CONTENT-* — Zone D main content slot. */
export function WorkspaceMainContent({ children, className }: Props) {
  return (
    <main
      data-zone="D"
      data-component="WS-CONTENT"
      data-layout="LAYOUT-WORKSPACE"
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-background p-3 pb-20 lg:pb-4 lg:p-4",
        className,
      )}
    >
      {children}
    </main>
  );
}
