import { demoVariants, products, type Product, type ProductVariant } from "./products";

export type VariantDimension = {
  id: string;
  name: string;
  values: string[];
};

export type VariantMatrixRow = {
  id: string;
  label: string;
  dimensions: Record<string, string>;
  sku: string;
  price: number;
  stock: number;
  barcode?: string;
  isDefault?: boolean;
};

export type CatalogVariantRow = {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  variantLabel: string;
  variantSku: string;
  price: number;
  stock: number;
  status: Product["status"];
  category: string;
  isDefault?: boolean;
};

export const VARIANT_DIMENSION_PRESETS: Record<string, VariantDimension[]> = {
  Apparel: [
    { id: "color", name: "Color", values: ["Black", "White"] },
    { id: "size", name: "Size", values: ["S", "M", "L"] },
  ],
  Electronics: [
    { id: "color", name: "Color", values: ["Black", "Silver", "Blue"] },
    { id: "storage", name: "Storage", values: ["128GB", "256GB"] },
  ],
  default: [
    { id: "option", name: "Option", values: ["Standard", "Premium"] },
  ],
};

export function cloneDimensions(preset: VariantDimension[]): VariantDimension[] {
  return preset.map((d) => ({ ...d, values: [...d.values] }));
}

export function cartesianProduct(dimensions: VariantDimension[]): Record<string, string>[] {
  const active = dimensions.filter((d) => d.name.trim() && d.values.length > 0);
  if (active.length === 0) return [];

  return active.reduce<Record<string, string>[]>(
    (acc, dim) => {
      const next: Record<string, string>[] = [];
      for (const row of acc) {
        for (const value of dim.values) {
          next.push({ ...row, [dim.name]: value });
        }
      }
      return next;
    },
    [{}],
  );
}

export function buildVariantLabel(dimensions: Record<string, string>): string {
  return Object.values(dimensions).join(" / ");
}

export function slugifySkuPart(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 12);
}

export function generateMatrixRows(
  dimensions: VariantDimension[],
  baseSku: string,
  basePrice: number,
): VariantMatrixRow[] {
  const combos = cartesianProduct(dimensions);
  const prefix = (baseSku || "SKU").toUpperCase();

  return combos.map((combo, index) => {
    const parts = Object.values(combo).map(slugifySkuPart).filter(Boolean);
    return {
      id: `row_${index + 1}`,
      label: buildVariantLabel(combo),
      dimensions: combo,
      sku: parts.length ? `${prefix}-${parts.join("-")}` : `${prefix}-${index + 1}`,
      price: basePrice,
      stock: 0,
      isDefault: index === 0,
    };
  });
}

export function variantToMatrixRow(variant: ProductVariant): VariantMatrixRow {
  const dimensions: Record<string, string> = { Color: variant.color };
  if (variant.storage) dimensions.Storage = variant.storage;
  if (variant.ram) dimensions.RAM = variant.ram;

  return {
    id: variant.id,
    label: variant.label,
    dimensions,
    sku: variant.sku,
    price: variant.price,
    stock: variant.stock,
    isDefault: variant.id === demoVariants[0]?.id,
  };
}

export function getPresetDimensions(category?: string): VariantDimension[] {
  const key = category && category in VARIANT_DIMENSION_PRESETS ? category : "default";
  return cloneDimensions(VARIANT_DIMENSION_PRESETS[key]);
}

/** Global sellable SKU list — variable children + simple products as single row */
export function getAllCatalogVariants(): CatalogVariantRow[] {
  const rows: CatalogVariantRow[] = [];

  for (const product of products) {
    if (product.category === "Electronics" && product.id === "prod_0002") {
      for (const variant of demoVariants) {
        rows.push({
          id: `${product.id}_${variant.id}`,
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          variantLabel: variant.label,
          variantSku: variant.sku,
          price: variant.price,
          stock: variant.stock,
          status: product.status,
          category: product.category,
          isDefault: variant.id === demoVariants[0]?.id,
        });
      }
      continue;
    }

    rows.push({
      id: `${product.id}_simple`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      variantLabel: "Default",
      variantSku: product.sku,
      price: product.price,
      stock: product.stock,
      status: product.status,
      category: product.category,
      isDefault: true,
    });
  }

  return rows;
}
