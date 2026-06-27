"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, CreditCard, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { OrderSummary } from "@/components/storefront/checkout/order-summary";
import { ApiConnectionBadge } from "@/components/products/api-connection-badge";
import {
  getCartSubtotal,
  useStorefrontCart,
} from "@/lib/store/storefront-cart-store";
import { useStorefrontCartApi } from "@/lib/api/use-storefront-cart";
import { submitStorefrontCheckout } from "@/lib/api/storefront-checkout";
import {
  BD_DISTRICTS,
  calcOrderTotals,
  generateOrderNumber,
  PAYMENT_METHODS,
  SHIPPING_METHODS,
} from "@/lib/mock-data/storefront-checkout";
import { storefrontPaths } from "@/lib/url-slug/storefront-paths";
import { cn } from "@/lib/utils";

type FormState = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  district: string;
  postalCode: string;
  notes: string;
};

const initialForm: FormState = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  district: "Dhaka",
  postalCode: "",
  notes: "",
};

export function CheckoutView() {
  const router = useRouter();
  const { couponCode, couponDiscount, clearCart } = useStorefrontCart();
  const { items, loading, error, apiEnabled } = useStorefrontCartApi();
  const [form, setForm] = useState<FormState>(initialForm);
  const [shippingId, setShippingId] = useState("standard");
  const [paymentId, setPaymentId] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const subtotal = getCartSubtotal(items);
  const shippingMethod = SHIPPING_METHODS.find((s) => s.id === shippingId) ?? SHIPPING_METHODS[0];
  const totals = calcOrderTotals(subtotal, shippingMethod, couponDiscount, couponCode);

  const update = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Valid email required";
    }
    if (!form.firstName.trim()) next.firstName = "Required";
    if (!form.lastName.trim()) next.lastName = "Required";
    if (!form.phone.trim()) next.phone = "Required";
    if (!form.address.trim()) next.address = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);

    if (apiEnabled) {
      try {
        const result = await submitStorefrontCheckout({
          email: form.email,
          first_name: form.firstName,
          last_name: form.lastName,
          phone: form.phone,
          address: form.address,
          district: form.district,
          postal_code: form.postalCode,
          notes: form.notes || undefined,
          payment_method: paymentId,
          shipping_method: shippingId,
        });
        sessionStorage.setItem(
          "last-order",
          JSON.stringify({
            orderNumber: result.order_number,
            email: result.email,
            total: parseFloat(result.grand_total) || 0,
            payment: result.payment_method,
          }),
        );
        clearCart();
        router.push(`${storefrontPaths.checkoutThankYou}?order=${result.order_number}`);
        return;
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Checkout failed");
        setSubmitting(false);
        return;
      }
    }

    await new Promise((r) => setTimeout(r, 800));
    const orderNumber = generateOrderNumber();
    sessionStorage.setItem(
      "last-order",
      JSON.stringify({
        orderNumber,
        email: form.email,
        total: totals.total,
        payment: PAYMENT_METHODS.find((p) => p.id === paymentId)?.label,
      }),
    );
    clearCart();
    router.push(`${storefrontPaths.checkoutThankYou}?order=${orderNumber}`);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground">
        Loading checkout…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-xl font-semibold">Nothing to checkout</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-6">
          <Link href={storefrontPaths.products}>Shop products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={storefrontPaths.cart}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to cart
      </Link>

      <h1 className="mb-8 text-2xl font-bold sm:text-3xl">Checkout</h1>

      {apiEnabled && (
        <div className="mb-6">
          <ApiConnectionBadge loading={loading} error={error} productCount={items.length} />
        </div>
      )}

      {submitError && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {/* Contact */}
          <section className="rounded-xl border border-border/60 bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Contact information</h2>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">Guest checkout — no account required</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className="mt-1.5 h-9"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className="mt-1.5 h-9"
                />
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => update("lastName", e.target.value)}
                  className="mt-1.5 h-9"
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="mt-1.5 h-9"
                  placeholder="01XXXXXXXXX"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="rounded-xl border border-border/60 bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Shipping address</h2>
            </div>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="address">Street address</Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="mt-1.5 min-h-[72px] text-sm"
                  placeholder="House, road, area"
                />
                {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="district">District</Label>
                  <Select
                    id="district"
                    value={form.district}
                    onChange={(e) => update("district", e.target.value)}
                    className="mt-1.5 h-9 w-full"
                  >
                    {BD_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal code</Label>
                  <Input
                    id="postalCode"
                    value={form.postalCode}
                    onChange={(e) => update("postalCode", e.target.value)}
                    className="mt-1.5 h-9"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Delivery notes</Label>
                <Input
                  id="notes"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                  className="mt-1.5 h-9"
                  placeholder="Optional instructions for courier"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium">Shipping method</h3>
              <div className="space-y-2">
                {SHIPPING_METHODS.map((method) => {
                  const price =
                    subtotal >= 2000 && method.id !== "express" ? 0 : method.price;
                  return (
                    <label
                      key={method.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-lg border p-3 transition",
                        shippingId === method.id ? "border-primary bg-primary/5" : "border-border/60",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingId === method.id}
                          onChange={() => setShippingId(method.id)}
                          className="accent-primary"
                        />
                        <div>
                          <p className="text-sm font-medium">{method.label}</p>
                          <p className="text-xs text-muted-foreground">{method.eta}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">
                        {price === 0 ? "Free" : `৳${price}`}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-xl border border-border/60 bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Payment</h2>
            </div>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition",
                    paymentId === method.id ? "border-primary bg-primary/5" : "border-border/60",
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentId === method.id}
                    onChange={() => setPaymentId(method.id)}
                    className="mt-1 accent-primary"
                  />
                  <div>
                    <p className="text-sm font-medium">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <Button type="submit" size="lg" className="h-11 w-full lg:hidden" disabled={submitting}>
            {submitting ? "Placing order…" : `Place order · ${new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(totals.total)}`}
          </Button>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <OrderSummary
            items={items}
            subtotal={totals.subtotal}
            shipping={totals.shipping}
            discount={totals.discount}
            total={totals.total}
          />
          <Button type="submit" size="lg" className="mt-4 hidden h-11 w-full lg:flex" disabled={submitting}>
            {submitting ? "Placing order…" : "Place order"}
          </Button>
        </aside>
      </form>
    </div>
  );
}
