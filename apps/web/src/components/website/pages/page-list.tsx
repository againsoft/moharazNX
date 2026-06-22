"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Trash2, Layers, ShoppingBag, Globe, PenTool, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WebsiteNav } from "@/components/website/website-nav";
import {
  websitePagesSeed,
  PAGE_STATUS_LABELS,
  type WebsitePageStatus,
  type WebsitePage,
} from "@/lib/mock-data/website";
import { mockWebsiteLayouts } from "@/lib/mock-data/website-layouts";

// ─── Types ────────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: "all",        label: "All" },
  { key: "website",    label: "Website" },
  { key: "ecommerce",  label: "Ecommerce" },
  { key: "published",  label: "Published" },
  { key: "draft",      label: "Draft" },
  { key: "review",     label: "In Review" },
  { key: "archived",   label: "Archived" },
] as const;

const statusColor: Record<WebsitePageStatus, string> = {
  published: "text-emerald-600 bg-emerald-50 border-emerald-200",
  draft:     "text-amber-600 bg-amber-50 border-amber-200",
  review:    "text-blue-600 bg-blue-50 border-blue-200",
  archived:  "text-muted-foreground bg-muted border-border",
};

const seoColor = (s: number) =>
  s >= 80 ? "text-emerald-600" : s >= 50 ? "text-amber-600" : "text-red-500";

const layoutMap = Object.fromEntries(mockWebsiteLayouts.map((l) => [l.id, l.name]));

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ─── New Page Dialog ──────────────────────────────────────────────────────────

function NewPageDialog({ onClose, onAdd }: { onClose: () => void; onAdd: (p: WebsitePage) => void }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug]   = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [type, setType]   = useState<"website" | "ecommerce">("website");
  const [layoutId, setLayoutId] = useState(mockWebsiteLayouts[0].id);

  function handleTitleChange(v: string) {
    setTitle(v);
    if (!slugManual) setSlug(slugify(v));
  }

  function handleSubmit() {
    if (!title.trim()) return;
    const newPage: WebsitePage = {
      id:          `pg-${Date.now()}`,
      title:       title.trim(),
      slug:        slug || slugify(title),
      status:      "draft",
      template:    "Default",
      layoutId,
      author:      "Admin",
      lastUpdated: new Date().toISOString().slice(0, 10),
      views:       0,
      seoScore:    0,
      type,
    };
    onAdd(newPage);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl border border-input bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">New Page</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Page title */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Page Title <span className="text-red-500">*</span></label>
            <input
              autoFocus
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="e.g. About Us"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">URL Slug</label>
            <div className="mt-1 flex items-center gap-0 rounded-md border border-input focus-within:ring-2 focus-within:ring-primary/40 overflow-hidden">
              <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-r border-input shrink-0">/</span>
              <input
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManual(true); }}
                className="flex-1 px-3 py-2 text-sm bg-background focus:outline-none"
                placeholder="about-us"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Page Type</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(["website", "ecommerce"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-all ${
                    type === t ? "border-primary bg-primary/5 text-primary" : "border-input text-muted-foreground hover:border-foreground/30"
                  }`}
                >
                  {t === "website" ? <Globe className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                  {t === "website" ? "Website" : "Ecommerce"}
                </button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div>
            <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Layout</label>
            <div className="mt-1 space-y-1.5">
              {mockWebsiteLayouts.filter((l) => l.status === "active").map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLayoutId(l.id)}
                  className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-all ${
                    layoutId === l.id ? "border-primary bg-primary/5" : "border-input hover:border-foreground/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{l.name}</span>
                    {l.isDefault && <span className="text-[10px] text-muted-foreground">(default)</span>}
                  </div>
                  {layoutId === l.id && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={!title.trim()}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Page
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page List ────────────────────────────────────────────────────────────────

export function WebsitePageList() {
  const [pages, setPages]       = useState<WebsitePage[]>(websitePagesSeed);
  const [search, setSearch]     = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = pages.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "all")       return matchSearch;
    if (activeTab === "website")   return matchSearch && p.type === "website";
    if (activeTab === "ecommerce") return matchSearch && p.type === "ecommerce";
    return matchSearch && p.status === activeTab;
  });

  function handleAdd(page: WebsitePage) {
    setPages((prev) => [page, ...prev]);
  }

  function handleDelete(id: string) {
    setPages((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Website</p>
          <h1 className="text-2xl font-semibold tracking-tight">Pages</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Manage website &amp; ecommerce pages</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New Page
        </Button>
      </div>

      <WebsiteNav />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                activeTab === tab.key ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-input bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-input bg-muted/40">
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Page</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden md:table-cell">Type</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden lg:table-cell">Layout</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden lg:table-cell">Author</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground hidden xl:table-cell">SEO</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-right text-[11px] font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-input">
            {filtered.map((page) => (
              <tr key={page.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-sm">{page.title}</p>
                  <p className="text-[11px] text-muted-foreground">/{page.slug}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                    page.type === "ecommerce"
                      ? "text-purple-600 bg-purple-50 border-purple-200"
                      : "text-sky-600 bg-sky-50 border-sky-200"
                  }`}>
                    {page.type === "ecommerce" ? <ShoppingBag className="h-2.5 w-2.5" /> : <Globe className="h-2.5 w-2.5" />}
                    {page.type === "ecommerce" ? "Ecommerce" : "Website"}
                  </span>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <Link href="/website/layouts" className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                    <Layers className="h-3 w-3" />
                    {layoutMap[page.layoutId] ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[12px] text-muted-foreground hidden lg:table-cell">{page.author}</td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  <span className={`text-[12px] font-semibold ${seoColor(page.seoScore)}`}>{page.seoScore || "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${statusColor[page.status]}`}>
                    {PAGE_STATUS_LABELS[page.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="Preview">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-[11px] gap-1" asChild>
                      <Link href={`/website/builder/${page.id}`}>
                        <PenTool className="h-3 w-3" /> Builder
                      </Link>
                    </Button>
                    <Button
                      size="icon" variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      title="Delete"
                      onClick={() => handleDelete(page.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No pages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground">{filtered.length} page{filtered.length !== 1 ? "s" : ""}</p>

      {showCreate && <NewPageDialog onClose={() => setShowCreate(false)} onAdd={handleAdd} />}
    </div>
  );
}
