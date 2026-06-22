import {
  demoVariants,
  getProductBySlug,
  getRelatedProducts,
  products,
  type Product,
  type ProductVariant,
} from "./products";
import { toStorefrontProduct } from "./storefront-home";

export type ProductSpecGroup = {
  name: string;
  specs: { label: string; value: string }[];
};

export type ProductReview = {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
};

export type ProductQuestion = {
  id: string;
  question: string;
  answer: string;
  author: string;
  date: string;
};

const CATEGORY_SLUG: Record<string, string> = {
  Apparel: "apparel",
  Electronics: "electronics",
  Home: "home",
  Beauty: "beauty",
  Sports: "sports",
  Books: "books",
};

export function getProductGallery(product: Product, variant?: ProductVariant) {
  if (variant?.gallery?.length) return variant.gallery;
  const thumb = product.thumbnail;
  if (thumb && !thumb.includes("picsum.photos")) {
    const large = thumb.includes("placehold.co")
      ? thumb.replace(/(\d+)x(\d+)/, "800x800")
      : thumb.replace("w=600", "w=800").replace("h=600", "h=800");
    return [thumb, large];
  }
  return [
    `https://picsum.photos/seed/${product.id}-1/800/800`,
    `https://picsum.photos/seed/${product.id}-2/800/800`,
    `https://picsum.photos/seed/${product.id}-3/800/800`,
    `https://picsum.photos/seed/${product.id}-4/800/800`,
  ];
}

export type CombinedGalleryData = {
  allImages: string[];
  variantGalleries: Record<string, string[]>;
  variantStartIndex: Record<string, number>;
};

/** Merge base + all variant galleries; track where each variant's images start */
export function buildCombinedGallery(product: Product, variants: ProductVariant[]): CombinedGalleryData {
  const baseGallery = getProductGallery(product);
  const variantGalleries: Record<string, string[]> = {};
  const allImages: string[] = [];
  const seen = new Set<string>();

  const pushUnique = (url: string) => {
    if (!seen.has(url)) {
      seen.add(url);
      allImages.push(url);
    }
  };

  baseGallery.forEach(pushUnique);

  for (const v of variants) {
    const imgs = v.gallery?.length ? v.gallery : baseGallery;
    variantGalleries[v.id] = imgs;
    imgs.forEach(pushUnique);
  }

  const variantStartIndex: Record<string, number> = {};
  for (const v of variants) {
    const first = variantGalleries[v.id]?.[0];
    if (first) variantStartIndex[v.id] = allImages.indexOf(first);
  }

  return { allImages, variantGalleries, variantStartIndex };
}

const TECH_CATEGORIES = new Set([
  "Electronics",
  "Laptops",
  "Gaming Laptop",
  "Components",
  "Monitors",
  "Phones",
  "Accessories",
  "Networking",
  "Gaming PC",
]);

function isTechProduct(product: Product) {
  return product.id.startsWith("cs_") || TECH_CATEGORIES.has(product.category);
}

export function getProductVariants(product: Product): ProductVariant[] {
  if (isTechProduct(product)) {
    return demoVariants.map((v) => ({
      ...v,
      gallery: v.gallery.length ? v.gallery : getProductGallery(product, v),
    }));
  }

  const colors = ["Black", "White", "Navy"];
  const sizes = ["S", "M", "L", "XL"];
  const out: ProductVariant[] = [];
  colors.forEach((color, ci) => {
    sizes.forEach((size, si) => {
      const idx = ci * sizes.length + si;
      out.push({
        id: `${product.id}-v${idx}`,
        label: `${color} / ${size}`,
        color,
        price: product.price + si * 100,
        stock: Math.max(0, product.stock - idx * 3),
        sku: `${product.sku}-${color[0]}${size}`,
        gallery: [
          `https://picsum.photos/seed/${product.id}-${color}-${size}/800/800`,
          `https://picsum.photos/seed/${product.id}-${color}-alt/800/800`,
        ],
      });
    });
  });
  return out.slice(0, 6);
}

