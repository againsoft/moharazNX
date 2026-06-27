"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, PackagePlus, Plus, Save, Search, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  CREATE_ORDER_DEFAULTS,
  ORDER_BRANCHES,
  ORDER_SOURCES,
  ORDER_STAFF,
  PAYMENT_METHODS,
  buildOrderFromDraft,
  calcOrderTotals,
  applyDraftToOrder,
  orderToDraft,
  type CreateOrderDraft,
} from "@/lib/mock-data/order-create";
import type { OrderLine } from "@/lib/mock-data/orders";
import type { Product } from "@/lib/mock-data/products";
import { products as baseProducts } from "@/lib/mock-data/products";
import { useCustomerStore } from "@/lib/store/customer-store";
import { useProductStore } from "@/lib/store/product-store";
import { useOrderStore } from "@/lib/store/order-store";
import { useOrderStoreHydrated } from "@/lib/hooks/use-order-store-hydrated";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import { OrdersNav } from "@/components/orders/orders-nav";
import { AddCustomerDialog } from "@/components/customers/add-customer-dialog";
import { AddProductDialog } from "@/components/products/add-product-dialog";

type Props = { orderId?: string; className?: string };

export function OrderFormWorkspace({ orderId, className }: Props = {}) {
  const isEdit = Boolean(orderId);
  const router = useRouter();
  const hydrated = useOrderStoreHydrated();
  const customers = useCustomerStore((s) => s.customers);
  const extraProducts = useProductStore((s) => s.extraProducts);
  const catalogProducts = useMemo(() => [...baseProducts, ...extraProducts], [extraProducts]);
  const orders = useOrderStore((s) => s.orders);
  const existingOrder = useOrderStore((s) => (orderId ? s.orders.find((o) => o.id === orderId) : undefined));
  const createOrder = useOrderStore((s) => s.createOrder);
  const updateOrder = useOrderStore((s) => s.updateOrder);

  const [draft, setDraft] = useState<CreateOrderDraft>(CREATE_ORDER_DEFAULTS);
  const [initialized, setInitialized] = useState(!isEdit);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);

  useEffect(() => {
    if (isEdit && hydrated && existingOrder && !initialized) {
      setDraft(orderToDraft(existingOrder));
      setInitialized(true);
    }
  }, [isEdit, hydrated, existingOrder, initialized]);

  const totals = useMemo(() => calcOrderTotals(draft), [draft]);
  const patch = (partial: Partial<CreateOrderDraft>) => setDraft((d) => ({ ...d, ...partial }));

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase().trim();
    if (!q) return customers.slice(0, 5);
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [customers, customerSearch]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase().trim();
    const published = catalogProducts.filter((p) => p.status === "published");
    if (!q) return published.slice(0, 6);
    return published.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 6);
  }, [catalogProducts, productSearch]);

  const selectCustomer = (c: (typeof customers)[0]) => {
    const addr = c.addresses.find((a) => a.isDefault) ?? c.addresses[0];
    patch({
      customerId: c.id,
      customerName: c.name,
      customerPhone: c.phone,
      customerEmail: c.email,
      customerGroup: c.group,
      shipping: addr
        ? { address: addr.address, city: addr.city, region: addr.region, country: addr.country }
        : draft.shipping,
      billing: addr
        ? { address: addr.address, city: addr.city, region: addr.region, country: addr.country }
        : draft.billing,
    });
    setCustomerSearch("");
    toast.success(`${c.name} selected`);
  };

  const addProduct = (p: Product) => {
    if (draft.items.some((i) => i.productId === p.id)) {
      toast.info("Already in order");
      return;
    }
    const line: OrderLine = {
      id: `li_${Date.now()}`,
      productId: p.id,
      name: p.name,
      sku: p.sku,
      imageUrl: p.thumbnail,
      quantity: 1,
      unitPrice: p.price,
      discount: 0,
      tax: Math.round(p.price * (draft.taxRate / 100)),
      lineTotal: p.price + Math.round(p.price * (draft.taxRate / 100)),
    };
    patch({ items: [...draft.items, line] });
    setProductSearch("");
  };

  const updateLine = (id: string, partial: Partial<OrderLine>) => {
    patch({
      items: draft.items.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, ...partial };
        const tax = Math.round(next.quantity * next.unitPrice * (draft.taxRate / 100));
        return { ...next, tax, lineTotal: next.quantity * next.unitPrice - next.discount + tax };
      }),
    });
  };

  const removeLine = (id: string) => patch({ items: draft.items.filter((i) => i.id !== id) });

  const validate = () => {
    if (!draft.customerName.trim()) return "Customer name is required";
    if (!draft.customerPhone.trim()) return "Customer phone is required";
    if (draft.items.length === 0) return "Add at least one product";
    if (!draft.shipping.address.trim()) return "Shipping address is required";
    return null;
  };

  const handleSave = (asDraft?: boolean) => {
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }
    if (isEdit && orderId && existingOrder) {
      const updated = applyDraftToOrder(draft, existingOrder);
      if (asDraft) updated.status = "draft";
      updateOrder(orderId, updated);
      toast.success("Order updated");
      router.push(`/orders/${orderId}`);
      return;
    }
    const order = buildOrderFromDraft(draft, orders, asDraft ? "draft" : "pending");
    createOrder(order);
    toast.success(asDraft ? "Draft saved" : "Order created");
    router.push(`/orders/${order.id}`);
  };

  if (isEdit) {
    if (!hydrated || !initialized) {
      return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;
    }
    if (!existingOrder) {
      return (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-sm font-medium">Order not found</p>
          <Button variant="ghost" size="sm" asChild className="mt-2">
            <Link href="/orders/all">Back</Link>
          </Button>
        </div>
      );
    }
  }

  return (
    <div className={cn("flex min-h-0 w-full flex-1 flex-col gap-3", className)}>
      <OrdersNav />

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={isEdit ? `/orders/${orderId}` : "/orders/all"}
            className="mb-0.5 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> {isEdit ? existingOrder?.orderNumber : "Back to orders"}
          </Link>
          {isEdit && existingOrder ? (
            <p className="text-xs text-muted-foreground">
              {existingOrder.customer.name} · {formatCurrency(existingOrder.grandTotal)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Manual order entry workspace</p>
          )}
        </div>
        <div className="flex gap-2">
          {!isEdit && (
            <Button variant="outline" size="sm" onClick={() => handleSave(true)}>
              Save draft
            </Button>
          )}
          <Button size="sm" onClick={() => handleSave()}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {isEdit ? "Save changes" : "Create order"}
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-0 space-y-4 overflow-y-auto pr-0.5">
          {/* Customer — compact inline */}
          <section className="rounded-xl border border-input/70 bg-card p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</p>
            <div className="mb-3 flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search existing customer…"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-9"
                />
                {customerSearch && filteredCustomers.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-input bg-popover shadow-md">
                    {filteredCustomers.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => selectCustomer(c)}
                        className="flex w-full px-3 py-2.5 text-left text-sm hover:bg-muted"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="ml-2 text-muted-foreground">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={() => setAddCustomerOpen(true)}
              >
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                Add customer
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <CompactField label="Name *">
                <Input value={draft.customerName} onChange={(e) => patch({ customerName: e.target.value })} />
              </CompactField>
              <CompactField label="Phone *">
                <Input value={draft.customerPhone} onChange={(e) => patch({ customerPhone: e.target.value })} />
              </CompactField>
              <CompactField label="Email" className="sm:col-span-2">
                <Input type="email" value={draft.customerEmail} onChange={(e) => patch({ customerEmail: e.target.value })} />
              </CompactField>
            </div>
          </section>

          {/* Products — table style */}
          <section className="overflow-hidden rounded-xl border border-input/70 bg-card shadow-sm">
            <div className="flex flex-wrap items-center gap-2 border-b border-input/60 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:mr-auto">Products</p>
              <div className="flex w-full min-w-0 flex-1 items-center gap-2 sm:max-w-md sm:flex-none">
                <Input
                  placeholder="Search product to add…"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="min-w-0 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => setAddProductOpen(true)}
                >
                  <PackagePlus className="mr-1.5 h-3.5 w-3.5" />
                  Add product
                </Button>
              </div>
            </div>
            {productSearch && filteredProducts.length > 0 && (
              <div className="border-b border-input/60 bg-muted/10 px-2 py-1">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct(p)}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <img src={p.thumbnail} alt="" className="h-8 w-8 rounded object-cover" />
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="font-medium">{formatCurrency(p.price)}</span>
                  </button>
                ))}
              </div>
            )}
            {draft.items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">Search and add products to this order</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="border-b border-input/60 bg-muted/30 text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Product</th>
                      <th className="px-4 py-2.5 font-medium">Qty</th>
                      <th className="px-4 py-2.5 font-medium">Unit price</th>
                      <th className="px-4 py-2.5 text-right font-medium">Line total</th>
                      <th className="w-10 px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-input/50">
                    {draft.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={item.imageUrl} alt="" className="h-10 w-10 rounded object-cover" />
                            <div className="min-w-0">
                              <p className="truncate font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="inline-flex items-center rounded-md border border-input">
                            <button
                              type="button"
                              className="px-2 py-1.5 hover:bg-muted"
                              onClick={() => updateLine(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                            <button
                              type="button"
                              className="px-2 py-1.5 hover:bg-muted"
                              onClick={() => updateLine(item.id, { quantity: item.quantity + 1 })}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateLine(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                            className="w-28"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">
                          {formatCurrency(item.lineTotal)}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeLine(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Shipping — minimal */}
          <section className="rounded-xl border border-input/70 bg-card p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Shipping</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <CompactField label="Address *" className="sm:col-span-2">
                <Input
                  value={draft.shipping.address}
                  onChange={(e) =>
                    patch({
                      shipping: { ...draft.shipping, address: e.target.value },
                      ...(draft.sameAsShipping ? { billing: { ...draft.shipping, address: e.target.value } } : {}),
                    })
                  }
                />
              </CompactField>
              <CompactField label="City">
                <Input value={draft.shipping.city} onChange={(e) => patch({ shipping: { ...draft.shipping, city: e.target.value } })} />
              </CompactField>
              <CompactField label="Region">
                <Input value={draft.shipping.region} onChange={(e) => patch({ shipping: { ...draft.shipping, region: e.target.value } })} />
              </CompactField>
            </div>
            <textarea
              value={draft.notes}
              onChange={(e) => patch({ notes: e.target.value })}
              rows={3}
              placeholder="Internal notes (optional)"
              className="mt-3 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </section>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-0 lg:self-start">
          <div className="rounded-xl border border-input/70 bg-card p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Summary</p>
            <div className="mt-3 space-y-2 text-sm">
              <SummaryRow label="Subtotal" value={formatCurrency(totals.subtotal)} />
              <SummaryRow label="Discount" value={`−${formatCurrency(totals.discountAmount)}`} />
              <SummaryRow label={`Tax (${draft.taxRate}%)`} value={formatCurrency(totals.taxAmount)} />
              <SummaryRow label="Shipping" value={formatCurrency(totals.shippingAmount)} />
              <div className="flex justify-between border-t border-input/60 pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <CompactField label="Discount">
                <Input type="number" min={0} value={draft.discountAmount} onChange={(e) => patch({ discountAmount: parseFloat(e.target.value) || 0 })} />
              </CompactField>
              <CompactField label="Shipping">
                <Input type="number" min={0} value={draft.shippingAmount} onChange={(e) => patch({ shippingAmount: parseFloat(e.target.value) || 0 })} />
              </CompactField>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-input/70 bg-card p-4 shadow-sm">
            <CompactField label="Payment">
              <Select value={draft.paymentMethod} onChange={(e) => patch({ paymentMethod: e.target.value })}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </Select>
            </CompactField>
            <CompactField label="Source">
              <Select value={draft.source} onChange={(e) => patch({ source: e.target.value })}>
                {ORDER_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </CompactField>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full rounded-lg border border-dashed border-input px-3 py-2.5 text-left text-xs text-muted-foreground hover:bg-muted/30"
          >
            {showAdvanced ? "− Hide" : "+ Show"} advanced settings
          </button>

          {showAdvanced && (
            <div className="space-y-3 rounded-xl border border-input/70 bg-card p-4 shadow-sm">
              <CompactField label="Branch">
                <Select value={draft.branch} onChange={(e) => patch({ branch: e.target.value })}>
                  {ORDER_BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </Select>
              </CompactField>
              <CompactField label="Staff">
                <Select value={draft.assignedStaff} onChange={(e) => patch({ assignedStaff: e.target.value })}>
                  {ORDER_STAFF.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </CompactField>
              <CompactField label="Priority">
                <Select value={draft.priority} onChange={(e) => patch({ priority: e.target.value as CreateOrderDraft["priority"] })}>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </CompactField>
              <CompactField label="Tags">
                <Input value={draft.tags} onChange={(e) => patch({ tags: e.target.value })} placeholder="VIP, Express" />
              </CompactField>
              <CompactField label="Tax %">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={draft.taxRate}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value) || 0;
                    patch({
                      taxRate: rate,
                      items: draft.items.map((item) => {
                        const tax = Math.round(item.quantity * item.unitPrice * (rate / 100));
                        return { ...item, tax, lineTotal: item.quantity * item.unitPrice - item.discount + tax };
                      }),
                    });
                  }}
                />
              </CompactField>
            </div>
          )}
        </aside>
      </div>

      <AddCustomerDialog
        open={addCustomerOpen}
        onOpenChange={setAddCustomerOpen}
        initialValues={{
          name: draft.customerName,
          phone: draft.customerPhone,
          email: draft.customerEmail,
          address: draft.shipping.address,
          city: draft.shipping.city,
          region: draft.shipping.region,
        }}
        onCreated={(customer) => selectCustomer(customer)}
      />

      <AddProductDialog
        open={addProductOpen}
        onOpenChange={setAddProductOpen}
        initialValues={{ name: productSearch }}
        onCreated={(product) => {
          addProduct(product);
          setProductSearch("");
        }}
      />
    </div>
  );
}

function CompactField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export function CreateOrderWorkspace({ className }: { className?: string }) {
  return <OrderFormWorkspace className={className} />;
}
