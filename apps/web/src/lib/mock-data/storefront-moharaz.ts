/**
 * MoharazNX storefront — home & chrome data from AgainERP catalog mocks.
 * Sources: products, categories, brands, computer-store tech catalog, blog.
 */
import { brandsSeed } from "./brands";
import { categoriesFlat } from "./categories";
import { isProductOnWebsite } from "@/lib/catalog/website-visibility";
import { products, type Product } from "./products";
import {
  computerAiPicks,
  computerBestSellers,
  computerBlogPosts,
  computerCategories,
  computerHeroSlides,
  computerNewArrivals,
  computerReviews,
  computerStoreProducts,
  csUnsplash,
} from "./storefront-computer-store";
import type { StorefrontBlogPost } from "./storefront-blog";
import type {
  HeroSlide,
  StorefrontBrand,
  StorefrontCategory,
  StorefrontProduct,
  StorefrontReview,
} from "./storefront-types";

export const moharazStoreConfig = {
  name: "MoharazNX",
  tagline: "Bangladesh's trusted tech store — laptops, phones, components & more",
  currency: "BDT",
  phone: "+880 9613-786464",
  whatsapp: "+8809613786464",
  supportEmail: "support@moharaznx.com",
  address: "Mohara Tower, 2nd Floor, 75-76, Mirpur Road, Dhaka-1216, Bangladesh",
  hours: "10:00 AM – 8:00 PM",
  days: "Saturday – Thursday",
};

export const moharazPromoMessages = [
  "Free delivery on orders over ৳5,000",
  "0% EMI on selected cards — up to 12 months",
  "100% genuine products with official warranty",
  "Cash on delivery available nationwide",
];

export const moharazTrustFeatures = [
  { id: "cod", label: "Cash on delivery", description: "Pay when you receive" },
  { id: "warranty", label: "Official warranty", description: "Genuine products only" },
  { id: "delivery", label: "Fast delivery", description: "Dhaka & nationwide" },
  { id: "support", label: "Expert support", description: "Pre & post purchase help" },
];

function productToHome(p: Product, i: number, badge?: StorefrontProduct["badge"]): StorefrontProduct {
  const badges: StorefrontProduct["badge"][] = ["bestseller", "sale", "new", "ai-pick", undefined];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    image: p.thumbnail,
    brand: p.brand,
    rating: 4.1 + (i % 9) * 0.1,
    reviewCount: 18 + (i % 140),
    badge: badge ?? badges[i % badges.length],
  };
}

/** Unified published catalog — computer store + admin catalog products. */
export function getMoharazCatalogProducts(): Product[] {
  const bySlug = new Map<string, Product>();
  for (const p of computerStoreProducts) {
    if (p.status === "published") bySlug.set(p.slug, p);
  }
  for (const p of products) {
    if (p.status === "published" && isProductOnWebsite(p) && !bySlug.has(p.slug)) {
      bySlug.set(p.slug, p);
    }
  }
  return [...bySlug.values()];
}

export const moharazHeroSlides: HeroSlide[] = computerHeroSlides.map((s) => ({
  ...s,
  eyebrow: s.eyebrow.replace(/TechPoint/gi, "MoharazNX"),
  subtitle: s.subtitle.replace(/TechPoint/gi, "MoharazNX"),
}));

const extraCategories: StorefrontCategory[] = [
  { id: "mc_desktop", slug: "electronics", name: "Desktop PCs", image: csUnsplash("gpu", 400, 400), productCount: 29 },
  { id: "mc_tablet", slug: "electronics", name: "Tablets", image: csUnsplash("laptop", 400, 400), productCount: 18 },
  { id: "mc_camera", slug: "electronics", name: "Cameras", image: csUnsplash("gaming", 400, 400), productCount: 22 },
  { id: "mc_net", slug: "electronics", name: "Networking", image: csUnsplash("gpu", 400, 400), productCount: 34 },
  { id: "mc_acc", slug: "electronics", name: "Accessories", image: csUnsplash("laptop", 400, 400), productCount: 91 },
  { id: "mc_print", slug: "electronics", name: "Printers", image: csUnsplash("gaming", 400, 400), productCount: 15 },
];

export const moharazCategories: StorefrontCategory[] = [
  ...computerCategories,
  ...categoriesFlat
    .filter((c) => c.active && c.parentId === null && !computerCategories.some((cc) => cc.slug === c.slug))
    .slice(0, 2)
    .map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.caption || c.name,
      image: c.bannerUrl ?? c.iconUrl ?? csUnsplash("laptop", 400, 400),
      productCount: c.productCount,
    })),
  ...extraCategories,
].slice(0, 12);

export const moharazFeaturedProducts: StorefrontProduct[] = getMoharazCatalogProducts()
  .slice(0, 6)
  .map((p, i) => productToHome(p, i));

