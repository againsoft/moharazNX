import type { Product, ProductStatus, StockStatusLabel } from "@/lib/mock-data/products";

/** Raw product shape from FastAPI `/api/v1/catalog/products`. */
export type ApiCatalogProduct = {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  price: string;
  compare_at_price: string | null;
  stock: number;
  status: ProductStatus;
  brand: string | null;
  category: string | null;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiProductListResponse = {
  data: ApiCatalogProduct[];
  meta: { count: number; page: number; per_page: number };
  errors: string[];
};

export type ApiProductResponse = {
  data: ApiCatalogProduct;
  errors: string[];
};

function resolveStockStatus(stock: number): StockStatusLabel {
  if (stock === 0) return "Out of Stock";
  if (stock <= 20) return "Low Stock";
  return "In Stock";
}

export function apiProductToProduct(row: ApiCatalogProduct): Product {
  const price = parseFloat(row.price) || 0;
  const compareAt = row.compare_at_price ? parseFloat(row.compare_at_price) : undefined;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    price,
    compareAtPrice: compareAt,
    stock: row.stock,
    stockStatus: resolveStockStatus(row.stock),
    status: row.status,
    visibility: "public",
    category: row.category ?? "Uncategorized",
    brand: row.brand ?? "Unknown",
    thumbnail: row.thumbnail ?? `https://picsum.photos/seed/${row.id}/80/80`,
    updatedAt: row.updated_at,
    seoTitle: `${row.name} | Buy Online — MoharazNX`,
    description: row.description ?? undefined,
    tags: [],
  };
}

export type CreateCatalogProductInput = {
  name: string;
  slug: string;
  sku: string;
  price: number;
  stock?: number;
  status?: ProductStatus;
  brand?: string;
  category?: string;
  description?: string;
  thumbnail?: string;
};

export type UpdateCatalogProductInput = {
  name?: string;
  slug?: string;
  sku?: string;
  price?: number;
  compare_at_price?: number;
  stock?: number;
  status?: ProductStatus;
  brand?: string;
  category?: string;
  description?: string;
  thumbnail?: string;
};

export function productToApiPayload(input: CreateCatalogProductInput) {
  return {
    name: input.name,
    slug: input.slug,
    sku: input.sku,
    price: input.price.toFixed(2),
    stock: input.stock ?? 0,
    status: input.status ?? "draft",
    brand: input.brand ?? null,
    category: input.category ?? null,
    description: input.description ?? null,
    thumbnail: input.thumbnail ?? null,
  };
}

export function productToApiUpdatePayload(input: UpdateCatalogProductInput) {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.slug !== undefined) payload.slug = input.slug;
  if (input.sku !== undefined) payload.sku = input.sku;
  if (input.price !== undefined) payload.price = input.price.toFixed(2);
  if (input.compare_at_price !== undefined) {
    payload.compare_at_price = input.compare_at_price.toFixed(2);
  }
  if (input.stock !== undefined) payload.stock = input.stock;
  if (input.status !== undefined) payload.status = input.status;
  if (input.brand !== undefined) payload.brand = input.brand;
  if (input.category !== undefined) payload.category = input.category;
  if (input.description !== undefined) payload.description = input.description;
  if (input.thumbnail !== undefined) payload.thumbnail = input.thumbnail;
  return payload;
}
