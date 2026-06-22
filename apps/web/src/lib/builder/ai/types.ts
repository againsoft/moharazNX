/** AI PC Builder — types */

export type PcBuildPurpose =
  | "gaming"
  | "workstation"
  | "video_editing"
  | "streaming"
  | "office"
  | "general";

export type PerformanceTier = "budget" | "mid_range" | "high_end";

export type ParsedBuildIntent = {
  rawPrompt: string;
  purpose: PcBuildPurpose;
  budgetBdt: number | null;
  performanceTier: PerformanceTier;
  includeMonitor: boolean;
  keywords: string[];
};

export type BuildRequirements = {
  purpose: PcBuildPurpose;
  budgetBdt: number | null;
  performanceTier: PerformanceTier;
  includeMonitor: boolean;
  /** Target budget share per step (0–1) */
  budgetWeights: Partial<Record<string, number>>;
  minRamGb: number;
  minStorageGb: number;
  minPsuWatts: number;
  preferGpu: boolean;
  preferMultiCore: boolean;
};

export type AiProductPick = {
  stepId: string;
  productId: string;
  productName: string;
  price: number;
  reason: string;
};

export type AiUpgradeSuggestion = {
  stepId: string;
  currentProductId: string;
  upgradeProductId: string;
  upgradeProductName: string;
  priceDelta: number;
  benefit: string;
};

export type AiAlternativeSuggestion = {
  stepId: string;
  productId: string;
  productName: string;
  price: number;
  tradeoff: string;
};

export type AiPcBuildResult = {
  intent: ParsedBuildIntent;
  requirements: BuildRequirements;
  selections: AiProductPick[];
  totalPrice: number;
  remainingBudget: number | null;
  compatibilityStatus: "compatible" | "warning" | "incompatible";
  compatibilityMessages: string[];
  explanation: string;
  upgrades: AiUpgradeSuggestion[];
  alternatives: AiAlternativeSuggestion[];
  confidence: number;
};

export const PURPOSE_LABELS: Record<PcBuildPurpose, string> = {
  gaming: "Gaming",
  workstation: "Workstation",
  video_editing: "Video Editing",
  streaming: "Streaming",
  office: "Office / Productivity",
  general: "General Purpose",
};
