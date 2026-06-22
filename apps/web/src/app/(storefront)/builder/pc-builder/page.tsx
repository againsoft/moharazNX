import { Suspense } from "react";
import { BuilderShareHydrator } from "@/components/storefront/builder/builder-share-hydrator";
import { PcBuilderWorkspace } from "@/components/storefront/builder/pc-builder-workspace";

export const metadata = {
  title: "AI PC Builder — Build Your Custom PC",
  description: "AI-first PC configurator — Bangla/English prompts, live compatibility, filters, multi-storage.",
};

export default function PcBuilderPage() {
  return (
    <div className="mx-auto max-w-6xl px-3 py-6 pb-24 sm:px-5 sm:py-8 lg:pb-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold sm:text-2xl">AI PC Builder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          বাংলা বা English-এ বলুন কী চান — AI compatible build দেবে। তারপর Manual-এ fine-tune করুন।
        </p>
      </div>

      <Suspense fallback={null}>
        <BuilderShareHydrator />
      </Suspense>

      <PcBuilderWorkspace />
    </div>
  );
}
