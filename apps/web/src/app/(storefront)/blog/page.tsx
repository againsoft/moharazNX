import { Suspense } from "react";
import { BlogListView } from "@/components/storefront/blog/blog-list-view";

export const metadata = {
  title: "Blog — MoharazNX",
  description: "Tips, trends, and inspiration from MoharazNX.",
};

export default function BlogIndexPage() {
  return (
    <Suspense fallback={null}>
      <BlogListView />
    </Suspense>
  );
}
