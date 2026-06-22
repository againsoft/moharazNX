"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AskQuestionDialog } from "@/components/storefront/product/ask-question-dialog";
import type { ProductQuestion } from "@/lib/mock-data/storefront-product";
import { cn } from "@/lib/utils";

type ProductQaSectionProps = {
  productName: string;
  questions: ProductQuestion[];
};

export function ProductQaSection({ productName, questions: initialQuestions }: ProductQaSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [localQuestions, setLocalQuestions] = useState<ProductQuestion[]>([]);

  const questions = useMemo(
    () => [...localQuestions, ...initialQuestions],
    [localQuestions, initialQuestions],
  );

  const [openId, setOpenId] = useState<string | null>(initialQuestions[0]?.id ?? null);

  const onQuestionSubmitted = (question: ProductQuestion) => {
    setLocalQuestions((prev) => [question, ...prev]);
    setOpenId(question.id);
  };

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Questions & answers</h2>
        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          Ask a question
        </Button>
      </div>
      <div className="space-y-2">
        {questions.map((q) => {
          const open = openId === q.id;
          const pending = !q.answer;
          return (
            <div key={q.id} className="rounded-xl border border-border/60">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium"
                onClick={() => setOpenId(open ? null : q.id)}
              >
                <span className="flex flex-wrap items-center gap-2">
                  {q.question}
                  {pending && (
                    <Badge variant="outline" className="text-[10px] font-normal">
                      Awaiting answer
                    </Badge>
                  )}
                </span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 transition", open && "rotate-180")} />
              </button>
              {open && (
                <div className="border-t border-border/60 px-4 py-3 text-sm text-muted-foreground">
                  {pending ? (
                    <p className="italic">
                      Thanks for asking! Our team is reviewing your question and will post an answer
                      soon.
                    </p>
                  ) : (
                    <p>{q.answer}</p>
                  )}
                  <p className="mt-2 text-xs">
                    — {q.author}, {q.date}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AskQuestionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productName={productName}
        onSubmitted={onQuestionSubmitted}
      />
    </section>
  );
}

type ProductShippingWarrantyProps = {
  shipping: { standard: string; express: string; returns: string };
  warranty: string;
};

export function ProductShippingWarranty({ shipping, warranty }: ProductShippingWarrantyProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-border/60 p-4">
        <h3 className="text-sm font-semibold">Shipping</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          <li>{shipping.standard}</li>
          <li>{shipping.express}</li>
          <li>{shipping.returns}</li>
        </ul>
      </div>
      <div className="rounded-xl border border-border/60 p-4">
        <h3 className="text-sm font-semibold">Warranty</h3>
        <p className="mt-2 text-sm text-muted-foreground">{warranty}</p>
      </div>
    </div>
  );
}
