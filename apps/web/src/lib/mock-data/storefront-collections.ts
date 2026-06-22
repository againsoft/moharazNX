import { products, type Product } from "./products";
import { toStorefrontProduct, type StorefrontProduct } from "./storefront-home";

export type CollectionType = "new" | "bestsellers";

export type CollectionSort = "featured" | "newest" | "price_asc" | "price_desc" | "rating";

export const COLLECTION_CATEGORIES = [
  { slug: "all", label: "All", name: null as string | null },
  { slug: "electronics", label: "Electronics", name: "Electronics" },
  { slug: "apparel", label: "Fashion", name: "Apparel" },
  { slug: "home", label: "Home", name: "Home" },
  { slug: "beauty", label: "Beauty", name: "Beauty" },
];

export const COLLECTION_CONFIG: Record<
  CollectionType,
  {
    title: string;
    subtitle: string;
    breadcrumb: string;
    eyebrow: string;
    defaultSort: CollectionSort;
    badge: StorefrontProduct["badge"];
    heroImage: string;
  }
> = {
  new: {
    title: "New arrivals",
    subtitle: "Fresh styles and latest tech — just landed this week.",
    breadcrumb: "New arrivals",
    eyebrow: "Just in",
    defaultSort: "newest",
    badge: "new",
    heroImage: "https://picsum.photos/seed/new-arrivals/1200/400",
  },
  bestsellers: {
    title: "Best sellers",
    subtitle: "Top-rated picks loved by shoppers across Bangladesh.",
    breadcrumb: "Best sellers",
    eyebrow: "Trending now",
    defaultSort: "featured",
    badge: "bestseller",
    heroImage: "https://picsum.photos/seed/bestsellers/1200/400",
  },
};

export const COLLECTION_SORT_OPTIONS: Record<CollectionType, { value: CollectionSort; label: string }[]> = {
  new: [
    { value: "newest", label: "Newest first" },
    { value: "price_asc", label: "Price: low to high" },
    { value: "price_desc", label: "Price: high to low" },
    { value: "rating", label: "Top rated" },
  ],
  bestsellers: [
    { value: "featured", label: "Best selling" },
    { value: "rating", label: "Top rated" },
    { value: "price_asc", label: "Price: low to high" },
    { value: "price_desc", label: "Price: high to low" },
  ],
};

function getPublishedBase(type: CollectionType): Product[] {
  const published = products.filter((p) => p.status === "published");
  if (type === "bestsellers") {
    const tagged = published.filter((p) => p.tags.includes("bestseller"));
    const pool = tagged.length >= 8 ? tagged : published;
    return [...pool].sort((a, b) => b.stock - a.stock);
  }
  return [...published].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function sortCollection(items: Product[], sort: CollectionSort) {
  const sorted = [...items];
  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "newest":
      return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case "rating":
      return sorted.sort((a, b) => b.stock - a.stock);
    default:
      return sorted;
  }
}

export function queryCollection(
  type: CollectionType,
  options: { category?: string; sort?: CollectionSort; page?: number; perPage?: number },
) {
  const config = COLLECTION_CONFIG[type];
  const perPage = options.perPage ?? 12;
  const page = options.page ?? 1;
  const sort = options.sort ?? config.defaultSort;
  const category = options.category ?? "all";

  let items = getPublishedBase(type);

  if (category !== "all") {
    const cat = COLLECTION_CATEGORIES.find((c) => c.slug === category);
    if (cat?.name) items = items.filter((p) => p.category === cat.name);
  }

  items = sortCollection(items, sort);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;
  const slice = items.slice(start, start + perPage);

  return {
    products: slice.map((p, i) => ({
      ...toStorefrontProduct(p, start + i),
      badge: config.badge,
    })),
    spotlight: getPublishedBase(type)
      .slice(0, 3)
      .map((p, i) => ({ ...toStorefrontProduct(p, i), badge: config.badge })),
    total,
    page: safePage,
    totalPages,
    perPage,
    config,
  };
}

export function parseCollectionSort(type: CollectionType, value: string | null): CollectionSort {
  const options = COLLECTION_SORT_OPTIONS[type];
  return options.some((o) => o.value === value) ? (value as CollectionSort) : COLLECTION_CONFIG[type].defaultSort;
}
