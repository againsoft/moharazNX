"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, LayoutTemplate, Monitor, PanelLeft, PanelRight, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteNav } from "@/components/website/website-nav";
import {
  mockWebsiteLayouts,
  HEADER_STYLE_LABELS,
  FOOTER_STYLE_LABELS,
  SIDEBAR_LABELS,
  type WebsiteLayout,
} from "@/lib/mock-data/website-layouts";

const statusColor = {
  active: "text-emerald-600 bg-emerald-50 border-emerald-200",
  draft: "text-amber-600 bg-amber-50 border-amber-200",
};

function LayoutPreviewCard({ layout, onEdit }: { layout: WebsiteLayout; onEdit: () => void }) {
  return (
    <div className={`relative rounded-lg border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md ${
      layout.isDefault ? "border-primary/50 ring-1 ring-primary/20" : "border-input"
    }`}>
      {layout.isDefault && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
          <CheckCircle2 className="h-2.5 w-2.5" /> Default
        </div>
      )}

      {/* Visual preview */}
      <div className="h-36 bg-muted/40 p-3 flex flex-col gap-1.5 border-b border-input">
        {/* Header preview */}
        <div className="rounded bg-foreground/10 h-6 flex items-center px-2 gap-1.5">
          <div className="h-2 w-2 rounded-full bg-foreground/20" />
          {layout.headerStyle === "mega" && (
            <div className="flex gap-1 ml-1">
              {[1,2,3,4].map(i => <div key={i} className="h-1.5 w-6 rounded bg-foreground/15" />)}
            </div>
          )}
          {layout.headerStyle === "standard" && (
            <div className="flex gap-1 ml-1">
              {[1,2,3].map(i => <div key={i} className="h-1.5 w-5 rounded bg-foreground/15" />)}
            </div>
          )}
          {layout.headerStyle === "centered" && (
            <div className="flex-1 flex justify-center">
              <div className="h-1.5 w-10 rounded bg-foreground/20" />
            </div>
          )}
          <div className="ml-auto h-1.5 w-8 rounded bg-foreground/20" />
        </div>

        {/* Body */}
        <div className="flex flex-1 gap-1.5">
          {layout.sidebarPosition === "left" && (
            <div className="w-8 rounded bg-foreground/8 border border-foreground/10 flex flex-col gap-1 p-1">
              {[1,2,3].map(i => <div key={i} className="h-1 w-full rounded bg-foreground/15" />)}
            </div>
          )}
          <div className="flex-1 rounded bg-foreground/5 border border-foreground/10 flex flex-col gap-1 p-1">
            <div className="h-3 w-3/4 rounded bg-foreground/15" />
            <div className="h-1.5 w-full rounded bg-foreground/10" />
            <div className="h-1.5 w-5/6 rounded bg-foreground/10" />
          </div>
          {layout.sidebarPosition === "right" && (
            <div className="w-8 rounded bg-foreground/8 border border-foreground/10 flex flex-col gap-1 p-1">
              {[1,2,3].map(i => <div key={i} className="h-1 w-full rounded bg-foreground/15" />)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`rounded h-5 flex items-center px-2 gap-1 ${
          layout.footerStyle === "dark" ? "bg-foreground/30" : "bg-foreground/10"
        }`}>
          {layout.footerStyle !== "minimal" && (
            <>
              {[1,2,3].map(i => <div key={i} className="h-1 w-6 rounded bg-foreground/20 mr-2" />)}
            </>
          )}
          {layout.footerStyle === "minimal" && <div className="h-1 w-12 rounded bg-foreground/20 mx-auto" />}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium text-sm">{layout.name}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{layout.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1">
          <div className="rounded bg-muted/50 px-1.5 py-1 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Header</p>
            <p className="text-[10px] font-medium mt-0.5">{HEADER_STYLE_LABELS[layout.headerStyle]}</p>
          </div>
          <div className="rounded bg-muted/50 px-1.5 py-1 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Footer</p>
            <p className="text-[10px] font-medium mt-0.5">{FOOTER_STYLE_LABELS[layout.footerStyle]}</p>
          </div>
          <div className="rounded bg-muted/50 px-1.5 py-1 text-center">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wide">Sidebar</p>
            <p className="text-[10px] font-medium mt-0.5">
              {layout.sidebarPosition === "none" ? "None" : layout.sidebarPosition === "left" ? "Left" : "Right"}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${statusColor[layout.status]}`}>
              {layout.status === "active" ? "Active" : "Draft"}
            </span>
            <span className="text-[11px] text-muted-foreground">{layout.pagesCount} pages</span>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" onClick={onEdit}>
              <Edit2 className="h-3 w-3 mr-1" /> Edit
            </Button>
            {!layout.isDefault && (
              <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateLayoutModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-input bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-semibold mb-4">New Layout</h2>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Layout Name</label>
            <input className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Blog Sidebar Layout" />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Header Style</label>
            <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="standard">Standard</option>
              <option value="minimal">Minimal</option>
              <option value="mega">Mega Menu</option>
              <option value="centered">Centered</option>
              <option value="sidebar">Sidebar</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Footer Style</label>
            <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="extended">Extended</option>
              <option value="standard">Standard</option>
              <option value="minimal">Minimal</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Sidebar</label>
            <select className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="none">No Sidebar</option>
              <option value="left">Left Sidebar</option>
              <option value="right">Right Sidebar</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Description</label>
            <textarea className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" rows={2} placeholder="Describe when to use this layout..." />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={onClose}>Create Layout</Button>
        </div>
      </div>
    </div>
  );
}

export function LayoutManager() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Website</p>
          <h1 className="text-2xl font-semibold tracking-tight">Layouts</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Define reusable header, footer &amp; sidebar templates for your pages</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New Layout
        </Button>
      </div>

      <WebsiteNav />

      {/* Info banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-[12px] text-blue-700 flex items-start gap-2 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300">
        <LayoutTemplate className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <span>Layouts define the outer structure of a page — header style, footer, and sidebar. Assign a layout to any page from the Pages tab.</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {mockWebsiteLayouts.map((layout) => (
          <LayoutPreviewCard key={layout.id} layout={layout} onEdit={() => {}} />
        ))}
      </div>

      {showCreate && <CreateLayoutModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
