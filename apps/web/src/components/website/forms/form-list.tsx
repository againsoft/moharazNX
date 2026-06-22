"use client";

import { Plus, Eye, Edit2, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteNav } from "@/components/website/website-nav";
import { formsSeed } from "@/lib/mock-data/website";

const typeColor: Record<string, string> = {
  contact: "text-blue-600 bg-blue-50 border-blue-200",
  lead: "text-purple-600 bg-purple-50 border-purple-200",
  newsletter: "text-emerald-600 bg-emerald-50 border-emerald-200",
  survey: "text-amber-600 bg-amber-50 border-amber-200",
  application: "text-orange-600 bg-orange-50 border-orange-200",
};

export function FormList() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Website</p>
          <h1 className="text-2xl font-semibold tracking-tight">Forms</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Create and manage website forms</p>
        </div>
        <Button size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New Form
        </Button>
      </div>

      <WebsiteNav compact />

      <div className="rounded-lg border border-input bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-input bg-muted/40">
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Form Name</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Type</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden md:table-cell">Submissions</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden lg:table-cell">Conversion</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-input">
            {formsSeed.map((form) => (
              <tr key={form.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{form.formName}</td>
                <td className="px-4 py-3">
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize ${typeColor[form.formType]}`}>
                    {form.formType}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12px] tabular-nums hidden md:table-cell">{form.submissions.toLocaleString()}</td>
                <td className="px-4 py-3 text-[12px] hidden lg:table-cell">
                  <span className="text-emerald-600">{form.conversionRate}%</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${form.status === "active" ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-muted-foreground bg-muted border-border"}`}>
                    {form.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="View Submissions">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="Embed Code">
                      <Code2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit">
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
