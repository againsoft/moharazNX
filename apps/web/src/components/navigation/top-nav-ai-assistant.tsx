"use client";

import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app-store";

export function TopNavAiAssistant() {
  const openUtilityPanel = useAppStore((s) => s.openUtilityPanel);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openUtilityPanel("ai");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openUtilityPanel]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 shrink-0"
      data-component="WS-HEADER-AI"
      onClick={() => openUtilityPanel("ai")}
      title="AI Assistant (Ctrl+J)"
      aria-label="Open AI assistant"
      aria-keyshortcuts="Control+J"
    >
      <Sparkles className="h-4 w-4 text-violet-500 dark:text-violet-400" aria-hidden />
    </Button>
  );
}
