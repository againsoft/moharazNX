"use client";

import * as React from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app-store";

const mockActions = [
  "Generate product description",
  "Generate SEO meta",
  "Generate FAQ",
  "Generate tags",
  "Translate to Bengali",
  "Rewrite for clarity",
  "Analyze listing quality",
];

const mockResponses: Record<string, string> = {
  "Generate product description":
    "Premium wireless earbuds with active noise cancellation, 32-hour battery life, and IPX5 water resistance. Ideal for commuters and fitness enthusiasts.",
  default: "This is a mock AI response. Live LLM integration is disabled in prototype mode.",
};

export function AiAssistantDrawer() {
  const open = useAppStore((s) => s.aiDrawerOpen);
  const setOpen = (v: boolean) => useAppStore.setState({ aiDrawerOpen: v });
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full max-w-md sm:max-w-lg">
        <div className="flex items-center gap-2 pr-8">
          <Sparkles className="h-5 w-5 text-violet-500" />
          <div>
            <h2 className="text-lg font-semibold">AI Assistant</h2>
            <p className="text-xs text-muted-foreground">Prototype · mock responses only</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {mockActions.map((action) => (
            <Button
              key={action}
              variant="outline"
              className="w-full justify-start"
              onClick={() => setLastAction(action)}
            >
              <Wand2 className="h-4 w-4" />
              {action}
            </Button>
          ))}
        </div>
        {lastAction && (
          <div className="mt-6 rounded-lg border bg-muted/40 p-4 text-sm">
            <p className="mb-1 font-medium">{lastAction}</p>
            <p className="text-muted-foreground">
              {mockResponses[lastAction] ?? mockResponses.default}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
