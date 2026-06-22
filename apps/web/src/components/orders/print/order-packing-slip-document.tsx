import type { Order } from "@/lib/mock-data/orders";
import { ORDER_STATUS_LABELS } from "@/lib/mock-data/orders";
import {
  AddressBlock,
  formatDocDate,
  MetaGrid,
  PrintCompanyHeader,
  PrintFooter,
} from "@/components/orders/print/order-print-shared";

type Props = { order: Order };

export function OrderPackingSlipDocument({ order }: Props) {
  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <article className="order-print-document mx-auto max-w-[210mm] bg-white p-8 text-neutral-900 shadow-sm print:shadow-none">
      <PrintCompanyHeader title="Packing Slip" />

      <section className="mt-5 grid gap-6 sm:grid-cols-[1.2fr_1fr]">
        <AddressBlock
          label="Ship To"
          name={order.customer.name}
          address={order.shipping}
          phone={order.customer.phone}
        />
        <div className="flex flex-col items-start sm:items-end">
          <div className="rounded border-2 border-dashed border-neutral-400 px-6 py-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Order</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">{order.orderNumber}</p>
          </div>
          {order.shipment.trackingNumber && (
            <p className="mt-3 text-[11px] text-neutral-600">
              Tracking: <span className="font-mono font-semibold">{order.shipment.trackingNumber}</span>
            </p>
          )}
        </div>
      </section>

      <section className="mt-5 rounded border border-neutral-200 bg-neutral-50 p-3">
        <MetaGrid
          rows={[
            { label: "Order Date", value: formatDocDate(order.orderDate) },
            { label: "Status", value: ORDER_STATUS_LABELS[order.status] },
            { label: "Fulfillment", value: order.shipmentStatus.replace("_", " ") },
            { label: "Courier", value: order.shipment.courier ?? "Not assigned" },
            { label: "Branch", value: order.branch },
            { label: "Priority", value: order.priority },
            { label: "Payment", value: order.payment.method },
            { label: "Total Items", value: String(totalQty) },
            { label: "Assigned", value: order.assignedStaff ?? "—" },
          ]}
        />
      </section>

      {order.tags.length > 0 && (
        <p className="mt-3 text-[11px] text-neutral-600">
          Tags: <span className="font-medium text-neutral-800">{order.tags.join(", ")}</span>
        </p>
      )}

      <table className="mt-6 w-full border-collapse text-[11px]">
        <thead>
          <tr className="border-b-2 border-neutral-800 text-left">
            <th className="w-10 py-2 pr-2 font-semibold">Pick</th>
            <th className="py-2 pr-2 font-semibold">Product</th>
            <th className="py-2 pr-2 font-semibold">SKU</th>
            <th className="py-2 pr-2 font-semibold">Variant</th>
            <th className="py-2 text-right font-semibold">Qty</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b border-neutral-200">
              <td className="py-3 pr-2 align-top">
                <span className="inline-block h-4 w-4 border border-neutral-400" aria-hidden />
              </td>
              <td className="py-3 pr-2 align-top font-medium text-neutral-900">{item.name}</td>
              <td className="py-3 pr-2 align-top font-mono text-[10px]">{item.sku}</td>
              <td className="py-3 pr-2 align-top text-neutral-600">{item.variant ?? "—"}</td>
              <td className="py-3 text-right align-top text-base font-bold tabular-nums">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4} className="pt-3 text-right font-semibold text-neutral-700">
              Total units
            </td>
            <td className="pt-3 text-right text-base font-bold tabular-nums">{totalQty}</td>
          </tr>
        </tfoot>
      </table>

      {order.notes && (
        <section className="mt-5 rounded border border-amber-200 bg-amber-50 p-3 text-[11px]">
          <p className="font-semibold text-amber-900">Warehouse / delivery notes</p>
          <p className="mt-1 leading-relaxed text-amber-950">{order.notes}</p>
        </section>
      )}

      <section className="mt-8 grid grid-cols-3 gap-6 border-t border-neutral-200 pt-6 text-[11px]">
        <div>
          <p className="font-semibold text-neutral-700">Picked by</p>
          <div className="mt-8 border-b border-neutral-400" />
        </div>
        <div>
          <p className="font-semibold text-neutral-700">Packed by</p>
          <div className="mt-8 border-b border-neutral-400" />
        </div>
        <div>
          <p className="font-semibold text-neutral-700">Date</p>
          <div className="mt-8 border-b border-neutral-400" />
        </div>
      </section>

      <PrintFooter note="Do not include pricing on the package — this document is for warehouse and courier use only." />
    </article>
  );
}
