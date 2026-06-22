"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrderStoreHydrated } from "@/lib/hooks/use-order-store-hydrated";
import { useOrderStore } from "@/lib/store/order-store";
import { OrderInvoiceDocument } from "@/components/orders/print/order-invoice-document";
import { OrderPackingSlipDocument } from "@/components/orders/print/order-packing-slip-document";

export type OrderPrintDocType = "invoice" | "packing-slip";

type Props = {
  orderId: string;
  type: OrderPrintDocType;
  autoPrint?: boolean;
};

const DOC_LABELS: Record<OrderPrintDocType, string> = {
  invoice: "Tax Invoice",
  "packing-slip": "Packing Slip",
};

export function OrderPrintWorkspace({ orderId, type, autoPrint = false }: Props) {
  const hydrated = useOrderStoreHydrated();
  const order = useOrderStore((s) => s.orders.find((o) => o.id === orderId));

  useEffect(() => {
    if (!autoPrint || !hydrated || !order) return;
    const timer = window.setTimeout(() => window.print(), 500);
    return () => window.clearTimeout(timer);
  }, [autoPrint, hydrated, order]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-[#666]">Loading document…</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6">
        <p className="text-sm font-medium text-[#333]">Order not found</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/orders/all">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const label = DOC_LABELS[type];
  const document =
    type === "invoice" ? <OrderInvoiceDocument order={order} /> : <OrderPackingSlipDocument order={order} />;

  return (
    <div className="min-h-screen print:min-h-0 print:bg-white">
      <div className="print-hide fixed inset-x-0 top-0 z-50 border-b border-[#ccc] bg-white shadow-sm">
        <div className="mx-auto flex max-w-[210mm] items-center justify-between gap-3 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="h-8 shrink-0">
              <Link href={`/orders/${orderId}`}>
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back
              </Link>
            </Button>
            <span className="truncate text-sm font-medium text-[#333]">
              {label} · {order.orderNumber}
            </span>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button size="sm" className="h-8 bg-[#714B67] hover:bg-[#5c3d55]" onClick={() => window.print()}>
              <Printer className="mr-1.5 h-3.5 w-3.5" /> Print
            </Button>
            <Button variant="outline" size="sm" className="h-8" onClick={() => window.close()}>
              <X className="mr-1.5 h-3.5 w-3.5" /> Close
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[210mm] px-3 pb-8 pt-14 print:max-w-none print:p-0 print:pt-0">
        {document}
      </div>
    </div>
  );
}
