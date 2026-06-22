"use client";

import { cn } from "@/lib/utils";
import type { WizardQuestion, WizardQuestionOption } from "@/lib/builder/wizard/types";
import { BUDGET_PRESETS } from "@/lib/builder/wizard/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  question: WizardQuestion;
  value: unknown;
  onChange: (value: unknown) => void;
};

function OptionCard({
  option,
  selected,
  onSelect,
}: {
  option: WizardQuestionOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-lg border p-3 text-left transition-all",
        selected
          ? "border-indigo-400 bg-indigo-50/50 ring-1 ring-indigo-400 dark:bg-indigo-950/30"
          : "border-input bg-card hover:border-indigo-200",
      )}
    >
      <p className="text-sm font-medium">{option.label}</p>
      {option.description && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{option.description}</p>
      )}
    </button>
  );
}

export function WizardQuestionCard({ question, value, onChange }: Props) {
  if (question.type === "single_choice") {
    const selected = value as string | undefined;
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {question.options.map((opt) => (
          <OptionCard
            key={opt.value}
            option={opt}
            selected={selected === opt.value}
            onSelect={() => onChange(opt.value)}
          />
        ))}
      </div>
    );
  }

  if (question.type === "multi_choice") {
    const selected = (value as string[]) ?? [];
    const toggle = (v: string) => {
      if (v === "none") {
        onChange(["none"]);
        return;
      }
      const next = selected.filter((x) => x !== "none");
      if (next.includes(v)) onChange(next.filter((x) => x !== v));
      else onChange([...next, v]);
    };
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {question.options.map((opt) => (
          <OptionCard
            key={opt.value}
            option={opt}
            selected={selected.includes(opt.value)}
            onSelect={() => toggle(opt.value)}
          />
        ))}
      </div>
    );
  }

  if (question.type === "budget_slider") {
    const budget = (value as number) ?? 100000;
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {BUDGET_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              className={cn(
                "rounded-lg border px-3 py-2 text-left",
                budget === p.value
                  ? "border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30"
                  : "border-input hover:border-indigo-200",
              )}
            >
              <p className="text-sm font-semibold">{p.label}</p>
              <p className="text-[10px] text-muted-foreground">{p.sub}</p>
            </button>
          ))}
        </div>
        <div>
          <Label className="text-xs">Custom amount (BDT)</Label>
          <Input
            type="number"
            min={question.minValue}
            max={question.maxValue}
            value={budget}
            onChange={(e) => onChange(Number(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
      </div>
    );
  }

  if (question.type === "contact_form") {
    const contact = (value as { name?: string; email?: string; phone?: string }) ?? {};
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label className="text-xs">Name</Label>
          <Input
            value={contact.name ?? ""}
            onChange={(e) => onChange({ ...contact, name: e.target.value })}
            placeholder="Your name"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Email</Label>
          <Input
            type="email"
            value={contact.email ?? ""}
            onChange={(e) => onChange({ ...contact, email: e.target.value })}
            placeholder="you@example.com"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs">Phone</Label>
          <Input
            value={contact.phone ?? ""}
            onChange={(e) => onChange({ ...contact, phone: e.target.value })}
            placeholder="+880…"
            className="mt-1"
          />
        </div>
      </div>
    );
  }

  return null;
}
