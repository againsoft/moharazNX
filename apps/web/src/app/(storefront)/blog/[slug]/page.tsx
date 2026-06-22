import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/mock-data/storefront-blog";
import { BlogArticleView } from "@/components/storefront/blog/blog-article-view";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} — MoharazNX Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();
  return <BlogArticleView post={post} />;
}
