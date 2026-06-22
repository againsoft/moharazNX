"use client";

import { OrdersNav } from "@/components/orders/orders-nav";

type Props = {
  title: string;
  description: string;
};

export function PlaceholderModulePage({ title, description }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <p className="page-subtitle">MoharazNX › Orders</p>
        <h1 className="page-title">{title}</h1>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <OrdersNav compact />
      <div className="rounded-lg border border-dashed border-input p-12 text-center">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">Prototype screen — coming next phase</p>
      </div>
    </div>
  );
}