export const moharazBestSellers: StorefrontProduct[] =
  computerBestSellers.length >= 6
    ? computerBestSellers
    : getMoharazCatalogProducts()
        .slice(6, 12)
        .map((p, i) => productToHome(p, i, "bestseller"));

export const moharazNewArrivals: StorefrontProduct[] =
  computerNewArrivals.length >= 6
    ? computerNewArrivals
    : getMoharazCatalogProducts()
        .slice(12, 18)
        .map((p, i) => productToHome(p, i, "new"));

export const moharazAiPicks: StorefrontProduct[] =
  computerAiPicks.length >= 6 ? computerAiPicks : moharazFeaturedProducts.map((p) => ({ ...p, badge: "ai-pick" as const }));

const staticBrands: StorefrontBrand[] = [
  { id: "sb_asus", name: "ASUS", slug: "asus", logo: "https://placehold.co/120x40/1e293b/ffffff?text=ASUS&font=montserrat" },
  { id: "sb_dell", name: "Dell", slug: "dell", logo: "https://placehold.co/120x40/1e293b/ffffff?text=Dell&font=montserrat" },
  { id: "sb_hp", name: "HP", slug: "hp", logo: "https://placehold.co/120x40/1e293b/ffffff?text=HP&font=montserrat" },
  { id: "sb_lenovo", name: "Lenovo", slug: "lenovo", logo: "https://placehold.co/120x40/1e293b/ffffff?text=Lenovo&font=montserrat" },
  { id: "sb_msi", name: "MSI", slug: "msi", logo: "https://placehold.co/120x40/1e293b/ffffff?text=MSI&font=montserrat" },
  { id: "sb_samsung", name: "Samsung", slug: "samsung", logo: "https://placehold.co/120x40/1e293b/ffffff?text=Samsung&font=montserrat" },
  { id: "sb_apple", name: "Apple", slug: "apple", logo: "https://placehold.co/120x40/1e293b/ffffff?text=Apple&font=montserrat" },
  { id: "sb_acer", name: "Acer", slug: "acer", logo: "https://placehold.co/120x40/1e293b/ffffff?text=Acer&font=montserrat" },
  { id: "sb_gigabyte", name: "Gigabyte", slug: "gigabyte", logo: "https://placehold.co/120x40/1e293b/ffffff?text=Gigabyte&font=montserrat" },
  { id: "sb_intel", name: "Intel", slug: "intel", logo: "https://placehold.co/120x40/1e293b/ffffff?text=Intel&font=montserrat" },
  { id: "sb_amd", name: "AMD", slug: "amd", logo: "https://placehold.co/120x40/1e293b/ffffff?text=AMD&font=montserrat" },
  { id: "sb_corsair", name: "Corsair", slug: "corsair", logo: "https://placehold.co/120x40/1e293b/ffffff?text=Corsair&font=montserrat" },
];

export const moharazBrands: StorefrontBrand[] = (() => {
  const fromSeed = brandsSeed
    .filter((b) => b.active)
    .slice(0, 6)
    .map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: b.logoUrl ?? `https://placehold.co/120x40/1e293b/ffffff?text=${encodeURIComponent(b.name)}`,
    }));
  const seen = new Set(fromSeed.map((b) => b.slug));
  const extras = staticBrands.filter((b) => !seen.has(b.slug));
  return [...fromSeed, ...extras].slice(0, 12);
})();

export const moharazReviews: StorefrontReview[] = computerReviews.map((r) => ({
  ...r,
  body: r.body.replace(/TechPoint/gi, "MoharazNX"),
}));

export const moharazBlogPosts: StorefrontBlogPost[] = computerBlogPosts.map((post) => ({
  ...post,
  author: post.author.replace(/TechPoint/gi, "MoharazNX"),
}));

export type StorefrontNavLink = { href: string; label: string };

/** Header nav from AgainERP categories + fixed ecommerce links. */
export function getMoharazNavLinks(): StorefrontNavLink[] {
  const fromCategories = categoriesFlat
    .filter((c) => c.active && c.showInTopMenu)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({ href: `/${c.slug}`, label: c.caption || c.name }));

  const core: StorefrontNavLink[] = [
    { href: "/laptops", label: "Laptops" },
    { href: "/gaming-laptop", label: "Gaming" },
    { href: "/phones", label: "Phones" },
    { href: "/electronics", label: "Components" },
    { href: "/deals", label: "Deals" },
    { href: "/builder/pc-builder", label: "PC Builder" },
  ];

  const seen = new Set<string>();
  return [...core, ...fromCategories].filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

export function getMoharazHomepageDeals(limit = 6): StorefrontProduct[] {
  return getMoharazCatalogProducts()
    .filter((p) => p.compareAtPrice && p.compareAtPrice > p.price)
    .slice(0, limit)
    .map((p, i) => productToHome(p, i, "sale"));
}
