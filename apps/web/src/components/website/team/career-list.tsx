"use client";

import Link from "next/link";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteNav } from "@/components/website/website-nav";
import { careersSeed, JOB_TYPE_LABELS } from "@/lib/mock-data/website";

const statusColor = {
  published: "text-emerald-600 bg-emerald-50 border-emerald-200",
  draft: "text-amber-600 bg-amber-50 border-amber-200",
  closed: "text-muted-foreground bg-muted border-border",
};

export function CareerList() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Website</p>
          <h1 className="text-2xl font-semibold tracking-tight">Careers</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Post and manage job listings</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/website/team">Team</Link>
          </Button>
          <Button size="sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Post Job
          </Button>
        </div>
      </div>

      <WebsiteNav compact />

      <div className="rounded-lg border border-input bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-input bg-muted/40">
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Job Title</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden md:table-cell">Department</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden lg:table-cell">Type</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden lg:table-cell">Expires</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden xl:table-cell">Applications</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-input">
            {careersSeed.map((job) => (
              <tr key={job.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium">{job.jobTitle}</p>
                  <p className="text-[11px] text-muted-foreground">{job.location}</p>
                </td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground hidden md:table-cell">{job.department}</td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground hidden lg:table-cell">{JOB_TYPE_LABELS[job.jobType]}</td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground hidden lg:table-cell">{job.expiresAt}</td>
                <td className="px-4 py-3 text-[12px] tabular-nums hidden xl:table-cell">{job.applications}</td>
                <td className="px-4 py-3">
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${statusColor[job.status]}`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7"><Edit2 className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground"><Trash2 className="h-3.5 w-3.5" /></Button>
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
