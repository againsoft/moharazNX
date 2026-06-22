"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SUPPLIER_TAB_LABELS,
  SUPPLIER_TABS,
  pathFromTab,
  tabFromPath,
  type SupplierTab,
} from "@/lib/mock-data/suppliers";

type Props = {
  openPoCount?: number;
  activeTab?: SupplierTab;
};

export function SupplierNav({ openPoCount = 0, activeTab }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const active = activeTab ?? tabFromPath(pathname);

  return (
    <nav className="flex flex-wrap gap-1 rounded-lg border border-input bg-muted/30 p-1">
      {SUPPLIER_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => router.push(pathFromTab(tab))}
          className={cn(
            "relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            active === tab
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
          )}
        >
          {SUPPLIER_TAB_LABELS[tab]}
          {tab === "purchase-orders" && openPoCount > 0 && (
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
              {openPoCount}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

export function SupplierBreadcrumb({ tab }: { tab: SupplierTab }) {
  const label = SUPPLIER_TAB_LABELS[tab];
  if (tab === "summary") return null;

  return (
    <p className="text-[11px] text-muted-foreground">
      <Link href="/suppliers" className="hover:text-foreground">
        Suppliers
      </Link>
      <span className="mx-1">›</span>
      <span>{label}</span>
    </p>
  );
}
