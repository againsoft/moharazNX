"use client";

import { use, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { CustomerDetailWorkspace } from "@/components/customers/customer-detail-workspace";
import {
  updateCommerceCustomerStatus,
  useCommerceCustomer,
} from "@/lib/api/use-commerce-customers";
import type { CustomerStatus } from "@/lib/mock-data/customers";
import { useCustomerStore } from "@/lib/store/customer-store";

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { customer, loading, error, refetch } = useCommerceCustomer(id);
  const patchCustomer = useCustomerStore((s) => s.patchCustomer);

  useEffect(() => {
    if (!customer) return;
    const current = useCustomerStore.getState().customers;
    const exists = current.some((c) => c.id === customer.id);
    useCustomerStore.setState({
      customers: exists
        ? current.map((c) => (c.id === customer.id ? customer : c))
        : [customer, ...current],
    });
  }, [customer]);

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "commerce-customer-detail-api" });
    }
  }, [error]);

  const handleStatusChange = useCallback(
    async (customerId: string, status: CustomerStatus) => {
      try {
        const updated = await updateCommerceCustomerStatus(customerId, status);
        patchCustomer(customerId, updated);
        await refetch();
        toast.success(`Customer updated to ${status}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Status update failed");
      }
    },
    [patchCustomer, refetch],
  );

  return (
    <div className="space-y-1">
      <p className="page-subtitle">MoharazNX › Customers › Customer 360</p>
      <div className="pt-2">
        <CustomerDetailWorkspace
          customerId={id}
          customer={customer}
          loading={loading}
          onStatusChange={handleStatusChange}
        />
      </div>
    </div>
  );
}
