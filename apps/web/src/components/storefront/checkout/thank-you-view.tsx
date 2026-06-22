"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";

type LastOrder = {
  orderNumber: string;
  email: string;
  total: number;
  payment: string;
};

export function ThankYouView() {
  const searchParams = useSearchParams();
  const orderParam = searchParams.get("order");
  const [order, setOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("last-order");
      if (raw) setOrder(JSON.parse(raw) as LastOrder);
    } catch {
      /* ignore */
    }
  }, []);

  const orderNumber = order?.orderNumber ?? orderParam ?? "ORD-UNKNOWN";

  return (
    <div className="mx-auto max-w-lg py-8 text-center sm:py-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h1 className="mt-6 text-2xl font-bold sm:text-3xl">Thank you for your order!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Order <span className="font-mono font-semibold text-foreground">{orderNumber}</span> confirmed.
      </p>

      <div className="mt-8 rounded-xl border border-border/60 bg-card p-5 text-left text-sm">
        {order?.email && (
          <p className="text-muted-foreground">
            Confirmation sent to <span className="font-medium text-foreground">{order.email}</span>
          </p>
        )}
        {order?.total != null && (
          <p className="mt-2">
            Total paid: <span className="font-semibold">{formatCurrency(order.total)}</span>
          </p>
        )}
        {order?.payment && (
          <p className="mt-1 text-muted-foreground">Payment: {order.payment}</p>
        )}
        <p className="mt-4 flex items-center gap-2 text-muted-foreground">
          <Package className="h-4 w-4 shrink-0" />
          We&apos;ll notify you when your order ships.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href={storefrontPaths.products}>Continue shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
