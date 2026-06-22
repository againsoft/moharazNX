import type { Product, ProductStatus, ProductVisibility, StockStatusLabel } from "@/lib/mock-data/products";
import { apiFetch } from "@/lib/api/client";

/** Raw product shape from FastAPI `/api/v1/catalog/products`. */
export type ApiCatalogProduct = {
  id: string;
  company_id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  short_description: string | null;
  price: string;
  compare_at_price: string | null;
  stock: number;
  status: ProductStatus;
  product_type: "simple" | "variable";
  visibility: ProductVisibility;
  brand: string | null;
  category: string | null;
  brand_id: string | null;
  category_id: string | null;
  attribute_profile_id: string | null;
  thumbnail: string | null;
  seo_title: string | null;
  seo_description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type ApiProductVariant = {
  id: string;
  sku: string;
  name: string;
  price: string;
  stock: number;
  status: ProductStatus;
  is_default: boolean;
  sort_order: number;
};

export type ApiProductMediaLink = {
  id: string;
  media_id: string;
  url: string;
  name: string;
  media_type: string;
  sort_order: number;
  is_primary: boolean;
};

export type ApiProductDetail = ApiCatalogProduct & {
  variants: ApiProductVariant[];
  media: ApiProductMediaLink[];
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

export type ApiProductDetailResponse = {
  data: ApiProductDetail;
  errors: string[];
};

export type ProductDetail = Product & {
  productType: "simple" | "variable";
  categoryId: string | null;
  brandId: string | null;
  attributeProfileId: string | null;
  shortDescription: string;
  metaTitle: string;
  metaDescription: string;
  mediaLinks: ApiProductMediaLink[];
  variants: ApiProductVariant[];
};

export type ProductSpecValue = {
  attributeId: string;
  attributeCode: string;
  attributeName: string;
  value: string;
};

export type ProductSpecs = {
  attributeProfileId: string | null;
  values: ProductSpecValue[];
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
    visibility: row.visibility ?? "public",
    category: row.category ?? "Uncategorized",
    brand: row.brand ?? "Unknown",
    thumbnail: row.thumbnail ?? `https://picsum.photos/seed/${row.id}/80/80`,
    updatedAt: row.updated_at,
    seoTitle: row.seo_title ?? `${row.name} | Buy Online — MoharazNX`,
    description: row.description ?? undefined,
    shortDescription: row.short_description ?? undefined,
    tags: row.tags ?? [],
  };
}

export function apiProductDetailToProduct(row: ApiProductDetail): ProductDetail {
  const base = apiProductToProduct(row);
  return {
    ...base,
    seoTitle: row.seo_title ?? base.seoTitle,
    shortDescription: row.short_description ?? "",
    productType: row.product_type,
    categoryId: row.category_id,
    brandId: row.brand_id,
    attributeProfileId: row.attribute_profile_id,
    metaTitle: row.seo_title ?? "",
    metaDescription: row.seo_description ?? "",
    mediaLinks: row.media,
    variants: row.variants,
  };
}

export type CreateCatalogProductInput = {
  name: string;
  slug: string;
  sku: string;
  price: number;
  stock?: number;
  status?: ProductStatus;
  product_type?: "simple" | "variable";
  visibility?: ProductVisibility;
  brand?: string;
  category?: string;
  brand_id?: string | null;
  category_id?: string | null;
  description?: string;
  short_description?: string;
  thumbnail?: string;
  seo_title?: string;
  seo_description?: string;
  tags?: string[];
  compare_at_price?: number;
};

export type UpdateCatalogProductInput = Partial<CreateCatalogProductInput>;

export type VariantUpsertInput = {
  id?: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  status?: ProductStatus;
  is_default?: boolean;
  sort_order?: number;
};

function productPayload(input: CreateCatalogProductInput | UpdateCatalogProductInput) {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.slug !== undefined) payload.slug = input.slug;
  if (input.sku !== undefined) payload.sku = input.sku;
  if (input.price !== undefined) payload.price = input.price.toFixed(2);
  if (input.compare_at_price !== undefined) payload.compare_at_price = input.compare_at_price.toFixed(2);
  if (input.stock !== undefined) payload.stock = input.stock;
  if (input.status !== undefined) payload.status = input.status;
  if (input.product_type !== undefined) payload.product_type = input.product_type;
  if (input.visibility !== undefined) payload.visibility = input.visibility;
  if (input.brand !== undefined) payload.brand = input.brand;
  if (input.category !== undefined) payload.category = input.category;
  if (input.brand_id !== undefined) payload.brand_id = input.brand_id;
  if (input.category_id !== undefined) payload.category_id = input.category_id;
  if (input.description !== undefined) payload.description = input.description;
  if (input.short_description !== undefined) payload.short_description = input.short_description;
  if (input.thumbnail !== undefined) payload.thumbnail = input.thumbnail;
  if (input.seo_title !== undefined) payload.seo_title = input.seo_title;
  if (input.seo_description !== undefined) payload.seo_description = input.seo_description;
  if (input.tags !== undefined) payload.tags = input.tags;
  return payload;
}

