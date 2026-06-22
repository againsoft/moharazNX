"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { ProductGallery } from "@/components/storefront/product/product-gallery";
import { ProductPurchasePanel } from "@/components/storefront/product/product-purchase-panel";
import { ProductAiSummary, ProductSpecs } from "@/components/storefront/product/product-specs";
import { ProductReviewsSection } from "@/components/storefront/product/product-reviews-section";
import { ProductQaSection, ProductShippingWarranty } from "@/components/storefront/product/product-qa-section";
import { StickyCartBar } from "@/components/storefront/product/sticky-cart-bar";
import { SectionHeader } from "@/components/storefront/home/section-header";
import { ProductRail } from "@/components/storefront/home/product-rail";
import type { StorefrontProductDetail } from "@/lib/mock-data/storefront-product";
import type { ProductVariant } from "@/lib/mock-data/products";
import { categoryPath } from "@/lib/url-slug/storefront-paths";

type ProductDetailViewProps = {
  detail: StorefrontProductDetail;
  apiCartEnabled?: boolean;
};

export function ProductDetailView({ detail, apiCartEnabled = false }: ProductDetailViewProps) {
  const { product, categorySlug, variants, gallery, galleryData, specs, reviews, reviewCount, avgRating, questions, aiSummary, related, crossSell, upsell, shipping, warranty } = detail;

  const [activeVariant, setActiveVariant] = useState<ProductVariant | undefined>(variants[0]);
  const [cartActions, setCartActions] = useState<{ addToCart: () => void; buyNow: () => void } | null>(
    null,
  );

  const price = activeVariant?.price ?? product.price;
  const stock = activeVariant?.stock ?? product.stock;
  const inStock = stock > 0;

  const onVariantChange = (v: ProductVariant) => {
    setActiveVariant(v);
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
          <Home className="h-3.5 w-3.5" />
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={categoryPath(categorySlug)} className="hover:text-foreground">
          {product.category}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-foreground line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <ProductGallery
          images={gallery}
          productName={product.name}
          variantId={activeVariant?.id}
          variantGalleries={galleryData.variantGalleries}
          variantStartIndex={galleryData.variantStartIndex}
        />
        <ProductPurchasePanel
          product={product}
          variants={variants}
          avgRating={avgRating}
          reviewCount={reviewCount}
          onVariantChange={onVariantChange}
          onActionsReady={setCartActions}
          apiCartEnabled={apiCartEnabled}
        />
      </div>

      <div className="mt-12 space-y-12">
        <section>
          <h2 className="mb-4 text-xl font-semibold">About this product</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          <div className="mt-6 max-w-3xl">
            <ProductAiSummary bullets={aiSummary} />
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Specifications</h2>
          <ProductSpecs specs={specs} />
        </section>

        <ProductShippingWarranty shipping={shipping} warranty={warranty} />

        <ProductReviewsSection
          productName={product.name}
          reviews={reviews}
          avgRating={avgRating}
          reviewCount={reviewCount}
        />

        <ProductQaSection productName={product.name} questions={questions} />

        {crossSell.length > 0 && (
          <section>
            <SectionHeader title="Frequently bought together" />
            <ProductRail products={crossSell} />
          </section>
        )}

        {upsell.length > 0 && (
          <section>
            <SectionHeader title="Upgrade picks" subtitle="Premium alternatives you might prefer" />
            <ProductRail products={upsell} />
          </section>
        )}

        {related.length > 0 && (
          <section>
            <SectionHeader title="Related products" href={categoryPath(categorySlug)} />
            <ProductRail products={related} />
          </section>
        )}
      </div>

      <StickyCartBar
        price={price}
        inStock={inStock}
        productName={product.name}
        onAddToCart={cartActions?.addToCart}
        onBuyNow={cartActions?.buyNow}
      />
    </>
  );
}
