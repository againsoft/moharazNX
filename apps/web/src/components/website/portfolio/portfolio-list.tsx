"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteNav } from "@/components/website/website-nav";
import { portfolioSeed } from "@/lib/mock-data/website";

const statusColor = {
  published: "text-emerald-600 bg-emerald-50 border-emerald-200",
  draft: "text-amber-600 bg-amber-50 border-amber-200",
};

export function PortfolioList() {
  const [items] = useState(portfolioSeed);

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Website</p>
          <h1 className="text-2xl font-semibold tracking-tight">Portfolio</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Showcase your work and case studies</p>
        </div>
        <Button size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New Item
        </Button>
      </div>

      <WebsiteNav compact />

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-input bg-card shadow-sm overflow-hidden">
            <div className="flex h-36 items-center justify-center bg-muted">
              <ImageOff className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.client} · {item.category}</p>
                </div>
                <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${statusColor[item.status]}`}>
                  {item.status === "published" ? "Live" : "Draft"}
                </span>
              </div>
              <div className="mt-3 flex justify-end gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
