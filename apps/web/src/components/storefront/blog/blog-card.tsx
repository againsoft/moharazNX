import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StorefrontBlogPost } from "@/lib/mock-data/storefront-blog";
import { blogPostPath } from "@/lib/url-slug/storefront-paths";
import { cn } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  style: "Style",
  tech: "Tech",
  home: "Home",
  beauty: "Beauty",
  guides: "Guides",
};

type BlogCardProps = {
  post: StorefrontBlogPost;
  featured?: boolean;
  className?: string;
};

export function BlogCard({ post, featured, className }: BlogCardProps) {
  return (
    <Link
      href={blogPostPath(post.slug)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card transition hover:shadow-sm",
        featured && "sm:flex-row sm:items-stretch",
        className,
      )}
    >
      <div className={cn("relative bg-muted", featured ? "aspect-[16/10] sm:aspect-auto sm:w-2/5 sm:min-h-[180px]" : "aspect-[16/10]")}>
        <Image
          src={post.image}
          alt=""
          fill
          sizes={featured ? "(max-width: 640px) 100vw, 40vw" : "(max-width: 640px) 100vw, 33vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className={cn("flex flex-1 flex-col p-3", featured && "sm:justify-center sm:p-4")}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-[10px]">
            {categoryLabels[post.category] ?? post.category}
          </Badge>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {post.readMinutes} min
          </span>
        </div>
        <h3 className={cn("mt-1.5 font-semibold leading-snug group-hover:text-primary", featured ? "text-sm sm:text-base" : "text-xs sm:text-sm")}>
          {post.title}
        </h3>
        <p className="mt-1 flex-1 text-[11px] text-muted-foreground line-clamp-2 sm:text-xs">{post.excerpt}</p>
        <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
          <span>{post.author}</span>
          <time>{post.date}</time>
        </div>
        <span className="mt-2 inline-flex items-center gap-0.5 text-[11px] font-medium text-primary">
          Read more
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function BlogCardCompact({ post }: { post: StorefrontBlogPost }) {
  return (
    <Link
      href={blogPostPath(post.slug)}
      className="group flex gap-3 rounded-lg border border-border/60 bg-card p-2.5 transition hover:bg-accent/30"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image src={post.image} alt="" fill sizes="56px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-xs font-medium leading-snug group-hover:text-primary">{post.title}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{post.date}</p>
      </div>
    </Link>
  );
}
