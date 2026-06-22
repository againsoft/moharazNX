import { products } from "@/lib/mock-data/products";
import { computerStoreProducts, getComputerHomepageDeals } from "@/lib/mock-data/storefront-computer-store";
import {
  flashSalesSeed,
  type FlashSale,
  type FlashSaleItem,
  type FlashSaleStatus,
} from "@/lib/mock-data/flash-sales";
import {
  describeOffer,
  specialOffersSeed,
  type SpecialOffer,
  type SpecialOfferStatus,
} from "@/lib/mock-data/special-offers";
import { useFlashSaleStore } from "@/lib/store/flash-sale-store";
import { useSpecialOfferStore } from "@/lib/store/special-offer-store";
import { toStorefrontProduct, type StorefrontProduct } from "@/lib/mock-data/storefront-home";
import type { OfferLabel } from "@/lib/storefront/storefront-offer-types";

function resolveCatalogProduct(productId: string) {
  return (
    products.find((p) => p.id === productId) ??
    computerStoreProducts.find((p) => p.id === productId)
  );
}

function catalogToStorefront(
  catalog: NonNullable<ReturnType<typeof resolveCatalogProduct>>,
  index: number,
): StorefrontProduct {
  const cs = computerStoreProducts.find((p) => p.id === catalog.id || p.slug === catalog.slug);
  if (cs) {
    return {
      id: cs.id,
      slug: cs.slug,
      name: cs.name,
      price: cs.price,
      compareAtPrice: cs.compareAtPrice,
      image: cs.thumbnail,
      brand: cs.brand,
      rating: 4.2 + (index % 8) * 0.1,
      reviewCount: 24 + (index % 120),
    };
  }
  return toStorefrontProduct(catalog, index);
}

export type ProductOfferView = {
  displayPrice: number;
  compareAtPrice?: number;
  discountPercent: number;
  flashSale?: { id: string; name: string; slug: string; endsAt: string };
  labels: OfferLabel[];
};

function effectiveFlashStatus(sale: FlashSale): FlashSaleStatus {
  if (sale.status === "draft" || sale.status === "cancelled") return sale.status;
  const now = Date.now();
  const start = new Date(sale.startsAt).getTime();
  const end = new Date(sale.endsAt).getTime();
  if (now < start) return "scheduled";
  if (now <= end) return "running";
  return "completed";
}

function effectiveSpecialStatus(offer: SpecialOffer): SpecialOfferStatus {
  if (offer.status === "draft" || offer.status === "cancelled") return offer.status;
  const now = Date.now();
  const start = new Date(offer.startsAt).getTime();
  const end = new Date(offer.endsAt).getTime();
  if (now < start) return "scheduled";
  if (now <= end) return "running";
  return "completed";
}

export function getOfferSources() {
  return {
    flashSales: useFlashSaleStore.getState().sales,
    specialOffers: useSpecialOfferStore.getState().offers,
  };
}

/** Seed fallback for SSR — avoid zustand persist on server */
export function getOfferSourcesWithFallback() {
  if (typeof window === "undefined") {
    return { flashSales: flashSalesSeed, specialOffers: specialOffersSeed };
  }
  const { flashSales, specialOffers } = getOfferSources();
  return {
    flashSales: flashSales.length ? flashSales : flashSalesSeed,
    specialOffers: specialOffers.length ? specialOffers : specialOffersSeed,
  };
}

export function getActiveFlashSales(flashSales = getOfferSourcesWithFallback().flashSales) {
  return flashSales.filter((s) => effectiveFlashStatus(s) === "running");
}

export function getActiveSpecialOffers(
  specialOffers = getOfferSourcesWithFallback().specialOffers,
) {
  return specialOffers.filter((o) => effectiveSpecialStatus(o) === "running");
}

export function getPrimaryRunningFlashSale(
  flashSales = getOfferSourcesWithFallback().flashSales,
) {
  const active = getActiveFlashSales(flashSales).filter((s) => s.showOnDealsPage);
  return active.sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime())[0] ?? null;
}

export function getFlashSaleItemForProduct(
  productId: string,
  flashSales = getOfferSourcesWithFallback().flashSales,
): { sale: FlashSale; item: FlashSaleItem } | null {
  for (const sale of getActiveFlashSales(flashSales)) {
    const item = sale.items.find((i) => i.productId === productId);
    if (item) return { sale, item };
  }
  return null;
}

function productInSpecialOffer(offer: SpecialOffer, productId: string, category?: string) {
  if (offer.offerType === "bogo" && offer.bogo) {
    return (
      offer.bogo.buyProduct.productId === productId ||
      offer.bogo.getProduct.productId === productId
    );
  }
  if (offer.offerType === "bundle" && offer.bundle) {
    return offer.bundle.items.some((i) => i.productId === productId);
  }
  if (offer.offerType === "gift_with_purchase" && offer.gift) {
    return (
      offer.gift.giftProduct.productId === productId ||
      offer.gift.qualifyingProducts.some((p) => p.productId === productId)
    );
  }
  if (offer.offerType === "tiered" && offer.tiered) {
    if (offer.tiered.targetProduct?.productId === productId) return true;
    if (category && offer.tiered.targetCategory && offer.tiered.targetCategory === category) {
      return true;
    }
  }
  return false;
}

