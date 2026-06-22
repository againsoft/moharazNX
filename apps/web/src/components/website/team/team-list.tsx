"use client";

import Link from "next/link";
import { Plus, Edit2, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteNav } from "@/components/website/website-nav";
import { teamMembersSeed } from "@/lib/mock-data/website";

export function TeamList() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Website</p>
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage team member profiles shown on your website</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/website/careers">Careers</Link>
          </Button>
          <Button size="sm">
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Member
          </Button>
        </div>
      </div>

      <WebsiteNav compact />

      <div className="rounded-lg border border-input bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-input bg-muted/40">
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden md:table-cell">Role</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden lg:table-cell">Department</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Visible</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-input">
            {teamMembersSeed.map((m) => (
              <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="font-medium">{m.fullName}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground hidden md:table-cell">{m.jobTitle}</td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground hidden lg:table-cell">{m.department}</td>
                <td className="px-4 py-3">
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${m.published ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-muted-foreground bg-muted border-border"}`}>
                    {m.published ? "Visible" : "Hidden"}
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
