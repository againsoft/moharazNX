"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  FileText,
  MessageSquare,
  Eye,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WebsiteNav } from "@/components/website/website-nav";
import {
  websiteDashboardKpis,
  websitePagesSeed,
  blogPostsSeed,
  PAGE_STATUS_LABELS,
  BLOG_STATUS_LABELS,
} from "@/lib/mock-data/website";

const statusColor: Record<string, string> = {
  published: "text-emerald-600 bg-emerald-50 border-emerald-200",
  draft: "text-amber-600 bg-amber-50 border-amber-200",
  archived: "text-muted-foreground bg-muted",
  review: "text-blue-600 bg-blue-50 border-blue-200",
  scheduled: "text-purple-600 bg-purple-50 border-purple-200",
};

export function WebsiteDashboard() {
  const kpis = [
    { label: websiteDashboardKpis.publishedPages.label, value: websiteDashboardKpis.publishedPages.value, change: websiteDashboardKpis.publishedPages.change, up: websiteDashboardKpis.publishedPages.up, icon: FileText },
    { label: websiteDashboardKpis.blogPosts.label, value: websiteDashboardKpis.blogPosts.value, change: websiteDashboardKpis.blogPosts.change, up: websiteDashboardKpis.blogPosts.up, icon: MessageSquare },
    { label: websiteDashboardKpis.totalViews.label, value: websiteDashboardKpis.totalViews.value, change: websiteDashboardKpis.totalViews.change, up: websiteDashboardKpis.totalViews.up, icon: Eye },
    { label: websiteDashboardKpis.formSubmissions.label, value: websiteDashboardKpis.formSubmissions.value, change: websiteDashboardKpis.formSubmissions.change, up: websiteDashboardKpis.formSubmissions.up, icon: Globe },
  ];

  const recentPages = websitePagesSeed.slice(0, 5);
  const recentPosts = blogPostsSeed.slice(0, 5);

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Website</p>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Overview of your website content and performance</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/website/blog/posts?create=1">+ New Post</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/website/pages?create=1">+ New Page</Link>
          </Button>
        </div>
      </div>

      {/* Nav */}
      <WebsiteNav compact />

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-lg border border-input bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] text-muted-foreground">{k.label}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{k.value}</p>
              </div>
              <div className="rounded-md bg-muted/60 p-2">
                <k.icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <p className={`mt-2 flex items-center gap-0.5 text-xs ${k.up ? "text-emerald-600" : "text-amber-600"}`}>
              {k.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {k.change}
            </p>
          </div>
        ))}
      </div>

      {/* Tables Row */}
      <div className="grid gap-4 xl:grid-cols-2">
        {/* Recent Pages */}
        <div className="rounded-lg border border-input bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-input px-4 py-3">
            <p className="text-sm font-semibold">Recent Pages</p>
            <Link href="/website/pages" className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-input">
            {recentPages.map((page) => (
              <div key={page.id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium">{page.title}</p>
                  <p className="text-[11px] text-muted-foreground">/{page.slug} · {page.views.toLocaleString()} views</p>
                </div>
                <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${statusColor[page.status]}`}>
                  {PAGE_STATUS_LABELS[page.status]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Blog Posts */}
        <div className="rounded-lg border border-input bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-input px-4 py-3">
            <p className="text-sm font-semibold">Recent Blog Posts</p>
            <Link href="/website/blog/posts" className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-input">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium line-clamp-1">{post.title}</p>
                  <p className="text-[11px] text-muted-foreground">{post.category} · {post.author}</p>
                </div>
                <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${statusColor[post.status]}`}>
                  {BLOG_STATUS_LABELS[post.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-input bg-card p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold">Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "New Page", href: "/website/pages?create=1" },
            { label: "New Blog Post", href: "/website/blog/posts?create=1" },
            { label: "View Forms", href: "/website/forms" },
            { label: "SEO Overview", href: "/website/seo/meta" },
            { label: "Manage Domains", href: "/website/domain" },
            { label: "AI Tools", href: "/website/ai" },
          ].map((a) => (
            <Button key={a.label} size="sm" variant="outline" asChild>
              <Link href={a.href}>{a.label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
