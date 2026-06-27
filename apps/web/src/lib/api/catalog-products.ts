import type { Product, ProductStatus, ProductVisibility, StockStatusLabel } from "@/lib/mock-data/products";
import { apiFetch, ApiError } from "@/lib/api/client";

/** Raw product shape from FastAPI `/api/v1/catalog/products`. */
export type DigitalFile = {
  id: string;
  product_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  download_limit: number | null;
  expires_days: number | null;
  sort_order: number;
};

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
  product_type: "simple" | "variable" | "digital";
  visibility: ProductVisibility;
  brand: string | null;
  category: string | null;
  brand_id: string | null;
  category_id: string | null;
  attribute_profile_id: string | null;
  thumbnail: string | null;
  seo_title: string | null;
  seo_description: string | null;
  warranty: string | null;
  tags: string[];
  custom_specs_json: string | null;
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
  image_id: string | null;
  image_url: string | null;
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
  has_inventory: boolean;
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
  productType: "simple" | "variable" | "digital";
  categoryId: string | null;
  brandId: string | null;
  attributeProfileId: string | null;
  shortDescription: string;
  metaTitle: string;
  metaDescription: string;
  warranty: string | null;
  customSpecsJson: string | null;
  mediaLinks: ApiProductMediaLink[];
  variants: ApiProductVariant[];
  hasInventory: boolean;
  specs?: ProductSpecs;
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
    warranty: row.warranty ?? null,
    customSpecsJson: row.custom_specs_json ?? null,
    mediaLinks: row.media,
    variants: row.variants,
    hasInventory: row.has_inventory ?? false,
  };
}

export type CreateCatalogProductInput = {
  name: string;
  slug: string;
  sku: string;
  price: number;
  stock?: number;
  status?: ProductStatus;
  product_type?: "simple" | "variable" | "digital";
  visibility?: ProductVisibility;
  brand?: string;
  category?: string;
  brand_id?: string | null;
  category_id?: string | null;
  attribute_profile_id?: string | null;
  description?: string;
  short_description?: string;
  thumbnail?: string;
  seo_title?: string;
  seo_description?: string;
  warranty?: string | null;
  tags?: string[];
  compare_at_price?: number;
  custom_specs_json?: string | null;
};

export type ProductInventoryInput = {
  warehouse_id: string;
  on_hand?: number;
  min_qty?: number;
  unit_cost?: number;
};

export type ProductInventoryRecord = {
  id: string;
  warehouseId: string;
  warehouseName: string;
  variantId: string;
  onHand: number;
  minQty: number;
  unitCost: number;
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
  image_id?: string | null;
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
  if (input.attribute_profile_id !== undefined) payload.attribute_profile_id = input.attribute_profile_id;
  if (input.description !== undefined) payload.description = input.description;
  if (input.short_description !== undefined) payload.short_description = input.short_description;
  if (input.thumbnail !== undefined) payload.thumbnail = input.thumbnail;
  if (input.seo_title !== undefined) payload.seo_title = input.seo_title;
  if (input.seo_description !== undefined) payload.seo_description = input.seo_description;
  if (input.warranty !== undefined) payload.warranty = input.warranty;
  if (input.tags !== undefined) payload.tags = input.tags;
  if (input.custom_specs_json !== undefined) payload.custom_specs_json = input.custom_specs_json;
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
        image_id: v.image_id ?? null,
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

export async function checkCatalogProductSlug(
  slug: string,
  excludeId?: string,
): Promise<{ slug: string; available: boolean; message?: string | null }> {
  const params = new URLSearchParams({ slug });
  if (excludeId) params.set("exclude_id", excludeId);
  return apiFetch(`/api/v1/catalog/products/slug/check?${params.toString()}`);
}

function apiInventoryToRecord(row: {
  id: string;
  warehouse_id: string;
  warehouse_name: string;
  variant_id: string;
  on_hand: number;
  min_qty: number;
  unit_cost: string;
}): ProductInventoryRecord {
  return {
    id: row.id,
    warehouseId: row.warehouse_id,
    warehouseName: row.warehouse_name,
    variantId: row.variant_id,
    onHand: row.on_hand,
    minQty: row.min_qty,
    unitCost: parseFloat(row.unit_cost) || 0,
  };
}

export async function fetchProductInventory(productId: string): Promise<ProductInventoryRecord | null> {
  try {
    const res = await apiFetch<{ data: { id: string; warehouse_id: string; warehouse_name: string; variant_id: string; on_hand: number; min_qty: number; unit_cost: string } }>(
      `/api/v1/catalog/products/${productId}/inventory`,
    );
    return apiInventoryToRecord(res.data);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function fetchDigitalFiles(productId: string): Promise<DigitalFile[]> {
  const res = await apiFetch<{ data: DigitalFile[]; errors: string[] }>(
    `/api/v1/catalog/products/${productId}/digital-files`,
  );
  return res.data;
}

export async function uploadDigitalFile(productId: string, file: File): Promise<DigitalFile> {
  const { getApiBaseUrl } = await import("@/lib/api/client");
  const { getStoredAuthToken } = await import("@/lib/store/admin-auth-store");
  const form = new FormData();
  form.append("file", file);
  const token = getStoredAuthToken();
  const res = await fetch(`${getApiBaseUrl()}/api/v1/catalog/products/${productId}/digital-files`, {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json() as { data: DigitalFile };
  return json.data;
}

export async function deleteDigitalFile(productId: string, fileId: string): Promise<void> {
  await apiFetch(`/api/v1/catalog/products/${productId}/digital-files/${fileId}`, { method: "DELETE" });
}

export async function upsertProductInventory(
  productId: string,
  input: ProductInventoryInput,
): Promise<ProductInventoryRecord> {
  const res = await apiFetch<{ data: { id: string; warehouse_id: string; warehouse_name: string; variant_id: string; on_hand: number; min_qty: number; unit_cost: string } }>(
    `/api/v1/catalog/products/${productId}/inventory`,
    {
      method: "PUT",
      body: JSON.stringify({
        warehouse_id: input.warehouse_id,
        on_hand: input.on_hand,
        min_qty: input.min_qty,
        unit_cost: input.unit_cost,
      }),
    },
  );
  return apiInventoryToRecord(res.data);
}
