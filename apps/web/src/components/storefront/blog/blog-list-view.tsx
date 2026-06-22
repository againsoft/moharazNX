"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Home } from "lucide-react";
import { BlogCard } from "@/components/storefront/blog/blog-card";
import { NewsletterSection } from "@/components/storefront/home/newsletter-section";
import {
  BLOG_CATEGORIES,
  filterBlogPosts,
  getFeaturedPost,
  type BlogCategory,
} from "@/lib/mock-data/storefront-blog";
import { cn } from "@/lib/utils";

export function BlogListView() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("category");
  const validInitial =
    initial && BLOG_CATEGORIES.some((c) => c.value === initial)
      ? (initial as BlogCategory | "all")
      : "all";

  const [category, setCategory] = useState<BlogCategory | "all">(validInitial);

  useEffect(() => {
    if (validInitial !== "all") setCategory(validInitial);
  }, [validInitial]);
  const featured = getFeaturedPost();
  const posts = useMemo(() => {
    const filtered = filterBlogPosts(category);
    return category === "all" ? filtered.filter((p) => !p.featured || p.slug !== featured.slug) : filtered;
  }, [category, featured.slug]);

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
          <Home className="h-3 w-3" />
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Blog</span>
      </nav>

      <header>
        <h1 className="text-xl font-bold sm:text-2xl">MoharazNX Journal</h1>
        <p className="mt-1 max-w-xl text-xs text-muted-foreground sm:text-sm">
          Style tips, tech guides, and shopping inspiration — curated for you.
        </p>
      </header>

      {category === "all" && featured && (
        <section>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Featured</p>
          <BlogCard post={featured} featured />
        </section>
      )}

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {BLOG_CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setCategory(cat.value)}
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              category === cat.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/60 bg-card hover:border-primary/40",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {posts.length === 0 && (
        <p className="py-8 text-center text-xs text-muted-foreground">No posts in this category yet.</p>
      )}

      <NewsletterSection />
    </div>
  );
}
