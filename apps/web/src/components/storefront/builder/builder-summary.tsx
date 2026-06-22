"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronRight, Plus, Share2, Save, ShoppingCart, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import {
  PC_BUILDER_ASSEMBLY_SERVICE,
  PC_BUILDER_PHASES,
  getStepsForPhase,
  phaseFilledCount,
  type PcBuilderPhaseId,
} from "@/lib/builder/phases";
import { PC_BUILDER_STEPS, stepAllowsMultiple, type PcBuilderStepId } from "@/lib/builder/types";
import { PC_BUILDER_STEP_ICONS } from "@/lib/builder/step-icons";
import { usePcBuilderStore } from "@/lib/store/pc-builder-store";
import { useStorefrontCart } from "@/lib/store/storefront-cart-store";
import { builderPcPath } from "@/lib/url-slug/storefront-paths";
import { pcSelectionsToErpInput } from "@/lib/configurator/erp/build-to-erp";
import { BuilderErpActions } from "@/components/configurator/erp/builder-erp-actions";
import { EmiInlineLink } from "@/components/storefront/emi/emi-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = { className?: string };

function SummarySlotShell({
  stepId,
  isActive,
  isEmpty,
  isOptional,
  onClick,
  children,
  trailing,
}: {
  stepId: PcBuilderStepId;
  isActive: boolean;
  isEmpty: boolean;
  isOptional?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  const Icon = PC_BUILDER_STEP_ICONS[stepId];
  const step = PC_BUILDER_STEPS.find((s) => s.id === stepId)!;

  return (
    <div
      className={cn(
        "group rounded-lg border transition-all",
        isEmpty
          ? "border-dashed border-muted-foreground/25 bg-muted/20 hover:border-indigo-300 hover:bg-indigo-50/30 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/20"
          : "border-border/70 bg-background shadow-sm hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-800",
        isActive && "border-indigo-400 ring-1 ring-indigo-400/40 dark:border-indigo-600",
      )}
    >
      <div className="flex items-start gap-2.5 p-2.5">
        <button type="button" onClick={onClick} className="flex min-w-0 flex-1 items-start gap-2.5 text-left">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border",
              isEmpty
                ? "border-muted-foreground/20 bg-muted/50 text-muted-foreground"
                : "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400",
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {step.label}
                {isOptional && (
                  <span className="ml-1 font-normal normal-case text-muted-foreground/70">· optional</span>
                )}
              </span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500" />
            </div>
            {children}
          </div>
        </button>
        {trailing}
      </div>
    </div>
  );
}

export function BuilderSummary({ className }: Props) {
  const currentPhase = usePcBuilderStore((s) => s.currentPhase);
  const currentStep = usePcBuilderStore((s) => s.currentStep);
  const selections = usePcBuilderStore((s) => s.selections);
  const getSelectionsForStep = usePcBuilderStore((s) => s.getSelectionsForStep);
  const setStep = usePcBuilderStore((s) => s.setStep);
  const totalPrice = usePcBuilderStore((s) => s.totalPrice);
  const assemblyEnabled = usePcBuilderStore((s) => s.assemblyEnabled);
  const toggleAssembly = usePcBuilderStore((s) => s.toggleAssembly);
  const compatibilityStatus = usePcBuilderStore((s) => s.compatibilityStatus);
  const buildName = usePcBuilderStore((s) => s.buildName);
  const setBuildName = usePcBuilderStore((s) => s.setBuildName);
  const saveBuild = usePcBuilderStore((s) => s.saveBuild);
  const encodeSelectionsUrl = usePcBuilderStore((s) => s.encodeSelectionsUrl);
  const removeSelection = usePcBuilderStore((s) => s.removeSelection);
  const clearStep = usePcBuilderStore((s) => s.clearStep);
  const addToCart = useStorefrontCart((s) => s.addItem);

  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    components: true,
    extras: false,
    peripherals: false,
  });

  useEffect(() => {
    if (currentPhase !== "overview") {
      setExpandedPhases((prev) => ({ ...prev, [currentPhase]: true }));
    }
  }, [currentPhase]);

  const togglePhase = (phaseId: PcBuilderPhaseId) => {
    if (phaseId === "overview") return;
    setExpandedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const filledSteps = PC_BUILDER_STEPS.filter((step) => getSelectionsForStep(step.id).length > 0).length;

  const renderStep = (step: (typeof PC_BUILDER_STEPS)[number]) => {
    const stepSelections = getSelectionsForStep(step.id);
    const multi = stepAllowsMultiple(step.id);
    const isActive = currentStep === step.id;
    const isOptional = "optional" in step && step.optional;

    if (stepSelections.length === 0) {
      return (
        <SummarySlotShell
          key={step.id}
          stepId={step.id}
          isActive={isActive}
          isEmpty
          isOptional={isOptional}
          onClick={() => setStep(step.id)}
        >
          <p className="mt-0.5 text-xs font-medium text-muted-foreground/80">Not selected</p>
          <p className="mt-1 text-[10px] text-muted-foreground/60">Click to choose {step.label}</p>
        </SummarySlotShell>
      );
    }

    return (
      <div key={step.id} className="space-y-1.5">
        {stepSelections.map((sel, idx) => (
          <SummarySlotShell
            key={sel.selectionId}
            stepId={step.id}
            isActive={isActive && idx === 0}
            isEmpty={false}
            onClick={() => setStep(step.id)}
            trailing={
              <Button
                variant="ghost"
                size="icon"
                className="mt-0.5 h-7 w-7 shrink-0 self-start opacity-60 hover:opacity-100"
                onClick={() => (multi ? removeSelection(sel.selectionId) : clearStep(step.id))}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            }
          >
            <div className="mt-0.5 flex items-center gap-2">
              <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-border/50 bg-muted">
                <Image src={sel.image} alt="" fill sizes="32px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium leading-tight">{sel.productName}</p>
                <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  {formatCurrency(sel.price)}
                </p>
              </div>
            </div>
          </SummarySlotShell>
        ))}
        {multi && (
          <button
            type="button"
            onClick={() => setStep(step.id)}
            className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-indigo-200/80 py-1.5 text-[10px] font-medium text-indigo-600 transition-colors hover:bg-indigo-50/50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
          >
            <Plus className="h-3 w-3" />
            Add another {step.label}
          </button>
        )}
      </div>
    );
  };

  const statusVariant =
    compatibilityStatus() === "compatible"
      ? "success"
      : compatibilityStatus() === "warning"
        ? "warning"
        : "outline";

  const handleSave = () => {
    const build = saveBuild();
    toast.success(`Build saved — ${build.buildCode}`);
  };

  const handleShare = async () => {
    const selectionIds = encodeSelectionsUrl();
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}${builderPcPath()}?selections=${encodeURIComponent(selectionIds)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied");
    } catch {
      toast.info(url);
    }
  };

  const handleAddToCart = () => {
    if (selections.length === 0) {
      toast.error("Select at least one component");
      return;
    }
    for (const sel of selections) {
      addToCart({
        productId: sel.productId,
        slug: sel.productId,
        name: sel.productName,
        price: sel.price,
        image: sel.image,
        qty: 1,
      });
    }
    toast.success(`${selections.length} components added to cart`);
  };

  const erpInputForActions = pcSelectionsToErpInput(
    `pc_active_${selections.map((s) => s.productId).join("_") || "empty"}`,
    `PC-${new Date().getFullYear()}-${selections.length}`,
    buildName,
    selections,
    totalPrice(),
    compatibilityStatus(),
  );

  return (
    <aside
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border/60 bg-gradient-to-b from-card to-muted/20 shadow-sm",
        className,
      )}
    >
      <div className="border-b border-border/60 bg-card/80 px-3 py-3 backdrop-blur-sm">
        <h2 className="text-sm font-semibold tracking-tight">Build summary</h2>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant} className="capitalize text-[10px]">
            {compatibilityStatus()}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {selections.length} parts · {filledSteps}/{PC_BUILDER_STEPS.length}
          </span>
        </div>
      </div>

      <div className="max-h-[50vh] flex-1 space-y-3 overflow-y-auto p-3 lg:max-h-[calc(100vh-16rem)]">
        {PC_BUILDER_PHASES.filter((p) => p.id !== "overview").map((phase) => {
          const steps = getStepsForPhase(phase.id);
          const filled = phaseFilledCount(phase.id, getSelectionsForStep);
          const isExpanded = expandedPhases[phase.id] ?? phase.id === currentPhase;
          const isActivePhase = currentPhase === phase.id;

          return (
            <div key={phase.id} className={cn("rounded-lg border border-border/50", isActivePhase && "border-indigo-200/80 dark:border-indigo-800/50")}>
              <button
                type="button"
                onClick={() => togglePhase(phase.id)}
                className="flex w-full items-center gap-2 px-2.5 py-2 text-left"
              >
                <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform", !isExpanded && "-rotate-90")} />
                <span className="text-[11px] font-semibold">{phase.label}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  {filled}/{steps.length}
                </span>
              </button>
              {isExpanded && <div className="space-y-2 px-2 pb-2">{steps.map((step) => renderStep(step))}</div>}
            </div>
          );
        })}
      </div>

      <div className="border-t border-border/60 bg-card/90 p-3">
        <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-dashed border-border/70 bg-muted/20 px-3 py-2.5 transition-colors hover:bg-muted/40">
          <input
            type="checkbox"
            checked={assemblyEnabled}
            onChange={toggleAssembly}
            className="mt-0.5 h-4 w-4 rounded border-border accent-indigo-600"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{PC_BUILDER_ASSEMBLY_SERVICE.label}</span>
            </div>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{PC_BUILDER_ASSEMBLY_SERVICE.description}</p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            +{formatCurrency(PC_BUILDER_ASSEMBLY_SERVICE.price)}
          </span>
        </label>

        <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">Total</span>
          <span className="text-lg font-bold tracking-tight">{formatCurrency(totalPrice())}</span>
        </div>

        <EmiInlineLink amount={totalPrice()} className="mt-2" surface="builder" />

        <div className="mt-3 space-y-2">
          <Input
            value={buildName}
            onChange={(e) => setBuildName(e.target.value)}
            placeholder="Build name"
            className="h-8 border-border/70 bg-background text-xs"
          />
          <Button className="w-full" size="sm" onClick={handleAddToCart} disabled={compatibilityStatus() === "incompatible"}>
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            Add build to cart
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={handleSave} disabled={selections.length === 0}>
              <Save className="mr-1 h-3 w-3" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} disabled={selections.length === 0}>
              <Share2 className="mr-1 h-3 w-3" />
              Share
            </Button>
          </div>
          <BuilderErpActions input={erpInputForActions} variant="storefront" />
        </div>
      </div>
    </aside>
  );
}
