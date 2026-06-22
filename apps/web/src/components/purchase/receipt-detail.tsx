"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, MoreHorizontal, Package } from "lucide-react";
import { toast } from "sonner";
import {
  RECEIPT_STATUS_LABELS,
  receiptLineQtyTotal,
  receiptSupplierName,
  type ReceiptStatus,
} from "@/lib/mock-data/purchase-receipts";
import {
  receiptStatusBadgeVariant,
  usePurchaseReceiptStore,
} from "@/lib/store/purchase-receipt-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";

type Tab = "lines" | "activity";

type Props = { receiptId: string };

export function ReceiptDetail({ receiptId }: Props) {
  const receipt = usePurchaseReceiptStore((s) => s.getById(receiptId));
  const updateStatus = usePurchaseReceiptStore((s) => s.updateStatus);
  const updateLine = usePurchaseReceiptStore((s) => s.updateLine);
  const postReceipt = usePurchaseReceiptStore((s) => s.postReceipt);
  const completeReceipt = usePurchaseReceiptStore((s) => s.completeReceipt);
  const [tab, setTab] = useState<Tab>("lines");

  if (!receipt) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">Goods receipt not found</p>
        <Button variant="ghost" size="sm" asChild className="mt-2">
          <Link href="/suppliers/receipts">Back to receipts</Link>
        </Button>
      </div>
    );
  }

  const vendor = receiptSupplierName(receipt.supplierId);
  const canEdit = ["draft", "receiving", "qc_pending"].includes(receipt.status);

  const primaryAction = () => {
    if (receipt.status === "draft") {
      return (
        <Button size="sm" className="h-8" onClick={() => {
          updateStatus(receipt.id, "receiving");
          toast.success("Receiving started");
        }}>
          <Package className="mr-1.5 h-3.5 w-3.5" /> Start receiving
        </Button>
      );
    }
    if (receipt.status === "receiving" || receipt.status === "qc_pending") {
      return (
        <Button size="sm" className="h-8" onClick={() => postReceipt(receipt.id)}>
          Post receipt
        </Button>
      );
    }
    if (receipt.status === "posted") {
      return (
        <Button size="sm" className="h-8" onClick={() => completeReceipt(receipt.id)}>
          <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Complete
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 px-2">
          <Link href="/suppliers/receipts">
            <ArrowLeft className="mr-1 h-4 w-4" /> Goods receipts
          </Link>
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-semibold">{receipt.number}</h1>
            <Badge variant={receiptStatusBadgeVariant(receipt.status)} className="text-[10px]">
              {RECEIPT_STATUS_LABELS[receipt.status]}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            PO{" "}
            <Link
              href={`/suppliers/purchase-orders/${receipt.purchaseOrderId}`}
              className="text-primary hover:underline"
            >
              {receipt.poNumber}
            </Link>
            {" · "}
            <Link href={`/suppliers/${receipt.supplierId}`} className="text-primary hover:underline">
              {vendor}
            </Link>
            {" · "}
            {receipt.warehouse}
          </p>
        </div>
        <Select
          className="h-8 w-36 text-xs"
          value={receipt.status}
          onChange={(e) => {
            updateStatus(receipt.id, e.target.value as ReceiptStatus);
            toast.success("Status updated");
          }}
        >
          {Object.entries(RECEIPT_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <ActivityTriggerButton
          entity={{
            type: "purchase_receipt",
            id: receipt.id,
            label: receipt.number,
            subtitle: receipt.poNumber,
          }}
          className="h-8 w-8"
        />
        {primaryAction()}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info("Print GRN (mock)")}>
              Print GRN
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem onClick={() => updateStatus(receipt.id, "qc_pending")}>
                Send to QC
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                updateStatus(receipt.id, "cancelled");
                toast.success("Receipt cancelled");
              }}
            >
              Cancel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Received date", value: receipt.receivedDate },
          { label: "Received by", value: receipt.receivedBy },
          { label: "Total qty", value: String(receiptLineQtyTotal(receipt)) },
          { label: "Lines", value: String(receipt.lines.length) },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-input bg-card px-3 py-2">
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className="text-sm font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      {receipt.notes && (
        <p className="rounded-lg border border-input bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          {receipt.notes}
        </p>
      )}

      <div className="flex gap-1 rounded-lg border border-input bg-muted/30 p-1">
        {(["lines", "activity"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "lines" && (
        <div className="overflow-x-auto rounded-lg border border-input">
          <table className="w-full min-w-[720px] text-xs">
            <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Ordered</th>
                <th className="px-3 py-2 font-medium">Receiving</th>
                <th className="px-3 py-2 font-medium">Batch / lot</th>
              </tr>
            </thead>
            <tbody>
              {receipt.lines.map((line) => (
                <tr key={line.id} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">{line.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{line.sku}</td>
                  <td className="px-3 py-2">{line.quantityOrdered}</td>
                  <td className="px-3 py-2">
                    {canEdit ? (
                      <Input
                        type="number"
                        min={0}
                        max={line.quantityOrdered}
                        value={line.quantityReceived}
                        onChange={(e) =>
                          updateLine(receipt.id, line.id, {
                            quantityReceived: Number(e.target.value) || 0,
                          })
                        }
                        className="h-8 w-24 text-xs"
                      />
                    ) : (
                      line.quantityReceived
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {canEdit ? (
                      <Input
                        value={line.batchLot ?? ""}
                        onChange={(e) =>
                          updateLine(receipt.id, line.id, { batchLot: e.target.value || undefined })
                        }
                        placeholder="LOT-…"
                        className="h-8 w-28 text-xs"
                      />
                    ) : (
                      line.batchLot ?? "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "activity" && (
        <div className="rounded-lg border border-input bg-card p-4 text-xs text-muted-foreground">
          On post: triggers <code className="text-foreground">inventory.stock_in.posted</code> (mock) and
          updates PO received quantities.
        </div>
      )}

      {(receipt.status === "posted" || receipt.status === "completed") && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300">
          Stock movement recorded — inventory updated for {receiptLineQtyTotal(receipt)} units at{" "}
          {receipt.warehouse}.
        </div>
      )}
    </div>
  );
}
