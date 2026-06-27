"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  MoreHorizontal,
  Package,
  RotateCcw,
  Send,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import {
  PURCHASE_ORDER_STATUS_LABELS,
  formatPurchaseOrderVendor,
  purchaseOrderReceivedPct,
  type PurchaseOrderStatus,
} from "@/lib/mock-data/purchase-orders";
import {
  poStatusBadgeVariant,
  usePurchaseOrderStore,
} from "@/lib/store/purchase-order-store";
import { usePurchaseReceiptStore } from "@/lib/store/purchase-receipt-store";
import { BILL_STATUS_LABELS } from "@/lib/mock-data/purchase-bills";
import {
  billStatusBadgeVariant,
  usePurchaseBillStore,
} from "@/lib/store/purchase-bill-store";
import {
  RETURN_STATUS_LABELS,
} from "@/lib/mock-data/purchase-returns";
import {
  returnStatusBadgeVariant,
  usePurchaseReturnStore,
} from "@/lib/store/purchase-return-store";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/native-select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";

type Tab = "lines" | "receipts" | "bills" | "returns" | "activity";

const TABS: { id: Tab; label: string }[] = [
  { id: "lines", label: "Lines" },
  { id: "receipts", label: "Receipts" },
  { id: "bills", label: "Bills" },
  { id: "returns", label: "Returns" },
  { id: "activity", label: "Activity" },
];

type Props = { orderId: string };

