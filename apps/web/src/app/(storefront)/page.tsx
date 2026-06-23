import { HeroBanner } from "@/components/storefront/home/hero-banner";
import { SectionHeader } from "@/components/storefront/home/section-header";
import { CategoryGrid } from "@/components/storefront/home/category-grid";
import { ProductRail } from "@/components/storefront/home/product-rail";
import { HomeDealsSection } from "@/components/storefront/home/home-deals-section";
import { PromoBanners } from "@/components/storefront/home/promo-banners";
import { ProductSpotlight } from "@/components/storefront/home/product-spotlight";
import { PcBuilderCta } from "@/components/storefront/home/pc-builder-cta";
import { BrandsStrip } from "@/components/storefront/home/brands-strip";
import { ReviewsSection } from "@/components/storefront/home/reviews-section";
import { BlogSection } from "@/components/storefront/home/blog-section";
import { NewsletterSection } from "@/components/storefront/home/newsletter-section";
import { AiRecommendations } from "@/components/storefront/home/ai-recommendations";
import { TrustFeatures } from "@/components/storefront/trust-features";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";
import {
  aiPicks,
  blogPosts,
  customerReviews,
  featuredCategories,
  heroSlides,
  newArrivals,
  storefrontBrands,
} from "@/lib/mock-data/storefront-home";

export default function StorefrontHomePage() {
  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Hero slider — full-width, flush with header, no top gap */}
      <HeroBanner slides={heroSlides} />

      {/* Trust badges */}
      <TrustFeatures />

      {/* Category quick-access — 12 tiles */}
      <section aria-label="Shop by category">
        <SectionHeader
          title="Shop by Category"
          subtitle="Laptops, phones, components & accessories"
          href={storefrontPaths.categories}
        />
        <CategoryGrid categories={featuredCategories} />
      </section>

      {/* Product spotlight — 2-col with center fire icon */}
      <ProductSpotlight />

      {/* 2-col promo banners */}
      <PromoBanners />

      {/* Tabbed best sellers / most wanted */}
      <HomeDealsSection />

      {/* New arrivals rail */}
      <section aria-label="New arrivals">
        <SectionHeader
          title="New Arrivals"
          subtitle="Latest laptops, phones & PC parts"
          href={storefrontPaths.newArrivals}
        />
        <ProductRail products={newArrivals} columns={6} />
      </section>

      {/* PC Builder CTA banner */}
      <PcBuilderCta />

      {/* Brands we distribute */}
      <section aria-label="Brands we distribute">
        <SectionHeader
          title="Brands We Distribute"
          subtitle="Official distributor of trusted brands"
          href={storefrontPaths.categories}
        />
        <BrandsStrip brands={storefrontBrands} />
      </section>

      {/* AI picks */}
      <AiRecommendations products={aiPicks} />

      {/* Customer reviews */}
      <section aria-label="Customer reviews">
        <SectionHeader title="Customer Reviews" subtitle="Verified buyers across MoharazNX" />
        <ReviewsSection reviews={customerReviews} />
      </section>

      {/* Blog */}
      <section aria-label="From the blog">
        <SectionHeader
          title="From the Blog"
          subtitle="Buying guides, PC builds & tech tips"
          href={storefrontPaths.blog}
        />
        <BlogSection posts={blogPosts} />
      </section>

      <NewsletterSection />
    </div>
  );
}
