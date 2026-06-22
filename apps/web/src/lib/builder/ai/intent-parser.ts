import type { ParsedBuildIntent, PcBuildPurpose, PerformanceTier, BuildRequirements } from "@/lib/builder/ai/types";

const PURPOSE_PATTERNS: { purpose: PcBuildPurpose; patterns: RegExp[] }[] = [
  { purpose: "gaming", patterns: [/gaming/i, /game/i, /esports/i, /fps/i] },
  { purpose: "video_editing", patterns: [/video edit/i, /editing/i, /premiere/i, /davinci/i, /render/i] },
  { purpose: "workstation", patterns: [/workstation/i, /cad/i, /3d model/i, /blender/i, /professional/i] },
  { purpose: "streaming", patterns: [/stream/i, /twitch/i, /obs/i, /content creat/i] },
  { purpose: "office", patterns: [/office/i, /productivity/i, /browsing/i, /spreadsheet/i, /word/i] },
];

function extractBudgetBdt(prompt: string): number | null {
  const normalized = prompt.replace(/,/g, "");
  const patterns = [
    /(?:under|below|max|budget|within)\s*(?:৳|bdt|tk|taka)?\s*(\d+(?:\.\d+)?)\s*(?:k|K)?/i,
    /(?:৳|bdt|tk|taka)\s*(\d+(?:\.\d+)?)\s*(?:k|K)?/i,
    /(\d{5,7})\s*(?:bdt|tk|taka|৳)/i,
    /(\d+)\s*k\s*(?:bdt|tk|taka|budget)?/i,
  ];

  for (const re of patterns) {
    const m = normalized.match(re);
    if (m) {
      let val = parseFloat(m[1]);
      if (/k/i.test(m[0]) && val < 1000) val *= 1000;
      return Math.round(val);
    }
  }
  return null;
}

function detectPurpose(prompt: string): PcBuildPurpose {
  for (const { purpose, patterns } of PURPOSE_PATTERNS) {
    if (patterns.some((p) => p.test(prompt))) return purpose;
  }
  return "general";
}

function detectPerformanceTier(prompt: string, budget: number | null): PerformanceTier {
  if (/high[\s-]?end|premium|best|flagship|max/i.test(prompt)) return "high_end";
  if (/budget|cheap|affordable|entry|basic|low[\s-]?cost/i.test(prompt)) return "budget";
  if (budget !== null) {
    if (budget < 60000) return "budget";
    if (budget > 150000) return "high_end";
  }
  return "mid_range";
}

export function parseBuildIntent(prompt: string): ParsedBuildIntent {
  const budgetBdt = extractBudgetBdt(prompt);
  const purpose = detectPurpose(prompt);
  const performanceTier = detectPerformanceTier(prompt, budgetBdt);
  const includeMonitor = !/no monitor|without monitor|skip monitor/i.test(prompt);

  const keywords = prompt
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  return {
    rawPrompt: prompt.trim(),
    purpose,
    budgetBdt,
    performanceTier,
    includeMonitor,
    keywords,
  };
}

export function intentToRequirements(intent: ParsedBuildIntent): BuildRequirements {
  const base: BuildRequirements = {
    purpose: intent.purpose,
    budgetBdt: intent.budgetBdt,
    performanceTier: intent.performanceTier,
    includeMonitor: intent.includeMonitor,
    budgetWeights: {},
    minRamGb: 16,
    minStorageGb: 500,
    minPsuWatts: 550,
    preferGpu: false,
    preferMultiCore: false,
  };

  switch (intent.purpose) {
    case "gaming":
      return {
        ...base,
        budgetWeights: { cpu: 0.22, motherboard: 0.14, ram: 0.08, gpu: 0.32, ssd: 0.08, psu: 0.06, case: 0.05, monitor: 0.05 },
        minRamGb: intent.performanceTier === "high_end" ? 32 : 16,
        preferGpu: true,
      };
    case "video_editing":
    case "workstation":
      return {
        ...base,
        budgetWeights: { cpu: 0.28, motherboard: 0.14, ram: 0.14, gpu: 0.18, ssd: 0.12, psu: 0.06, case: 0.04, monitor: 0.04 },
        minRamGb: 32,
        minStorageGb: 1000,
        preferMultiCore: true,
      };
    case "streaming":
      return {
        ...base,
        budgetWeights: { cpu: 0.26, motherboard: 0.14, ram: 0.12, gpu: 0.22, ssd: 0.1, psu: 0.06, case: 0.04, monitor: 0.06 },
        minRamGb: 32,
        preferMultiCore: true,
        preferGpu: true,
      };
    case "office":
      return {
        ...base,
        budgetWeights: { cpu: 0.25, motherboard: 0.18, ram: 0.12, gpu: 0.05, ssd: 0.2, psu: 0.08, case: 0.07, monitor: 0.05 },
        minRamGb: 8,
        minPsuWatts: 450,
      };
    default:
      return {
        ...base,
        budgetWeights: { cpu: 0.24, motherboard: 0.15, ram: 0.1, gpu: 0.2, ssd: 0.12, psu: 0.07, case: 0.05, monitor: 0.07 },
      };
  }
}
