"use client";

import { use } from "react";
import { OrderPrintWorkspace } from "@/components/orders/print/order-print-workspace";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoprint?: string }>;
};

export default function OrderPackingSlipPrintPage({ params, searchParams }: Props) {
  const { id } = use(params);
  const { autoprint } = use(searchParams);

  return <OrderPrintWorkspace orderId={id} type="packing-slip" autoPrint={autoprint === "1"} />;
}
