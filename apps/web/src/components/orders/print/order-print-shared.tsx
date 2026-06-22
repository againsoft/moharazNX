import type { Order } from "@/lib/mock-data/orders";
import { COMPANY_PROFILE, companyAddressBlock } from "@/lib/mock-data/company";
import { formatCurrency } from "@/lib/utils";

export function formatDocDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDocDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PrintCompanyHeader({ title }: { title: string }) {
  return (
    <header className="flex items-start justify-between gap-6 border-b border-neutral-300 pb-4">
      <div>
        <p className="text-xl font-bold tracking-tight text-neutral-900">{COMPANY_PROFILE.name}</p>
        <p className="text-[11px] text-neutral-600">{COMPANY_PROFILE.legalName}</p>
        <p className="mt-2 text-[11px] leading-relaxed text-neutral-600">{companyAddressBlock()}</p>
        <p className="text-[11px] text-neutral-600">
          {COMPANY_PROFILE.phone} · {COMPANY_PROFILE.email}
        </p>
        <p className="text-[11px] text-neutral-600">Tax ID: {COMPANY_PROFILE.taxId}</p>
      </div>
      <div className="text-right">
        <h1 className="text-2xl font-bold uppercase tracking-wide text-neutral-900">{title}</h1>
        <p className="mt-1 text-[10px] text-neutral-500">{COMPANY_PROFILE.website}</p>
      </div>
    </header>
  );
}

export function AddressBlock({
  label,
  name,
  address,
  phone,
  email,
}: {
  label: string;
  name: string;
  address: Order["shipping"];
  phone?: string;
  email?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-neutral-900">{name}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-neutral-700">{address.address}</p>
      <p className="text-[11px] text-neutral-700">
        {address.city}, {address.region}
      </p>
      <p className="text-[11px] text-neutral-700">{address.country}</p>
      {phone && <p className="mt-1 text-[11px] text-neutral-600">Phone: {phone}</p>}
      {email && <p className="text-[11px] text-neutral-600">{email}</p>}
    </div>
  );
}

export function MetaGrid({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] sm:grid-cols-3">
      {rows.map((row) => (
        <div key={row.label}>
          <dt className="font-medium text-neutral-500">{row.label}</dt>
          <dd className="font-semibold text-neutral-900">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function TotalsBlock({ order }: { order: Order }) {
  return (
    <div className="ml-auto w-full max-w-xs space-y-1 text-[11px]">
      <TotalRow label="Subtotal" value={formatCurrency(order.subtotal)} />
      <TotalRow label="Discount" value={`−${formatCurrency(order.discountAmount)}`} />
      <TotalRow label="Tax" value={formatCurrency(order.taxAmount)} />
      <TotalRow label="Shipping" value={formatCurrency(order.shippingAmount)} />
      <div className="flex justify-between border-t border-neutral-300 pt-2 text-sm font-bold text-neutral-900">
        <span>Total</span>
        <span>{formatCurrency(order.grandTotal)}</span>
      </div>
      <TotalRow label="Paid" value={formatCurrency(order.payment.paidAmount)} />
      <TotalRow label="Due" value={formatCurrency(order.payment.dueAmount)} bold={order.payment.dueAmount > 0} />
    </div>
  );
}

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold text-neutral-900" : "text-neutral-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function PrintFooter({ note }: { note?: string }) {
  return (
    <footer className="mt-8 border-t border-neutral-200 pt-4 text-center text-[10px] leading-relaxed text-neutral-500">
      {note && <p className="mb-2">{note}</p>}
      <p>{COMPANY_PROFILE.tagline}</p>
      <p className="mt-1">Thank you for shopping with {COMPANY_PROFILE.name}.</p>
    </footer>
  );
}
