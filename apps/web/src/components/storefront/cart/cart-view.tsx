"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { ProductRail } from "@/components/storefront/home/product-rail";
import { SectionHeader } from "@/components/storefront/home/section-header";
import {
  getCartSavings,
  getCartSubtotal,
  useStorefrontCart,
} from "@/lib/store/storefront-cart-store";
import { useStorefrontCartApi } from "@/lib/api/use-storefront-cart";
import { validateCoupon, FREE_SHIPPING_THRESHOLD } from "@/lib/mock-data/storefront-checkout";
import { crossSell } from "@/lib/mock-data/storefront-cart-extras";
import { formatCurrency } from "@/lib/utils";
import { useState, useMemo } from "react";
import { getCartSpecialOfferHints } from "@/lib/storefront/storefront-offers";
import { useStorefrontOfferSources } from "@/hooks/use-storefront-offers";
import { EmiInlineLink } from "@/components/storefront/emi/emi-badge";
import { productPath, storefrontPaths } from "@/lib/url-slug/storefront-paths";

export function CartView() {
  const { couponCode, couponDiscount, setCoupon } = useStorefrontCart();
  const { items, loading, error, apiEnabled, updateQty, removeItem } = useStorefrontCartApi();
  const sources = useStorefrontOfferSources();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const offerHints = useMemo(
    () => getCartSpecialOfferHints(items.map((i) => i.productId), sources.specialOffers),
    [items, sources.specialOffers],
  );

  const subtotal = getCartSubtotal(items);
  const savings = getCartSavings(items);
  const shippingHint = subtotal >= FREE_SHIPPING_THRESHOLD;

  const applyCoupon = () => {
    const result = validateCoupon(couponInput, subtotal);
    if (!result.valid) {
      setCouponError("Invalid coupon code");
      return;
    }
    setCouponError(null);
    setCoupon(result.code, result.discount);
    setCouponInput("");
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Loading cart…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h1 className="mt-4 text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add items to get started.</p>
        <Button asChild className="mt-6">
          <Link href={storefrontPaths.products}>Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">Shopping cart</h1>
        {apiEnabled && (
          <ApiConnectionBadge loading={loading} error={error} productCount={items.length} />
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex gap-3 rounded-xl border border-border/60 bg-card p-3 sm:gap-4 sm:p-4"
            >
              <Link href={productPath(item.slug)} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-24 sm:w-24">
                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link href={productPath(item.slug)} className="font-medium hover:text-primary line-clamp-2">
                  {item.name}
                </Link>
                {item.variantLabel && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.variantLabel}</p>
                )}
                <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
                  <div className="flex items-center rounded-lg border border-input">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void updateQty(item.id, item.qty - 1)}>
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.qty}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => void updateQty(item.id, item.qty + 1)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(item.price * item.qty)}</p>
                    {item.compareAtPrice && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatCurrency(item.compareAtPrice * item.qty)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground" onClick={() => void removeItem(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </article>
          ))}

          {offerHints.length > 0 && (
            <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-900 dark:bg-violet-950/20">
              <p className="text-sm font-medium text-violet-800 dark:text-violet-200">
                Active special offers
              </p>
              <ul className="mt-2 space-y-1 text-xs text-violet-700 dark:text-violet-300">
                {offerHints.map((hint) => (
                  <li key={hint}>• {hint}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-xl border border-border/60 bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Tag className="h-4 w-4 text-primary" />
              Coupon code
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="SAVE10, WELCOME, FLASH20"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="h-9 flex-1"
              />
              <Button variant="outline" className="h-9" onClick={applyCoupon}>
                Apply
              </Button>
            </div>
            {couponError && <p className="mt-1 text-xs text-red-500">{couponError}</p>}
            {couponCode && (
              <p className="mt-2 text-xs text-emerald-600">
                {couponCode} applied — {formatCurrency(couponDiscount)} off
              </p>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <h2 className="font-semibold">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium">{formatCurrency(subtotal)}</dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <dt>Savings</dt>
                  <dd>-{formatCurrency(savings)}</dd>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <dt>Coupon</dt>
                  <dd>-{formatCurrency(couponDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="text-muted-foreground">Calculated at checkout</dd>
              </div>
            </dl>
            {!shippingHint && (
              <p className="mt-3 text-xs text-muted-foreground">
                Add {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping
              </p>
            )}
            {shippingHint && (
              <p className="mt-3 text-xs font-medium text-emerald-600">You qualify for free shipping!</p>
            )}
            <div className="mt-4 flex justify-between border-t border-border/60 pt-4 text-base font-bold">
              <span>Estimated total</span>
              <span>{formatCurrency(Math.max(0, subtotal - couponDiscount))}</span>
            </div>
            <EmiInlineLink
              amount={Math.max(0, subtotal - couponDiscount)}
              className="mt-3"
              surface="cart"
            />
            <Button asChild size="lg" className="mt-4 h-11 w-full">
              <Link href={storefrontPaths.checkout}>Proceed to checkout</Link>
            </Button>
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link href={storefrontPaths.products}>Continue shopping</Link>
            </Button>
          </div>
        </aside>
      </div>

      {crossSell.length > 0 && (
        <section className="mt-12">
          <SectionHeader title="Complete your order" />
          <ProductRail products={crossSell} />
        </section>
      )}
    </div>
  );
}
