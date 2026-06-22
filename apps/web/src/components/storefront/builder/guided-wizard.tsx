"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { PURPOSE_LABELS } from "@/lib/builder/ai/types";
import { getCurrentQuestion } from "@/lib/builder/wizard/question-engine";
import type { WizardAnswers, WizardStepId } from "@/lib/builder/wizard/types";
import { usePcBuilderWizardStore } from "@/lib/store/pc-builder-wizard-store";
import { usePcBuilderStore } from "@/lib/store/pc-builder-store";
import type { PcBuilderStepId } from "@/lib/builder/types";
import { WizardQuestionCard } from "@/components/storefront/builder/wizard-question-card";
import { WizardResultPanel } from "@/components/storefront/builder/wizard-result-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = { className?: string };

function getStepValue(answers: WizardAnswers, step: WizardStepId): unknown {
  switch (step) {
    case "purpose":
      return answers.purpose;
    case "budget":
      return answers.budgetBdt;
    case "brand_preference":
      return answers.brandPreference;
    case "performance_priority":
      return answers.performancePriority;
    case "upgrade_requirement":
      return answers.upgradeRequirement;
    case "upgrade_component":
      return answers.upgradeComponent;
    case "accessories":
      return answers.accessories;
    case "contact":
      return { name: answers.contactName, email: answers.contactEmail, phone: answers.contactPhone };
    default:
      return undefined;
  }
}

function setStepValue(
  setAnswer: <K extends keyof WizardAnswers>(key: K, value: WizardAnswers[K]) => void,
  step: WizardStepId,
  value: unknown,
) {
  switch (step) {
    case "purpose":
      setAnswer("purpose", value as WizardAnswers["purpose"]);
      break;
    case "budget":
      setAnswer("budgetBdt", value as number);
      break;
    case "brand_preference":
      setAnswer("brandPreference", value as WizardAnswers["brandPreference"]);
      break;
    case "performance_priority":
      setAnswer("performancePriority", value as WizardAnswers["performancePriority"]);
      break;
    case "upgrade_requirement":
      setAnswer("upgradeRequirement", value as WizardAnswers["upgradeRequirement"]);
      break;
    case "upgrade_component":
      setAnswer("upgradeComponent", value as WizardAnswers["upgradeComponent"]);
      break;
    case "accessories":
      setAnswer("accessories", value as string[]);
      break;
    case "contact": {
      const c = value as { name?: string; email?: string; phone?: string };
      setAnswer("contactName", c.name);
      setAnswer("contactEmail", c.email);
      setAnswer("contactPhone", c.phone);
      break;
    }
  }
}

function isStepValid(step: WizardStepId, answers: WizardAnswers): boolean {
  switch (step) {
    case "purpose":
      return !!answers.purpose;
    case "budget":
      return (answers.budgetBdt ?? 0) >= 40000;
    case "brand_preference":
    case "performance_priority":
    case "accessories":
    case "contact":
      return true;
    case "upgrade_requirement":
      return !!answers.upgradeRequirement;
    case "upgrade_component":
      return !!answers.upgradeComponent;
    default:
      return true;
  }
}

export function GuidedWizard({ className }: Props) {
  const [finishing, setFinishing] = useState(false);
  const answers = usePcBuilderWizardStore((s) => s.answers);
  const currentStep = usePcBuilderWizardStore((s) => s.currentStep);
  const loading = usePcBuilderWizardStore((s) => s.loading);
  const recommendation = usePcBuilderWizardStore((s) => s.recommendation);
  const setAnswer = usePcBuilderWizardStore((s) => s.setAnswer);
  const goNext = usePcBuilderWizardStore((s) => s.goNext);
  const goBack = usePcBuilderWizardStore((s) => s.goBack);
  const runRecommendation = usePcBuilderWizardStore((s) => s.runRecommendation);
  const saveSession = usePcBuilderWizardStore((s) => s.saveSession);
  const createCrmLead = usePcBuilderWizardStore((s) => s.createCrmLead);
  const resetWizard = usePcBuilderWizardStore((s) => s.resetWizard);
  const getFlow = usePcBuilderWizardStore((s) => s.getFlow);
  const applyAiBuild = usePcBuilderStore((s) => s.applyAiBuild);
  const setBuildName = usePcBuilderStore((s) => s.setBuildName);

  const flow = getFlow();
  const question = getCurrentQuestion(flow);

  const handleNext = async () => {
    if (!isStepValid(currentStep, answers)) {
      toast.error("Please complete this step");
      return;
    }
    const next = flow.questions.findIndex((q) => q.id === currentStep);
    if (next >= flow.questions.length - 1) {
      setFinishing(true);
      try {
        await runRecommendation();
        const session = saveSession();
        if (answers.contactName || answers.contactEmail) {
          const lead = createCrmLead();
          if (lead) toast.success(`CRM lead ${lead.leadNumber} created`);
        }
        toast.success(`Wizard complete — ${session.sessionCode}`);
      } catch {
        toast.error("Could not generate recommendation");
      } finally {
        setFinishing(false);
      }
    } else {
      goNext();
    }
  };

  const handleConvert = () => {
    if (!recommendation) return;
    applyAiBuild(
      recommendation.selections.map((s) => ({
        stepId: s.stepId as PcBuilderStepId,
        productId: s.productId,
      })),
    );
    setBuildName(`${PURPOSE_LABELS[recommendation.intent.purpose]} Wizard Build`);
    usePcBuilderWizardStore.getState().setMode("manual");
    toast.success("Build applied — customize in Manual Builder");
  };

  if (currentStep === "complete" && recommendation) {
    return (
      <WizardResultPanel
        className={className}
        result={recommendation}
        onConvert={handleConvert}
        onRestart={resetWizard}
      />
    );
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-sky-50/30 p-5 dark:border-indigo-900/50 dark:from-indigo-950/30",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Wand2 className="h-5 w-5 text-indigo-600" />
            Guided PC Wizard
            <Badge variant="secondary" className="text-[9px]">
              <Sparkles className="mr-0.5 h-2.5 w-2.5" />
              No tech knowledge needed
            </Badge>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Step {question?.stepIndex ?? 0} of {question?.totalSteps ?? 0} — we handle compatibility
          </p>
        </div>
        <span className="text-xs font-medium text-indigo-600">{flow.progressPercent}%</span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-950">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${flow.progressPercent}%` }}
        />
      </div>

      {question && (
        <div className="mt-5">
          <h3 className="text-lg font-semibold">{question.title}</h3>
          {question.subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{question.subtitle}</p>
          )}
          <div className="mt-4">
            <WizardQuestionCard
              question={question}
              value={getStepValue(answers, question.id)}
              onChange={(v) => setStepValue(setAnswer, question.id, v)}
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" onClick={goBack} disabled={currentStep === "purpose" || loading}>
          Back
        </Button>
        <Button size="sm" onClick={handleNext} disabled={loading || finishing}>
          {loading || finishing ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : question && question.stepIndex === question.totalSteps ? (
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          ) : (
            <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
          )}
          {question && question.stepIndex === question.totalSteps ? "Get my build" : "Continue"}
        </Button>
      </div>
    </section>
  );
}
