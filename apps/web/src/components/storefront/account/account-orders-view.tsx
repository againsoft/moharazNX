"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Download, Package, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { accountOrders } from "@/lib/mock-data/storefront-account";
import { accountPaths, storefrontPaths } from "@/lib/url-slug/storefront-paths";
import { formatCurrency } from "@/lib/utils";

export function AccountOrdersView() {
  const searchParams = useSearchParams();
  const trackOrder = searchParams.get("track");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">Orders</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          View, track, reorder, and download invoices
        </p>
      </div>

      {trackOrder && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          Tracking <span className="font-medium">{trackOrder}</span> —{" "}
          <Link href={storefrontPaths.track} className="font-medium text-primary hover:underline">
            open full tracker
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {accountOrders.map((order) => (
          <article
            key={order.id}
            className="rounded-xl border border-border/60 bg-card p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">Placed {order.placedAt}</p>
              </div>
              <Badge variant="secondary">{order.statusLabel}</Badge>
            </div>

            <ul className="mt-4 space-y-3">
              {order.items.map((item) => (
                <li key={`${order.id}-${item.slug}`} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.qty}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-3 text-sm font-semibold">{formatCurrency(order.total)}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {order.canTrack && (
                <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                  <Link href={`${storefrontPaths.track}?order=${order.orderNumber}`}>
                    <Package className="mr-1.5 h-3.5 w-3.5" />
                    Track
                  </Link>
                </Button>
              )}
              {order.canReorder && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => toast.success("Items added to cart (mock)")}
                >
                  Reorder
                </Button>
              )}
              {order.canReturn && (
                <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
                  <Link href={accountPaths.returns}>
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Return
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => toast.success("Invoice PDF download (mock)")}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Invoice
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
