import Link from "next/link";
import { Cpu, Laptop, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { builderPcPath } from "@/lib/url-slug/storefront-paths";

export const metadata = {
  title: "PC Builder — Build Your Custom PC",
  description: "Step-by-step PC configurator with live compatibility checks and pricing.",
};

export default function BuilderHubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <div className="text-center">
        <Puzzle className="mx-auto h-10 w-10 text-indigo-600" />
        <h1 className="mt-3 text-2xl font-bold sm:text-3xl">Product Configurator</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Build your perfect setup — we check compatibility at every step.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-6 dark:border-indigo-900/50 dark:bg-indigo-950/20">
          <Cpu className="h-8 w-8 text-indigo-600" />
          <h2 className="mt-3 text-lg font-semibold">PC Builder</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            CPU, motherboard, RAM, GPU, SSD, HDD, PSU, case & monitor — with live compatibility.
          </p>
          <Button className="mt-4" asChild>
            <Link href={builderPcPath()}>Start building →</Link>
          </Button>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6 opacity-70">
          <Laptop className="h-8 w-8 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold">Laptop Builder</h2>
          <p className="mt-1 text-sm text-muted-foreground">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
