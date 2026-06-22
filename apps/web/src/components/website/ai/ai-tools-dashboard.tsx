"use client";

import { Pen, BookOpen, Image, Search, Languages, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteNav } from "@/components/website/website-nav";

const AI_TOOLS = [
  { icon: Pen, label: "Page Writer", description: "Generate page section copy from a prompt", credits: 2, unit: "per run", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { icon: BookOpen, label: "Blog Writer", description: "Draft a full blog post from title and outline", credits: 5, unit: "per post", color: "text-purple-600 bg-purple-50 border-purple-200" },
  { icon: Image, label: "Image Generator", description: "Create AI-generated images for your pages", credits: 5, unit: "per image", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { icon: Search, label: "SEO Generator", description: "Bulk generate meta tags for all pages", credits: 1, unit: "per page", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { icon: Languages, label: "Translator", description: "Translate a page into another language", credits: 10, unit: "per page", color: "text-orange-600 bg-orange-50 border-orange-200" },
];

const USAGE_HISTORY = [
  { tool: "Blog Writer", action: "Drafted: Inventory Management Best Practices", credits: 5, time: "2h ago" },
  { tool: "SEO Generator", action: "Generated meta for 12 pages", credits: 12, time: "Yesterday" },
  { tool: "Page Writer", action: "Generated: Hero section copy", credits: 2, time: "Yesterday" },
  { tool: "Translator", action: "Translated: About Us (Bengali)", credits: 10, time: "3 days ago" },
];

export function AiToolsDashboard() {
  const creditsUsed = 29;
  const creditsTotal = 200;
  const creditsLeft = creditsTotal - creditsUsed;

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Website</p>
          <h1 className="text-2xl font-semibold tracking-tight">AI Tools</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">AI-powered content generation for your website</p>
        </div>
      </div>

      <WebsiteNav compact />

      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        {/* Tool Cards */}
        <div className="space-y-3">
          <p className="text-sm font-semibold">Available Tools</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {AI_TOOLS.map((tool) => (
              <div key={tool.label} className="rounded-lg border border-input bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg border p-2 ${tool.color}`}>
                    <tool.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{tool.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{tool.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">{tool.credits}</span> credit{tool.credits > 1 ? "s" : ""} {tool.unit}
                    </p>
                  </div>
                </div>
                <Button size="sm" className="mt-3 w-full" variant="outline">
                  <Zap className="mr-1.5 h-3.5 w-3.5" /> Use Tool
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Credits Sidebar */}
        <div className="space-y-3">
          <p className="text-sm font-semibold">Credit Usage</p>
          <div className="rounded-lg border border-input bg-card p-4 shadow-sm space-y-3">
            <div>
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">Used this month</span>
                <span className="font-semibold">{creditsUsed} / {creditsTotal}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(creditsUsed / creditsTotal) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{creditsLeft} credits remaining</p>
            </div>
            <Button size="sm" className="w-full" variant="outline">Upgrade Plan</Button>
          </div>

          <div className="rounded-lg border border-input bg-card shadow-sm overflow-hidden">
            <div className="border-b border-input px-3 py-2.5">
              <p className="text-[12px] font-semibold">Recent Activity</p>
            </div>
            <div className="divide-y divide-input">
              {USAGE_HISTORY.map((h, i) => (
                <div key={i} className="px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium">{h.tool}</p>
                    <span className="text-[10px] text-muted-foreground">−{h.credits} cr</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{h.action}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{h.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
