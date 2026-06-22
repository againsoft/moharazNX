import { categoriesFlat } from "./categories";
import { categoryPath } from "@/lib/url-slug/paths";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";
import {
  CATALOG_BRANDS,
  DEFAULT_FILTERS,
  filterProducts,
  getPublishedProducts,
  queryCatalog,
  toCatalogProductWithMeta,
  type CatalogProductWithMeta,
} from "./storefront-catalog";

export type SearchCategoryHit = {
  name: string;
  slug: string;
  productCount: number;
};

export type SearchBrandHit = {
  name: string;
  slug: string;
};

export type LiveSearchResult = {
  products: CatalogProductWithMeta[];
  categories: SearchCategoryHit[];
  brands: SearchBrandHit[];
  total: number;
};

export const TRENDING_SEARCHES = [
  "wireless earbuds",
  "cotton t-shirt",
  "running shoes",
  "smart watch",
  "face serum",
];

const RECENT_KEY = "storefront-recent-searches";
const RECENT_LIMIT = 6;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string").slice(0, RECENT_LIMIT)
      : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query: string) {
  const term = query.trim();
  if (!term || typeof window === "undefined") return;
  const prev = getRecentSearches().filter((s) => s.toLowerCase() !== term.toLowerCase());
  localStorage.setItem(RECENT_KEY, JSON.stringify([term, ...prev].slice(0, RECENT_LIMIT)));
}

export function liveSearch(query: string, productLimit = 6): LiveSearchResult {
  const term = query.trim().toLowerCase();
  if (!term) {
    return { products: [], categories: [], brands: [], total: 0 };
  }

  const all = getPublishedProducts();
  const matched = filterProducts(all, DEFAULT_FILTERS, query);
  const products = matched.slice(0, productLimit).map((p, i) => toCatalogProductWithMeta(p, i));

  const categories = categoriesFlat
    .filter(
      (c) =>
        c.active &&
        (c.name.toLowerCase().includes(term) ||
          c.caption.toLowerCase().includes(term) ||
          c.slug.toLowerCase().includes(term)),
    )
    .slice(0, 4)
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      productCount: c.productCount,
    }));

  const brands = CATALOG_BRANDS.filter((b) => b.toLowerCase().includes(term))
    .slice(0, 4)
    .map((name) => ({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
    }));

  return {
    products,
    categories,
    brands,
    total: matched.length,
  };
}

export function searchCatalog(query: string, page = 1, perPage = 12) {
  return queryCatalog({ q: query, page, perPage, sort: "relevance" });
}

export function buildSearchUrl(query: string) {
  const term = query.trim();
  if (!term) return storefrontPaths.search;
  return `${storefrontPaths.search}?q=${encodeURIComponent(term)}`;
}

export function buildBrandSearchUrl(brand: string) {
  return `${storefrontPaths.products}?brand=${encodeURIComponent(brand)}`;
}

export function buildCategoryUrl(slug: string) {
  return categoryPath(slug);
}
