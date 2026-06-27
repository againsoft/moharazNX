"use client";

import { Toaster } from "sonner";
import { CommandPalette } from "@/components/command-palette";
import { AiAssistantDrawer } from "@/components/ai-assistant-drawer";
import { ActivityDrawer } from "@/components/activity/activity-drawer";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        richColors
        position="bottom-right"
        offset={16}
        gap={8}
        toastOptions={{
          classNames: {
            toast: "!p-2 !min-h-0 !rounded-md !shadow-md !text-xs",
            title: "!text-xs !font-medium !leading-tight",
            description: "!text-[10px] !leading-tight",
            icon: "!h-3.5 !w-3.5",
            closeButton: "!h-4 !w-4",
          },
        }}
      />
      <CommandPalette />
      <AiAssistantDrawer />
      <ActivityDrawer />
    </>
  );
}
