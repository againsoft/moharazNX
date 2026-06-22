import type { PcBuilderProduct, PcBuilderSelection, PcBuilderStepId } from "@/lib/builder/types";
import { PC_BUILDER_STEPS } from "@/lib/builder/types";
import type {
  AiAlternativeSuggestion,
  AiPcBuildResult,
  AiProductPick,
  AiUpgradeSuggestion,
  BuildRequirements,
  ParsedBuildIntent,
} from "@/lib/builder/ai/types";
import { PURPOSE_LABELS } from "@/lib/builder/ai/types";
import { intentToRequirements, parseBuildIntent } from "@/lib/builder/ai/intent-parser";
import { evaluateBuildCompatibility, filterCompatibleProducts } from "@/lib/builder/compatibility-filter";
import {
  getPcProductsByStep,
  pcBuilderProductsSeed,
  selectionsToBuildContext,
} from "@/lib/mock-data/pc-builder-products";
import { compatibilityRulesSeed } from "@/lib/mock-data/compatibility-rules";

function scoreCpu(p: PcBuilderProduct, req: BuildRequirements): number {
  const cores = Number(p.attributes.core_count ?? 0);
  let score = cores * 10;
  if (req.preferMultiCore) score += cores * 5;
  if (req.performanceTier === "budget") score -= p.price / 500;
  if (req.performanceTier === "high_end") score += p.price / 1000;
  if (p.stockStatus === "Out of Stock") score -= 10000;
  return score;
}

function scoreGpu(p: PcBuilderProduct, req: BuildRequirements, remaining: number): number {
  const vram = Number(p.attributes.vram ?? 0);
  let score = vram * 20;
  if (req.preferGpu) score += vram * 15;
  if (p.price <= remaining) score += 50;
  else score -= (p.price - remaining) / 100;
  if (p.stockStatus === "Out of Stock") score -= 10000;
  return score;
}

function scoreByPriceFit(products: PcBuilderProduct[], target: number): PcBuilderProduct | null {
  const inStock = products.filter((p) => p.stockStatus !== "Out of Stock");
  if (inStock.length === 0) return null;
  return inStock.reduce((best, p) => {
    const bestDiff = Math.abs(best.price - target);
    const diff = Math.abs(p.price - target);
    return diff < bestDiff ? p : best;
  });
}

function pickBest(
  stepId: PcBuilderStepId,
  selections: PcBuilderSelection[],
  req: BuildRequirements,
  spent: number,
  scorer?: (p: PcBuilderProduct) => number,
): PcBuilderProduct | null {
  const all = getPcProductsByStep(stepId);
  const { compatible } = filterCompatibleProducts(all, selections, compatibilityRulesSeed);
  if (compatible.length === 0) return null;

  const weight = req.budgetWeights[stepId] ?? 0.1;
  const budget = req.budgetBdt ?? 200000;
  const target = Math.max(3000, budget * weight);
  const remaining = budget - spent;

  if (scorer) {
    const sorted = [...compatible].sort((a, b) => scorer(b) - scorer(a));
    const affordable = sorted.find((p) => !req.budgetBdt || spent + p.price <= req.budgetBdt);
    return affordable ?? sorted[0];
  }

  const affordable = compatible.filter((p) => !req.budgetBdt || spent + p.price <= req.budgetBdt);
  const pool = affordable.length > 0 ? affordable : compatible;
  return scoreByPriceFit(pool, Math.min(target, remaining));
}

function productToSelection(p: PcBuilderProduct): PcBuilderSelection {
  return {
    selectionId: `sel_${p.id}_${Date.now().toString(36)}`,
    stepId: p.stepId,
    productId: p.id,
    productName: p.name,
    price: p.price,
    image: p.image,
    attributes: p.attributes,
    attributeProfileId: p.attributeProfileId,
  };
}

function buildUpgrades(
  selections: PcBuilderSelection[],
  req: BuildRequirements,
): AiUpgradeSuggestion[] {
  const upgrades: AiUpgradeSuggestion[] = [];

  for (const sel of selections) {
    const stepProducts = getPcProductsByStep(sel.stepId);
    const { compatible } = filterCompatibleProducts(stepProducts, selections.filter((s) => s.stepId !== sel.stepId), compatibilityRulesSeed);
    const better = compatible
      .filter((p) => p.price > sel.price && p.stockStatus !== "Out of Stock")
      .sort((a, b) => a.price - b.price)[0];

    if (!better) continue;
    if (req.budgetBdt && selections.reduce((s, x) => s + x.price, 0) - sel.price + better.price > req.budgetBdt * 1.15) continue;

    upgrades.push({
      stepId: sel.stepId,
      currentProductId: sel.productId,
      upgradeProductId: better.id,
      upgradeProductName: better.name,
      priceDelta: better.price - sel.price,
      benefit:
        sel.stepId === "gpu"
          ? `More VRAM (${better.attributes.vram}GB) for higher settings`
          : sel.stepId === "cpu"
            ? `More cores for faster multitasking`
            : sel.stepId === "ram"
              ? `More memory for demanding workloads`
              : `Better component tier`,
    });
  }

  return upgrades.slice(0, 3);
}

