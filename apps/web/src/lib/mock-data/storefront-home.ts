import {
  moharazAiPicks,
  moharazBestSellers,
  moharazBlogPosts,
  moharazBrands,
  moharazCategories,
  moharazFeaturedProducts,
  moharazHeroSlides,
  moharazNewArrivals,
  moharazReviews,
  moharazStoreConfig,
} from "./storefront-moharaz";
import { computerStoreProducts } from "./storefront-computer-store";
import type { StorefrontProduct } from "./storefront-types";

export type {
  HeroSlide,
  StorefrontBrand,
  StorefrontCategory,
  StorefrontProduct,
  StorefrontReview,
} from "./storefront-types";
export type { StorefrontBlogPost } from "./storefront-blog";

/** Map admin catalog product → storefront card shape. */
export function toStorefrontProduct(
  p: { id: string; slug: string; name: string; price: number; compareAtPrice?: number; brand: string; thumbnail?: string },
  i: number,
): StorefrontProduct {
  const badges: StorefrontProduct["badge"][] = ["bestseller", "sale", "new", "ai-pick", undefined];
  const cs = computerStoreProducts.find((c) => c.id === p.id || c.slug === p.slug);
  const image =
    cs?.thumbnail ??
    p.thumbnail ??
    `https://placehold.co/600x600/0f172a/e2e8f0/png?text=${encodeURIComponent(p.name.slice(0, 16))}`;
  return {
    id: p.id,
    slug: p.slug,
    name: cs?.name ?? p.name,
    price: cs?.price ?? p.price,
    compareAtPrice: cs?.compareAtPrice ?? p.compareAtPrice,
    image,
    brand: cs?.brand ?? p.brand,
    rating: 3.8 + (i % 12) * 0.1,
    reviewCount: 12 + (i % 80),
    badge: badges[i % badges.length],
  };
}

export const heroSlides = moharazHeroSlides;
export const featuredCategories = moharazCategories;
export const featuredProducts = moharazFeaturedProducts;
export const bestSellers = moharazBestSellers;
export const newArrivals = moharazNewArrivals;
export const storefrontBrands = moharazBrands;
export const customerReviews = moharazReviews;
export const blogPosts = moharazBlogPosts;
export const aiPicks = moharazAiPicks;
export const storeConfig = moharazStoreConfig;
