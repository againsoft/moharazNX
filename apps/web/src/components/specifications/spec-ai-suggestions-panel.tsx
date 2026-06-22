"use client";

import { Check, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpecificationsNav } from "@/components/specifications/specifications-nav";

const SUGGESTIONS = [
  {
    id: "s1",
    type: "missing_field",
    product: "Lenovo ThinkPad X1 Carbon",
    message: 'Missing required field "CPU Model" in Processor group',
    action: "Fill with AI",
  },
  {
    id: "s2",
    type: "filter",
    profile: "Laptop",
    message: 'Enable "Filterable" on RAM — high facet value for category Laptops',
    action: "Enable filter",
  },
  {
    id: "s3",
    type: "normalize",
    product: "Dell XPS 15",
    message: 'Normalize "16 gig" → "16 GB" for RAM field',
    action: "Apply normalization",
  },
  {
    id: "s4",
    type: "duplicate",
    product: "HP Pavilion 15",
    message: 'Duplicate spec: "512GB SSD" and "512 GB Solid State" — merge?',
    action: "Merge values",
  },
  {
    id: "s5",
    type: "new_field",
    profile: "Laptop",
    message: 'Suggest new field "Battery Wh" under Power group (12 products missing)',
    action: "Add to profile",
  },
];

export function SpecAiSuggestionsPanel() {
  return (
    <div className="space-y-4">
      <SpecificationsNav />

      <div className="rounded-lg border border-input bg-card p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">AI suggestion queue</p>
          <Badge variant="outline">{SUGGESTIONS.length} pending</Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Missing fields, filter recommendations, value normalization, duplicates
        </p>
      </div>

      <div className="space-y-2">
        {SUGGESTIONS.map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-input bg-card px-4 py-3"
          >
            <Badge variant="muted" className="shrink-0 text-[10px] capitalize">
              {s.type.replace("_", " ")}
            </Badge>
            <p className="min-w-0 flex-1 text-sm">
              {s.message}
              {"product" in s && s.product && (
                <span className="ml-1 text-xs text-muted-foreground">· {s.product}</span>
              )}
              {"profile" in s && s.profile && (
                <span className="ml-1 text-xs text-muted-foreground">· {s.profile}</span>
              )}
            </p>
            <div className="flex shrink-0 gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => toast.info(`Dismissed: ${s.id}`)}
              >
                <X className="mr-1 h-3.5 w-3.5" /> Dismiss
              </Button>
              <Button
                size="sm"
                className="h-8"
                onClick={() => toast.success(`${s.action} applied (mock)`)}
              >
                <Check className="mr-1 h-3.5 w-3.5" /> {s.action}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
