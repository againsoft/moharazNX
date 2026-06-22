"use client";

import { BookOpen, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STEPS = [
  {
    step: 1,
    title: "Mode বেছে নিন",
    titleEn: "Choose how to build",
    body: "AI Chat (recommended) — বাংলা/English-এ বলুন কী চান। Wizard — budget + purpose। Manual — নিজে প্রতিটি part।",
    demo: "Try: «১ লাখ টাকায় গেমিং PC বানাও»",
  },
  {
    step: 2,
    title: "Compatible parts দেখুন",
    titleEn: "Only compatible products",
    body: "Admin-এ যে rule আছে (socket, RAM type…) — সেই অনুযায়ী incompatible product লুকিয়ে যায়। Banner-এ সবুজ/হলুদ/লাল status।",
    demo: "Socket mismatch হলে motherboard list filter হয়",
  },
  {
    step: 3,
    title: "Filter + Multi-add",
    titleEn: "Refine your build",
    body: "Quick Filter, Filtering panel, Sort By। RAM, SSD, HDD — একাধিক যোগ করুন (Add button)।",
    demo: "২টি SSD + ১টি HDD এক বিল্ডে",
  },
  {
    step: 4,
    title: "Summary → Cart / Share",
    titleEn: "Finish",
    body: "Summary-এ «GPU — not selected» ক্লিক করলে GPU step। Share link copy। ERP Quote prototype।",
    demo: "?selections=pcb_cpu_i5,pcb_gpu_4060,...",
  },
];

type Props = { className?: string };

export function BuilderHowItWorks({ className }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className={cn("rounded-xl border border-indigo-200/80 bg-indigo-50/40 dark:border-indigo-900/40 dark:bg-indigo-950/20", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-semibold">কীভাবে কাজ করে — How it works</span>
          <Badge variant="secondary" className="text-[9px]">Design demo</Badge>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="grid gap-3 border-t border-indigo-200/60 px-4 py-3 sm:grid-cols-2 lg:grid-cols-4 dark:border-indigo-900/40">
          {STEPS.map((s) => (
            <div key={s.step} className="rounded-lg border border-background/80 bg-background/70 p-3 shadow-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {s.step}
              </div>
              <p className="mt-2 text-xs font-semibold">{s.title}</p>
              <p className="text-[10px] text-muted-foreground">{s.titleEn}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-foreground/85">{s.body}</p>
              <p className="mt-2 rounded bg-muted/50 px-2 py-1 text-[10px] text-indigo-700 dark:text-indigo-300">
                <Sparkles className="mr-0.5 inline h-2.5 w-2.5" />
                {s.demo}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
