"use client";

import { Suspense, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { CustomersDashboard } from "@/components/customers/customers-dashboard";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import { Button } from "@/components/ui/button";
import { useCommerceCustomers } from "@/lib/api/use-commerce-customers";
import { useCustomerStore } from "@/lib/store/customer-store";
import { cn } from "@/lib/utils";

function CustomersDashboardContent() {
  const { customers, total, loading, error, refetch } = useCommerceCustomers();

  useEffect(() => {
    if (customers.length) {
      useCustomerStore.setState({ customers });
    }
  }, [customers]);

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "commerce-customers-dashboard-api" });
    }
  }, [error]);

  return (
    <>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="page-subtitle">MoharazNX › Customers</p>
          <h1 className="page-title">Customer 360</h1>
          <div className="mt-1.5">
            <ApiConnectionBadge loading={loading} error={error} productCount={total} />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={loading}>
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>
      <CustomersDashboard customers={customers} loading={loading} />
    </>
  );
}

export default function CustomersPage() {
  return (
    <div className="space-y-1">
      <Suspense fallback={null}>
        <CustomersDashboardContent />
      </Suspense>
    </div>
  );
}
