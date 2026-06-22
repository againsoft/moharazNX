import type { Order } from "@/lib/mock-data/orders";
import { ORDER_STATUS_LABELS } from "@/lib/mock-data/orders";
import {
  COMPANY_PROFILE,
  companyAddressBlock,
  estimateTaxRate,
  invoiceNumberFromOrder,
} from "@/lib/mock-data/company";
import { formatCurrency } from "@/lib/utils";
import { formatDocDate } from "@/components/orders/print/order-print-shared";

type Props = { order: Order };

function paymentTermsLabel(order: Order) {
  if (order.payment.method === "COD") return "Cash on Delivery";
  if (order.paymentStatus === "paid") return "Immediate Payment";
  return "Due on Receipt";
}

function dueDateLabel(order: Order) {
  if (order.paymentStatus === "paid") return formatDocDate(order.orderDate);
  const d = new Date(order.orderDate);
  d.setDate(d.getDate() + 7);
  return formatDocDate(d.toISOString());
}

export function OrderInvoiceDocument({ order }: Props) {
  const invoiceNo = invoiceNumberFromOrder(order.orderNumber);
  const taxRate = estimateTaxRate(order);
  const taxable = Math.max(order.subtotal - order.discountAmount, 0);

  return (
    <article className="order-print-document odoo-invoice mx-auto w-full max-w-[210mm] bg-white text-[#333] shadow-md print:shadow-none">
      {/* Odoo-style header band */}
      <header className="flex items-stretch border border-[#ddd]">
        <div className="flex flex-1 items-start gap-4 border-r border-[#ddd] p-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-[#714B67] text-lg font-bold text-white">
            AE
          </div>
          <div className="min-w-0 text-[11px] leading-relaxed">
            <p className="text-base font-bold text-[#714B67]">{COMPANY_PROFILE.legalName}</p>
            <p className="mt-1 font-medium text-[#555]">{COMPANY_PROFILE.name}</p>
            <p className="mt-2">{companyAddressBlock()}</p>
            <p className="mt-1">Phone: {COMPANY_PROFILE.phone}</p>
            <p>Email: {COMPANY_PROFILE.email}</p>
            <p>Web: {COMPANY_PROFILE.website}</p>
            <p className="mt-2">
              <span className="font-semibold">BIN:</span> {COMPANY_PROFILE.taxId}
              {" · "}
              <span className="font-semibold">VAT Reg:</span> {COMPANY_PROFILE.vatRegNo}
            </p>
          </div>
        </div>
        <div className="w-[240px] shrink-0 bg-[#f8f8f8] p-6">
          <h1 className="text-right text-3xl font-light uppercase tracking-[0.2em] text-[#714B67]">Invoice</h1>
          <table className="mt-4 w-full text-[11px]">
            <tbody>
              <InvoiceMetaRow label="Invoice No." value={invoiceNo} />
              <InvoiceMetaRow label="Order Ref." value={order.orderNumber} />
              <InvoiceMetaRow label="Invoice Date" value={formatDocDate(order.orderDate)} />
              <InvoiceMetaRow label="Due Date" value={dueDateLabel(order)} />
              <InvoiceMetaRow label="Payment Terms" value={paymentTermsLabel(order)} />
              <InvoiceMetaRow label="Status" value={ORDER_STATUS_LABELS[order.status]} />
            </tbody>
          </table>
        </div>
      </header>

      {/* Customer address blocks — Odoo invoicing / shipping */}
      <section className="grid grid-cols-2 border-x border-b border-[#ddd]">
        <div className="border-r border-[#ddd] p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#714B67]">Invoicing Address</p>
          <p className="text-sm font-bold text-[#222]">{order.customer.name}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-[#444]">{order.billing.address}</p>
          <p className="text-[11px] text-[#444]">
            {order.billing.city}, {order.billing.region}
          </p>
          <p className="text-[11px] text-[#444]">{order.billing.country}</p>
          <p className="mt-2 text-[11px] text-[#555]">Phone: {order.customer.phone}</p>
          <p className="text-[11px] text-[#555]">{order.customer.email}</p>
        </div>
        <div className="p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#714B67]">Shipping Address</p>
          <p className="text-sm font-bold text-[#222]">{order.customer.name}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-[#444]">{order.shipping.address}</p>
          <p className="text-[11px] text-[#444]">
            {order.shipping.city}, {order.shipping.region}
          </p>
          <p className="text-[11px] text-[#444]">{order.shipping.country}</p>
        </div>
      </section>

      {/* Reference row */}
      <section className="grid grid-cols-4 border-x border-b border-[#ddd] bg-[#fafafa] text-[10px]">
        <RefCell label="Source Document" value={order.source} />
        <RefCell label="Salesperson" value={order.assignedStaff ?? "—"} />
        <RefCell label="Branch / Warehouse" value={order.branch} />
        <RefCell label="Payment Method" value={order.payment.method} />
      </section>

      {/* Line items — Odoo table */}
      <table className="w-full border-collapse border-x border-[#ddd] text-[11px]">
        <thead>
          <tr className="bg-[#714B67] text-left text-[10px] font-semibold uppercase tracking-wide text-white">
            <th className="border-r border-[#5c3d55] px-3 py-2.5">Description</th>
            <th className="w-16 border-r border-[#5c3d55] px-3 py-2.5 text-right">Qty</th>
            <th className="w-24 border-r border-[#5c3d55] px-3 py-2.5 text-right">Unit Price</th>
            <th className="w-20 border-r border-[#5c3d55] px-3 py-2.5 text-right">Disc.</th>
            <th className="w-16 border-r border-[#5c3d55] px-3 py-2.5 text-right">Taxes</th>
            <th className="w-28 px-3 py-2.5 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}>
              <td className="border-b border-[#e8e8e8] px-3 py-3 align-top">
                <p className="font-semibold text-[#222]">{item.name}</p>
                <p className="mt-0.5 font-mono text-[10px] text-[#777]">[{item.sku}]</p>
                {item.variant && <p className="mt-0.5 text-[10px] text-[#666]">{item.variant}</p>}
              </td>
              <td className="border-b border-[#e8e8e8] px-3 py-3 text-right align-top tabular-nums">
                {item.quantity}
              </td>
              <td className="border-b border-[#e8e8e8] px-3 py-3 text-right align-top tabular-nums">
                {formatCurrency(item.unitPrice)}
              </td>
              <td className="border-b border-[#e8e8e8] px-3 py-3 text-right align-top tabular-nums">
                {item.discount > 0 ? formatCurrency(item.discount) : "—"}
              </td>
              <td className="border-b border-[#e8e8e8] px-3 py-3 text-right align-top tabular-nums">
                {taxRate > 0 ? `${taxRate}%` : "—"}
              </td>
              <td className="border-b border-[#e8e8e8] px-3 py-3 text-right align-top font-semibold tabular-nums">
                {formatCurrency(item.lineTotal)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals + payment info — Odoo bottom section */}
      <section className="flex border-x border-b border-[#ddd]">
        <div className="flex-1 border-r border-[#ddd] p-5 text-[11px] leading-relaxed text-[#555]">
          {order.notes && (
            <div className="mb-4">
              <p className="mb-1 font-bold uppercase tracking-wide text-[#714B67]">Terms &amp; Notes</p>
              <p className="text-[#444]">{order.notes}</p>
            </div>
          )}
          <div>
            <p className="mb-1 font-bold uppercase tracking-wide text-[#714B67]">Payment Communication</p>
            <p>
              Please use invoice number <strong>{invoiceNo}</strong> as payment reference.
            </p>
            {order.payment.transactionId && (
              <p className="mt-1">
                Transaction ID: <span className="font-mono">{order.payment.transactionId}</span>
              </p>
            )}
          </div>
          <div className="mt-4">
            <p className="mb-1 font-bold uppercase tracking-wide text-[#714B67]">Bank Details</p>
            <p>
              {COMPANY_PROFILE.bankName} — {COMPANY_PROFILE.bankBranch}
            </p>
            <p>A/C: {COMPANY_PROFILE.bankAccount}</p>
            <p>Routing: {COMPANY_PROFILE.routingNo}</p>
          </div>
        </div>
        <div className="w-[280px] shrink-0 bg-[#f8f8f8] p-5">
          <table className="w-full text-[11px]">
            <tbody>
              <TotalRow label="Untaxed Amount" value={formatCurrency(taxable)} />
              <TotalRow label={`VAT ${taxRate > 0 ? `${taxRate}%` : "0%"}`} value={formatCurrency(order.taxAmount)} />
              <TotalRow label="Shipping" value={formatCurrency(order.shippingAmount)} />
              <TotalRow label="Discount" value={`−${formatCurrency(order.discountAmount)}`} muted />
              <tr>
                <td colSpan={2} className="py-2">
                  <div className="border-t-2 border-[#714B67]" />
                </td>
              </tr>
              <TotalRow label="Total" value={formatCurrency(order.grandTotal)} bold large />
              <TotalRow
                label="Amount Paid"
                value={formatCurrency(order.payment.paidAmount)}
                accent={order.payment.paidAmount > 0}
              />
              <TotalRow
                label="Amount Due"
                value={formatCurrency(order.payment.dueAmount)}
                bold
                accent={order.payment.dueAmount > 0}
              />
            </tbody>
          </table>
          <p className="mt-4 text-[10px] italic text-[#777]">All amounts in BDT (৳)</p>
        </div>
      </section>

      {/* Signature footer */}
      <footer className="grid grid-cols-2 gap-8 border-x border-b border-[#ddd] p-6 text-[11px]">
        <div>
          <p className="font-bold uppercase tracking-wide text-[#714B67]">Customer Acceptance</p>
          <div className="mt-10 border-b border-[#999]" />
          <p className="mt-1 text-[10px] text-[#777]">Name &amp; Signature · Date</p>
        </div>
        <div>
          <p className="font-bold uppercase tracking-wide text-[#714B67]">Authorized Signature</p>
          <div className="mt-10 border-b border-[#999]" />
          <p className="mt-1 text-[10px] text-[#777]">For {COMPANY_PROFILE.legalName}</p>
        </div>
      </footer>

      <p className="border-x border-b border-[#ddd] bg-[#fafafa] px-4 py-2 text-center text-[9px] text-[#999]">
        This is a computer-generated tax invoice. Valid without physical signature per VAT Act guidelines.
      </p>
    </article>
  );
}

function InvoiceMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td className="py-1 pr-3 align-top font-semibold text-[#777]">{label}</td>
      <td className="py-1 text-right align-top font-bold text-[#222]">{value}</td>
    </tr>
  );
}

function RefCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-[#ddd] px-3 py-2 last:border-r-0">
      <p className="font-bold uppercase tracking-wide text-[#714B67]">{label}</p>
      <p className="mt-0.5 font-semibold text-[#333]">{value}</p>
    </div>
  );
}

function TotalRow({
  label,
  value,
  bold,
  large,
  muted,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  large?: boolean;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <tr>
      <td
        className={`py-1.5 pr-4 align-top ${bold ? "font-bold text-[#222]" : muted ? "text-[#888]" : "text-[#555]"}`}
      >
        {label}
      </td>
      <td
        className={`py-1.5 text-right align-top tabular-nums ${large ? "text-base font-bold" : ""} ${bold ? "font-bold" : "font-semibold"} ${accent ? "text-[#714B67]" : "text-[#222]"}`}
      >
        {value}
      </td>
    </tr>
  );
}
