"use client";

import { usePcBuilderWizardStore } from "@/lib/store/pc-builder-wizard-store";
import { BuilderModeSelector } from "@/components/storefront/builder/builder-mode-selector";
import { BuilderHowItWorks } from "@/components/storefront/builder/builder-how-it-works";
import { GuidedWizard } from "@/components/storefront/builder/guided-wizard";
import { PcBuilderAiAssistant } from "@/components/storefront/builder/pc-builder-ai-assistant";
import { PcBuilderWizard } from "@/components/storefront/builder/pc-builder-wizard";

export function PcBuilderWorkspace() {
  const mode = usePcBuilderWizardStore((s) => s.mode);

  return (
    <div className="space-y-6">
      <BuilderHowItWorks />
      <BuilderModeSelector />

      {mode === "ai_chat" && (
        <>
          <PcBuilderAiAssistant />
          <p className="text-center text-xs text-muted-foreground">
            AI build apply করার পর <strong>Manual Builder</strong>-এ গিয়ে SSD/RAM আরও add করতে পারবেন।
          </p>
        </>
      )}

      {mode === "wizard" && <GuidedWizard />}

      {mode === "manual" && <PcBuilderWizard />}

      {mode !== "manual" && (
        <div className="rounded-lg border border-dashed border-input p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Parts customize করতে চান? Build apply করার পর <strong>Manual Builder</strong> mode-এ যান।
          </p>
        </div>
      )}
    </div>
  );
}
