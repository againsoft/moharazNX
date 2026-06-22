"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABELS, type Order } from "@/lib/mock-data/orders";
import { statusBadgeVariant } from "@/components/orders/orders-nav";

type Props = {
  orders: Order[];
};

export function OrderMobileCards({ orders }: Props) {
  if (orders.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No orders match filters</p>;
  }

  return (
    <div className="space-y-2 lg:hidden">
      {orders.map((o) => (
        <Link
          key={o.id}
          href={`/orders/${o.id}`}
          className="block rounded-lg border border-input bg-card p-3 shadow-sm transition-colors hover:bg-muted/30"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-primary">{o.orderNumber}</p>
              <p className="text-xs text-muted-foreground">{o.customer.name}</p>
            </div>
            <Badge variant={statusBadgeVariant(o.status)} className="text-[9px] shrink-0">
              {ORDER_STATUS_LABELS[o.status]}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span>{new Date(o.orderDate).toLocaleDateString()}</span>
            <span>·</span>
            <span className="capitalize">{o.paymentStatus}</span>
            <span>·</span>
            <span>{o.branch}</span>
          </div>
          <p className="mt-2 text-sm font-semibold tabular-nums">{formatCurrency(o.grandTotal)}</p>
        </Link>
      ))}
    </div>
  );
}
