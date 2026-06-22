import type { AiPcBuildResult } from "@/lib/builder/ai/types";
import { planPcBuild, summarizeCatalogForPrompt } from "@/lib/builder/ai/build-planner";
import {
  PC_BUILDER_AI_SYSTEM_PROMPT,
  buildPcBuilderUserPrompt,
} from "@/lib/builder/ai/prompts";

export type AiAssistOptions = {
  /** Production: pass to LLM provider */
  useLlm?: boolean;
};

/**
 * AI PC Builder service — prototype uses rule-based planner.
 * Production: intent parse via LLM → product selection via constrained catalog RAG → compatibility verify.
 */
export class PcBuilderAiService {
  async buildFromPrompt(prompt: string, _options?: AiAssistOptions): Promise<AiPcBuildResult> {
    // Production path:
    // 1. const llmIntent = await llm.chat(SYSTEM, buildPcBuilderUserPrompt(prompt, summarizeCatalogForPrompt()))
    // 2. Merge LLM intent with parseBuildIntent() fallback
    // 3. planPcBuild with merged requirements
    // 4. Re-run compatibility engine; retry with alternatives if incompatible

    void PC_BUILDER_AI_SYSTEM_PROMPT;
    void buildPcBuilderUserPrompt;
    void summarizeCatalogForPrompt;

    return planPcBuild(prompt);
  }
}

export const pcBuilderAiService = new PcBuilderAiService();
