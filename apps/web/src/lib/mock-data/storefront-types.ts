import type { OfferLabel } from "@/lib/storefront/storefront-offer-types";

export type StorefrontProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  brand: string;
  rating: number;
  reviewCount: number;
  badge?: "new" | "sale" | "bestseller" | "ai-pick";
  offerLabels?: OfferLabel[];
  flashSaleName?: string;
};

export type StorefrontCategory = {
  id: string;
  slug: string;
  name: string;
  image: string;
  productCount: number;
};

export type StorefrontBrand = {
  id: string;
  name: string;
  slug: string;
  logo: string;
};

export type StorefrontReview = {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  productName: string;
  verified: boolean;
};

export type HeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
  theme: "light" | "dark";
};
