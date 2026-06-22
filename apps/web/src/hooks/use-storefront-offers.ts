"use client";

import { useMemo } from "react";
import { useFlashSaleStore } from "@/lib/store/flash-sale-store";
import { useSpecialOfferStore } from "@/lib/store/special-offer-store";
import {
  buildDealProductsFromAdmin,
  buildHomepageDealProducts,
  getPrimaryRunningFlashSale,
  resolveProductOffer,
  type ProductOfferView,
} from "@/lib/storefront/storefront-offers";

export function useStorefrontOfferSources() {
  const flashSales = useFlashSaleStore((s) => s.sales);
  const specialOffers = useSpecialOfferStore((s) => s.offers);
  return { flashSales, specialOffers };
}

export function useProductOffer(
  productId: string,
  catalogPrice: number,
  catalogCompareAt?: number,
  category?: string,
): ProductOfferView {
  const sources = useStorefrontOfferSources();
  return useMemo(
    () => resolveProductOffer(productId, catalogPrice, catalogCompareAt, category, sources),
    [productId, catalogPrice, catalogCompareAt, category, sources],
  );
}

export function useAdminDealProducts() {
  const { flashSales } = useStorefrontOfferSources();
  return useMemo(() => buildDealProductsFromAdmin(flashSales), [flashSales]);
}

export function useHomepageDealProducts(limit = 6) {
  const { flashSales } = useStorefrontOfferSources();
  return useMemo(() => buildHomepageDealProducts(limit, flashSales), [flashSales, limit]);
}

export function usePrimaryFlashSale() {
  const { flashSales } = useStorefrontOfferSources();
  return useMemo(() => getPrimaryRunningFlashSale(flashSales), [flashSales]);
}
