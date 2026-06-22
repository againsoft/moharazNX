"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Package,
  Plus,
  Search,
  Store,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { products } from "@/lib/mock-data/products";
import {
  computeSalePrice,
  FLASH_SALE_STATUS_LABELS,
  type FlashSale,
  type FlashSaleDiscountType,
  type FlashSaleItem,
  type FlashSaleStatus,
} from "@/lib/mock-data/flash-sales";
import { useFlashSaleStore } from "@/lib/store/flash-sale-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SlugInput } from "@/components/ui/slug-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  sale?: FlashSale | null;
};

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string) {
  return new Date(value).toISOString();
}

function inferStatus(startsAt: string, endsAt: string, manual: FlashSaleStatus): FlashSaleStatus {
  if (manual === "draft" || manual === "cancelled") return manual;
  const now = Date.now();
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (now < start) return "scheduled";
  if (now <= end) return "running";
  return "completed";
}

export function FlashSaleFormSheet({ open, onOpenChange, mode = "create", sale }: Props) {
  const upsertSale = useFlashSaleStore((s) => s.upsertSale);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<FlashSaleStatus>("draft");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [showOnHomepage, setShowOnHomepage] = useState(true);
  const [showOnDealsPage, setShowOnDealsPage] = useState(true);
  const [items, setItems] = useState<FlashSaleItem[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const defaultStart = new Date();
    defaultStart.setHours(defaultStart.getHours() + 1, 0, 0, 0);
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setDate(defaultEnd.getDate() + 3);
    defaultEnd.setHours(23, 59, 0, 0);

    setName(sale?.name ?? "");
    setSlug(sale?.slug ?? "");
    setDescription(sale?.description ?? "");
    setStatus(sale?.status ?? "draft");
    setStartsAt(toDatetimeLocal(sale?.startsAt ?? defaultStart.toISOString()));
    setEndsAt(toDatetimeLocal(sale?.endsAt ?? defaultEnd.toISOString()));
    setShowOnHomepage(sale?.showOnHomepage ?? true);
    setShowOnDealsPage(sale?.showOnDealsPage ?? true);
    setItems(sale?.items ?? []);
    setPickerOpen(false);
    setPickerQuery("");
  }, [open, sale]);

  const pickerProducts = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    const selected = new Set(items.map((i) => i.productId));
    return products
      .filter((p) => p.status === "published")
      .filter((p) => !selected.has(p.id))
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [items, pickerQuery]);

  const updateItem = useCallback(
    (productId: string, patch: Partial<FlashSaleItem>) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.productId !== productId) return item;
          const next = { ...item, ...patch };
          next.salePrice = computeSalePrice(
            next.originalPrice,
            next.discountType,
            next.discountValue,
          );
          return next;
        }),
      );
    },
    [],
  );

  const addProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const discountType: FlashSaleDiscountType = "percent";
    const discountValue = 15;
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        thumbnail: product.thumbnail,
        originalPrice: product.price,
        discountType,
        discountValue,
        salePrice: computeSalePrice(product.price, discountType, discountValue),
      },
    ]);
    setPickerOpen(false);
    setPickerQuery("");
  };

  const handleSave = (publish: boolean) => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!slug.trim()) {
      toast.error("Slug is required");
      return;
    }
    if (!items.length) {
      toast.error("Add at least one product");
      return;
    }
    if (new Date(endsAt) <= new Date(startsAt)) {
      toast.error("End time must be after start time");
      return;
    }

    const isoStart = fromDatetimeLocal(startsAt);
    const isoEnd = fromDatetimeLocal(endsAt);
    const finalStatus = publish
      ? inferStatus(isoStart, isoEnd, "scheduled")
      : status;

    upsertSale({
      id: sale?.id,
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || undefined,
      status: finalStatus,
      startsAt: isoStart,
      endsAt: isoEnd,
      showOnHomepage,
      showOnDealsPage,
      items,
      ordersCount: sale?.ordersCount ?? 0,
      revenue: sale?.revenue ?? 0,
    });

    toast.success(
      publish
        ? "Flash sale scheduled — prices sync at start time"
        : mode === "create"
          ? "Flash sale saved as draft"
          : "Flash sale updated",
    );
    onOpenChange(false);
  };

  const effectiveStatus =
    status === "draft" || status === "cancelled"
      ? status
      : inferStatus(fromDatetimeLocal(startsAt), fromDatetimeLocal(endsAt), status);

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
                  <Zap className="h-4 w-4 text-amber-500" />
                  {mode === "create" ? "Create flash sale" : "Edit flash sale"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Schedule discounted prices for one or many products
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
            <div className="rounded-lg border border-amber-200/80 bg-amber-50/60 p-3 text-xs leading-relaxed text-amber-950 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
              <p className="font-medium">How this works</p>
              <ol className="mt-1.5 list-decimal space-y-1 pl-4">
                <li>You pick products and set sale prices below.</li>
                <li>At <strong>start time</strong>, system syncs <code>special_price</code> to catalog.</li>
                <li>Storefront shows deals on <code>/deals</code>, homepage widget, and product pages.</li>
                <li>At <strong>end time</strong>, prices revert automatically.</li>
              </ol>
            </div>

            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Details
              </h3>
              <div className="space-y-2">
                <Label htmlFor="fs-name">Name</Label>
                <Input
                  id="fs-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Eid Weekend Flash"
                />
              </div>
              <div className="space-y-2">
                <Label>URL slug</Label>
                <SlugInput value={slug} onChange={setSlug} />
                <p className="text-[10px] text-muted-foreground">
                  Storefront: /deals/{slug || "your-slug"}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fs-desc">Description (optional)</Label>
                <Textarea
                  id="fs-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Short note for admin and deals page…"
                />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                Schedule
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fs-start">Starts</Label>
                  <Input
                    id="fs-start"
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fs-end">Ends</Label>
                  <Input
                    id="fs-end"
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Label className="text-xs">Status</Label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as FlashSaleStatus)}
                  className="h-8 w-[160px] text-xs"
                >
                  {(Object.keys(FLASH_SALE_STATUS_LABELS) as FlashSaleStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {FLASH_SALE_STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
                {status !== "draft" && status !== "cancelled" && (
                  <Badge variant="outline" className="text-[10px] capitalize">
                    Will show as: {FLASH_SALE_STATUS_LABELS[effectiveStatus]}
                  </Badge>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Store className="h-3.5 w-3.5" />
                Storefront
              </h3>
              <Switch
                checked={showOnHomepage}
                onCheckedChange={setShowOnHomepage}
                label="Show on homepage deals strip"
                description="Countdown widget on home page"
              />
              <Switch
                checked={showOnDealsPage}
                onCheckedChange={setShowOnDealsPage}
                label="Show on /deals page"
                description="Listed in offers hub with other active sales"
              />
            </section>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Package className="h-3.5 w-3.5" />
                  Products ({items.length})
                </h3>
                <Button type="button" size="sm" className="h-7 text-xs" onClick={() => setPickerOpen((v) => !v)}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add products
                </Button>
              </div>

              {pickerOpen && (
                <div className="rounded-lg border border-input bg-muted/20 p-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={pickerQuery}
                      onChange={(e) => setPickerQuery(e.target.value)}
                      placeholder="Search by name, SKU, category…"
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                  <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                    {pickerProducts.length ? (
                      pickerProducts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => addProduct(p.id)}
                          className="flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left text-xs hover:border-input hover:bg-background"
                        >
                          <img src={p.thumbnail} alt="" className="h-8 w-8 rounded object-cover" />
                          <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                          <span className="text-muted-foreground">৳{p.price}</span>
                        </button>
                      ))
                    ) : (
                      <p className="py-2 text-center text-xs text-muted-foreground">No products found</p>
                    )}
                  </div>
                </div>
              )}

              {!items.length ? (
                <div className="rounded-lg border border-dashed border-input px-4 py-8 text-center text-xs text-muted-foreground">
                  No products yet — add one or many SKUs to this offer
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="rounded-lg border border-input bg-card p-3"
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.thumbnail}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-md object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.productName}</p>
                          <p className="text-[10px] text-muted-foreground">{item.sku}</p>
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-[10px] text-muted-foreground">Was</p>
                              <p className="text-xs font-medium line-through">৳{item.originalPrice}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground">Discount</p>
                              <div className="flex gap-1">
                                <Select
                                  value={item.discountType}
                                  onChange={(e) =>
                                    updateItem(item.productId, {
                                      discountType: e.target.value as FlashSaleDiscountType,
                                    })
                                  }
                                  className="h-7 flex-1 px-1 text-[10px]"
                                >
                                  <option value="percent">%</option>
                                  <option value="fixed">৳</option>
                                </Select>
                                <Input
                                  type="number"
                                  min={0}
                                  value={item.discountValue}
                                  onChange={(e) =>
                                    updateItem(item.productId, {
                                      discountValue: Number(e.target.value),
                                    })
                                  }
                                  className="h-7 text-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground">Sale price</p>
                              <p className="text-sm font-semibold text-emerald-600">
                                ৳{item.salePrice}
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() =>
                            setItems((prev) => prev.filter((p) => p.productId !== item.productId))
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              Schedule offer
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
