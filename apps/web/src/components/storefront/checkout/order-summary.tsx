"use client";

import Image from "next/image";
import { Lock, ShieldCheck, Truck } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { CartLineItem } from "@/lib/store/storefront-cart-store";

type OrderSummaryProps = {
  items: CartLineItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  compact?: boolean;
};

export function OrderSummary({ items, subtotal, shipping, discount, total, compact }: OrderSummaryProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <h2 className="font-semibold">Order summary</h2>

      {!compact && (
        <ul className="mt-4 max-h-48 space-y-3 overflow-y-auto">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                  {item.qty}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium">{item.name}</p>
                {item.variantLabel && (
                  <p className="text-[11px] text-muted-foreground">{item.variantLabel}</p>
                )}
              </div>
              <p className="shrink-0 text-sm font-medium">{formatCurrency(item.price * item.qty)}</p>
            </li>
          ))}
        </ul>
      )}

      <dl className={`space-y-2 text-sm ${compact ? "mt-2" : "mt-4 border-t border-border/60 pt-4"}`}>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatCurrency(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <dt>Discount</dt>
            <dd>-{formatCurrency(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd>{shipping === 0 ? "Free" : formatCurrency(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-border/60 pt-3 text-base font-bold">
          <dt>Total</dt>
          <dd>{formatCurrency(total)}</dd>
        </div>
      </dl>

      <div className="mt-4 space-y-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
        <p className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 shrink-0 text-primary" />
          Secure SSL encrypted checkout
        </p>
        <p className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 shrink-0 text-primary" />
          Free returns within 30 days
        </p>
        <p className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
          Buyer protection on every order
        </p>
      </div>
    </div>
  );
}