export function productToApiPayload(input: CreateCatalogProductInput) {
  return productPayload(input);
}

export function productToApiUpdatePayload(input: UpdateCatalogProductInput) {
  return productPayload(input);
}

export async function fetchCatalogProductDetail(id: string): Promise<ProductDetail> {
  const res = await apiFetch<ApiProductDetailResponse>(`/api/v1/catalog/products/${id}`);
  return apiProductDetailToProduct(res.data);
}

export async function replaceProductVariants(
  productId: string,
  variants: VariantUpsertInput[],
): Promise<ProductDetail> {
  const res = await apiFetch<ApiProductDetailResponse>(`/api/v1/catalog/products/${productId}/variants`, {
    method: "PUT",
    body: JSON.stringify({
      variants: variants.map((v, idx) => ({
        id: v.id,
        sku: v.sku,
        name: v.name,
        price: v.price.toFixed(2),
        stock: v.stock,
        status: v.status ?? "draft",
        is_default: v.is_default ?? false,
        sort_order: v.sort_order ?? idx,
      })),
    }),
  });
  return apiProductDetailToProduct(res.data);
}

export async function replaceProductMedia(
  productId: string,
  mediaIds: string[],
): Promise<ProductDetail> {
  const res = await apiFetch<ApiProductDetailResponse>(`/api/v1/catalog/products/${productId}/media`, {
    method: "PUT",
    body: JSON.stringify({ media_ids: mediaIds }),
  });
  return apiProductDetailToProduct(res.data);
}

export async function fetchProductSpecs(productId: string): Promise<ProductSpecs> {
  const res = await apiFetch<{ data: { attribute_profile_id: string | null; values: { attribute_id: string; attribute_code: string; attribute_name: string; value: string }[] } }>(
    `/api/v1/catalog/products/${productId}/specs`,
  );
  return {
    attributeProfileId: res.data.attribute_profile_id,
    values: res.data.values.map((v) => ({
      attributeId: v.attribute_id,
      attributeCode: v.attribute_code,
      attributeName: v.attribute_name,
      value: v.value,
    })),
  };
}

export async function replaceProductSpecs(
  productId: string,
  payload: { attributeProfileId: string | null; values: { attributeId: string; value: string }[] },
): Promise<ProductSpecs> {
  const res = await apiFetch<{ data: { attribute_profile_id: string | null; values: { attribute_id: string; attribute_code: string; attribute_name: string; value: string }[] } }>(
    `/api/v1/catalog/products/${productId}/specs`,
    {
      method: "PUT",
      body: JSON.stringify({
        attribute_profile_id: payload.attributeProfileId,
        values: payload.values.map((v) => ({
          attribute_id: v.attributeId,
          value: v.value,
        })),
      }),
    },
  );
  return {
    attributeProfileId: res.data.attribute_profile_id,
    values: res.data.values.map((v) => ({
      attributeId: v.attribute_id,
      attributeCode: v.attribute_code,
      attributeName: v.attribute_name,
      value: v.value,
    })),
  };
}
