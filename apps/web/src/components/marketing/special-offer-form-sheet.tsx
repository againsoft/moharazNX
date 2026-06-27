"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Gift,
  Layers,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Store,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { products } from "@/lib/mock-data/products";
import {
  bundleComputedPrice,
  SPECIAL_OFFER_STATUS_LABELS,
  SPECIAL_OFFER_TYPE_DESCRIPTIONS,
  SPECIAL_OFFER_TYPE_LABELS,
  type BogoConfig,
  type BundleConfig,
  type GiftConfig,
  type OfferProductRef,
  type SpecialOffer,
  type SpecialOfferStatus,
  type SpecialOfferType,
  type TieredConfig,
} from "@/lib/mock-data/special-offers";
import { useSpecialOfferStore } from "@/lib/store/special-offer-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/native-select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SlugInput } from "@/components/ui/slug-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  offer?: SpecialOffer | null;
};

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string) {
  return new Date(value).toISOString();
}

function inferStatus(startsAt: string, endsAt: string, manual: SpecialOfferStatus): SpecialOfferStatus {
  if (manual === "draft" || manual === "cancelled") return manual;
  const now = Date.now();
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (now < start) return "scheduled";
  if (now <= end) return "running";
  return "completed";
}

function toProductRef(productId: string): OfferProductRef | null {
  const p = products.find((x) => x.id === productId);
  if (!p) return null;
  return {
    productId: p.id,
    productName: p.name,
    sku: p.sku,
    thumbnail: p.thumbnail,
    price: p.price,
  };
}

