"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { SupplierPageShell } from "@/components/suppliers/supplier-page-shell";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import { useCommerceSuppliers } from "@/lib/api/use-commerce-suppliers";
import { cn } from "@/lib/utils";

export default function SuppliersPage() {
  const { suppliers, total, loading, error, refetch } = useCommerceSuppliers();

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "commerce-suppliers-list-api" });
    }
  }, [error]);

  return (
    <div className="space-y-1">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <ApiConnectionBadge loading={loading} error={error} productCount={total} />
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>
      <SupplierPageShell suppliers={suppliers} suppliersLoading={loading} />
    </div>
  );
}
