"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  MoreHorizontal,
  Package,
  RotateCcw,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import {
  RETURN_REASON_LABELS,
  RETURN_STATUS_LABELS,
  returnLineTotal,
  returnSupplierName,
  type ReturnReason,
  type ReturnStatus,
} from "@/lib/mock-data/purchase-returns";
import {
  returnStatusBadgeVariant,
  usePurchaseReturnStore,
} from "@/lib/store/purchase-return-store";
import { cn, formatCurrency } from "@/lib/utils";
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

type Props = { returnId: string };

export function ReturnDetail({ returnId }: Props) {
  const ret = usePurchaseReturnStore((s) => s.getById(returnId));
  const updateStatus = usePurchaseReturnStore((s) => s.updateStatus);
  const patchReturn = usePurchaseReturnStore((s) => s.patchReturn);
  const updateLine = usePurchaseReturnStore((s) => s.updateLine);
  const approveReturn = usePurchaseReturnStore((s) => s.approveReturn);
  const rejectReturn = usePurchaseReturnStore((s) => s.rejectReturn);
  const shipReturn = usePurchaseReturnStore((s) => s.shipReturn);
  const confirmVendorReceived = usePurchaseReturnStore((s) => s.confirmVendorReceived);
  const creditReturn = usePurchaseReturnStore((s) => s.creditReturn);
  const [tab, setTab] = useState<Tab>("lines");

  if (!ret) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">Purchase return not found</p>
        <Button variant="ghost" size="sm" asChild className="mt-2">
          <Link href="/suppliers/returns">Back to returns</Link>
        </Button>
      </div>
    );
  }

  const vendor = returnSupplierName(ret.supplierId);
  const canEdit = ret.status === "requested";
  const totalQty = ret.lines.reduce((s, l) => s + l.quantityReturn, 0);

  const primaryAction = () => {
    if (ret.status === "requested") {
      return (
        <Button size="sm" className="h-8" onClick={() => approveReturn(ret.id)}>
          <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Approve
        </Button>
      );
    }
    if (ret.status === "approved") {
      return (
        <Button size="sm" className="h-8" onClick={() => shipReturn(ret.id)}>
          <Truck className="mr-1.5 h-3.5 w-3.5" /> Ship return
        </Button>
      );
    }
    if (ret.status === "shipped") {
      return (
        <Button size="sm" className="h-8" onClick={() => confirmVendorReceived(ret.id)}>
          <Package className="mr-1.5 h-3.5 w-3.5" /> Vendor received
        </Button>
      );
    }
    if (ret.status === "vendor_received") {
      return (
        <Button size="sm" className="h-8" onClick={() => creditReturn(ret.id)}>
          Post credit note
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 px-2">
          <Link href="/suppliers/returns">
            <ArrowLeft className="mr-1 h-4 w-4" /> Vendor returns
          </Link>
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-semibold">{ret.number}</h1>
            <Badge variant={returnStatusBadgeVariant(ret.status)} className="text-[10px]">
              {RETURN_STATUS_LABELS[ret.status]}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {RETURN_REASON_LABELS[ret.reason]}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            PO{" "}
            <Link
              href={`/suppliers/purchase-orders/${ret.purchaseOrderId}`}
              className="text-primary hover:underline"
            >
              {ret.poNumber}
            </Link>
            {ret.receiptNumber && (
              <>
                {" · GR "}
                <Link
                  href={`/suppliers/receipts/${ret.receiptId}`}
                  className="text-primary hover:underline"
                >
                  {ret.receiptNumber}
                </Link>
              </>
            )}
            {" · "}
            <Link href={`/suppliers/${ret.supplierId}`} className="text-primary hover:underline">
              {vendor}
            </Link>
            {" · "}
            {ret.warehouse}
          </p>
        </div>
        <Select
          className="h-8 w-40 text-xs"
          value={ret.status}
          onChange={(e) => {
            updateStatus(ret.id, e.target.value as ReturnStatus);
            toast.success("Status updated");
          }}
        >
          {Object.entries(RETURN_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <ActivityTriggerButton
          entity={{
            type: "purchase_return",
            id: ret.id,
            label: ret.number,
            subtitle: ret.poNumber,
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
            {ret.status === "requested" && (
              <DropdownMenuItem onClick={() => rejectReturn(ret.id)}>Reject</DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => toast.info("Print RMA label (mock)")}>
              <RotateCcw className="mr-2 h-3.5 w-3.5" /> Print RMA
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  updateStatus(ret.id, "cancelled");
                  toast.success("Return cancelled");
                }}
              >
                Cancel
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Requested", value: ret.requestDate },
          { label: "Requested by", value: ret.requestedBy },
          { label: "Total qty", value: String(totalQty) },
          { label: "Credit value", value: formatCurrency(ret.creditAmount) },
          { label: "Tracking", value: ret.trackingNumber || "—" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-input bg-card px-3 py-2">
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className="text-sm font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      {canEdit && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-input bg-muted/20 px-3 py-3">
          <div>
            <label className="mb-1 block text-[10px] text-muted-foreground">Return reason</label>
            <Select
              className="h-8 w-40 text-xs"
              value={ret.reason}
              onChange={(e) => patchReturn(ret.id, { reason: e.target.value as ReturnReason })}
            >
              {Object.entries(RETURN_REASON_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}

      {ret.notes && (
        <p className="rounded-lg border border-input bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          {ret.notes}
        </p>
      )}

      <div className="flex gap-1 rounded-lg border border-input bg-muted/30 p-1">
        {(["lines", "activity"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "lines" && (
        <div className="overflow-x-auto rounded-lg border border-input">
          <table className="w-full min-w-[760px] text-xs">
            <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Return qty</th>
                <th className="px-3 py-2 font-medium">Unit price</th>
                <th className="px-3 py-2 font-medium">Line credit</th>
                <th className="px-3 py-2 font-medium">Reason</th>
                <th className="px-3 py-2 font-medium">Batch / lot</th>
              </tr>
            </thead>
            <tbody>
              {ret.lines.map((line) => (
                <tr key={line.id} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">{line.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{line.sku}</td>
                  <td className="px-3 py-2">
                    {canEdit ? (
                      <Input
                        type="number"
                        min={0}
                        value={line.quantityReturn}
                        onChange={(e) =>
                          updateLine(ret.id, line.id, {
                            quantityReturn: Number(e.target.value) || 0,
                          })
                        }
                        className="h-8 w-24 text-xs"
                      />
                    ) : (
                      line.quantityReturn
                    )}
                  </td>
                  <td className="px-3 py-2">{formatCurrency(line.unitPrice)}</td>
                  <td className="px-3 py-2 font-medium">{formatCurrency(returnLineTotal(line))}</td>
                  <td className="px-3 py-2">
                    {canEdit ? (
                      <Select
                        className="h-8 w-32 text-xs"
                        value={line.reason}
                        onChange={(e) =>
                          updateLine(ret.id, line.id, { reason: e.target.value as ReturnReason })
                        }
                      >
                        {Object.entries(RETURN_REASON_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      RETURN_REASON_LABELS[line.reason]
                    )}
                  </td>
                  <td className="px-3 py-2">{line.batchLot ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "activity" && (
        <div className="rounded-lg border border-input bg-card p-4 text-xs text-muted-foreground">
          On ship: triggers <code className="text-foreground">inventory.stock_out.posted</code> (mock) and
          updates PO returned quantities. On credit:{" "}
          <code className="text-foreground">purchase.return.credited</code> posts vendor debit note.
        </div>
      )}

      {ret.status === "shipped" && ret.trackingNumber && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
          In transit — tracking {ret.trackingNumber}
        </div>
      )}

      {ret.status === "credited" && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300">
          Credit note posted — {formatCurrency(ret.creditAmount)} applied against vendor AP balance.
        </div>
      )}
    </div>
  );
}
