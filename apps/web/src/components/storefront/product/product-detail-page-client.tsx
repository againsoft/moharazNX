"use client";

import { notFound } from "next/navigation";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { ProductDetailView } from "@/components/storefront/product/product-detail-view";
import { useStorefrontProduct } from "@/lib/api/use-storefront-product";
import {
  buildCombinedGallery,
  getStorefrontProductDetail,
  type StorefrontProductDetail,
} from "@/lib/mock-data/storefront-product";
import type { Product } from "@/lib/mock-data/products";

type ProductDetailPageClientProps = {
  slug: string;
  /** Mock-resolved product from server slug resolver (optional). */
  initialProduct?: Product;
};

function buildDetailFromApiProduct(product: Product): StorefrontProductDetail {
  const variants: StorefrontProductDetail["variants"] = [];
  const galleryData = buildCombinedGallery(product, variants);
  const categorySlug = product.category.toLowerCase().replace(/\s+/g, "-");

  return {
    product,
    categorySlug,
    variants,
    gallery: galleryData.allImages,
    galleryData,
    specs: [],
    reviews: [],
    reviewCount: 0,
    avgRating: 0,
    questions: [],
    aiSummary: [],
    related: [],
    crossSell: [],
    upsell: [],
    shipping: {
      standard: "Delivery in 2–4 business days · Free over ৳2,000",
      express: "Next-day delivery in Dhaka — ৳150",
      returns: "Free 30-day returns",
    },
    warranty: "30-day quality guarantee",
  };
}

export function ProductDetailPageClient({ slug, initialProduct }: ProductDetailPageClientProps) {
  const { product: apiProduct, loading, error, apiEnabled } = useStorefrontProduct(slug);

  const mockDetail = getStorefrontProductDetail(slug);

  if (loading && !mockDetail && !initialProduct) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">Loading product…</p>
    );
  }

  let detail: StorefrontProductDetail | null = null;

  if (apiEnabled && apiProduct) {
    const mockExtras = mockDetail ?? (initialProduct ? getStorefrontProductDetail(initialProduct.slug) : null);
    const base = buildDetailFromApiProduct(apiProduct);
    detail = mockExtras
      ? {
          ...mockExtras,
          product: apiProduct,
          categorySlug: mockExtras.categorySlug,
          variants: mockExtras.variants.length > 0 ? mockExtras.variants : base.variants,
          gallery: base.gallery,
          galleryData: base.galleryData,
        }
      : base;
  } else if (mockDetail) {
    detail = mockDetail;
  } else if (initialProduct) {
    detail = getStorefrontProductDetail(initialProduct.slug) ?? buildDetailFromApiProduct(initialProduct);
  }

  if (!detail) {
    if (!loading) notFound();
    return null;
  }

  return (
    <div className="space-y-4">
      {apiEnabled && (
        <ApiConnectionBadge loading={loading} error={error} productCount={1} />
      )}
      <ProductDetailView detail={detail} apiCartEnabled={apiEnabled} />
    </div>
  );
}