function buildAlternatives(
  selections: PcBuilderSelection[],
): AiAlternativeSuggestion[] {
  const alts: AiAlternativeSuggestion[] = [];

  for (const sel of selections) {
    const stepProducts = getPcProductsByStep(sel.stepId);
    const { compatible } = filterCompatibleProducts(
      stepProducts,
      selections.filter((s) => s.stepId !== sel.stepId),
      compatibilityRulesSeed,
    );
    const alt = compatible.find(
      (p) => p.id !== sel.productId && p.stockStatus !== "Out of Stock" && Math.abs(p.price - sel.price) < sel.price * 0.25,
    );
    if (alt) {
      alts.push({
        stepId: sel.stepId,
        productId: alt.id,
        productName: alt.name,
        price: alt.price,
        tradeoff:
          alt.price < sel.price
            ? `Saves ৳${sel.price - alt.price} with similar specs`
            : `+৳${alt.price - sel.price} for ${alt.brand} alternative`,
      });
    }
  }

  return alts.slice(0, 3);
}

function generateExplanation(
  intent: ParsedBuildIntent,
  req: BuildRequirements,
  selections: PcBuilderSelection[],
  total: number,
  status: string,
): string {
  const parts: string[] = [];
  parts.push(
    `I interpreted your request as a **${PURPOSE_LABELS[intent.purpose]}** build` +
      (intent.budgetBdt ? ` with a **৳${intent.budgetBdt.toLocaleString()}** budget cap` : "") +
      ` (${intent.performanceTier.replace("_", " ")} tier).`,
  );

  const cpu = selections.find((s) => s.stepId === "cpu");
  const gpu = selections.find((s) => s.stepId === "gpu");
  if (intent.purpose === "gaming" && gpu) {
    parts.push(`Prioritized the GPU (${gpu.productName}) for gaming performance while keeping ${cpu?.productName ?? "a balanced CPU"} for platform stability.`);
  } else if ((intent.purpose === "video_editing" || intent.purpose === "workstation") && cpu) {
    parts.push(`Selected ${cpu.productName} for strong multi-core performance, paired with ${req.minRamGb}GB+ RAM for editing workloads.`);
  } else if (intent.purpose === "streaming") {
    parts.push(`Balanced CPU encoding headroom with a capable GPU for gaming while streaming.`);
  }

  parts.push(`Total build cost: **৳${total.toLocaleString()}**. All parts passed compatibility checks (${status}).`);
  return parts.join(" ");
}

export function planPcBuild(prompt: string): AiPcBuildResult {
  const intent = parseBuildIntent(prompt);
  const requirements = intentToRequirements(intent);
  const selections: PcBuilderSelection[] = [];
  const picks: AiProductPick[] = [];
  let spent = 0;

  const steps: PcBuilderStepId[] = PC_BUILDER_STEPS.filter(
    (s) =>
      s.phase === "components" ||
      (s.id === "monitor" && intent.includeMonitor),
  ).map((s) => s.id);

  for (const stepId of steps) {
    let product: PcBuilderProduct | null = null;

    if (stepId === "cpu") {
      product = pickBest(stepId, selections, requirements, spent, (p) => scoreCpu(p, requirements));
    } else if (stepId === "gpu") {
      const remaining = (requirements.budgetBdt ?? 200000) - spent;
      product = pickBest(stepId, selections, requirements, spent, (p) => scoreGpu(p, requirements, remaining));
      if (!requirements.preferGpu && requirements.purpose === "office") {
        product = null; // skip dGPU for office
      }
    } else if (stepId === "psu") {
      const tdp =
        Number(selections.find((s) => s.stepId === "cpu")?.attributes.tdp ?? 65) +
        Number(selections.find((s) => s.stepId === "gpu")?.attributes.tdp ?? 0);
      const minW = Math.max(requirements.minPsuWatts, tdp + 150);
      product = pickBest(stepId, selections, requirements, spent, (p) => {
        const w = Number(p.attributes.wattage ?? 0);
        return w >= minW ? w : w - 5000;
      });
    } else {
      product = pickBest(stepId, selections, requirements, spent);
    }

    if (!product) continue;

    if (requirements.budgetBdt && spent + product.price > requirements.budgetBdt) continue;

    const sel = productToSelection(product);
    selections.push(sel);
    spent += product.price;

    picks.push({
      stepId,
      productId: product.id,
      productName: product.name,
      price: product.price,
      reason: `${PC_BUILDER_STEPS.find((s) => s.id === stepId)?.label} pick for ${intent.purpose}`,
    });
  }

  const evalResult = evaluateBuildCompatibility(selections, compatibilityRulesSeed);
  const upgrades = buildUpgrades(selections, requirements);
  const alternatives = buildAlternatives(selections);

  return {
    intent,
    requirements,
    selections: picks,
    totalPrice: spent,
    remainingBudget: requirements.budgetBdt ? requirements.budgetBdt - spent : null,
    compatibilityStatus: evalResult.status,
    compatibilityMessages: evalResult.results.map((r) => r.message),
    explanation: generateExplanation(intent, requirements, selections, spent, evalResult.status),
    upgrades,
    alternatives,
    confidence: selections.length >= 5 ? 0.88 : 0.72,
  };
}

/** Catalog summary for LLM context (production) */
export function summarizeCatalogForPrompt(): string {
  return PC_BUILDER_STEPS.map((step) => {
    const products = getPcProductsByStep(step.id);
    const sample = products.slice(0, 3).map((p) => `${p.name} (৳${p.price})`).join(", ");
    return `${step.label}: ${products.length} products — e.g. ${sample}`;
  }).join("\n");
}

export { selectionsToBuildContext };
