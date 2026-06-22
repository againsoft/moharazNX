import { products, type Product } from "./products";
import { categoriesFlat, getCategoryBySlug, type Category } from "./categories";
import { enrichStorefrontProduct } from "@/lib/storefront/storefront-offers";
import { isProductOnWebsite } from "@/lib/catalog/website-visibility";
import { toStorefrontProduct, type StorefrontProduct } from "./storefront-home";

export type CatalogSort = "relevance" | "price_asc" | "price_desc" | "newest" | "best_selling";

export type CatalogFilters = {
  brands: string[];
  priceMin?: number;
  priceMax?: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
};

export type CatalogQuery = {
  q?: string;
  sort?: CatalogSort;
  page?: number;
  perPage?: number;
  categorySlug?: string;
  filters?: CatalogFilters;
};

const CATEGORY_NAME_BY_ROOT: Record<string, string> = {
  apparel: "Apparel",
  electronics: "Electronics",
  home: "Home",
  beauty: "Beauty",
  sports: "Sports",
  books: "Books",
};

export const CATALOG_BRANDS = [...new Set(products.map((p) => p.brand))].sort();
export const CATALOG_SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "best_selling", label: "Best selling" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export const DEFAULT_FILTERS: CatalogFilters = {
  brands: [],
  inStockOnly: false,
  onSaleOnly: false,
};

const publishedPrices = products.filter((p) => p.status === "published").map((p) => p.price);

export const CATALOG_PRICE_BOUNDS = {
  min: Math.floor(Math.min(...publishedPrices) / 100) * 100,
  max: Math.ceil(Math.max(...publishedPrices) / 100) * 100,
  step: 100,
};

function rootSlugFromCategory(slug: string) {
  return slug.split("/")[0] ?? slug;
}

export function productMatchesCategory(product: Product, categorySlug?: string) {
  if (!categorySlug) return true;
  const root = rootSlugFromCategory(categorySlug);
  const name = CATEGORY_NAME_BY_ROOT[root];
  return name ? product.category === name : true;
}

export function getPublishedProducts(categorySlug?: string) {
  return products.filter(
    (p) => isProductOnWebsite(p) && productMatchesCategory(p, categorySlug),
  );
}

export function filterProducts(items: Product[], filters: CatalogFilters, q?: string) {
  let result = [...items];

  if (q?.trim()) {
    const term = q.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term),
    );
  }

  if (filters.brands.length > 0) {
    result = result.filter((p) => filters.brands.includes(p.brand));
  }

  if (filters.priceMin != null) {
    result = result.filter((p) => p.price >= filters.priceMin!);
  }

  if (filters.priceMax != null) {
    result = result.filter((p) => p.price <= filters.priceMax!);
  }

  if (filters.inStockOnly) {
    result = result.filter((p) => p.stock > 0);
  }

  if (filters.onSaleOnly) {
    result = result.filter((p) => p.compareAtPrice != null && p.compareAtPrice > p.price);
  }

  return result;
}

export function sortProducts(items: Product[], sort: CatalogSort = "relevance") {
  const sorted = [...items];
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "newest":
      return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case "best_selling":
      return sorted.sort((a, b) => b.stock - a.stock);
    default:
      return sorted;
  }
}

export function queryCatalog(query: CatalogQuery) {
  const perPage = query.perPage ?? 12;
  const page = query.page ?? 1;
  const filters = query.filters ?? DEFAULT_FILTERS;
  const base = getPublishedProducts(query.categorySlug);
  return queryCatalogFromSource(base, query);
}

export function queryCatalogFromSource(base: Product[], query: CatalogQuery) {
  const perPage = query.perPage ?? 12;
  const page = query.page ?? 1;
  const filters = query.filters ?? DEFAULT_FILTERS;
  const filtered = filterProducts(
    base.filter((p) => productMatchesCategory(p, query.categorySlug)),
    filters,
    query.q,
  );
  const sorted = sortProducts(filtered, query.sort);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;
  const slice = sorted.slice(start, start + perPage);

  return {
    products: slice.map((p, i) => toCatalogProductWithMeta(p, start + i)),
    total,
    page: safePage,
    totalPages,
    perPage,
  };
}

export function getCatalogContext(categorySlug?: string) {
  if (!categorySlug) {
    return {
      title: "All products",
      description: "Browse our full catalog — filter by brand, price, and availability.",
      category: undefined as Category | undefined,
      subcategories: categoriesFlat.filter((c) => !c.parentId && c.active),
    };
  }

  const category = getCategoryBySlug(categorySlug);
  const subcategories = category
    ? categoriesFlat.filter((c) => c.parentId === category.id && c.active)
    : [];

  return {
    title: category?.name ?? "Category",
    description:
      category?.description ??
      category?.metaDescription ??
      "Shop quality products with fast delivery and easy returns.",
    category,
    subcategories,
  };
}

export function parseFiltersFromParams(params: URLSearchParams): CatalogFilters {
  const brands = params.getAll("brand");
  const priceMin = params.get("price_min");
  const priceMax = params.get("price_max");
  return {
    brands,
    priceMin: priceMin ? Number(priceMin) : undefined,
    priceMax: priceMax ? Number(priceMax) : undefined,
    inStockOnly: params.get("in_stock") === "1",
    onSaleOnly: params.get("on_sale") === "1",
  };
}

export function parseSortFromParams(params: URLSearchParams): CatalogSort {
  const sort = params.get("sort") as CatalogSort | null;
  return CATALOG_SORT_OPTIONS.some((o) => o.value === sort) ? sort! : "relevance";
}

export type CatalogProductWithMeta = StorefrontProduct & { stock: number; category: string };

export function toCatalogProductWithMeta(p: Product, i: number): CatalogProductWithMeta {
  const base = { ...toStorefrontProduct(p, i), stock: p.stock, category: p.category };
  return enrichStorefrontProduct(base, p.category);
}
