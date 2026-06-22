"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Star, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ProductReview } from "@/lib/mock-data/storefront-product";

type WriteReviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  onSubmitted?: (review: ProductReview) => void;
};

type FormState = {
  name: string;
  email: string;
  title: string;
  body: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  title: "",
  body: "",
};

export function WriteReviewDialog({
  open,
  onOpenChange,
  productName,
  onSubmitted,
}: WriteReviewDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | "rating", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) {
      setRating(0);
      setHoverRating(0);
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
    const next: Partial<Record<keyof FormState | "rating", string>> = {};
    if (rating < 1) next.rating = "Please select a rating";
    if (!form.name.trim()) next.name = "Required";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Valid email required";
    }
    if (!form.title.trim()) next.title = "Required";
    if (!form.body.trim()) next.body = "Please share your experience";
    else if (form.body.trim().length < 20) next.body = "At least 20 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));

    const review: ProductReview = {
      id: `pr-new-${Date.now()}`,
      author: form.name.trim(),
      rating,
      title: form.title.trim(),
      body: form.body.trim(),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      verified: false,
    };

    onSubmitted?.(review);
    setSubmitting(false);
    setSubmitted(true);
    toast.success("Thanks! Your review was submitted.");
  };

  const displayRating = hoverRating || rating;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[min(480px,95vw)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-input bg-background p-5 shadow-xl">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-base font-semibold">Write a review</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground line-clamp-2">
                Share your experience with {productName}
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
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
              </div>
              <p className="mt-4 text-sm font-semibold">Review submitted</p>
              <p className="mt-1 text-xs text-muted-foreground">
                It may take a short while before your review appears publicly.
              </p>
              <Button type="button" size="sm" className="mt-5" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label className="text-xs">Overall rating</Label>
                <div className="mt-1.5 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const value = i + 1;
                    const filled = value <= displayRating;
                    return (
                      <button
                        key={value}
                        type="button"
                        className="rounded p-0.5 transition hover:scale-110"
                        onClick={() => {
                          setRating(value);
                          setErrors((e) => ({ ...e, rating: undefined }));
                        }}
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`Rate ${value} out of 5 stars`}
                      >
                        <Star
                          className={cn(
                            "h-7 w-7",
                            filled ? "fill-amber-400 text-amber-400" : "text-muted",
                          )}
                        />
                      </button>
                    );
                  })}
                  {displayRating > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {displayRating} out of 5
                    </span>
                  )}
                </div>
                {errors.rating && <p className="mt-1 text-[11px] text-destructive">{errors.rating}</p>}
              </div>

              <Field label="Your name" required error={errors.name}>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="How should we display your name?"
                  autoComplete="name"
                />
              </Field>

              <Field label="Email" hint="Optional — for order verification only" error={errors.email}>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </Field>

              <Field label="Review title" required error={errors.title}>
                <Input
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Sum up your experience in one line"
                />
              </Field>

              <Field label="Your review" required error={errors.body}>
                <Textarea
                  value={form.body}
                  onChange={(e) => update("body", e.target.value)}
                  rows={4}
                  placeholder="What did you like or dislike? How is the quality, fit, or performance?"
                />
              </Field>

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit review"}
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
