"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Home,
  Package,
  RefreshCw,
  RotateCcw,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DELIVERY_ZONES,
  FREE_SHIPPING_THRESHOLD,
  RETURN_POLICY,
  RETURN_STEPS,
  SHIPPING_FAQ,
  SHIPPING_METHODS,
} from "@/lib/mock-data/storefront-shipping";
import { formatCurrency } from "@/lib/utils";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";
import { cn } from "@/lib/utils";

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border/60">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-xs font-medium"
        onClick={() => setOpen((v) => !v)}
      >
        {q}
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition", open && "rotate-180")} />
      </button>
      {open && <p className="border-t border-border/60 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">{a}</p>}
    </div>
  );
}

export function ShippingReturnsView() {
  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
          <Home className="h-3 w-3" />
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Shipping & returns</span>
      </nav>

      <header>
        <h1 className="text-xl font-bold sm:text-2xl">Shipping & returns</h1>
        <p className="mt-1 max-w-lg text-xs text-muted-foreground sm:text-sm">
          Delivery options, timelines, and our hassle-free return policy.
        </p>
      </header>

      {/* Shipping methods */}
      <section className="rounded-lg border border-border/60 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold">
          <Truck className="h-4 w-4 text-primary" />
          Shipping options
        </h2>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Free standard shipping on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-xs">
            <thead>
              <tr className="border-b border-border/60 text-[10px] uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 pr-3 font-semibold">Method</th>
                <th className="pb-2 pr-3 font-semibold">Delivery</th>
                <th className="pb-2 font-semibold">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {SHIPPING_METHODS.map((m) => (
                <tr key={m.id}>
                  <td className="py-2 pr-3 font-medium">{m.label}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{m.eta}</td>
                  <td className="py-2 font-medium">
                    {m.id === "standard" ? (
                      <span>
                        {formatCurrency(m.price)}{" "}
                        <span className="font-normal text-muted-foreground">/ free over ৳2k</span>
                      </span>
                    ) : m.price === 0 ? (
                      "Free"
                    ) : (
                      formatCurrency(m.price)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Delivery zones */}
      <section className="rounded-lg border border-border/60 bg-card p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold">
          <Package className="h-4 w-4 text-primary" />
          Delivery by zone
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {DELIVERY_ZONES.map((z) => (
            <div key={z.zone} className="rounded-md border border-border/60 p-3">
              <p className="text-xs font-semibold">{z.zone}</p>
              <dl className="mt-2 space-y-1 text-[11px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Standard</dt>
                  <dd>{z.standard}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Express</dt>
                  <dd>{z.express}</dd>
                </div>
              </dl>
              <p className="mt-2 text-[10px] text-muted-foreground">{z.note}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Return policy */}
        <section className="rounded-lg border border-border/60 bg-card p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            <RotateCcw className="h-4 w-4 text-primary" />
            Return policy
          </h2>
          <ul className="mt-3 space-y-2 text-xs">
            <li className="flex gap-2">
              <RefreshCw className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>
                <strong>{RETURN_POLICY.windowDays}-day</strong> return window from delivery date
              </span>
            </li>
            <li className="text-[11px] text-muted-foreground">Condition: {RETURN_POLICY.condition}</li>
            <li className="text-[11px] text-muted-foreground">Refund within {RETURN_POLICY.refundTime}</li>
          </ul>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Not eligible</p>
          <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-[11px] text-muted-foreground">
            {RETURN_POLICY.exclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Return steps */}
        <section className="rounded-lg border border-border/60 bg-card p-4">
          <h2 className="text-sm font-semibold">How to return</h2>
          <ol className="mt-3 space-y-3">
            {RETURN_STEPS.map((s) => (
              <li key={s.step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {s.step}
                </span>
                <div>
                  <p className="text-xs font-medium">{s.title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <Button asChild variant="outline" size="sm" className="mt-4 h-8 text-xs">
            <Link href={storefrontPaths.contact}>Contact support</Link>
          </Button>
        </section>
      </div>

      {/* FAQ */}
      <section>
        <h2 className="mb-3 text-sm font-semibold">Common questions</h2>
        <div className="space-y-2">
          {SHIPPING_FAQ.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
          <Link href={storefrontPaths.track}>Track an order</Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="h-8 text-xs">
          <Link href={storefrontPaths.faq}>Full FAQ</Link>
        </Button>
      </div>
    </div>
  );
}
