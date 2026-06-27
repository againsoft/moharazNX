"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, MoreHorizontal, Send, Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  QUOTATION_STATUS_LABELS,
  RFQ_STATUS_LABELS,
  quoteTotalFromLines,
  rfqSupplierName,
  type RfqStatus,
} from "@/lib/mock-data/purchase-rfq";
import {
  quotationStatusBadgeVariant,
  rfqStatusBadgeVariant,
  usePurchaseRfqStore,
} from "@/lib/store/purchase-rfq-store";
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

type Tab = "lines" | "comparison" | "quotes" | "activity";

const TABS: { id: Tab; label: string }[] = [
  { id: "lines", label: "Lines" },
  { id: "comparison", label: "Comparison" },
  { id: "quotes", label: "Quotations" },
  { id: "activity", label: "Activity" },
];

type Props = { rfqId: string };

export function RfqDetail({ rfqId }: Props) {
  const router = useRouter();
  const rfq = usePurchaseRfqStore((s) => s.getById(rfqId));
  const updateStatus = usePurchaseRfqStore((s) => s.updateStatus);
  const awardQuote = usePurchaseRfqStore((s) => s.awardQuote);
  const patchRfq = usePurchaseRfqStore((s) => s.patchRfq);
  const [tab, setTab] = useState<Tab>("comparison");

  const submittedQuotes = useMemo(
    () => rfq?.quotes.filter((q) => q.status !== "draft") ?? [],
    [rfq],
  );

  if (!rfq) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <p className="text-sm font-medium">RFQ not found</p>
        <Button variant="ghost" size="sm" asChild className="mt-2">
          <Link href="/suppliers/rfq">Back to RFQ list</Link>
        </Button>
      </div>
    );
  }

  const createPoFromAward = () => {
    if (!rfq.awardedSupplierId) {
      toast.error("Award a vendor quote first");
      return;
    }
    patchRfq(rfq.id, { status: "po_created", linkedPoId: "po_1001" });
    toast.success("Draft PO created from RFQ award (mock PO-8821)");
    router.push("/suppliers/purchase-orders/po_007");
  };

  const headerAction = () => {
    if (rfq.status === "draft") {
      return (
        <Button
          size="sm"
          className="h-8"
          onClick={() => {
            updateStatus(rfq.id, "sent");
            toast.success("RFQ sent to invited vendors");
          }}
        >
          <Send className="mr-1.5 h-3.5 w-3.5" /> Send RFQ
        </Button>
      );
    }
    if (rfq.status === "approved") {
      return (
        <Button size="sm" className="h-8" onClick={createPoFromAward}>
          <FileText className="mr-1.5 h-3.5 w-3.5" /> Create PO
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 px-2">
          <Link href="/suppliers/rfq">
            <ArrowLeft className="mr-1 h-4 w-4" /> RFQ
          </Link>
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-semibold">{rfq.number}</h1>
            <Badge variant={rfqStatusBadgeVariant(rfq.status)} className="text-[10px]">
              {RFQ_STATUS_LABELS[rfq.status]}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {rfq.title} · Deadline {rfq.deadline} · Buyer {rfq.buyer}
          </p>
        </div>
        <Select
          className="h-8 w-40 text-xs"
          value={rfq.status}
          onChange={(e) => {
            updateStatus(rfq.id, e.target.value as RfqStatus);
            toast.success("Status updated");
          }}
        >
          {Object.entries(RFQ_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <ActivityTriggerButton
          entity={{ type: "purchase_rfq", id: rfq.id, label: rfq.number, subtitle: rfq.title }}
          className="h-8 w-8"
        />
        {headerAction()}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.info("Email RFQ to vendors (mock)")}>
              Email vendors
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => {
                updateStatus(rfq.id, "cancelled");
                toast.success("RFQ cancelled");
              }}
            >
              Cancel RFQ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Vendors invited", value: String(rfq.invitedSupplierIds.length) },
          { label: "Quotes received", value: String(submittedQuotes.length) },
          {
            label: "Awarded vendor",
            value: rfq.awardedSupplierId ? rfqSupplierName(rfq.awardedSupplierId) : "—",
          },
          {
            label: "Linked PO",
            value: rfq.linkedPoId ? (
              <Link href={`/suppliers/purchase-orders/${rfq.linkedPoId}`} className="text-primary hover:underline">
                {rfq.linkedPoId}
              </Link>
            ) : (
              "—"
            ),
          },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-input bg-card px-3 py-2">
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
            <p className="text-sm font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      {rfq.notes && (
        <p className="rounded-lg border border-input bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          {rfq.notes}
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
          <table className="w-full min-w-[480px] text-xs">
            <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Product</th>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Qty</th>
              </tr>
            </thead>
            <tbody>
              {rfq.lines.map((line) => (
                <tr key={line.id} className="border-b last:border-0">
                  <td className="px-3 py-2 font-medium">{line.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{line.sku}</td>
                  <td className="px-3 py-2">{line.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "comparison" && (
        <div className="space-y-3">
          {submittedQuotes.length === 0 ? (
            <p className="rounded-lg border border-dashed border-input p-8 text-center text-sm text-muted-foreground">
              No vendor quotes yet. Send RFQ and wait for responses.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-input">
              <table className="w-full min-w-[720px] text-xs">
                <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Line item</th>
                    <th className="px-3 py-2 font-medium">Qty</th>
                    {submittedQuotes.map((q) => (
                      <th key={q.id} className="px-3 py-2 font-medium">
                        {rfqSupplierName(q.supplierId)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rfq.lines.map((line) => {
                    const prices = submittedQuotes.map((q) => {
                      const lq = q.lineQuotes.find((x) => x.rfqLineId === line.id);
                      return lq?.unitPrice ?? null;
                    });
                    const min = Math.min(...prices.filter((p): p is number => p !== null));
                    return (
                      <tr key={line.id} className="border-b last:border-0">
                        <td className="px-3 py-2 font-medium">{line.name}</td>
                        <td className="px-3 py-2">{line.quantity}</td>
                        {submittedQuotes.map((q, i) => {
                          const price = prices[i];
                          const isBest = price !== null && price === min;
                          return (
                            <td key={q.id} className="px-3 py-2">
                              {price != null ? (
                                <span className={isBest ? "font-semibold text-emerald-600" : ""}>
                                  {formatCurrency(price)}
                                  {isBest && " ★"}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  <tr className="bg-muted/20 font-medium">
                    <td className="px-3 py-2" colSpan={2}>
                      Total
                    </td>
                    {submittedQuotes.map((q) => {
                      const total = quoteTotalFromLines(rfq, q);
                      const totals = submittedQuotes.map((x) => quoteTotalFromLines(rfq, x));
                      const minTotal = Math.min(...totals);
                      return (
                        <td key={q.id} className="px-3 py-2">
                          <span className={total === minTotal ? "text-emerald-600" : ""}>
                            {formatCurrency(total)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="text-muted-foreground">
                    <td className="px-3 py-2" colSpan={2}>
                      Lead time / MOQ
                    </td>
                    {submittedQuotes.map((q) => (
                      <td key={q.id} className="px-3 py-2">
                        {q.leadTimeDays}d · MOQ {q.moq}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {submittedQuotes.length > 0 && rfq.status !== "po_created" && (
            <div className="flex flex-wrap gap-2">
              {submittedQuotes.map((q) => (
                <Button
                  key={q.id}
                  variant={rfq.awardedSupplierId === q.supplierId ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    awardQuote(rfq.id, q.id);
                    toast.success(`Awarded ${rfqSupplierName(q.supplierId)}`);
                  }}
                >
                  <Trophy className="mr-1.5 h-3.5 w-3.5" />
                  Award {rfqSupplierName(q.supplierId)}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "quotes" && (
        <div className="overflow-x-auto rounded-lg border border-input">
          <table className="w-full min-w-[640px] text-xs">
            <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">Vendor</th>
                <th className="px-3 py-2 font-medium">Quote #</th>
                <th className="px-3 py-2 font-medium">Total</th>
                <th className="px-3 py-2 font-medium">Lead</th>
                <th className="px-3 py-2 font-medium">Valid until</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rfq.quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    No quotations recorded
                  </td>
                </tr>
              ) : (
                rfq.quotes.map((q) => (
                  <tr key={q.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-3 py-2">
                      <Link href={`/suppliers/${q.supplierId}`} className="text-primary hover:underline">
                        {rfqSupplierName(q.supplierId)}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{q.quoteNumber}</td>
                    <td className="px-3 py-2 font-medium">{formatCurrency(quoteTotalFromLines(rfq, q))}</td>
                    <td className="px-3 py-2">{q.leadTimeDays} days</td>
                    <td className="px-3 py-2">{q.validUntil}</td>
                    <td className="px-3 py-2">
                      <Badge variant={quotationStatusBadgeVariant(q.status)} className="text-[10px]">
                        {QUOTATION_STATUS_LABELS[q.status]}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "activity" && (
        <div className="rounded-lg border border-input bg-card p-4 text-xs text-muted-foreground">
          RFQ timeline — use Activity drawer on header. Invited:{" "}
          {rfq.invitedSupplierIds.map((id) => rfqSupplierName(id)).join(", ")}
        </div>
      )}
    </div>
  );
}
