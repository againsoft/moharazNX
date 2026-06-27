"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  PURCHASE_ORDER_WAREHOUSES,
  buildPurchaseOrderDraft,
} from "@/lib/mock-data/purchase-orders";
import { businessPartnersSeed } from "@/lib/mock-data/business-partners";
import { suppliersSeed } from "@/lib/mock-data/suppliers";
import { useBusinessPartnerStore } from "@/lib/store/business-partner-store";
import { usePurchaseOrderStore } from "@/lib/store/purchase-order-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/native-select";

type LineDraft = {
  key: string;
  sku: string;
  name: string;
  quantityOrdered: number;
  unitPrice: number;
};

const EMPTY_LINE = (): LineDraft => ({
  key: `line_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  sku: "",
  name: "",
  quantityOrdered: 1,
  unitPrice: 0,
});

export function PurchaseOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addOrder = usePurchaseOrderStore((s) => s.addOrder);

  const partnerId = searchParams.get("partnerId");
  const storePartners = useBusinessPartnerStore((s) => s.partners);
  const resolvedPartner = useMemo(() => {
    if (!partnerId) return undefined;
    return storePartners.find((p) => p.id === partnerId) ?? businessPartnersSeed.find((p) => p.id === partnerId);
  }, [partnerId, storePartners]);

  const initialSupplierId =
    searchParams.get("supplierId") ??
    resolvedPartner?.supplierId ??
    suppliersSeed[0]?.id ??
    "";

  const [supplierId, setSupplierId] = useState(initialSupplierId);
  const [warehouse, setWarehouse] = useState(PURCHASE_ORDER_WAREHOUSES[0]);
  const [expectedDate, setExpectedDate] = useState("2026-06-30");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([
    {
      key: "line_1",
      sku: "SKU-0002",
      name: "Wireless Earbuds Pro",
      quantityOrdered: 100,
      unitPrice: 4200,
    },
  ]);

  const total = lines.reduce((s, l) => s + l.quantityOrdered * l.unitPrice, 0);

  useEffect(() => {
    if (initialSupplierId) setSupplierId(initialSupplierId);
  }, [initialSupplierId]);

  useEffect(() => {
    if (resolvedPartner) {
      toast.info(`PO pre-filled from partner ${resolvedPartner.name}`, {
        description: resolvedPartner.partnerCode,
      });
    }
  }, [resolvedPartner]);

  const updateLine = (key: string, patch: Partial<LineDraft>) => {
    setLines((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const save = (submit: boolean) => {
    if (!supplierId) {
      toast.error("Select a vendor");
      return;
    }
    if (lines.length === 0 || lines.some((l) => !l.name.trim())) {
      toast.error("Add at least one line with a product name");
      return;
    }

    const draft = buildPurchaseOrderDraft({
      supplierId,
      warehouse,
      expectedDate,
      notes: notes.trim() || undefined,
      lines: lines.map((l) => ({
        productId: `prod_new_${l.key}`,
        sku: l.sku || `SKU-${Date.now()}`,
        name: l.name,
        quantityOrdered: l.quantityOrdered,
        unitPrice: l.unitPrice,
      })),
    });

    const order = submit ? { ...draft, status: "pending_approval" as const } : draft;
    addOrder(order);
    toast.success(submit ? "PO submitted for approval" : "PO saved as draft");
    router.push(`/suppliers/purchase-orders/${order.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 px-2">
          <Link href="/suppliers/purchase-orders">
            <ArrowLeft className="mr-1 h-4 w-4" /> Purchase orders
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="text-base font-semibold">Create purchase order</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Draft PO — submit sends to approval workflow (mock)
          {resolvedPartner && (
            <>
              {" "}
              · from partner{" "}
              <Link href={`/partners/directory?view=${resolvedPartner.id}`} className="text-primary hover:underline">
                {resolvedPartner.partnerCode}
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="po-vendor">Vendor</Label>
          <Select
            id="po-vendor"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="text-sm"
          >
            {suppliersSeed.map((s) => (
              <option key={s.id} value={s.id} disabled={s.status === "blocked"}>
                {s.name}
                {s.status === "blocked" ? " (blocked)" : ""}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="po-warehouse">Warehouse</Label>
          <Select
            id="po-warehouse"
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            className="text-sm"
          >
            {PURCHASE_ORDER_WAREHOUSES.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="po-expected">Expected date</Label>
          <Input
            id="po-expected"
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="po-notes">Notes</Label>
          <Input
            id="po-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes for procurement team"
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Order lines</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => setLines((l) => [...l, EMPTY_LINE()])}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add line
          </Button>
        </div>

        <div className="space-y-2">
          {lines.map((line) => (
            <div
              key={line.key}
              className="grid gap-2 rounded-lg border border-input bg-card p-3 sm:grid-cols-12"
            >
              <div className="sm:col-span-4">
                <Label className="text-[10px]">Product name</Label>
                <Input
                  value={line.name}
                  onChange={(e) => updateLine(line.key, { name: e.target.value })}
                  className="mt-0.5 h-8 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-[10px]">SKU</Label>
                <Input
                  value={line.sku}
                  onChange={(e) => updateLine(line.key, { sku: e.target.value })}
                  className="mt-0.5 h-8 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-[10px]">Qty</Label>
                <Input
                  type="number"
                  min={1}
                  value={line.quantityOrdered}
                  onChange={(e) =>
                    updateLine(line.key, { quantityOrdered: Number(e.target.value) || 0 })
                  }
                  className="mt-0.5 h-8 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-[10px]">Unit price</Label>
                <Input
                  type="number"
                  min={0}
                  value={line.unitPrice}
                  onChange={(e) =>
                    updateLine(line.key, { unitPrice: Number(e.target.value) || 0 })
                  }
                  className="mt-0.5 h-8 text-xs"
                />
              </div>
              <div className="flex items-end justify-between sm:col-span-2">
                <p className="text-xs font-medium">{formatCurrency(line.quantityOrdered * line.unitPrice)}</p>
                {lines.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive"
                    onClick={() => setLines((rows) => rows.filter((r) => r.key !== line.key))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-input pt-3">
          <p className="text-sm font-semibold">Total: {formatCurrency(total)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-input pt-4">
        <Button variant="outline" onClick={() => save(false)}>
          Save draft
        </Button>
        <Button onClick={() => save(true)}>Submit for approval</Button>
        <Button variant="ghost" asChild>
          <Link href="/suppliers/purchase-orders">Cancel</Link>
        </Button>
      </div>
    </div>
  );
}
