"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Check,
  Circle,
  Home,
  MapPin,
  Package,
  Search,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  lookupOrder,
  TRACK_ORDER_HINT,
  type TrackedOrder,
} from "@/lib/mock-data/storefront-track-order";
import { formatCurrency } from "@/lib/utils";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";
import { cn } from "@/lib/utils";

export function TrackOrderView() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("last-order");
      if (raw) {
        const parsed = JSON.parse(raw) as { orderNumber?: string; email?: string };
        if (parsed.orderNumber) setOrderNumber(parsed.orderNumber);
        if (parsed.email) setEmail(parsed.email);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = lookupOrder(orderNumber, email);
    setLoading(false);
    if (!result) {
      setOrder(null);
      setError("Order not found. Check your order number and email.");
      return;
    }
    setOrder(result);
  };

  const fillDemo = () => {
    setOrderNumber(TRACK_ORDER_HINT.orderNumber);
    setEmail(TRACK_ORDER_HINT.email);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
          <Home className="h-3 w-3" />
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Track order</span>
      </nav>

      <header>
        <h1 className="text-xl font-bold sm:text-2xl">Track your order</h1>
        <p className="mt-1 max-w-lg text-xs text-muted-foreground sm:text-sm">
          Enter your order number and email to see real-time delivery status.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="space-y-4">
          <form
            onSubmit={handleTrack}
            className="rounded-lg border border-border/60 bg-card p-4"
          >
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Search className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Look up order</h2>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 sm:max-w-xs">
                <Label htmlFor="orderNumber">Order number</Label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                  placeholder="ORD-DEMO01"
                  className="mt-1.5 h-8 font-mono text-xs"
                  required
                />
              </div>
              <div className="sm:col-span-2 sm:max-w-sm">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 h-8 text-xs"
                  required
                />
              </div>
            </div>
            {error && <p className="mt-3 text-[11px] text-red-500">{error}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button type="submit" size="sm" className="h-8" disabled={loading}>
                {loading ? "Looking up…" : "Track order"}
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={fillDemo}>
                Try demo order
              </Button>
            </div>
          </form>

          {order && (
            <div className="space-y-4">
              {/* Status banner */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Order {order.orderNumber}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-base font-bold text-primary">
                      <Truck className="h-4 w-4" />
                      {order.statusLabel}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Est. delivery: <span className="font-medium text-foreground">{order.estimatedDelivery}</span>
                    </p>
                  </div>
                  <div className="text-right text-[11px]">
                    <p className="text-muted-foreground">Courier</p>
                    <p className="font-semibold">{order.courier}</p>
                    <p className="mt-1 font-mono text-[10px] text-muted-foreground">{order.trackingNumber}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <section className="rounded-lg border border-border/60 bg-card p-4">
                <h2 className="text-sm font-semibold">Shipment progress</h2>
                <ol className="mt-4 space-y-0">
                  {order.timeline.map((step, i) => (
                    <li key={step.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full border-2",
                            step.completed
                              ? step.current
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-primary bg-primary/10 text-primary"
                              : "border-border bg-muted text-muted-foreground",
                          )}
                        >
                          {step.completed && !step.current ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Circle className="h-2 w-2 fill-current" />
                          )}
                        </span>
                        {i < order.timeline.length - 1 && (
                          <span
                            className={cn(
                              "my-0.5 w-0.5 flex-1 min-h-[24px]",
                              step.completed ? "bg-primary/40" : "bg-border",
                            )}
                          />
                        )}
                      </div>
                      <div className={cn("pb-5", i === order.timeline.length - 1 && "pb-0")}>
                        <p className={cn("text-xs font-medium", step.current && "text-primary")}>{step.label}</p>
                        <p className="text-[11px] text-muted-foreground">{step.description}</p>
                        {step.completed && (
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {step.date} · {step.time}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>

              {/* Items */}
              <section className="rounded-lg border border-border/60 bg-card p-4">
                <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                  <Package className="h-4 w-4 text-primary" />
                  Items in this order
                </h2>
                <ul className="mt-3 space-y-2">
                  {order.items.map((item) => (
                    <li key={item.name} className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image src={item.image} alt="" fill sizes="40px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">Qty {item.qty}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 border-t border-border/60 pt-3 text-xs font-semibold">
                  Total: {formatCurrency(order.total)}
                </p>
              </section>
            </div>
          )}
        </div>

        <aside className="space-y-3">
          <section className="rounded-lg border border-border/60 bg-card p-3">
            <h2 className="text-xs font-semibold">Demo credentials</h2>
            <dl className="mt-2 space-y-1.5 font-mono text-[10px]">
              <div>
                <dt className="text-muted-foreground">Order</dt>
                <dd className="font-semibold">{TRACK_ORDER_HINT.orderNumber}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-semibold">{TRACK_ORDER_HINT.email}</dd>
              </div>
            </dl>
            <Button variant="outline" size="sm" className="mt-3 h-7 w-full text-[11px]" onClick={fillDemo}>
              Fill demo
            </Button>
          </section>

          {order && (
            <section className="rounded-lg border border-border/60 bg-card p-3">
              <h2 className="flex items-center gap-1.5 text-xs font-semibold">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Delivery address
              </h2>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{order.shippingAddress}</p>
            </section>
          )}

          <section className="rounded-lg border border-border/60 bg-muted/30 p-3">
            <p className="text-[11px] text-muted-foreground">
              Need help with this order?{" "}
              <Link href={storefrontPaths.contact} className="font-medium text-primary hover:underline">
                Contact support
              </Link>
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
