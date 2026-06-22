import { products } from "./products";
import { toStorefrontProduct, type StorefrontProduct } from "@/lib/mock-data/storefront-home";
import type { OfferLabel } from "@/lib/storefront/storefront-offer-types";
import { buildDealProductsFromAdmin, getOfferSourcesWithFallback } from "@/lib/storefront/storefront-offers";

export type DealProduct = StorefrontProduct & {
  discountPercent: number;
  savings: number;
  offerLabels?: OfferLabel[];
  flashSaleName?: string;
};

export type DealTier = "all" | "20" | "30" | "40";

export const DEAL_TIERS: { value: DealTier; label: string; minPercent: number }[] = [
  { value: "all", label: "All deals", minPercent: 0 },
  { value: "20", label: "20%+ off", minPercent: 20 },
  { value: "30", label: "30%+ off", minPercent: 30 },
  { value: "40", label: "40%+ off", minPercent: 40 },
];

export const DEAL_CATEGORIES = [
  { slug: "all", label: "All" },
  { slug: "electronics", label: "Electronics", name: "Electronics" },
  { slug: "apparel", label: "Fashion", name: "Apparel" },
  { slug: "home", label: "Home", name: "Home" },
  { slug: "beauty", label: "Beauty", name: "Beauty" },
];

/** Flash sale ends tonight at 23:59:59 local — prototype fixed offset from page load */
export function getFlashSaleEndTime() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end.getTime();
}

export function getDiscountMeta(price: number, compareAtPrice?: number) {
  if (!compareAtPrice || compareAtPrice <= price) {
    return { discountPercent: 0, savings: 0 };
  }
  const savings = compareAtPrice - price;
  const discountPercent = Math.round((savings / compareAtPrice) * 100);
  return { discountPercent, savings };
}

function toDealProduct(p: (typeof products)[0], i: number): DealProduct {
  const base = toStorefrontProduct(p, i);
  const { discountPercent, savings } = getDiscountMeta(p.price, p.compareAtPrice);
  return {
    ...base,
    badge: "sale",
    discountPercent,
    savings,
  };
}

export function getAllDealProducts(): DealProduct[] {
  const adminDeals = buildDealProductsFromAdmin(getOfferSourcesWithFallback().flashSales);
  if (adminDeals.length > 0) return adminDeals;

  return products
    .filter((p) => p.status === "published" && p.compareAtPrice != null && p.compareAtPrice > p.price)
    .map(toDealProduct)
    .sort((a, b) => b.discountPercent - a.discountPercent);
}

export type DealSort = "discount" | "price_asc" | "price_desc" | "newest";

export const DEAL_SORT_OPTIONS: { value: DealSort; label: string }[] = [
  { value: "discount", label: "Biggest discount" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "newest", label: "Newest deals" },
];

export function queryDeals(options: {
  tier?: DealTier;
  category?: string;
  sort?: DealSort;
  page?: number;
  perPage?: number;
}) {
  const { tier = "all", category = "all", sort = "discount", page = 1, perPage = 12 } = options;
  const tierMin = DEAL_TIERS.find((t) => t.value === tier)?.minPercent ?? 0;

  let items = getAllDealProducts().filter((p) => p.discountPercent >= tierMin);

  if (category !== "all") {
    const cat = DEAL_CATEGORIES.find((c) => c.slug === category);
    if (cat?.name) {
      items = items.filter((p) => {
        const product = products.find((x) => x.id === p.id);
        return product?.category === cat.name;
      });
    }
  }

  switch (sort) {
    case "price_asc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      items.sort((a, b) => b.price - a.price);
      break;
    case "newest":
      items.sort((a, b) => {
        const pa = products.find((x) => x.id === a.id);
        const pb = products.find((x) => x.id === b.id);
        return (pb?.updatedAt ?? "").localeCompare(pa?.updatedAt ?? "");
      });
      break;
    default:
      items.sort((a, b) => b.discountPercent - a.discountPercent);
  }

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;

  return {
    products: items.slice(start, start + perPage),
    total,
    page: safePage,
    totalPages,
    perPage,
    spotlight: getAllDealProducts().slice(0, 3),
  };
}

export function parseDealTier(value: string | null): DealTier {
  return DEAL_TIERS.some((t) => t.value === value) ? (value as DealTier) : "all";
}

export function parseDealSort(value: string | null): DealSort {
  return DEAL_SORT_OPTIONS.some((o) => o.value === value) ? (value as DealSort) : "discount";
}
