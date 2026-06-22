"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Edit2,
  FileText,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Printer,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/lib/mock-data/orders";
import { ORDER_STATUS_LABELS } from "@/lib/mock-data/orders";
import { openOrderPrint } from "@/lib/orders/open-order-print";
import { useOrderStore } from "@/lib/store/order-store";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { statusBadgeVariant } from "@/lib/order-status";
import { useOrderStoreHydrated } from "@/lib/hooks/use-order-store-hydrated";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";

type Props = {
  orderId: string;
  isDrawer?: boolean;
  onClose?: () => void;
  order?: Order | null;
  loading?: boolean;
  onStatusChange?: (id: string, status: OrderStatus) => void | Promise<void>;
};

export function OrderDetailWorkspace({
  orderId,
  isDrawer = false,
  onClose,
  order: orderProp,
  loading: loadingProp = false,
  onStatusChange,
}: Props) {
  const hydrated = useOrderStoreHydrated();
  const canWrite = useAdminCanWrite();
  const storeOrder = useOrderStore((s) => s.orders.find((o) => o.id === orderId));
  const storeUpdateStatus = useOrderStore((s) => s.updateStatus);
  const order = orderProp ?? storeOrder;
  const loading = loadingProp || (!orderProp && !hydrated);

  const updateStatus = (id: string, status: OrderStatus) => {
    if (onStatusChange) {
      void onStatusChange(id, status);
      return;
    }
    storeUpdateStatus(id, status);
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">Loading order…</div>
    );
  }

  if (!order) {
    return (
      <div className="p-10 text-center">
        <p className="text-sm font-medium">Order not found</p>
        <Button variant="ghost" size="sm" asChild className="mt-2">
          <Link href="/orders/all">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const fulfillmentLabel =
    order.shipmentStatus === "unfulfilled"
      ? "Unfulfilled"
      : order.shipmentStatus === "partial"
        ? "Partially fulfilled"
        : order.shipmentStatus === "delivered"
          ? "Delivered"
          : "Fulfilled";

  const showAiHint = order.aiInsights.riskLevel !== "low";

  /* ── Shared sub-components ── */
  const metaSidebar = (
    <div className="space-y-3">
      <MetaBlock title="Customer">
        <p className="font-medium">{order.customer.name}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground capitalize">{order.customer.group}</p>
        <div className="mt-2 space-y-1.5">
          <a href={`tel:${order.customer.phone}`} className="flex items-center gap-1.5 text-[11px] text-primary">
            <Phone className="h-3 w-3" /> {order.customer.phone}
          </a>
          <a href={`mailto:${order.customer.email}`} className="flex items-center gap-1.5 text-[11px] text-primary">
            <Mail className="h-3 w-3" /> {order.customer.email}
          </a>
        </div>
      </MetaBlock>

      <MetaBlock title="Shipping">
        <div className="flex gap-2 text-[11px] leading-relaxed text-muted-foreground">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
          <div>
            <p>{order.shipping.address}</p>
            <p>{order.shipping.city}, {order.shipping.region}</p>
          </div>
        </div>
        <Button
          variant="ghost" size="sm"
          className="mt-2 h-6 px-0 text-[10px] text-primary"
          onClick={() => { navigator.clipboard?.writeText(order.shipping.address); toast.success("Address copied"); }}
        >
          <Copy className="mr-1 h-3 w-3" /> Copy
        </Button>
      </MetaBlock>

      <MetaBlock title="Payment">
        <p className="text-sm font-medium capitalize">{order.payment.method}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Paid {formatCurrency(order.payment.paidAmount)}
          {order.payment.dueAmount > 0 && ` · Due ${formatCurrency(order.payment.dueAmount)}`}
        </p>
        {order.payment.transactionId && (
          <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{order.payment.transactionId}</p>
        )}
      </MetaBlock>

      {order.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 px-1">
          {order.tags.map((t) => (
            <Badge key={t} variant="outline" className="text-[9px]">{t}</Badge>
          ))}
        </div>
      )}
    </div>
  );

  const itemsCard = (
    <div className="overflow-hidden rounded-xl border border-input/70 bg-card shadow-sm">
      <div className="border-b border-input/60 px-4 py-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="divide-y divide-input/50">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
            {item.imageUrl && (
              <img src={item.imageUrl} alt="" className="h-9 w-9 shrink-0 rounded-md object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {item.sku}{item.variant ? ` · ${item.variant}` : ""}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-medium tabular-nums">{formatCurrency(item.lineTotal)}</p>
              <p className="text-[10px] tabular-nums text-muted-foreground">
                {formatCurrency(item.unitPrice)} × {item.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-1 border-t border-input/60 bg-muted/10 px-4 py-3 text-xs">
        <TotalRow label="Subtotal" value={formatCurrency(order.subtotal)} />
        {order.discountAmount > 0 && (
          <TotalRow label="Discount" value={`−${formatCurrency(order.discountAmount)}`} />
        )}
        <TotalRow label="Tax" value={formatCurrency(order.taxAmount)} />
        <TotalRow label="Shipping" value={formatCurrency(order.shippingAmount)} />
        <TotalRow label="Total" value={formatCurrency(order.grandTotal)} bold />
      </div>
    </div>
  );

  const dropdown = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isDrawer && (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/orders/${order.id}`}>Open full view</Link>
            </DropdownMenuItem>
            {canWrite && (
              <DropdownMenuItem asChild>
                <Link href={`/orders/${order.id}/edit`}>
                  <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
                </Link>
              </DropdownMenuItem>
            )}
          </>
        )}
        <DropdownMenuItem onClick={() => openOrderPrint(order.id, "invoice")}>
          <FileText className="mr-2 h-3.5 w-3.5" /> Print invoice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openOrderPrint(order.id, "packing-slip")}>
          <Printer className="mr-2 h-3.5 w-3.5" /> Packing slip
        </DropdownMenuItem>
        {canWrite && (
          <>
            <DropdownMenuItem onClick={() => toast.info("Duplicate order")}>Duplicate</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Cancel order")}>Cancel order</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  /* ── DRAWER layout ── */
  if (isDrawer) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        {/* Sticky header */}
        <div className="shrink-0 border-b bg-background px-5 py-3">
          {/* Row 1: order# + badge + close */}
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold">{order.orderNumber}</h2>
                <Badge variant={statusBadgeVariant(order.status)} className="text-[10px]">
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {new Date(order.orderDate).toLocaleString()} · {order.source}
              </p>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" className="h-8 w-8 shrink-0 p-0" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {/* Row 2: actions */}
          <div className="mt-2.5 flex items-center gap-2">
            {canWrite ? (
              <Select
                className="h-8 flex-1 text-xs"
                value={order.status}
                onChange={(e) => {
                  updateStatus(order.id, e.target.value as OrderStatus);
                  toast.success("Status updated");
                }}
              >
                {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </Select>
            ) : (
              <Badge variant={statusBadgeVariant(order.status)} className="flex-1 justify-center text-[10px] capitalize">
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
            )}
            <ActivityTriggerButton
              entity={{ type: "order", id: order.id, label: order.orderNumber }}
              className="h-8 w-8 shrink-0"
            />
            {canWrite && (
              <>
                <Button variant="outline" size="sm" className="h-8 shrink-0 px-3" asChild>
                  <Link href={`/orders/${order.id}/edit`}>
                    <Edit2 className="mr-1.5 h-3.5 w-3.5" /> Edit
                  </Link>
                </Button>
                <Button size="sm" className="h-8 shrink-0 px-3" onClick={() => toast.info("Create fulfillment")}>
                  <Truck className="mr-1.5 h-3.5 w-3.5" /> Fulfill
                </Button>
              </>
            )}
            {dropdown}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Status strip */}
          <div className="flex flex-wrap items-center gap-2 border-b bg-muted/20 px-5 py-2.5">
            <StatusChip
              label={order.paymentStatus === "paid" ? "Paid" : order.paymentStatus}
              tone={order.paymentStatus === "paid" ? "success" : "warning"}
            />
            <StatusChip
              label={fulfillmentLabel}
              tone={order.shipmentStatus === "delivered" ? "success" : "info"}
            />
            <span className="text-[11px] text-muted-foreground">{order.branch}</span>
            <span className="ml-auto text-sm font-semibold tabular-nums">{formatCurrency(order.grandTotal)}</span>
          </div>

          {/* AI hint */}
          {showAiHint && (
            <div className="flex items-center gap-2 border-b bg-amber-50/80 px-5 py-2.5 text-[11px] dark:bg-amber-950/20">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span className="text-muted-foreground">
                AI: {order.aiInsights.riskLevel} risk ({order.aiInsights.riskScore}/100) — {order.aiInsights.riskReasons[0]}
              </span>
            </div>
          )}

          {/* Shipment tracking */}
          {(order.shipment.courier || order.shipment.trackingNumber) && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-2.5">
              <div className="flex items-center gap-2 text-xs">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{order.shipment.courier ?? "Courier"}</span>
                {order.shipment.trackingNumber && (
                  <span className="font-mono text-[11px] text-muted-foreground">{order.shipment.trackingNumber}</span>
                )}
              </div>
              {order.shipment.trackingUrl && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <a href={order.shipment.trackingUrl} target="_blank" rel="noreferrer">Track</a>
                </Button>
              )}
            </div>
          )}

          {/* 2-column body */}
          <div className="grid gap-0 sm:grid-cols-[1fr_240px]">
            {/* Left — items */}
            <div className="border-r p-4">
              {itemsCard}
            </div>
            {/* Right — meta */}
            <div className="p-4">
              {metaSidebar}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── FULL PAGE layout ── */
  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 px-2">
          <Link href="/orders/all">
            <ArrowLeft className="mr-1 h-4 w-4" /> Orders
          </Link>
        </Button>
        <div className="h-4 w-px bg-border" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-base font-semibold">{order.orderNumber}</h1>
            <Badge variant={statusBadgeVariant(order.status)} className="text-[10px]">
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {new Date(order.orderDate).toLocaleString()} · {order.source}
          </p>
        </div>
        {canWrite ? (
          <Select
            className="h-8 w-32 text-xs"
            value={order.status}
            onChange={(e) => {
              updateStatus(order.id, e.target.value as OrderStatus);
              toast.success("Status updated");
            }}
          >
            {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        ) : null}
        <ActivityTriggerButton
          entity={{ type: "order", id: order.id, label: order.orderNumber }}
          className="h-8 w-8"
        />
        {canWrite && (
          <>
            <Button variant="outline" size="sm" className="h-8" asChild>
              <Link href={`/orders/${order.id}/edit`}>
                <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit
              </Link>
            </Button>
            <Button size="sm" className="h-8" onClick={() => toast.info("Create fulfillment")}>
              <Truck className="mr-1 h-3.5 w-3.5" /> Fulfill
            </Button>
          </>
        )}
        {dropdown}
      </div>

      {/* Status strip */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-input/70 bg-muted/20 px-3 py-2">
        <StatusChip label={order.paymentStatus === "paid" ? "Paid" : order.paymentStatus} tone={order.paymentStatus === "paid" ? "success" : "warning"} />
        <StatusChip label={fulfillmentLabel} tone={order.shipmentStatus === "delivered" ? "success" : "info"} />
        <span className="text-[11px] text-muted-foreground">{order.branch}</span>
        <span className="ml-auto text-sm font-semibold tabular-nums">{formatCurrency(order.grandTotal)}</span>
      </div>

      {/* AI hint */}
      {showAiHint && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-[11px] dark:border-amber-900/50 dark:bg-amber-950/20">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <span className="text-muted-foreground">
            AI: {order.aiInsights.riskLevel} risk ({order.aiInsights.riskScore}/100) — {order.aiInsights.riskReasons[0]}
          </span>
        </div>
      )}

      {/* Shipment tracking */}
      {(order.shipment.courier || order.shipment.trackingNumber) && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-input/70 bg-card px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{order.shipment.courier ?? "Courier"}</span>
            {order.shipment.trackingNumber && (
              <span className="font-mono text-[11px] text-muted-foreground">{order.shipment.trackingNumber}</span>
            )}
          </div>
          {order.shipment.trackingUrl && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
              <a href={order.shipment.trackingUrl} target="_blank" rel="noreferrer">Track shipment</a>
            </Button>
          )}
        </div>
      )}

      {/* Items + meta grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        {itemsCard}
        {metaSidebar}
      </div>
    </div>
  );
}

function StatusChip({ label, tone }: { label: string; tone: "success" | "warning" | "info" }) {
  const dot = tone === "success" ? "bg-emerald-500" : tone === "warning" ? "bg-amber-500" : "bg-blue-500";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-[11px] capitalize">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function MetaBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-input/70 bg-card p-3 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="mt-2 text-xs">{children}</div>
    </div>
  );
}

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "pt-1 text-sm font-semibold" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className={bold ? "text-foreground" : ""}>{value}</span>
    </div>
  );
}