export function PurchaseOrderDetail({ orderId }: Props) {
  const router = useRouter();
  const order = usePurchaseOrderStore((s) => s.getById(orderId));
  const updateStatus = usePurchaseOrderStore((s) => s.updateStatus);
  const poReceipts = usePurchaseReceiptStore((s) => s.getByPurchaseOrder(orderId));
  const poBills = usePurchaseBillStore((s) => s.getByPurchaseOrder(orderId));
  const poReturns = usePurchaseReturnStore((s) => s.getByPurchaseOrder(orderId));
  const [tab, setTab] = useState<Tab>("lines");

  if (!order) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">Purchase order not found</p>
        <Button variant="ghost" size="sm" asChild className="mt-2">
          <Link href="/suppliers/purchase-orders">Back to purchase orders</Link>
        </Button>
      </div>
    );
  }

  const receivedPct = purchaseOrderReceivedPct(order);
  const vendorName = formatPurchaseOrderVendor(order);
  const canBill =
    order.lines.some((l) => l.quantityReceived > 0) ||
    poReceipts.some((r) => r.status === "posted" || r.status === "completed");
  const canReturn = canBill;

  const actionForStatus = () => {
    switch (order.status) {
      case "draft":
        return (
          <Button size="sm" className="h-8" onClick={() => {
            updateStatus(order.id, "pending_approval");
            toast.success("Submitted for approval");
          }}>
            Submit for approval
          </Button>
        );
      case "pending_approval":
        return (
          <Button size="sm" className="h-8" onClick={() => {
            updateStatus(order.id, "approved");
            toast.success("PO approved");
          }}>
            Approve
          </Button>
        );
      case "approved":
        return (
          <Button size="sm" className="h-8" onClick={() => {
            updateStatus(order.id, "ordered");
            toast.success("PO sent to vendor (mock)");
          }}>
            <Send className="mr-1.5 h-3.5 w-3.5" /> Send to vendor
          </Button>
        );
      case "ordered":
      case "partially_received":
        return (
          <Button
            size="sm"
            className="h-8"
            onClick={() => router.push(`/suppliers/receipts/create?poId=${order.id}`)}
          >
            <Truck className="mr-1.5 h-3.5 w-3.5" /> Receive
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 px-2">
          <Link href="/suppliers/purchase-orders">
            <ArrowLeft className="mr-1 h-4 w-4" /> Purchase orders
          </Link>
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-semibold">{order.number}</h1>
            <Badge variant={poStatusBadgeVariant(order.status)} className="text-[10px]">
              {PURCHASE_ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {order.orderDate} ·{" "}
            <Link href={`/suppliers/${order.supplierId}`} className="text-primary hover:underline">
              {vendorName}
            </Link>
            {" · "}
            {order.warehouse}
          </p>
        </div>
        <Select
          className="h-8 w-40 text-xs"
          value={order.status}
          onChange={(e) => {
            updateStatus(order.id, e.target.value as PurchaseOrderStatus);
            toast.success("Status updated");
          }}
        >
          {Object.entries(PURCHASE_ORDER_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <ActivityTriggerButton
          entity={{ type: "purchase_order", id: order.id, label: order.number, subtitle: vendorName }}
          className="h-8 w-8"
        />
        {actionForStatus()}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info("Print PO PDF (mock)")}>
              <FileText className="mr-2 h-3.5 w-3.5" /> Print PO
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Create vendor bill (P4)")}>
              Create bill
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                updateStatus(order.id, "cancelled");
                toast.success("PO cancelled");
              }}
            >
              Cancel PO
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total", value: formatCurrency(order.total) },
          { label: "Expected", value: order.expectedDate },
          { label: "Buyer", value: order.buyer },
          { label: "Received", value: `${receivedPct}%` },
          { label: "Lines", value: String(order.lines.length) },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-input bg-card px-3 py-2">
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className="text-sm font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      {order.notes && (
        <p className="rounded-lg border border-input bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          {order.notes}
        </p>
      )}

      <div className="flex gap-1 rounded-lg border border-input bg-muted/30 p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "lines" && (
        <div className="overflow-x-auto rounded-lg border border-input">
          <table className="w-full min-w-[640px] text-xs">
            <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Ordered</th>
                <th className="px-3 py-2 font-medium">Received</th>
                <th className="px-3 py-2 font-medium">Billed</th>
                <th className="px-3 py-2 font-medium">Returned</th>
                <th className="px-3 py-2 font-medium">Unit price</th>
                <th className="px-3 py-2 font-medium">Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((line) => (
                <tr key={line.id} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-3 py-2 font-medium">{line.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{line.sku}</td>
                  <td className="px-3 py-2">{line.quantityOrdered}</td>
                  <td className="px-3 py-2">{line.quantityReceived}</td>
                  <td className="px-3 py-2">{line.quantityBilled}</td>
                  <td className="px-3 py-2">{line.quantityReturned}</td>
                  <td className="px-3 py-2">{formatCurrency(line.unitPrice)}</td>
                  <td className="px-3 py-2 font-medium">
                    {formatCurrency(line.quantityOrdered * line.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "receipts" && (
        <div className="space-y-3">
          {poReceipts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-input p-8 text-center text-sm text-muted-foreground">
              No goods receipts yet. Use Receive when PO is ordered.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-input">
              <table className="w-full min-w-[520px] text-xs">
                <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">GR #</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Qty</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {poReceipts.map((gr) => (
                    <tr key={gr.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2">
                        <Link
                          href={`/suppliers/receipts/${gr.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {gr.number}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{gr.receivedDate}</td>
                      <td className="px-3 py-2">
                        {gr.lines.reduce((s, l) => s + l.quantityReceived, 0)}
                      </td>
                      <td className="px-3 py-2 capitalize">{gr.status.replace(/_/g, " ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {["ordered", "partially_received"].includes(order.status) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/suppliers/receipts/create?poId=${order.id}`)}
            >
              <Truck className="mr-1.5 h-3.5 w-3.5" /> New receipt
            </Button>
          )}
        </div>
      )}

      {tab === "bills" && (
        <div className="space-y-3">
          {poBills.length === 0 ? (
            <p className="rounded-lg border border-dashed border-input p-8 text-center text-sm text-muted-foreground">
              No vendor bills yet. Create after goods receipt is posted.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-input">
              <table className="w-full min-w-[560px] text-xs">
                <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Bill #</th>
                    <th className="px-3 py-2 font-medium">Vendor inv.</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Total</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {poBills.map((bill) => (
                    <tr key={bill.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2">
                        <Link
                          href={`/suppliers/bills/${bill.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {bill.number}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{bill.vendorInvoiceNumber || "—"}</td>
                      <td className="px-3 py-2">{bill.billDate}</td>
                      <td className="px-3 py-2">{formatCurrency(bill.total)}</td>
                      <td className="px-3 py-2">
                        <Badge variant={billStatusBadgeVariant(bill.status)} className="text-[10px]">
                          {BILL_STATUS_LABELS[bill.status]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {canBill && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/suppliers/bills/create?poId=${order.id}`)}
            >
              <FileText className="mr-1.5 h-3.5 w-3.5" /> New vendor bill
            </Button>
          )}
        </div>
      )}

      {tab === "returns" && (
        <div className="space-y-3">
          {poReturns.length === 0 ? (
            <p className="rounded-lg border border-dashed border-input p-8 text-center text-sm text-muted-foreground">
              No vendor returns yet. Create after goods are received.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-input">
              <table className="w-full min-w-[560px] text-xs">
                <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Return #</th>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Credit</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {poReturns.map((pr) => (
                    <tr key={pr.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2">
                        <Link
                          href={`/suppliers/returns/${pr.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {pr.number}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{pr.requestDate}</td>
                      <td className="px-3 py-2">{formatCurrency(pr.creditAmount)}</td>
                      <td className="px-3 py-2">
                        <Badge variant={returnStatusBadgeVariant(pr.status)} className="text-[10px]">
                          {RETURN_STATUS_LABELS[pr.status]}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {canReturn && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/suppliers/returns/create?poId=${order.id}`)}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> New return
            </Button>
          )}
        </div>
      )}

      {tab === "activity" && (
        <div className="rounded-lg border border-input bg-card p-4 text-xs text-muted-foreground">
          <p>Procurement timeline — uses global Activity drawer (prototype).</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => router.push(`/suppliers/${order.supplierId}`)}
          >
            View vendor activity
          </Button>
        </div>
      )}
    </div>
  );
}
