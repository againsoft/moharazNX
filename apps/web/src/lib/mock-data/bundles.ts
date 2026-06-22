export type BundleStatus = "draft" | "published" | "archived";

export type BundlePricingMode = "fixed" | "sum_discount";

export type BundleItem = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  isOptional: boolean;
  thumbnail?: string;
};

export type ProductBundle = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  status: BundleStatus;
  pricingMode: BundlePricingMode;
  bundlePrice: number;
  discountPercent: number;
  retailTotal: number;
  componentCount: number;
  componentsSummary: string;
  stock: number;
  thumbnail?: string;
  category: string;
  updatedAt: string;
  description?: string;
  components: BundleItem[];
};

export const BUNDLE_STATUS_LABELS: Record<BundleStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const BUNDLE_PRICING_LABELS: Record<BundlePricingMode, string> = {
  fixed: "Fixed price",
  sum_discount: "Sum − discount",
};

function calcRetailTotal(items: BundleItem[]) {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

function calcBundlePrice(
  retail: number,
  mode: BundlePricingMode,
  fixed: number,
  discountPercent: number,
) {
  if (mode === "fixed") return fixed;
  return Math.round(retail * (1 - discountPercent / 100));
}

function summaryFromItems(items: BundleItem[]) {
  const names = items.slice(0, 3).map((i) => i.productName.split(" ")[0]);
  const extra = items.length > 3 ? ` +${items.length - 3}` : "";
  return `${items.length} items · ${names.join(" + ")}${extra}`;
}

const bundleItems = {
  cameraKit: [
    {
      id: "bi_001",
      productId: "prod_0008",
      productName: "Smart Watch Series 5",
      sku: "SW-S5-001",
      quantity: 1,
      unitPrice: 12999,
      isOptional: false,
      thumbnail: "https://picsum.photos/seed/bi-watch/48/48",
    },
    {
      id: "bi_002",
      productId: "prod_0002",
      productName: "Wireless Earbuds Pro",
      sku: "WEB-PRO-002",
      quantity: 1,
      unitPrice: 3499,
      isOptional: false,
      thumbnail: "https://picsum.photos/seed/bi-earbuds/48/48",
    },
    {
      id: "bi_003",
      productId: "prod_0014",
      productName: "USB-C Hub 7-in-1",
      sku: "HUB-7IN1",
      quantity: 1,
      unitPrice: 1899,
      isOptional: true,
      thumbnail: "https://picsum.photos/seed/bi-hub/48/48",
    },
  ] satisfies BundleItem[],
  officeDesk: [
    {
      id: "bi_004",
      productId: "prod_0010",
      productName: "LED Desk Lamp",
      sku: "LAMP-LED",
      quantity: 1,
      unitPrice: 2199,
      isOptional: false,
      thumbnail: "https://picsum.photos/seed/bi-lamp/48/48",
    },
    {
      id: "bi_005",
      productId: "prod_0012",
      productName: "Stainless Water Bottle",
      sku: "BOTTLE-SS",
      quantity: 2,
      unitPrice: 899,
      isOptional: false,
      thumbnail: "https://picsum.photos/seed/bi-bottle/48/48",
    },
    {
      id: "bi_006",
      productId: "prod_0013",
      productName: "Graphic Hoodie",
      sku: "HOOD-GFX",
      quantity: 1,
      unitPrice: 2799,
      isOptional: false,
      thumbnail: "https://picsum.photos/seed/bi-hoodie/48/48",
    },
  ] satisfies BundleItem[],
  yogaStarter: [
    {
      id: "bi_007",
      productId: "prod_0009",
      productName: "Yoga Mat Pro",
      sku: "YOGA-MAT",
      quantity: 1,
      unitPrice: 2499,
      isOptional: false,
      thumbnail: "https://picsum.photos/seed/bi-yoga/48/48",
    },
    {
      id: "bi_008",
      productId: "prod_0008",
      productName: "Organic Face Serum",
      sku: "SERUM-ORG",
      quantity: 1,
      unitPrice: 1599,
      isOptional: false,
      thumbnail: "https://picsum.photos/seed/bi-serum/48/48",
    },
  ] satisfies BundleItem[],
};

function makeBundle(
  partial: Omit<
    ProductBundle,
    "retailTotal" | "componentCount" | "componentsSummary" | "bundlePrice"
  > & { bundlePrice?: number },
): ProductBundle {
  const retailTotal = calcRetailTotal(partial.components);
  const bundlePrice = calcBundlePrice(
    retailTotal,
    partial.pricingMode,
    partial.bundlePrice ?? retailTotal,
    partial.discountPercent,
  );
  return {
    ...partial,
    retailTotal,
    bundlePrice,
    componentCount: partial.components.length,
    componentsSummary: summaryFromItems(partial.components),
  };
}

export const bundlesSeed: ProductBundle[] = [
  makeBundle({
    id: "bnd_tech_starter",
    name: "Tech Starter Kit",
    slug: "tech-starter-kit",
    sku: "BND-TECH-001",
    status: "published",
    pricingMode: "sum_discount",
    discountPercent: 15,
    stock: 42,
    thumbnail: "https://picsum.photos/seed/bnd-tech/64/64",
    category: "Electronics",
    updatedAt: "2026-06-12",
    description: "Watch, earbuds, and optional USB hub at bundle pricing.",
    components: bundleItems.cameraKit,
  }),
  makeBundle({
    id: "bnd_office_essentials",
    name: "Office Desk Essentials",
    slug: "office-desk-essentials",
    sku: "BND-OFFICE-002",
    status: "published",
    pricingMode: "fixed",
    discountPercent: 0,
    bundlePrice: 5999,
    stock: 28,
    thumbnail: "https://picsum.photos/seed/bnd-office/64/64",
    category: "Home & Office",
    updatedAt: "2026-06-11",
    components: bundleItems.officeDesk,
  }),
  makeBundle({
    id: "bnd_yoga_wellness",
    name: "Yoga & Wellness Pack",
    slug: "yoga-wellness-pack",
    sku: "BND-YOGA-003",
    status: "published",
    pricingMode: "sum_discount",
    discountPercent: 10,
    stock: 65,
    thumbnail: "https://picsum.photos/seed/bnd-yoga/64/64",
    category: "Sports",
    updatedAt: "2026-06-10",
    components: bundleItems.yogaStarter,
  }),
  makeBundle({
    id: "bnd_coffee_gift",
    name: "Coffee Lover Gift Set",
    slug: "coffee-lover-gift-set",
    sku: "BND-COFFEE-004",
    status: "draft",
    pricingMode: "fixed",
    discountPercent: 0,
    bundlePrice: 3499,
    stock: 0,
    thumbnail: "https://picsum.photos/seed/bnd-coffee/64/64",
    category: "Home & Living",
    updatedAt: "2026-06-09",
    components: [
      {
        id: "bi_009",
        productId: "prod_0003",
        productName: "Ceramic Coffee Mug Set",
        sku: "MUG-CER-003",
        quantity: 2,
        unitPrice: 1299,
        isOptional: false,
        thumbnail: "https://picsum.photos/seed/bi-mug/48/48",
      },
      {
        id: "bi_010",
        productId: "prod_0015",
        productName: "Scented Candle Pack",
        sku: "CANDLE-PK",
        quantity: 1,
        unitPrice: 999,
        isOptional: false,
        thumbnail: "https://picsum.photos/seed/bi-candle/48/48",
      },
    ],
  }),
  makeBundle({
    id: "bnd_running_gear",
    name: "Running Gear Combo",
    slug: "running-gear-combo",
    sku: "BND-RUN-005",
    status: "published",
    pricingMode: "sum_discount",
    discountPercent: 20,
    stock: 15,
    thumbnail: "https://picsum.photos/seed/bnd-run/64/64",
    category: "Sports",
    updatedAt: "2026-06-08",
    components: [
      {
        id: "bi_011",
        productId: "prod_0004",
        productName: "Running Shoes Ultra",
        sku: "RUN-ULTRA",
        quantity: 1,
        unitPrice: 5999,
        isOptional: false,
        thumbnail: "https://picsum.photos/seed/bi-shoes/48/48",
      },
      {
        id: "bi_012",
        productId: "prod_0012",
        productName: "Stainless Water Bottle",
        sku: "BOTTLE-SS",
        quantity: 1,
        unitPrice: 899,
        isOptional: false,
        thumbnail: "https://picsum.photos/seed/bi-bottle/48/48",
      },
    ],
  }),
  makeBundle({
    id: "bnd_beauty_glow",
    name: "Glow Up Beauty Bundle",
    slug: "glow-up-beauty-bundle",
    sku: "BND-GLOW-006",
    status: "published",
    pricingMode: "fixed",
    discountPercent: 0,
    bundlePrice: 4299,
    stock: 33,
    thumbnail: "https://picsum.photos/seed/bnd-glow/64/64",
    category: "Beauty",
    updatedAt: "2026-06-07",
    components: [
      {
        id: "bi_013",
        productId: "prod_0008",
        productName: "Organic Face Serum",
        sku: "SERUM-ORG",
        quantity: 1,
        unitPrice: 1599,
        isOptional: false,
        thumbnail: "https://picsum.photos/seed/bi-serum/48/48",
      },
      {
        id: "bi_014",
        productId: "prod_0001",
        productName: "Premium Cotton T-Shirt",
        sku: "TEE-COT-001",
        quantity: 2,
        unitPrice: 1299,
        isOptional: false,
        thumbnail: "https://picsum.photos/seed/bi-tee/48/48",
      },
    ],
  }),
  makeBundle({
    id: "bnd_summer_fashion",
    name: "Summer Fashion Set",
    slug: "summer-fashion-set",
    sku: "BND-SUM-007",
    status: "archived",
    pricingMode: "sum_discount",
    discountPercent: 25,
    stock: 0,
    thumbnail: "https://picsum.photos/seed/bnd-summer/64/64",
    category: "Fashion",
    updatedAt: "2025-08-20",
    components: [
      {
        id: "bi_015",
        productId: "prod_0006",
        productName: "Linen Summer Dress",
        sku: "DRESS-LIN",
        quantity: 1,
        unitPrice: 3999,
        isOptional: false,
        thumbnail: "https://picsum.photos/seed/bi-dress/48/48",
      },
      {
        id: "bi_016",
        productId: "prod_0011",
        productName: "Leather Wallet",
        sku: "WALLET-LTH",
        quantity: 1,
        unitPrice: 1899,
        isOptional: false,
        thumbnail: "https://picsum.photos/seed/bi-wallet/48/48",
      },
    ],
  }),
  makeBundle({
    id: "bnd_speaker_party",
    name: "Party Speaker Pack",
    slug: "party-speaker-pack",
    sku: "BND-PARTY-008",
    status: "draft",
    pricingMode: "sum_discount",
    discountPercent: 12,
    stock: 8,
    thumbnail: "https://picsum.photos/seed/bnd-party/64/64",
    category: "Electronics",
    updatedAt: "2026-06-05",
    components: [
      {
        id: "bi_017",
        productId: "prod_0007",
        productName: "Bluetooth Speaker Mini",
        sku: "SPK-MINI",
        quantity: 2,
        unitPrice: 2499,
        isOptional: false,
        thumbnail: "https://picsum.photos/seed/bi-speaker/48/48",
      },
    ],
  }),
];

export function formatBdt(amount: number) {
  return `৳${amount.toLocaleString("en-BD")}`;
}

export function bundleSavings(bundle: ProductBundle) {
  return Math.max(0, bundle.retailTotal - bundle.bundlePrice);
}

export function bundleSavingsPercent(bundle: ProductBundle) {
  if (bundle.retailTotal <= 0) return 0;
  return Math.round((bundleSavings(bundle) / bundle.retailTotal) * 100);
}

export function recalcBundle(bundle: Partial<ProductBundle> & { components: BundleItem[] }): Pick<
  ProductBundle,
  "retailTotal" | "bundlePrice" | "componentCount" | "componentsSummary"
> {
  const retailTotal = calcRetailTotal(bundle.components);
  const pricingMode = bundle.pricingMode ?? "fixed";
  const discountPercent = bundle.discountPercent ?? 0;
  const bundlePrice = calcBundlePrice(
    retailTotal,
    pricingMode,
    bundle.bundlePrice ?? retailTotal,
    discountPercent,
  );
  return {
    retailTotal,
    bundlePrice,
    componentCount: bundle.components.length,
    componentsSummary: summaryFromItems(bundle.components),
  };
}
