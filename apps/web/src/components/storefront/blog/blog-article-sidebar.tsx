import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FolderOpen, Newspaper, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlogCardCompact } from "@/components/storefront/blog/blog-card";
import {
  BLOG_CATEGORIES,
  getPostsInCategory,
  getRelatedPosts,
  getRelatedProductsForPost,
  type StorefrontBlogPost,
} from "@/lib/mock-data/storefront-blog";
import { formatCurrency } from "@/lib/utils";
import { blogPostPath, categoryPath, productPath, storefrontPaths } from "@/lib/url-slug/storefront-paths";

const categoryLabels: Record<string, string> = {
  style: "Style",
  tech: "Tech",
  home: "Home",
  beauty: "Beauty",
  guides: "Guides",
};

type BlogArticleSidebarProps = {
  post: StorefrontBlogPost;
};

function SidebarBlock({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border/60 bg-card p-3">
      <h2 className="flex items-center gap-1.5 text-xs font-semibold">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {title}
      </h2>
      <div className="mt-2.5">{children}</div>
    </section>
  );
}

export function BlogArticleSidebar({ post }: BlogArticleSidebarProps) {
  const categoryLabel = categoryLabels[post.category] ?? post.category;
  const categoryPosts = getPostsInCategory(post.category, post.slug);
  const relatedPosts = getRelatedPosts(post.slug, 4);
  const relatedProducts = getRelatedProductsForPost(post.slug, 4);

  return (
    <aside className="space-y-3 lg:sticky lg:top-16 lg:self-start">
      {/* Category */}
      <SidebarBlock title="Category" icon={FolderOpen}>
        <Badge variant="secondary" className="text-[10px]">
          {categoryLabel}
        </Badge>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          {post.category === "beauty" && "Skincare, wellness, and self-care picks."}
          {post.category === "style" && "Fashion trends and wardrobe essentials."}
          {post.category === "tech" && "Gadgets, smart home, and buying guides."}
          {post.category === "home" && "Living space tips and home products."}
          {post.category === "guides" && "Curated shopping guides and gift ideas."}
        </p>
        <Link
          href={`${storefrontPaths.blog}?category=${post.category}`}
          className="mt-2 inline-flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline"
        >
          More in {categoryLabel}
          <ArrowRight className="h-3 w-3" />
        </Link>
        {categoryPosts.length > 0 && (
          <ul className="mt-2.5 space-y-1 border-t border-border/60 pt-2.5">
            {categoryPosts.map((p) => (
              <li key={p.id}>
                <Link
                  href={blogPostPath(p.slug)}
                  className="line-clamp-2 text-[11px] text-muted-foreground hover:text-primary"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SidebarBlock>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <SidebarBlock title="Related posts" icon={Newspaper}>
          <div className="space-y-2">
            {relatedPosts.map((p) => (
              <BlogCardCompact key={p.id} post={p} />
            ))}
          </div>
        </SidebarBlock>
      )}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <SidebarBlock title="Related products" icon={ShoppingBag}>
          <ul className="space-y-2">
            {relatedProducts.map((product) => (
              <li key={product.id}>
                <Link
                  href={productPath(product.slug)}
                  className="group flex gap-2.5 rounded-md p-1.5 transition hover:bg-accent/50"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image src={product.image} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[11px] font-medium leading-snug group-hover:text-primary">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold">{formatCurrency(product.price)}</p>
                    {product.compareAtPrice && (
                      <p className="text-[10px] text-muted-foreground line-through">
                        {formatCurrency(product.compareAtPrice)}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={categoryPath(post.category === "style" ? "apparel" : post.category === "guides" ? "home" : post.category)}
            className="mt-2 flex items-center justify-center gap-0.5 rounded-md border border-border/60 py-1.5 text-[11px] font-medium text-primary hover:bg-accent/50"
          >
            Shop {categoryLabel}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </SidebarBlock>
      )}
    </aside>
  );
}

export { BLOG_CATEGORIES, categoryLabels };
