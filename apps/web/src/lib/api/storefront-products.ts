import type { Product, ProductStatus, StockStatusLabel } from "@/lib/mock-data/products";
import { apiFetch } from "@/lib/api/client";

export type ApiStorefrontProduct = {
  id: string;
  slug: string;
  name: string;
  price: string;
  compare_at_price: string | null;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string | null;
  in_stock: boolean;
};

export type ApiStorefrontProductListResponse = {
  data: ApiStorefrontProduct[];
  meta: { count: number; page: number; per_page: number };
};

export type ApiStorefrontProductResponse = {
  data: ApiStorefrontProduct;
};

function resolveStockStatus(stock: number): StockStatusLabel {
  if (stock === 0) return "Out of Stock";
  if (stock <= 20) return "Low Stock";
  return "In Stock";
}

export function storefrontApiToProduct(row: ApiStorefrontProduct): Product {
  const price = parseFloat(row.price) || 0;
  const compareAt = row.compare_at_price ? parseFloat(row.compare_at_price) : undefined;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.slug,
    price,
    compareAtPrice: compareAt,
    stock: row.stock,
    stockStatus: resolveStockStatus(row.stock),
    status: "published" as ProductStatus,
    visibility: "public",
    category: row.category,
    brand: row.brand,
    thumbnail: row.thumbnail ?? `https://picsum.photos/seed/${row.id}/600/600`,
    updatedAt: new Date().toISOString(),
    seoTitle: `${row.name} | MoharazNX`,
    tags: [],
  };
}

export async function fetchStorefrontProductBySlug(slug: string): Promise<ApiStorefrontProduct> {
  const res = await apiFetch<ApiStorefrontProductResponse>(
    `/api/v1/storefront/products/by-slug/${encodeURIComponent(slug)}`,
  );
  return res.data;
}

export function buildStorefrontProductQuery(params?: {
  search?: string;
  category?: string;
  page?: number;
  perPage?: number;
}): string {
  const q = new URLSearchParams();
  if (params?.search) q.set("search", params.search);
  if (params?.category) q.set("category", params.category);
  if (params?.page) q.set("page", String(params.page));
  if (params?.perPage) q.set("per_page", String(params.perPage));
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}