export function getProductSpecs(product: Product): ProductSpecGroup[] {
  if (product.id === "prod_0002") {
    return [
      {
        name: "General",
        specs: [
          { label: "Brand", value: product.brand },
          { label: "Model", value: product.name },
          { label: "SKU", value: product.sku },
          { label: "Warranty", value: "1 year official" },
        ],
      },
      {
        name: "Audio",
        specs: [
          { label: "Driver", value: "10mm dynamic" },
          { label: "ANC", value: "Hybrid active noise cancellation" },
          { label: "Battery (buds)", value: "Up to 8 hours" },
          { label: "Battery (case)", value: "32 hours total" },
        ],
      },
      {
        name: "Connectivity",
        specs: [
          { label: "Bluetooth", value: "5.3" },
          { label: "Range", value: "10 m" },
          { label: "Water resistance", value: "IPX5" },
        ],
      },
    ];
  }

  if (isTechProduct(product)) {
    return [
      {
        name: "General",
        specs: [
          { label: "Brand", value: product.brand },
          { label: "Model", value: product.name },
          { label: "SKU", value: product.sku },
          { label: "Warranty", value: "1 year official" },
        ],
      },
      {
        name: "Display",
        specs: [
          { label: "Screen size", value: '6.1"' },
          { label: "Resolution", value: "2556 × 1179" },
          { label: "Panel", value: "OLED" },
        ],
      },
      {
        name: "Performance",
        specs: [
          { label: "Processor", value: "Octa-core" },
          { label: "RAM", value: "8GB / 12GB" },
          { label: "Storage", value: "128GB / 256GB" },
        ],
      },
    ];
  }

  return [
    {
      name: "Details",
      specs: [
        { label: "Brand", value: product.brand },
        { label: "Material", value: "Premium cotton blend" },
        { label: "Care", value: "Machine wash cold" },
        { label: "Origin", value: "Bangladesh" },
      ],
    },
    {
      name: "Dimensions",
      specs: [
        { label: "Weight", value: "320g" },
        { label: "Package", value: "Recyclable box" },
      ],
    },
  ];
}

export function getProductReviews(product: Product): ProductReview[] {
  return [
    {
      id: "pr1",
      author: "Fatima R.",
      rating: 5,
      title: "Worth every taka",
      body: `Really happy with ${product.name}. Quality exceeded expectations and delivery was fast.`,
      date: "Jun 10, 2026",
      verified: true,
    },
    {
      id: "pr2",
      author: "Karim H.",
      rating: 4,
      title: "Good value",
      body: "Solid product for the price. Would recommend to friends.",
      date: "Jun 5, 2026",
      verified: true,
    },
    {
      id: "pr3",
      author: "Nadia S.",
      rating: 5,
      title: "Perfect gift",
      body: "Bought as a gift — recipient loved it. Packaging was premium.",
      date: "May 28, 2026",
      verified: false,
    },
  ];
}

export function getProductQuestions(): ProductQuestion[] {
  return [
    {
      id: "q1",
      question: "Is this product covered by warranty?",
      answer: "Yes — 1 year manufacturer warranty with proof of purchase.",
      author: "Store team",
      date: "Jun 1, 2026",
    },
    {
      id: "q2",
      question: "Can I return if it doesn't fit?",
      answer: "Absolutely. Free returns within 30 days for unused items in original packaging.",
      author: "Store team",
      date: "May 20, 2026",
    },
  ];
}

export function getAiSummary(product: Product) {
  return [
    `Highly rated ${product.category.toLowerCase()} item from ${product.brand}.`,
    "Customers praise build quality and fast delivery.",
    product.compareAtPrice ? "Currently on sale — limited time offer." : "Competitive everyday pricing.",
    product.stock <= 10 && product.stock > 0 ? "Low stock — order soon." : "In stock and ready to ship.",
  ];
}

export function getCrossSellProducts(productId: string) {
  return getRelatedProducts(productId, 3).map((p, i) => toStorefrontProduct(p, i));
}

export function getUpsellProducts(productId: string) {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];
  return products
    .filter((p) => p.id !== productId && p.status === "published" && p.price > product.price)
    .slice(0, 4)
    .map((p, i) => toStorefrontProduct(p, i));
}

export function getStorefrontProductDetail(slug: string) {
  const product = getProductBySlug(slug);
  if (!product || product.status !== "published") return null;

  const variants = getProductVariants(product);
  const galleryData = buildCombinedGallery(product, variants);
  const reviews = getProductReviews(product);
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return {
    product,
    categorySlug: CATEGORY_SLUG[product.category] ?? "products",
    variants,
    gallery: galleryData.allImages,
    galleryData,
    specs: getProductSpecs(product),
    reviews,
    reviewCount: 24 + (product.id.charCodeAt(6) ?? 0) % 80,
    avgRating,
    questions: getProductQuestions(),
    aiSummary: getAiSummary(product),
    related: getRelatedProducts(product.id, 4).map((p, i) => toStorefrontProduct(p, i)),
    crossSell: getCrossSellProducts(product.id),
    upsell: getUpsellProducts(product.id),
    shipping: {
      standard: "Delivery in 2–4 business days · Free over ৳2,000",
      express: "Next-day delivery in Dhaka — ৳150",
      returns: "Free 30-day returns",
    },
    warranty: product.category === "Electronics" ? "1 year official warranty" : "30-day quality guarantee",
  };
}

export type StorefrontProductDetail = NonNullable<ReturnType<typeof getStorefrontProductDetail>>;
