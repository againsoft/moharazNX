import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StorefrontBlogPost } from "@/lib/mock-data/storefront-blog";
import { blogPostPath } from "@/lib/url-slug/storefront-paths";

type BlogSectionProps = {
  posts: StorefrontBlogPost[];
};

const categoryLabels: Record<string, string> = {
  style: "Style",
  tech: "Tech",
  home: "Home",
  beauty: "Beauty",
  guides: "Guides",
};

export function BlogSection({ posts }: BlogSectionProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={blogPostPath(post.slug)}
          className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card transition hover:shadow-sm"
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            <Image
              src={post.image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col p-3">
            <div className="flex items-center gap-2">
              <Badge variant="muted" className="text-[10px]">
                {categoryLabels[post.category] ?? post.category}
              </Badge>
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {post.readMinutes}m
              </span>
            </div>
            <h3 className="mt-1 text-xs font-semibold leading-snug group-hover:text-primary sm:text-sm">{post.title}</h3>
            <p className="mt-0.5 flex-1 text-[11px] text-muted-foreground line-clamp-2">{post.excerpt}</p>
            <span className="mt-2 inline-flex items-center gap-0.5 text-[11px] font-medium text-primary">
              Read more
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
