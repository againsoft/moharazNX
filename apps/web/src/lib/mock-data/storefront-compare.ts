import type { CompareItem, CompareProductInput } from "@/lib/store/storefront-compare-store";
import { formatCurrency } from "@/lib/utils";
import { getProductById } from "./products";
import { getProductReviews, getProductSpecs, type ProductSpecGroup } from "./storefront-product";
import type { StorefrontProduct } from "./storefront-home";

export type CompareRow = {
  label: string;
  group?: string;
  values: (string | null)[];
  differs: boolean;
};

export type CompareProductDetail = CompareItem & {
  specs: ProductSpecGroup[];
  specMap: Record<string, string>;
};

export function buildCompareProductDetail(item: CompareItem): CompareProductDetail | null {
  const product = getProductById(item.productId);
  if (!product) return null;

  const specs = getProductSpecs(product);
  const specMap: Record<string, string> = {};
  for (const group of specs) {
    for (const spec of group.specs) {
      specMap[spec.label] = spec.value;
    }
  }

  return { ...item, specs, specMap };
}

export function buildCompareRows(products: CompareProductDetail[]): CompareRow[] {
  if (products.length === 0) return [];

  const baseRows: CompareRow[] = [
    {
      label: "Price",
      group: "Overview",
      values: products.map((p) => formatCurrency(p.price)),
      differs: new Set(products.map((p) => p.price)).size > 1,
    },
    {
      label: "Brand",
      group: "Overview",
      values: products.map((p) => p.brand),
      differs: new Set(products.map((p) => p.brand)).size > 1,
    },
    {
      label: "Category",
      group: "Overview",
      values: products.map((p) => p.category),
      differs: new Set(products.map((p) => p.category)).size > 1,
    },
    {
      label: "Rating",
      group: "Overview",
      values: products.map((p) => `${p.rating.toFixed(1)} (${p.reviewCount})`),
      differs: new Set(products.map((p) => p.rating.toFixed(1))).size > 1,
    },
    {
      label: "Availability",
      group: "Overview",
      values: products.map((p) => (p.stock > 0 ? "In stock" : "Out of stock")),
      differs: new Set(products.map((p) => (p.stock > 0 ? "yes" : "no"))).size > 1,
    },
  ];

  const specLabels = new Map<string, string>();
  for (const product of products) {
    for (const group of product.specs) {
      for (const spec of group.specs) {
        if (!specLabels.has(spec.label)) {
          specLabels.set(spec.label, group.name);
        }
      }
    }
  }

  const specRows: CompareRow[] = [...specLabels.entries()].map(([label, group]) => {
    const values = products.map((p) => p.specMap[label] ?? "—");
    return {
      label,
      group,
      values,
      differs: new Set(values).size > 1,
    };
  });

  return [...baseRows, ...specRows];
}

export function compareItemFromProductId(
  productId: string,
  meta?: Partial<Pick<CompareItem, "rating" | "reviewCount" | "image">>,
): CompareProductInput | null {
  const product = getProductById(productId);
  if (!product) return null;

  const reviews = getProductReviews(product);
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return {
    productId: product.id,
    slug: product.sku.toLowerCase(),
    name: product.name,
    image: meta?.image ?? `https://picsum.photos/seed/${product.id}/600/600`,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    brand: product.brand,
    category: product.category,
    stock: product.stock,
    rating: meta?.rating ?? avgRating,
    reviewCount: meta?.reviewCount ?? 24 + (product.id.charCodeAt(6) ?? 0) % 80,
  };
}

export function resolveCompareIds(ids: string[]): CompareProductInput[] {
  return ids
    .map((id) => compareItemFromProductId(id.trim()))
    .filter((item): item is CompareProductInput => item != null);
}

export function compareInputFromStorefrontProduct(product: StorefrontProduct): CompareProductInput {
  const full = getProductById(product.id);
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: product.image,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    brand: product.brand,
    category: full?.category ?? "General",
    stock: full?.stock ?? 0,
    rating: product.rating,
    reviewCount: product.reviewCount,
  };
}
