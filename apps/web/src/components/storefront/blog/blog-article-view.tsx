import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Clock, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlogArticleSidebar } from "@/components/storefront/blog/blog-article-sidebar";
import type { StorefrontBlogPost } from "@/lib/mock-data/storefront-blog";

const categoryLabels: Record<string, string> = {
  style: "Style",
  tech: "Tech",
  home: "Home",
  beauty: "Beauty",
  guides: "Guides",
};

type BlogArticleViewProps = {
  post: StorefrontBlogPost;
};

export function BlogArticleView({ post }: BlogArticleViewProps) {
  return (
    <div>
      <Link
        href="/blog"
        className="mb-4 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to blog
      </Link>

      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-[10px] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          <Home className="h-3 w-3" />
        </Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-foreground">
          Blog
        </Link>
        <span>/</span>
        <span className="line-clamp-1 font-medium text-foreground">{post.title}</span>
      </nav>

      <div className="lg:grid lg:grid-cols-[1fr_260px] lg:items-start lg:gap-6 xl:grid-cols-[1fr_280px] xl:gap-8">
        <article className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {categoryLabels[post.category] ?? post.category}
              </Badge>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {post.readMinutes} min read
              </span>
            </div>
            <h1 className="mt-2 text-xl font-bold leading-tight sm:text-2xl">{post.title}</h1>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{post.excerpt}</p>
            <p className="mt-3 text-[11px] text-muted-foreground">
              By <span className="font-medium text-foreground">{post.author}</span> · {post.date}
            </p>
          </header>

          <div className="relative mt-5 aspect-[16/9] overflow-hidden rounded-lg bg-muted">
            <Image
              src={post.image}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-cover"
            />
          </div>

          <div className="prose prose-sm mt-6 max-w-none space-y-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            {(post.body ?? []).map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        </article>

        <BlogArticleSidebar post={post} />
      </div>
    </div>
  );
}