export function getSpecialOfferLabelsForProduct(
  productId: string,
  specialOffers = getOfferSourcesWithFallback().specialOffers,
  category?: string,
): OfferLabel[] {
  const labels: OfferLabel[] = [];
  for (const offer of getActiveSpecialOffers(specialOffers)) {
    if (!productInSpecialOffer(offer, productId, category)) continue;
    const show = offer.showOnPdp || offer.showBadge;
    if (!show) continue;
    labels.push({
      text: describeOffer(offer),
      type: offer.offerType,
    });
  }
  return labels;
}

export function resolveProductOffer(
  productId: string,
  catalogPrice: number,
  catalogCompareAt?: number,
  category?: string,
  sources = getOfferSourcesWithFallback(),
): ProductOfferView {
  const flash = getFlashSaleItemForProduct(productId, sources.flashSales);
  const labels = getSpecialOfferLabelsForProduct(
    productId,
    sources.specialOffers,
    category,
  );

  if (flash) {
    const { sale, item } = flash;
    const compareAt = item.originalPrice;
    const displayPrice = item.salePrice;
    const discountPercent = Math.round(
      ((compareAt - displayPrice) / compareAt) * 100,
    );
    return {
      displayPrice,
      compareAtPrice: compareAt,
      discountPercent,
      flashSale: {
        id: sale.id,
        name: sale.name,
        slug: sale.slug,
        endsAt: sale.endsAt,
      },
      labels: [
        { text: sale.name, type: "flash" },
        ...labels,
      ],
    };
  }

  const compareAt =
    catalogCompareAt && catalogCompareAt > catalogPrice
      ? catalogCompareAt
      : undefined;
  const discountPercent = compareAt
    ? Math.round(((compareAt - catalogPrice) / compareAt) * 100)
    : 0;

  return {
    displayPrice: catalogPrice,
    compareAtPrice: compareAt,
    discountPercent,
    labels,
  };
}

export function enrichStorefrontProduct<T extends StorefrontProduct>(
  product: T,
  category?: string,
): T & { offerLabels: OfferLabel[]; flashSaleName?: string } {
  const offer = resolveProductOffer(
    product.id,
    product.price,
    product.compareAtPrice,
    category,
  );
  const hasFlash = !!offer.flashSale;
  return {
    ...product,
    price: offer.displayPrice,
    compareAtPrice: offer.compareAtPrice,
    badge: hasFlash || offer.discountPercent > 0 ? "sale" : product.badge,
    offerLabels: offer.labels,
    flashSaleName: offer.flashSale?.name,
  };
}

export function buildDealProductsFromAdmin(
  flashSales = getOfferSourcesWithFallback().flashSales,
): Array<
  StorefrontProduct & {
    discountPercent: number;
    savings: number;
    offerLabels?: OfferLabel[];
    flashSaleName?: string;
  }
> {
  const active = getActiveFlashSales(flashSales).filter((s) => s.showOnDealsPage);
  const seen = new Set<string>();
  const deals: Array<
    StorefrontProduct & {
      discountPercent: number;
      savings: number;
      offerLabels?: OfferLabel[];
      flashSaleName?: string;
    }
  > = [];

  for (const sale of active) {
    for (const item of sale.items) {
      if (seen.has(item.productId)) continue;
      seen.add(item.productId);
      const catalog = resolveCatalogProduct(item.productId);
      if (!catalog || catalog.status !== "published") continue;
      const base = catalogToStorefront(catalog, deals.length);
      const discountPercent = Math.round(
        ((item.originalPrice - item.salePrice) / item.originalPrice) * 100,
      );
      deals.push({
        ...base,
        price: item.salePrice,
        compareAtPrice: item.originalPrice,
        badge: "sale",
        discountPercent,
        savings: item.originalPrice - item.salePrice,
        offerLabels: [{ text: sale.name, type: "flash" }],
        flashSaleName: sale.name,
      });
    }
  }

  return deals.sort((a, b) => b.discountPercent - a.discountPercent);
}

export function buildHomepageDealProducts(
  limit = 6,
  flashSales = getOfferSourcesWithFallback().flashSales,
): StorefrontProduct[] {
  const active = getActiveFlashSales(flashSales).filter((s) => s.showOnHomepage);
  const items: StorefrontProduct[] = [];
  const seen = new Set<string>();

  for (const sale of active) {
    for (const item of sale.items) {
      if (seen.has(item.productId) || items.length >= limit) continue;
      seen.add(item.productId);
      const catalog = resolveCatalogProduct(item.productId);
      if (!catalog) continue;
      const base = catalogToStorefront(catalog, items.length);
      items.push(
        enrichStorefrontProduct(
          {
            ...base,
            price: item.salePrice,
            compareAtPrice: item.originalPrice,
            badge: "sale",
          },
          catalog.category,
        ),
      );
    }
  }

  if (items.length >= limit) return items.slice(0, limit);
  return getComputerHomepageDeals(limit);
}

export function getCartSpecialOfferHints(
  productIds: string[],
  specialOffers = getOfferSourcesWithFallback().specialOffers,
) {
  const hints: string[] = [];
  for (const offer of getActiveSpecialOffers(specialOffers)) {
    if (!offer.showOnCart) continue;
    const matches = productIds.some((id) => productInSpecialOffer(offer, id));
    if (matches) hints.push(describeOffer(offer));
  }
  return [...new Set(hints)];
}
