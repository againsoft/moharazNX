"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getPartnerBySupplierId } from "@/lib/mock-data/business-partners";
import { SupplierDetailWorkspace } from "@/components/suppliers/supplier-detail-workspace";
import { useCommerceSupplier } from "@/lib/api/use-commerce-suppliers";

/** M2 — legacy supplier detail → partner drawer when mapped. */
export default function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const partner = getPartnerBySupplierId(id);
  const { supplier, loading, error } = useCommerceSupplier(id);

  useEffect(() => {
    if (partner && !supplier && !loading) {
      router.replace(`/partners/directory?view=${partner.id}`);
    }
  }, [partner, router, supplier, loading]);

  useEffect(() => {
    if (error) {
      toast.error(`API: ${error}`, { id: "commerce-supplier-detail-api" });
    }
  }, [error]);

  if (partner && !supplier && !loading) {
    return (
      <p className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Opening partner in Business Partners…
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <p className="page-subtitle">MoharazNX › Suppliers › Vendor</p>
      <div className="pt-2">
        <SupplierDetailWorkspace supplierId={id} supplier={supplier} loading={loading} />
      </div>
    </div>
  );
}
