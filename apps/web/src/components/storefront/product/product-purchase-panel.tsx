"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Star, Truck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WishlistButton } from "@/components/storefront/wishlist/wishlist-button";
import { CompareButton } from "@/components/storefront/compare/compare-button";
import { EmiBadge } from "@/components/storefront/emi/emi-badge";
import { cn, formatCurrency } from "@/lib/utils";
import { useStorefrontCart } from "@/lib/store/storefront-cart-store";
import { addStorefrontCartItem, apiCartToLineItems } from "@/lib/api/storefront-cart";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";
import { useProductOffer } from "@/hooks/use-storefront-offers";
import type { Product } from "@/lib/mock-data/products";
import type { ProductVariant } from "@/lib/mock-data/products";

type ProductPurchasePanelProps = {
  product: Product;
  variants: ProductVariant[];
  avgRating: number;
  reviewCount: number;
  onVariantChange?: (variant: ProductVariant) => void;
  onActionsReady?: (actions: { addToCart: () => void; buyNow: () => void }) => void;
  apiCartEnabled?: boolean;
};

export function ProductPurchasePanel({
  product,
  variants,
  avgRating,
  reviewCount,
  onVariantChange,
  onActionsReady,
  apiCartEnabled = false,
}: ProductPurchasePanelProps) {
  const router = useRouter();
  const addItem = useStorefrontCart((s) => s.addItem);
  const setItems = useStorefrontCart((s) => s.setItems);
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [qty, setQty] = useState(1);

  const variant = useMemo(
    () => variants.find((v) => v.id === variantId) ?? variants[0],
    [variants, variantId],
  );

  const catalogPrice = variant?.price ?? product.price;
  const offer = useProductOffer(
    product.id,
    catalogPrice,
    product.compareAtPrice,
    product.category,
  );
  const price = offer.displayPrice;
  const stock = variant?.stock ?? product.stock;
  const inStock = stock > 0;
  const lowStock = inStock && stock <= 5;
  const discount = offer.discountPercent > 0 ? offer.discountPercent : null;

  const selectVariant = (id: string) => {
    setVariantId(id);
    const v = variants.find((x) => x.id === id);
    if (v) onVariantChange?.(v);
  };

  const buildLineItem = useCallback(() => {
    const image =
      variant?.gallery?.[0] ?? `https://picsum.photos/seed/${product.id}/600/600`;
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      price,
      compareAtPrice: offer.compareAtPrice,
      qty,
      variantLabel: variant?.label,
    };
  }, [product, variant, price, qty]);

  const handleAddToCart = useCallback(() => {
    if (!inStock) return;
    if (apiCartEnabled) {
      void addStorefrontCartItem(product.id, qty)
        .then((cart) => setItems(apiCartToLineItems(cart)))
        .catch(() => addItem(buildLineItem()));
      return;
    }
    addItem(buildLineItem());
  }, [addItem, apiCartEnabled, buildLineItem, inStock, product.id, qty, setItems]);

  const handleBuyNow = useCallback(() => {
    if (!inStock) return;
    if (apiCartEnabled) {
      void addStorefrontCartItem(product.id, qty)
        .then((cart) => {
          setItems(apiCartToLineItems(cart));
          router.push(storefrontPaths.checkout);
        })
        .catch(() => {
          addItem(buildLineItem());
          router.push(storefrontPaths.checkout);
        });
      return;
    }
    addItem(buildLineItem());
    router.push(storefrontPaths.checkout);
  }, [addItem, apiCartEnabled, buildLineItem, inStock, product.id, qty, router, setItems]);

  useEffect(() => {
    onActionsReady?.({ addToCart: handleAddToCart, buyNow: handleBuyNow });
  }, [handleAddToCart, handleBuyNow, onActionsReady]);

  const colors = [...new Set(variants.map((v) => v.color))];
  const storages = [...new Set(variants.map((v) => v.storage).filter(Boolean))] as string[];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{product.brand}</p>
        <h1 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">{product.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviewCount} reviews)</span>
          </div>
          <Badge variant="outline" className="text-[10px]">
            SKU: {variant?.sku ?? product.sku}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-bold">{formatCurrency(price)}</span>
        <span className="text-xs text-muted-foreground">(Cash Price)</span>
        {offer.compareAtPrice && offer.compareAtPrice > price && (
          <>
            <span className="text-lg text-muted-foreground line-through">
              {formatCurrency(offer.compareAtPrice)}
            </span>
            {discount && (
              <Badge className="border-transparent bg-red-500 text-white">Save {discount}%</Badge>
            )}
          </>
        )}
      </div>

      <EmiBadge amount={price * qty} showCashLabel />

      {offer.labels.length > 0 && (
        <div className="space-y-1.5 rounded-lg border border-violet-200 bg-violet-50/60 px-3 py-2.5 dark:border-violet-900 dark:bg-violet-950/20">
          {offer.flashSale && (
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">
              ⚡ {offer.flashSale.name}
            </p>
          )}
          {offer.labels
            .filter((l) => l.type !== "flash" || !offer.flashSale)
            .slice(0, 3)
            .map((label, i) => (
              <p key={`${label.type}-${i}`} className="text-xs text-violet-800 dark:text-violet-200">
                {label.text}
              </p>
            ))}
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Color: {variant?.color}</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const match = variants.find((v) => v.color === color && (!variant?.storage || v.storage === variant.storage));
              const id = match?.id ?? variants.find((v) => v.color === color)?.id;
              if (!id) return null;
              return (
                <Button
                  key={color}
                  type="button"
                  size="sm"
                  variant={variant?.color === color ? "default" : "outline"}
                  onClick={() => selectVariant(id)}
                >
                  {color}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {storages.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Storage: {variant?.storage}</p>
          <div className="flex flex-wrap gap-2">
            {storages.map((storage) => {
              const match = variants.find((v) => v.storage === storage && v.color === variant?.color);
              if (!match) return null;
              return (
                <Button
                  key={storage}
                  type="button"
                  size="sm"
                  variant={variant?.storage === storage ? "default" : "outline"}
                  onClick={() => selectVariant(match.id)}
                >
                  {storage}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {variants.length > 0 && colors.length === 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Options</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <Button
                key={v.id}
                type="button"
                size="sm"
                variant={variant?.id === v.id ? "default" : "outline"}
                disabled={v.stock === 0}
                onClick={() => selectVariant(v.id)}
              >
                {v.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-lg border border-input">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            disabled={qty <= 1}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            disabled={!inStock || qty >= stock}
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className={cn("text-sm font-medium", inStock ? "text-emerald-600" : "text-red-500")}>
          {inStock ? (lowStock ? `Only ${stock} left` : "In stock") : "Out of stock"}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          size="lg"
          className="h-11 flex-1 text-sm"
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Add to cart
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-11 flex-1 text-sm"
          disabled={!inStock}
          onClick={handleBuyNow}
        >
          <Zap className="mr-2 h-4 w-4" />
          Buy now
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <WishlistButton
          variant="button"
          className="w-full"
          product={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: variant?.gallery?.[0] ?? `https://picsum.photos/seed/${product.id}/600/600`,
            price,
            compareAtPrice: offer.compareAtPrice,
            brand: product.brand,
          }}
        />
        <CompareButton
          variant="button"
          className="w-full"
          product={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: variant?.gallery?.[0] ?? `https://picsum.photos/seed/${product.id}/600/600`,
            price,
            compareAtPrice: offer.compareAtPrice,
            brand: product.brand,
            category: product.category,
            stock,
            rating: avgRating,
            reviewCount,
          }}
        />
      </div>

      {!inStock && (
        <Button variant="secondary" className="w-full">
          Notify me when back in stock
        </Button>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-4 text-sm">
        <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="font-medium">Free shipping over ৳2,000</p>
          <p className="text-muted-foreground">Delivery in 2–4 business days · Easy 30-day returns</p>
        </div>
      </div>
    </div>
  );
}

export type { ProductVariant };
