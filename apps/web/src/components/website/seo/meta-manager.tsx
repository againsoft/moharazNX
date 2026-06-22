"use client";

import { Sparkles, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteNav } from "@/components/website/website-nav";
import { websitePagesSeed } from "@/lib/mock-data/website";

const seoScoreBadge = (score: number) => {
  if (score >= 80) return { label: "Good", cls: "text-emerald-600 bg-emerald-50 border-emerald-200" };
  if (score >= 50) return { label: "Fair", cls: "text-amber-600 bg-amber-50 border-amber-200" };
  return { label: "Poor", cls: "text-red-600 bg-red-50 border-red-200" };
};

export function MetaManager() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Website · SEO</p>
          <h1 className="text-2xl font-semibold tracking-tight">Meta Manager</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage SEO meta tags for all pages in one place</p>
        </div>
        <Button size="sm" variant="outline">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" /> AI Generate All
        </Button>
      </div>

      <WebsiteNav compact />

      <div className="rounded-lg border border-input bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-input bg-muted/40">
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Page</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden md:table-cell">Meta Title</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden lg:table-cell">Meta Description</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">SEO Score</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-input">
            {websitePagesSeed.map((page) => {
              const badge = seoScoreBadge(page.seoScore);
              const hasTitle = page.title.length > 0;
              const hasDesc = page.seoScore > 50;
              return (
                <tr key={page.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{page.title}</p>
                    <p className="text-[11px] text-muted-foreground">/{page.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {hasTitle ? (
                      <p className="text-[12px] text-foreground line-clamp-1">{page.title} | MoharazNX</p>
                    ) : (
                      <p className="text-[11px] text-red-500 italic">Missing</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {hasDesc ? (
                      <p className="text-[12px] text-muted-foreground line-clamp-1">Discover {page.title.toLowerCase()} on MoharazNX platform.</p>
                    ) : (
                      <p className="text-[11px] text-red-500 italic">Missing</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${badge.cls}`}>
                        {badge.label}
                      </span>
                      <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">{page.seoScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="AI Generate">
                        <Sparkles className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
