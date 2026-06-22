"use client";

import { Truck } from "lucide-react";
import { tabFromPath } from "@/lib/mock-data/suppliers";
import { SupplierBreadcrumb } from "@/components/suppliers/supplier-nav";
import { SupplierControlCenter } from "@/components/suppliers/supplier-control-center";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  title?: string;
  subtitle?: string;
  suppliers?: import("@/lib/mock-data/suppliers").Supplier[];
  suppliersLoading?: boolean;
};

export function SupplierPageShell({ children, title, subtitle, suppliers, suppliersLoading }: Props) {
  const pathname = usePathname();
  const tab = tabFromPath(pathname);
  const isStandalone = Boolean(children);

  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col lg:min-h-[calc(100vh-2.75rem-2rem)]">
      <div className="shrink-0">
        <p className="page-subtitle">MoharazNX › Suppliers</p>
        {!isStandalone && <SupplierBreadcrumb tab={tab} />}
        <div className="flex flex-wrap items-center gap-2">
          <Truck className="h-5 w-5 text-indigo-600" />
          <h1 className="page-title">{title ?? "Suppliers"}</h1>
        </div>
        <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
          {subtitle ??
            "Purchase orders, RFQs, receipts, and vendor bills for your store."}
        </p>
      </div>

      <div className="mt-4 min-h-0 flex-1">
        {children ?? <SupplierControlCenter suppliers={suppliers} loading={suppliersLoading} />}
      </div>
    </div>
  );
}
