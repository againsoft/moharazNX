"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  FileText,
  MoreHorizontal,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import {
  BILL_STATUS_LABELS,
  MATCH_STATUS_LABELS,
  billLineTotal,
  billSupplierName,
  evaluateBillMatch,
  lineQtyVariance,
  lineVariancePct,
  type BillStatus,
} from "@/lib/mock-data/purchase-bills";
import {
  billStatusBadgeVariant,
  matchStatusBadgeVariant,
  usePurchaseBillStore,
} from "@/lib/store/purchase-bill-store";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";

type Tab = "match" | "lines" | "activity";

type Props = { billId: string };

export function BillDetail({ billId }: Props) {
  const bill = usePurchaseBillStore((s) => s.getById(billId));
  const updateStatus = usePurchaseBillStore((s) => s.updateStatus);
  const patchBill = usePurchaseBillStore((s) => s.patchBill);
  const updateLine = usePurchaseBillStore((s) => s.updateLine);
  const runAutoMatch = usePurchaseBillStore((s) => s.runAutoMatch);
  const approveBill = usePurchaseBillStore((s) => s.approveBill);
  const postBill = usePurchaseBillStore((s) => s.postBill);
  const markPaid = usePurchaseBillStore((s) => s.markPaid);
  const [tab, setTab] = useState<Tab>("match");

  const matchResult = useMemo(
    () => (bill ? evaluateBillMatch(bill) : null),
    [bill],
  );

  if (!bill) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">Vendor bill not found</p>
        <Button variant="ghost" size="sm" asChild className="mt-2">
          <Link href="/suppliers/bills">Back to vendor bills</Link>
        </Button>
      </div>
    );
  }

  const vendor = billSupplierName(bill.supplierId);
  const canEdit = ["draft", "unmatched", "exception"].includes(bill.status);

  const primaryAction = () => {
    if (["draft", "unmatched"].includes(bill.status)) {
      return (
        <Button size="sm" className="h-8" onClick={() => runAutoMatch(bill.id)}>
          <Scale className="mr-1.5 h-3.5 w-3.5" /> Run match
        </Button>
      );
    }
    if (bill.status === "matched" || bill.status === "exception") {
      return (
        <Button size="sm" className="h-8" onClick={() => approveBill(bill.id)}>
          <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Approve
        </Button>
      );
    }
    if (bill.status === "approved") {
      return (
        <Button size="sm" className="h-8" onClick={() => postBill(bill.id)}>
          Post bill
        </Button>
      );
    }
    if (bill.status === "posted") {
      return (
        <Button size="sm" className="h-8" onClick={() => markPaid(bill.id)}>
          Record payment
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 px-2">
          <Link href="/suppliers/bills">
            <ArrowLeft className="mr-1 h-4 w-4" /> Vendor bills
          </Link>
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-semibold">{bill.number}</h1>
            <Badge variant={billStatusBadgeVariant(bill.status)} className="text-[10px]">
              {BILL_STATUS_LABELS[bill.status]}
            </Badge>
            <Badge variant={matchStatusBadgeVariant(bill.matchStatus)} className="text-[10px]">
              {MATCH_STATUS_LABELS[bill.matchStatus]}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            PO{" "}
            <Link
              href={`/suppliers/purchase-orders/${bill.purchaseOrderId}`}
              className="text-primary hover:underline"
            >
              {bill.poNumber}
            </Link>
            {bill.receiptNumber && (
              <>
                {" · GR "}
                <Link
                  href={`/suppliers/receipts/${bill.receiptId}`}
                  className="text-primary hover:underline"
                >
                  {bill.receiptNumber}
                </Link>
              </>
            )}
            {" · "}
            <Link href={`/suppliers/${bill.supplierId}`} className="text-primary hover:underline">
              {vendor}
            </Link>
          </p>
        </div>
        <Select
          className="h-8 w-36 text-xs"
          value={bill.status}
          onChange={(e) => {
            updateStatus(bill.id, e.target.value as BillStatus);
            toast.success("Status updated");
          }}
        >
          {Object.entries(BILL_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <ActivityTriggerButton
          entity={{
            type: "purchase_bill",
            id: bill.id,
            label: bill.number,
            subtitle: bill.poNumber,
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
            <DropdownMenuItem onClick={() => runAutoMatch(bill.id)}>Re-run match</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Download invoice PDF (mock)")}>
              <FileText className="mr-2 h-3.5 w-3.5" /> Download invoice
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  updateStatus(bill.id, "cancelled");
                  toast.success("Bill cancelled");
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
          { label: "Vendor invoice", value: bill.vendorInvoiceNumber || "—" },
          { label: "Bill date", value: bill.billDate },
          { label: "Due date", value: bill.dueDate },
          { label: "Lines", value: String(bill.lines.length) },
          { label: "Total", value: formatCurrency(bill.total) },
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
            <label className="mb-1 block text-[10px] text-muted-foreground">Vendor invoice #</label>
            <Input
              value={bill.vendorInvoiceNumber}
              onChange={(e) => patchBill(bill.id, { vendorInvoiceNumber: e.target.value })}
              placeholder="INV-…"
              className="h-8 w-40 text-xs"
            />
          </div>
        </div>
      )}

      {bill.notes && (
        <p className="rounded-lg border border-input bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          {bill.notes}
        </p>
      )}

      <div className="flex gap-1 rounded-lg border border-input bg-muted/30 p-1">
        {(["match", "lines", "activity"] as Tab[]).map((t) => (
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
            {t === "match" ? "Three-way match" : t}
          </button>
        ))}
      </div>

      {tab === "match" && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-lg border border-input">
            <table className="w-full min-w-[880px] text-xs">
              <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium text-right">PO qty</th>
                  <th className="px-3 py-2 font-medium text-right">Receipt qty</th>
                  <th className="px-3 py-2 font-medium text-right">Bill qty</th>
                  <th className="px-3 py-2 font-medium text-right">PO price</th>
                  <th className="px-3 py-2 font-medium text-right">Bill price</th>
                  <th className="px-3 py-2 font-medium text-right">Price var. %</th>
                  <th className="px-3 py-2 font-medium text-right">Qty var.</th>
                </tr>
              </thead>
              <tbody>
                {bill.lines.map((line) => {
                  const priceVar = lineVariancePct(line);
                  const qtyVar = lineQtyVariance(line);
                  const hasIssue =
                    priceVar > 2 ||
                    qtyVar !== 0 ||
                    line.quantityBill !== line.quantityPo;
                  return (
                    <tr
                      key={line.id}
                      className={cn(
                        "border-b last:border-0",
                        hasIssue && "bg-amber-500/5",
                      )}
                    >
                      <td className="px-3 py-2">
                        <p className="font-medium">{line.name}</p>
                        <p className="text-[10px] text-muted-foreground">{line.sku}</p>
                      </td>
                      <td className="px-3 py-2 text-right">{line.quantityPo}</td>
                      <td className="px-3 py-2 text-right">{line.quantityReceipt}</td>
                      <td className="px-3 py-2 text-right font-medium">{line.quantityBill}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(line.unitPricePo)}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(line.unitPriceBill)}</td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right",
                          priceVar > 2 && "font-semibold text-amber-700 dark:text-amber-400",
                        )}
                      >
                        {priceVar.toFixed(1)}%
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right",
                          qtyVar !== 0 && "font-semibold text-amber-700 dark:text-amber-400",
                        )}
                      >
                        {qtyVar > 0 ? `+${qtyVar}` : qtyVar}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {matchResult && matchResult.matchStatus !== "matched" && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
              {bill.status === "exception"
                ? "Match exception — finance approval required before posting."
                : "Variances detected — run match after correcting bill lines or approve with override."}
            </div>
          )}
          {bill.matchStatus === "matched" && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300">
              Three-way match passed — PO, receipt, and bill quantities and prices align within tolerance.
            </div>
          )}
        </div>
      )}

      {tab === "lines" && (
        <div className="overflow-x-auto rounded-lg border border-input">
          <table className="w-full min-w-[720px] text-xs">
            <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Bill qty</th>
                <th className="px-3 py-2 font-medium">Unit price</th>
                <th className="px-3 py-2 font-medium">Line total</th>
              </tr>
            </thead>
            <tbody>
              {bill.lines.map((line) => (
                <tr key={line.id} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">{line.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{line.sku}</td>
                  <td className="px-3 py-2">
                    {canEdit ? (
                      <Input
                        type="number"
                        min={0}
                        value={line.quantityBill}
                        onChange={(e) =>
                          updateLine(bill.id, line.id, {
                            quantityBill: Number(e.target.value) || 0,
                          })
                        }
                        className="h-8 w-24 text-xs"
                      />
                    ) : (
                      line.quantityBill
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {canEdit ? (
                      <Input
                        type="number"
                        min={0}
                        value={line.unitPriceBill}
                        onChange={(e) =>
                          updateLine(bill.id, line.id, {
                            unitPriceBill: Number(e.target.value) || 0,
                          })
                        }
                        className="h-8 w-28 text-xs"
                      />
                    ) : (
                      formatCurrency(line.unitPriceBill)
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium">{formatCurrency(billLineTotal(line))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "activity" && (
        <div className="rounded-lg border border-input bg-card p-4 text-xs text-muted-foreground">
          On post: triggers <code className="text-foreground">accounting.bill.posted</code> (mock AP
          entry) and updates PO billed quantities.
        </div>
      )}

      {bill.status === "paid" && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300">
          Payment recorded — {formatCurrency(bill.total)} settled via accounts payable.
        </div>
      )}
    </div>
  );
}
