import { Sparkles } from "lucide-react";
import { ProductRail } from "@/components/storefront/home/product-rail";
import { SectionHeader } from "@/components/storefront/home/section-header";
import type { StorefrontProduct } from "@/lib/mock-data/storefront-home";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";

type AiRecommendationsProps = {
  products: StorefrontProduct[];
};

export function AiRecommendations({ products }: AiRecommendationsProps) {
  return (
    <section id="ai-picks" className="rounded-xl border border-violet-200/60 bg-gradient-to-br from-violet-50/80 to-indigo-50/50 p-4 dark:border-violet-900/40 dark:from-violet-950/30 dark:to-indigo-950/20 sm:p-5">
      <SectionHeader
        title="Picked for you"
        subtitle="AI-powered recommendations based on trending items and your browsing"
        href={storefrontPaths.recommendations}
      />
      <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-violet-600/10 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
        <Sparkles className="h-3.5 w-3.5" />
        Powered by MoharazNX AI
      </div>
      <ProductRail products={products} columns={6} />
    </section>
  );
}
