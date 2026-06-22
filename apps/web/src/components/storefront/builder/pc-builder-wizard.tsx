"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { filterCompatibleProducts } from "@/lib/builder/compatibility-filter";
import {
  applyBuilderFacetFilters,
  applyBuilderQuickFilter,
  countActiveBuilderFilters,
  sortBuilderProducts,
  type BuilderSortOption,
} from "@/lib/builder/product-list-utils";
import { getPcProductsByStep } from "@/lib/mock-data/pc-builder-products";
import { compatibilityRulesSeed } from "@/lib/mock-data/compatibility-rules";
import { usePcBuilderStore } from "@/lib/store/pc-builder-store";
import { getStepsForPhase } from "@/lib/builder/phases";
import { BuilderStepNav } from "@/components/storefront/builder/builder-step-nav";
import { PC_BUILDER_STEPS, stepAllowsMultiple } from "@/lib/builder/types";
import { BuilderProductCard } from "@/components/storefront/builder/builder-product-card";
import { BuilderComparePanel } from "@/components/storefront/builder/builder-compare-panel";
import { BuilderCompatibilityBanner } from "@/components/storefront/builder/builder-compatibility-banner";
import { BuilderPhaseTabs } from "@/components/storefront/builder/builder-phase-tabs";
import { BuilderOverviewPanel } from "@/components/storefront/builder/builder-overview-panel";
import { BuilderSummary } from "@/components/storefront/builder/builder-summary";
import { BuilderPresetsPanel } from "@/components/storefront/builder/builder-presets-panel";
import { BuilderLiveInsights } from "@/components/storefront/builder/builder-live-insights";
import { BuilderRecommendationsPanel } from "@/components/storefront/builder/builder-recommendations-panel";
import { BuilderProductToolbar } from "@/components/storefront/builder/builder-product-toolbar";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function PcBuilderWizard() {
  const currentPhase = usePcBuilderStore((s) => s.currentPhase);
  const currentStep = usePcBuilderStore((s) => s.currentStep);
  const selections = usePcBuilderStore((s) => s.selections);
  const selectProduct = usePcBuilderStore((s) => s.selectProduct);
  const isProductSelected = usePcBuilderStore((s) => s.isProductSelected);
  const getSelectionsForStep = usePcBuilderStore((s) => s.getSelectionsForStep);
  const toggleCompare = usePcBuilderStore((s) => s.toggleCompare);
  const compareByStep = usePcBuilderStore((s) => s.compareByStep);
  const totalPrice = usePcBuilderStore((s) => s.totalPrice);
  const nextStep = usePcBuilderStore((s) => s.nextStep);
  const prevStep = usePcBuilderStore((s) => s.prevStep);

  const [quickFilter, setQuickFilter] = useState("");
  const [facetFilters, setFacetFilters] = useState<Record<string, string[]>>({});
  const [sort, setSort] = useState<BuilderSortOption>("price_asc");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setQuickFilter("");
    setFacetFilters({});
    setSort("price_asc");
    setFilterOpen(false);
  }, [currentStep]);

  const stepMeta = PC_BUILDER_STEPS.find((s) => s.id === currentStep)!;
  const allProducts = getPcProductsByStep(currentStep);
  const stepSelections = getSelectionsForStep(currentStep);
  const allowMultiple = stepAllowsMultiple(currentStep);

  const { compatible, hidden } = useMemo(
    () => filterCompatibleProducts(allProducts, selections, compatibilityRulesSeed),
    [allProducts, selections, currentStep],
  );

  const displayed = useMemo(() => {
    let list = applyBuilderQuickFilter(compatible, quickFilter);
    list = applyBuilderFacetFilters(list, currentStep, facetFilters);
    return sortBuilderProducts(list, sort);
  }, [compatible, quickFilter, facetFilters, sort, currentStep]);

  const activeFilterCount = countActiveBuilderFilters(facetFilters) + (quickFilter.trim() ? 1 : 0);
  const phaseSteps = getStepsForPhase(currentPhase);
  const stepIndex = phaseSteps.findIndex((s) => s.id === currentStep);
  const isOverview = currentPhase === "overview";

  return (
    <div className="space-y-4">
      <BuilderPresetsPanel />
      <BuilderPhaseTabs />
      {!isOverview && <BuilderStepNav />}

      {!isOverview && currentPhase === "components" && <BuilderCompatibilityBanner />}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="space-y-3 lg:sticky lg:top-20 lg:w-[17.5rem] lg:shrink-0 xl:w-72">
          <BuilderSummary />
          {!isOverview && (
            <>
              <BuilderLiveInsights />
              <BuilderRecommendationsPanel />
            </>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          {isOverview ? (
            <BuilderOverviewPanel />
          ) : (
            <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Choose your {stepMeta.label}</h2>
              <p className="text-xs text-muted-foreground">
                {displayed.length} shown · {compatible.length} compatible
                {hidden > 0 && ` · ${hidden} hidden (incompatible)`}
                {allowMultiple && stepSelections.length > 0 && ` · ${stepSelections.length} added`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={stepIndex === 0} onClick={prevStep}>
                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                Back
              </Button>
              <Button size="sm" disabled={stepIndex === phaseSteps.length - 1} onClick={nextStep}>
                Next
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <BuilderProductToolbar
            stepId={currentStep}
            total={displayed.length}
            quickFilter={quickFilter}
            onQuickFilterChange={setQuickFilter}
            sort={sort}
            onSortChange={setSort}
            facetFilters={facetFilters}
            onFacetFiltersChange={setFacetFilters}
            filterOpen={filterOpen}
            onFilterOpenChange={setFilterOpen}
            activeFilterCount={activeFilterCount}
          />

          {hidden > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-input bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              Showing only components compatible with your current selections
            </div>
          )}

          {allowMultiple && stepSelections.length > 0 && (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-xs text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-100">
              You can add multiple {stepMeta.label} modules — click <strong>Add</strong> on each product card.
            </div>
          )}

          <BuilderComparePanel stepId={currentStep} />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {displayed.map((product) => (
              <BuilderProductCard
                key={product.id}
                product={product}
                selected={isProductSelected(currentStep, product.id)}
                allowMultiple={allowMultiple}
                inCompare={(compareByStep[currentStep] ?? []).includes(product.id)}
                onSelect={() => selectProduct(currentStep, product.id)}
                onToggleCompare={() => toggleCompare(currentStep, product.id)}
              />
            ))}
          </div>

          {displayed.length === 0 && (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <p className="text-sm font-medium">No compatible {stepMeta.label} products</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Adjust earlier selections or clear filters to see more options
              </p>
            </div>
          )}
            </>
          )}
        </div>
      </div>

      {!isOverview && (
      <div className="fixed bottom-14 left-0 right-0 z-40 border-t border-border/60 bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground">{selections.length} parts selected</p>
            <p className="text-sm font-bold">{formatCurrency(totalPrice())}</p>
          </div>
          <Button size="sm" onClick={nextStep} disabled={stepIndex === phaseSteps.length - 1}>
            Continue
          </Button>
        </div>
      </div>
      )}
    </div>
  );
}
