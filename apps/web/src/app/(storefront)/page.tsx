import { HeroBanner } from "@/components/storefront/home/hero-banner";
import { SectionHeader } from "@/components/storefront/home/section-header";
import { CategoryGrid } from "@/components/storefront/home/category-grid";
import { ProductRail } from "@/components/storefront/home/product-rail";
import { HomeDealsSection } from "@/components/storefront/home/home-deals-section";
import { BrandsStrip } from "@/components/storefront/home/brands-strip";
import { ReviewsSection } from "@/components/storefront/home/reviews-section";
import { BlogSection } from "@/components/storefront/home/blog-section";
import { NewsletterSection } from "@/components/storefront/home/newsletter-section";
import { AiRecommendations } from "@/components/storefront/home/ai-recommendations";
import { TrustFeatures } from "@/components/storefront/trust-features";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";
import {
  aiPicks,
  bestSellers,
  blogPosts,
  customerReviews,
  featuredCategories,
  featuredProducts,
  heroSlides,
  newArrivals,
  storefrontBrands,
} from "@/lib/mock-data/storefront-home";

export default function StorefrontHomePage() {
  return (
    <div className="space-y-8 sm:space-y-10">
      <HeroBanner slides={heroSlides} />

      <TrustFeatures />

      <section>
        <SectionHeader
          title="Shop by category"
          subtitle="Laptops, phones, components & accessories — from AgainERP catalog"
          href={storefrontPaths.categories}
        />
        <CategoryGrid categories={featuredCategories} />
      </section>

      <HomeDealsSection />

      <section>
        <SectionHeader
          title="Featured products"
          subtitle="Hand-picked from our catalog"
          href={storefrontPaths.products}
        />
        <ProductRail products={featuredProducts} columns={6} />
      </section>

      <section>
        <SectionHeader
          title="Best sellers"
          subtitle="Top-rated by shoppers across Bangladesh"
          href={storefrontPaths.bestsellers}
        />
        <ProductRail products={bestSellers} columns={6} />
      </section>

      <section>
        <SectionHeader
          title="New arrivals"
          subtitle="Latest laptops, phones & PC parts"
          href={storefrontPaths.newArrivals}
        />
        <ProductRail products={newArrivals} columns={6} />
      </section>

      <section>
        <SectionHeader title="Shop by brand" href={storefrontPaths.categories} />
        <BrandsStrip brands={storefrontBrands} />
      </section>

      <AiRecommendations products={aiPicks} />

      <section>
        <SectionHeader title="Customer reviews" subtitle="Verified buyers across MoharazNX" />
        <ReviewsSection reviews={customerReviews} />
      </section>

      <section>
        <SectionHeader
          title="From the blog"
          subtitle="Buying guides, PC builds & tech tips"
          href={storefrontPaths.blog}
        />
        <BlogSection posts={blogPosts} />
      </section>

      <NewsletterSection />
    </div>
  );
}