function ProductPicker({
  label,
  selectedId,
  onSelect,
  excludeIds = [],
}: {
  label: string;
  selectedId?: string;
  onSelect: (ref: OfferProductRef) => void;
  excludeIds?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = selectedId ? products.find((p) => p.id === selectedId) : null;

  const options = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products
      .filter((p) => p.status === "published")
      .filter((p) => !excludeIds.includes(p.id))
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q),
      )
      .slice(0, 10);
  }, [excludeIds, query]);

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      {selected ? (
        <div className="flex items-center gap-2 rounded-md border border-input bg-muted/20 px-2 py-1.5">
          <img src={selected.thumbnail} alt="" className="h-8 w-8 rounded object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{selected.name}</p>
            <p className="text-[10px] text-muted-foreground">৳{selected.price}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => setOpen(true)}>
            Change
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" className="h-8 w-full text-xs" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-3 w-3" />
          Select product
        </Button>
      )}
      {open && (
        <div className="rounded-lg border border-input bg-muted/20 p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="h-8 pl-8 text-xs"
            />
          </div>
          <div className="mt-1 max-h-32 space-y-0.5 overflow-y-auto">
            {options.map((p) => {
              const ref = toProductRef(p.id);
              if (!ref) return null;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelect(ref);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs hover:bg-background"
                >
                  <img src={p.thumbnail} alt="" className="h-7 w-7 rounded object-cover" />
                  <span className="truncate">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function SpecialOfferFormSheet({ open, onOpenChange, mode = "create", offer }: Props) {
  const upsertOffer = useSpecialOfferStore((s) => s.upsertOffer);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [slug, setSlug] = useState("");
  const [offerType, setOfferType] = useState<SpecialOfferType>("bogo");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<SpecialOfferStatus>("draft");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [showOnPdp, setShowOnPdp] = useState(true);
  const [showOnCart, setShowOnCart] = useState(true);
  const [showBadge, setShowBadge] = useState(true);
  const [stackable, setStackable] = useState(false);
  const [priority, setPriority] = useState(5);

  const [bogo, setBogo] = useState<BogoConfig | null>(null);
  const [bundle, setBundle] = useState<BundleConfig | null>(null);
  const [gift, setGift] = useState<GiftConfig | null>(null);
  const [tiered, setTiered] = useState<TieredConfig | null>(null);
  const [bundlePickerOpen, setBundlePickerOpen] = useState(false);
  const [bundleQuery, setBundleQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const defaultStart = new Date();
    defaultStart.setHours(defaultStart.getHours() + 2, 0, 0, 0);
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setDate(defaultEnd.getDate() + 14);
    defaultEnd.setHours(23, 59, 0, 0);

    setName(offer?.name ?? "");
    setCode(offer?.code ?? "");
    setSlug(offer?.slug ?? "");
    setOfferType(offer?.offerType ?? "bogo");
    setDescription(offer?.description ?? "");
    setStatus(offer?.status ?? "draft");
    setStartsAt(toDatetimeLocal(offer?.startsAt ?? defaultStart.toISOString()));
    setEndsAt(toDatetimeLocal(offer?.endsAt ?? defaultEnd.toISOString()));
    setShowOnPdp(offer?.showOnPdp ?? true);
    setShowOnCart(offer?.showOnCart ?? true);
    setShowBadge(offer?.showBadge ?? true);
    setStackable(offer?.stackable ?? false);
    setPriority(offer?.priority ?? 5);
    setBogo(offer?.bogo ?? null);
    setBundle(offer?.bundle ?? null);
    setGift(offer?.gift ?? null);
    setTiered(offer?.tiered ?? null);
    setBundlePickerOpen(false);
    setBundleQuery("");
  }, [open, offer]);

  useEffect(() => {
    if (offerType === "tiered" && !tiered) {
      setTiered({ tiers: [{ minQuantity: 2, discountPercent: 10 }] });
    }
  }, [offerType, tiered]);

  const bundlePickerProducts = useMemo(() => {
    const q = bundleQuery.trim().toLowerCase();
    const selected = new Set(bundle?.items.map((i) => i.productId) ?? []);
    return products
      .filter((p) => p.status === "published")
      .filter((p) => !selected.has(p.id))
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 10);
  }, [bundle, bundleQuery]);

  const addBundleItem = useCallback((productId: string) => {
    const ref = toProductRef(productId);
    if (!ref) return;
    setBundle((prev) => ({
      items: [...(prev?.items ?? []), { ...ref, quantity: 1 }],
      pricingMode: prev?.pricingMode ?? "percent_off",
      discountPercent: prev?.discountPercent ?? 15,
      bundlePrice: prev?.bundlePrice,
    }));
    setBundlePickerOpen(false);
    setBundleQuery("");
  }, []);

  const validateConfig = (): boolean => {
    if (offerType === "bogo") {
      if (!bogo?.buyProduct || !bogo.getProduct) {
        toast.error("Select buy and get products for BOGO");
        return false;
      }
    }
    if (offerType === "bundle") {
      if (!bundle?.items.length || bundle.items.length < 2) {
        toast.error("Bundle needs at least 2 products");
        return false;
      }
    }
    if (offerType === "gift_with_purchase") {
      if (!gift?.qualifyingProducts.length || !gift.giftProduct) {
        toast.error("Select qualifying products and a gift product");
        return false;
      }
    }
    if (offerType === "tiered") {
      if (!tiered?.tiers.length || (!tiered.targetProduct && !tiered.targetCategory)) {
        toast.error("Tiered offer needs target and at least one tier");
        return false;
      }
    }
    return true;
  };

  const handleSave = (publish: boolean) => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!code.trim()) {
      toast.error("Offer code is required");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      toast.error("End time must be after start time");
      return;
    }
    if (!validateConfig()) return;

    const isoStart = fromDatetimeLocal(startsAt);
    const isoEnd = fromDatetimeLocal(endsAt);
    const finalStatus = publish ? inferStatus(isoStart, isoEnd, "scheduled") : status;

    upsertOffer({
      id: offer?.id,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      slug: slug.trim(),
      offerType,
      description: description.trim() || undefined,
      status: finalStatus,
      startsAt: isoStart,
      endsAt: isoEnd,
      showOnPdp,
      showOnCart,
      showBadge,
      stackable,
      priority,
      bogo: offerType === "bogo" ? bogo ?? undefined : undefined,
      bundle: offerType === "bundle" ? bundle ?? undefined : undefined,
      gift: offerType === "gift_with_purchase" ? gift ?? undefined : undefined,
      tiered: offerType === "tiered" ? tiered ?? undefined : undefined,
      ordersCount: offer?.ordersCount ?? 0,
      revenue: offer?.revenue ?? 0,
    });

    toast.success(
      publish
        ? "Special offer scheduled — cart engine will apply at start"
        : mode === "create"
          ? "Offer saved as draft"
          : "Offer updated",
    );
    onOpenChange(false);
  };

  const effectiveStatus =
    status === "draft" || status === "cancelled"
      ? status
      : inferStatus(fromDatetimeLocal(startsAt), fromDatetimeLocal(endsAt), status);

  const typeIcon = {
    bogo: Layers,
    bundle: Package,
    gift_with_purchase: Gift,
    tiered: ShoppingCart,
  }[offerType];

  const TypeIcon = typeIcon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl [&>button.absolute]:hidden"
      >
        <div className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 border-b border-input px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="flex items-center gap-2 text-base font-semibold">
                  <Gift className="h-4 w-4 text-violet-600" />
                  {mode === "create" ? "Create special offer" : "Edit special offer"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  BOGO, bundles, gifts, and tiered deals — applied at cart checkout
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
            <div className="rounded-lg border border-violet-200/80 bg-violet-50/60 p-3 text-xs leading-relaxed text-violet-950 dark:border-violet-900 dark:bg-violet-950/20 dark:text-violet-100">
              <p className="font-medium">How special offers work</p>
              <ol className="mt-1.5 list-decimal space-y-1 pl-4">
                <li>Define deal rules (BOGO, bundle, gift, or tiered).</li>
                <li>Marketing engine evaluates cart at checkout — no <code>special_price</code> sync.</li>
                <li>Badges show on PDP; discounts apply in cart automatically.</li>
                <li>For simple scheduled price drops, use <strong>Flash Sales</strong> instead.</li>
              </ol>
            </div>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Offer type</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.keys(SPECIAL_OFFER_TYPE_LABELS) as SpecialOfferType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOfferType(type)}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-left transition-colors",
                      offerType === type
                        ? "border-violet-400 bg-violet-50 dark:border-violet-700 dark:bg-violet-950/30"
                        : "border-input hover:bg-muted/30",
                    )}
                  >
                    <p className="text-xs font-semibold">{SPECIAL_OFFER_TYPE_LABELS[type]}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {SPECIAL_OFFER_TYPE_DESCRIPTIONS[type]}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Details</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="so-name">Name</Label>
                  <Input id="so-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="T-Shirt BOGO Weekend" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="so-code">Offer code</Label>
                  <Input
                    id="so-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="BOGO-TSH"
                    className="font-mono uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>URL slug</Label>
                  <SlugInput value={slug} onChange={setSlug} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="so-desc">Description (optional)</Label>
                  <Textarea id="so-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <TypeIcon className="h-3.5 w-3.5" />
                {SPECIAL_OFFER_TYPE_LABELS[offerType]} rules
              </h3>

              {offerType === "bogo" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <ProductPicker
                    label="Buy product"
                    selectedId={bogo?.buyProduct.productId}
                    onSelect={(ref) =>
                      setBogo((prev) => ({
                        buyProduct: ref,
                        buyQuantity: prev?.buyQuantity ?? 1,
                        getProduct: prev?.getProduct ?? ref,
                        getQuantity: prev?.getQuantity ?? 1,
                        getDiscountPercent: prev?.getDiscountPercent ?? 100,
                      }))
                    }
                  />
                  <div className="space-y-2">
                    <Label className="text-xs">Buy quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={bogo?.buyQuantity ?? 1}
                      onChange={(e) =>
                        setBogo((prev) =>
                          prev
                            ? { ...prev, buyQuantity: Number(e.target.value) }
                            : null,
                        )
                      }
                    />
                  </div>
                  <ProductPicker
                    label="Get product"
                    selectedId={bogo?.getProduct.productId}
                    onSelect={(ref) =>
                      setBogo((prev) =>
                        prev
                          ? { ...prev, getProduct: ref }
                          : {
                              buyProduct: ref,
                              buyQuantity: 1,
                              getProduct: ref,
                              getQuantity: 1,
                              getDiscountPercent: 100,
                            },
                      )
                    }
                  />
                  <div className="space-y-2">
                    <Label className="text-xs">Get quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={bogo?.getQuantity ?? 1}
                      onChange={(e) =>
                        setBogo((prev) =>
                          prev ? { ...prev, getQuantity: Number(e.target.value) } : null,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-xs">Discount on &quot;get&quot; item (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={bogo?.getDiscountPercent ?? 100}
                      onChange={(e) =>
                        setBogo((prev) =>
                          prev ? { ...prev, getDiscountPercent: Number(e.target.value) } : null,
                        )
                      }
                    />
                    <p className="text-[10px] text-muted-foreground">100% = completely free (classic BOGO)</p>
                  </div>
                </div>
              )}

              {offerType === "bundle" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Bundle items ({bundle?.items.length ?? 0})</Label>
                    <Button type="button" size="sm" className="h-7 text-xs" onClick={() => setBundlePickerOpen((v) => !v)}>
                      <Plus className="mr-1 h-3 w-3" />
                      Add product
                    </Button>
                  </div>
                  {bundlePickerOpen && (
                    <div className="rounded-lg border border-input bg-muted/20 p-2">
                      <Input
                        value={bundleQuery}
                        onChange={(e) => setBundleQuery(e.target.value)}
                        placeholder="Search…"
                        className="h-8 text-xs"
                      />
                      <div className="mt-1 max-h-28 space-y-0.5 overflow-y-auto">
                        {bundlePickerProducts.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => addBundleItem(p.id)}
                            className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs hover:bg-background"
                          >
                            <img src={p.thumbnail} alt="" className="h-6 w-6 rounded object-cover" />
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {bundle?.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-2 rounded-md border border-input p-2">
                      <img src={item.thumbnail} alt="" className="h-10 w-10 rounded object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{item.productName}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Label className="text-[10px]">Qty</Label>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              setBundle((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      items: prev.items.map((i) =>
                                        i.productId === item.productId
                                          ? { ...i, quantity: Number(e.target.value) }
                                          : i,
                                      ),
                                    }
                                  : null,
                              )
                            }
                            className="h-7 w-16 text-xs"
                          />
                          <span className="text-[10px] text-muted-foreground">৳{item.price}</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          setBundle((prev) =>
                            prev
                              ? { ...prev, items: prev.items.filter((i) => i.productId !== item.productId) }
                              : null,
                          )
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                  {bundle && bundle.items.length >= 2 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-xs">Pricing</Label>
                        <Select
                          value={bundle.pricingMode}
                          onChange={(e) =>
                            setBundle((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    pricingMode: e.target.value as "fixed" | "percent_off",
                                  }
                                : null,
                            )
                          }
                          className="h-8 text-xs"
                        >
                          <option value="fixed">Fixed bundle price</option>
                          <option value="percent_off">% off combined total</option>
                        </Select>
                      </div>
                      {bundle.pricingMode === "fixed" ? (
                        <div className="space-y-2">
                          <Label className="text-xs">Bundle price (BDT)</Label>
                          <Input
                            type="number"
                            min={0}
                            value={bundle.bundlePrice ?? bundleComputedPrice(bundle)}
                            onChange={(e) =>
                              setBundle((prev) =>
                                prev ? { ...prev, bundlePrice: Number(e.target.value) } : null,
                              )
                            }
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label className="text-xs">Discount %</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={bundle.discountPercent ?? 15}
                            onChange={(e) =>
                              setBundle((prev) =>
                                prev ? { ...prev, discountPercent: Number(e.target.value) } : null,
                              )
                            }
                          />
                        </div>
                      )}
                      <p className="text-xs text-emerald-600 sm:col-span-2">
                        Customer pays: ৳{bundleComputedPrice(bundle)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {offerType === "gift_with_purchase" && (
                <div className="space-y-3">
                  <ProductPicker
                    label="Gift product (free item)"
                    selectedId={gift?.giftProduct.productId}
                    onSelect={(ref) =>
                      setGift((prev) => ({
                        qualifyingProducts: prev?.qualifyingProducts ?? [],
                        giftProduct: ref,
                        giftQuantity: prev?.giftQuantity ?? 1,
                        minCartAmount: prev?.minCartAmount,
                      }))
                    }
                  />
                  <div className="space-y-2">
                    <Label className="text-xs">Gift quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={gift?.giftQuantity ?? 1}
                      onChange={(e) =>
                        setGift((prev) =>
                          prev ? { ...prev, giftQuantity: Number(e.target.value) } : null,
                        )
                      }
                      className="w-24"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Min cart amount (optional)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={gift?.minCartAmount ?? ""}
                      onChange={(e) =>
                        setGift((prev) =>
                          prev
                            ? {
                                ...prev,
                                minCartAmount: e.target.value ? Number(e.target.value) : undefined,
                              }
                            : null,
                        )
                      }
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Qualifying products</Label>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {gift?.qualifyingProducts.map((q) => (
                        <Badge key={q.productId} variant="secondary" className="gap-1 text-[10px]">
                          {q.productName}
                          <button
                            type="button"
                            onClick={() =>
                              setGift((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      qualifyingProducts: prev.qualifyingProducts.filter(
                                        (p) => p.productId !== q.productId,
                                      ),
                                    }
                                  : null,
                              )
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <ProductPicker
                      label="Add qualifying product"
                      excludeIds={gift?.qualifyingProducts.map((p) => p.productId)}
                      onSelect={(ref) =>
                        setGift((prev) => ({
                          giftProduct: prev?.giftProduct ?? ref,
                          giftQuantity: prev?.giftQuantity ?? 1,
                          minCartAmount: prev?.minCartAmount,
                          qualifyingProducts: [...(prev?.qualifyingProducts ?? []), ref],
                        }))
                      }
                    />
                  </div>
                </div>
              )}

              {offerType === "tiered" && (
                <div className="space-y-3">
                  <ProductPicker
                    label="Target product (or use category below)"
                    selectedId={tiered?.targetProduct?.productId}
                    onSelect={(ref) =>
                      setTiered((prev) => ({
                        targetProduct: ref,
                        targetCategory: undefined,
                        tiers: prev?.tiers ?? [{ minQuantity: 2, discountPercent: 10 }],
                      }))
                    }
                  />
                  <div className="space-y-2">
                    <Label className="text-xs">Or target category</Label>
                    <Input
                      value={tiered?.targetCategory ?? ""}
                      onChange={(e) =>
                        setTiered((prev) => ({
                          targetProduct: undefined,
                          targetCategory: e.target.value || undefined,
                          tiers: prev?.tiers ?? [{ minQuantity: 2, discountPercent: 10 }],
                        }))
                      }
                      placeholder="Apparel"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Quantity tiers</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() =>
                          setTiered((prev) => ({
                            targetProduct: prev?.targetProduct,
                            targetCategory: prev?.targetCategory,
                            tiers: [
                              ...(prev?.tiers ?? []),
                              {
                                minQuantity: (prev?.tiers[prev.tiers.length - 1]?.minQuantity ?? 1) + 1,
                                discountPercent: 15,
                              },
                            ],
                          }))
                        }
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add tier
                      </Button>
                    </div>
                    {(tiered?.tiers ?? [{ minQuantity: 2, discountPercent: 10 }]).map((tier, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Buy</span>
                        <Input
                          type="number"
                          min={1}
                          value={tier.minQuantity}
                          onChange={(e) =>
                            setTiered((prev) => {
                              const tiers = [...(prev?.tiers ?? [])];
                              tiers[idx] = { ...tiers[idx], minQuantity: Number(e.target.value) };
                              return { ...prev, tiers, targetProduct: prev?.targetProduct, targetCategory: prev?.targetCategory };
                            })
                          }
                          className="h-8 w-16 text-xs"
                        />
                        <span className="text-xs text-muted-foreground">+ →</span>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={tier.discountPercent}
                          onChange={(e) =>
                            setTiered((prev) => {
                              const tiers = [...(prev?.tiers ?? [])];
                              tiers[idx] = { ...tiers[idx], discountPercent: Number(e.target.value) };
                              return { ...prev, tiers, targetProduct: prev?.targetProduct, targetCategory: prev?.targetCategory };
                            })
                          }
                          className="h-8 w-16 text-xs"
                        />
                        <span className="text-xs">% off</span>
                        {(tiered?.tiers.length ?? 0) > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              setTiered((prev) =>
                                prev
                                  ? { ...prev, tiers: prev.tiers.filter((_, i) => i !== idx) }
                                  : null,
                              )
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                Schedule
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Starts</Label>
                  <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Ends</Label>
                  <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SpecialOfferStatus)}
                  className="h-8 w-[160px] text-xs"
                >
                  {(Object.keys(SPECIAL_OFFER_STATUS_LABELS) as SpecialOfferStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {SPECIAL_OFFER_STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
                {status !== "draft" && status !== "cancelled" && (
                  <Badge variant="outline" className="text-[10px] capitalize">
                    Will show as: {SPECIAL_OFFER_STATUS_LABELS[effectiveStatus]}
                  </Badge>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Store className="h-3.5 w-3.5" />
                Storefront & cart
              </h3>
              <Switch checked={showOnPdp} onCheckedChange={setShowOnPdp} label="Show badge on product page" />
              <Switch checked={showOnCart} onCheckedChange={setShowOnCart} label="Apply automatically in cart" />
              <Switch checked={showBadge} onCheckedChange={setShowBadge} label="Show offer label in listings" />
              <Switch
                checked={stackable}
                onCheckedChange={setStackable}
                label="Stackable with other offers"
                description="When off, highest-priority offer wins"
              />
            </section>
          </div>

          <div className="shrink-0 flex flex-wrap gap-2 border-t border-input bg-muted/20 px-4 py-3">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={() => handleSave(false)}>
              Save draft
            </Button>
            <Button type="button" size="sm" onClick={() => handleSave(true)}>
              Activate offer
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
