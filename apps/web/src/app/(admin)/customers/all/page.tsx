"use client";

import { Suspense, useCallback, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { CustomerGrid } from "@/components/customers/customer-grid";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import {
  updateCommerceCustomerStatus,
  useCommerceCustomers,
} from "@/lib/api/use-commerce-customers";
import type { CustomerStatus } from "@/lib/mock-data/customers";
import { useCustomerStore } from "@/lib/store/customer-store";
import { cn } from "@/lib/utils";

function AllCustomersContent() {
  const { customers, total, loading, error, refetch } = useCommerceCustomers();
  const patchCustomer = useCustomerStore((s) => s.patchCustomer);

  useEffect(() => {
    if (customers.length) {
      useCustomerStore.setState({ customers });
    }
  }, [customers]);

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "commerce-customers-api" });
    }
  }, [error]);

  const handleStatusChange = useCallback(
    async (id: string, status: CustomerStatus) => {
      try {
        const updated = await updateCommerceCustomerStatus(id, status);
        patchCustomer(id, updated);
        await refetch();
        toast.success(`Customer updated to ${status}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Status update failed");
      }
    },
    [patchCustomer, refetch],
  );

  return (
    <>
      <div className="mb-1 shrink-0 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Customers</p>
          <h1 className="page-title">
            All Customers
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({loading ? "…" : total.toLocaleString()})
            </span>
          </h1>
          <div className="mt-1.5">
            <ApiConnectionBadge loading={loading} error={error} productCount={total} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>
      <CustomerGrid
        className="min-h-0 flex-1"
        customers={customers}
        loading={loading}
        onStatusChange={handleStatusChange}
      />
    </>
  );
}

export default function AllCustomersPage() {
  return (
    <div className="flex min-h-[calc(100vh-2.75rem-1.5rem)] flex-col">
      <Suspense fallback={<div className="min-h-0 flex-1 rounded-lg border border-input bg-muted/20" />}>
        <AllCustomersContent />
      </Suspense>
    </div>
  );
}
