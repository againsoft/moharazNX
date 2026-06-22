"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { HelpCircle, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProductQuestion } from "@/lib/mock-data/storefront-product";

type AskQuestionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  onSubmitted?: (question: ProductQuestion) => void;
};

type FormState = {
  name: string;
  email: string;
  question: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  question: "",
};

export function AskQuestionDialog({
  open,
  onOpenChange,
  productName,
  onSubmitted,
}: AskQuestionDialogProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setErrors({});
      setSubmitting(false);
      setSubmitted(false);
    }
  }, [open]);

  const update = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Required";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Valid email required";
    }
    if (!form.question.trim()) next.question = "Please enter your question";
    else if (form.question.trim().length < 10) next.question = "At least 10 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));

    const item: ProductQuestion = {
      id: `q-new-${Date.now()}`,
      question: form.question.trim(),
      answer: "",
      author: form.name.trim(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    onSubmitted?.(item);
    setSubmitting(false);
    setSubmitted(true);
    toast.success("Question submitted — we'll reply soon.");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[min(480px,95vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-input bg-background p-5 shadow-xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-base font-semibold">Ask a question</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground line-clamp-2">
                Get help about {productName} from our team or other shoppers
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="shrink-0 rounded-md p-1 hover:bg-accent"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {submitted ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-4 text-sm font-semibold">Question submitted</p>
              <p className="mt-1 text-xs text-muted-foreground">
                We&apos;ll notify you when an answer is posted.
              </p>
              <Button type="button" size="sm" className="mt-5" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <Field label="Your name" required error={errors.name}>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="How should we display your name?"
                  autoComplete="name"
                />
              </Field>

              <Field label="Email" hint="Optional — to notify you when answered" error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </Field>

              <Field label="Your question" required error={errors.question}>
                <Textarea
                  value={form.question}
                  onChange={(e) => update("question", e.target.value)}
                  rows={4}
                  placeholder="e.g. Does this come with a warranty? What are the dimensions?"
                />
              </Field>

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit question"}
                </Button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs">
        {label}
        {required && <span className="text-destructive"> *</span>}
        {hint && <span className="ml-1 font-normal text-muted-foreground">({hint})</span>}
      </Label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
