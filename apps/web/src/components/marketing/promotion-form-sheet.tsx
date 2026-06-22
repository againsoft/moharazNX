"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Plus,
  Scale,
  Search,
  ShoppingCart,
  Store,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { products } from "@/lib/mock-data/products";
import {
  CUSTOMER_GROUPS,
  PROMOTION_ACTION_DESCRIPTIONS,
  PROMOTION_ACTION_LABELS,
  PROMOTION_RULE_DESCRIPTIONS,
  PROMOTION_RULE_LABELS,
  PROMOTION_STATUS_LABELS,
  STACKING_MODE_LABELS,
  type Promotion,
  type PromotionAction,
  type PromotionActionType,
  type PromotionRule,
  type PromotionRuleType,
  type PromotionStatus,
  type StackingMode,
} from "@/lib/mock-data/promotions";
import { usePromotionStore } from "@/lib/store/promotion-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SlugInput } from "@/components/ui/slug-input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit";
  promotion?: Promotion | null;
};

const RULE_TYPES: PromotionRuleType[] = [
  "cart_subtotal",
  "product_in_cart",
  "customer_group",
  "category",
];

const ACTION_TYPES: PromotionActionType[] = [
  "percent_off_cart",
  "fixed_off_cart",
  "percent_off_item",
  "free_item",
  "free_shipping",
];

const RULE_ICONS: Record<PromotionRuleType, typeof Scale> = {
  cart_subtotal: Scale,
  product_in_cart: ShoppingCart,
  customer_group: Users,
  category: Tag,
};

function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocal(value: string) {
  return new Date(value).toISOString();
}

function inferStatus(startsAt: string, endsAt: string, manual: PromotionStatus): PromotionStatus {
  if (manual === "draft" || manual === "cancelled") return manual;
  const now = Date.now();
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (now < start) return "scheduled";
  if (now <= end) return "running";
  return "completed";
}

function defaultRule(type: PromotionRuleType): PromotionRule {
  switch (type) {
    case "cart_subtotal":
      return { type, minSubtotal: 3000 };
    case "product_in_cart":
      return { type, minQuantity: 1 };
    case "customer_group":
      return { type, customerGroup: "VIP" };
    case "category":
      return { type, category: "Electronics" };
  }
}

function defaultAction(type: PromotionActionType): PromotionAction {
  switch (type) {
    case "percent_off_cart":
    case "percent_off_item":
      return { type, value: 10 };
    case "fixed_off_cart":
      return { type, value: 500 };
    case "free_item":
      return { type };
    case "free_shipping":
      return { type };
  }
}

export function PromotionFormSheet({ open, onOpenChange, mode = "create", promotion }: Props) {
  const upsertPromotion = usePromotionStore((s) => s.upsertPromotion);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<PromotionStatus>("draft");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [rules, setRules] = useState<PromotionRule[]>([]);
  const [actions, setActions] = useState<PromotionAction[]>([]);
  const [priority, setPriority] = useState(10);
  const [stackingMode, setStackingMode] = useState<StackingMode>("stackable");
  const [autoApply, setAutoApply] = useState(true);
  const [showOnCart, setShowOnCart] = useState(true);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [productPickerIndex, setProductPickerIndex] = useState<number | null>(null);
  const [productQuery, setProductQuery] = useState("");
  const [freeItemPickerOpen, setFreeItemPickerOpen] = useState(false);
  const [freeItemQuery, setFreeItemQuery] = useState("");

  const categoryOptions = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [],
  );

  useEffect(() => {
    if (!open) return;
    const defaultStart = new Date();
    defaultStart.setHours(defaultStart.getHours() + 1, 0, 0, 0);
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setDate(defaultEnd.getDate() + 7);
    defaultEnd.setHours(23, 59, 0, 0);

    setName(promotion?.name ?? "");
    setSlug(promotion?.slug ?? "");
    setDescription(promotion?.description ?? "");
    setStatus(promotion?.status ?? "draft");
    setStartsAt(toDatetimeLocal(promotion?.startsAt ?? defaultStart.toISOString()));
    setEndsAt(toDatetimeLocal(promotion?.endsAt ?? defaultEnd.toISOString()));
    setRules(promotion?.rules?.length ? promotion.rules.map((r) => ({ ...r })) : [defaultRule("cart_subtotal")]);
    setActions(
      promotion?.actions?.length ? promotion.actions.map((a) => ({ ...a })) : [defaultAction("free_shipping")],
    );
    setPriority(promotion?.priority ?? 10);
    setStackingMode(promotion?.stackingMode ?? "stackable");
    setAutoApply(promotion?.autoApply ?? true);
    setShowOnCart(promotion?.showOnCart ?? true);
    setShowAnnouncement(promotion?.showAnnouncement ?? false);
    setProductPickerIndex(null);
    setProductQuery("");
    setFreeItemPickerOpen(false);
    setFreeItemQuery("");
  }, [open, promotion]);

  const pickerProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    return products
      .filter((p) => p.status === "published")
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      )
      .slice(0, 10);
  }, [productQuery]);

  const freeItemProducts = useMemo(() => {
    const q = freeItemQuery.trim().toLowerCase();
    return products
      .filter((p) => p.status === "published")
      .filter(
        (p) =>
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q),
      )
      .slice(0, 10);
  }, [freeItemQuery]);

  const updateRule = useCallback((index: number, patch: Partial<PromotionRule>) => {
    setRules((prev) =>
      prev.map((rule, i) => {
        if (i !== index) return rule;
        const next = { ...rule, ...patch };
        if (patch.type && patch.type !== rule.type) {
          return defaultRule(patch.type);
        }
        return next;
      }),
    );
  }, []);

  const updateAction = useCallback((index: number, patch: Partial<PromotionAction>) => {
    setActions((prev) =>
      prev.map((action, i) => {
        if (i !== index) return action;
        const next = { ...action, ...patch };
        if (patch.type && patch.type !== action.type) {
          return defaultAction(patch.type);
        }
        return next;
      }),
    );
  }, []);

  const handleSave = (activate: boolean) => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (rules.length === 0) {
      toast.error("Add at least one condition");
      return;
    }
    if (actions.length === 0) {
      toast.error("Add at least one action");
      return;
    }

    const startIso = fromDatetimeLocal(startsAt);
    const endIso = fromDatetimeLocal(endsAt);
    const nextStatus = activate
      ? inferStatus(startIso, endIso, "scheduled")
      : status === "cancelled"
        ? "cancelled"
        : "draft";

    upsertPromotion({
      id: promotion?.id,
      name: name.trim(),
      slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, "-"),
      description: description.trim() || undefined,
      status: nextStatus,
      startsAt: startIso,
      endsAt: endIso,
      rules,
      actions,
      priority,
      stackingMode,
      autoApply,
      showOnCart,
      showAnnouncement,
    });

    toast.success(activate ? "Promotion scheduled" : "Draft saved");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <div className="shrink-0 border-b border-input px-4 py-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-semibold">
              {mode === "edit" ? "Edit promotion" : "Create promotion"}
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Cart rule engine — conditions + discount actions, auto-applied at checkout.
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Details
            </h3>
            <div className="space-y-2">
              <Label className="text-xs">Promotion name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Free Shipping Weekend"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Slug</Label>
              <SlugInput value={slug} onChange={setSlug} className="text-xs" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Description (internal)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="text-xs"
                placeholder="What this rule does and who it targets…"
              />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Conditions (WHEN)
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-[10px]"
                onClick={() => setRules((prev) => [...prev, defaultRule("cart_subtotal")])}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add condition
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              All conditions must match (AND). Evaluated by the cart engine at checkout.
            </p>

            {rules.map((rule, index) => {
              const Icon = RULE_ICONS[rule.type];
              return (
                <div key={index} className="rounded-lg border border-input bg-muted/10 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-indigo-600" />
                      <Select
                        value={rule.type}
                        onChange={(e) => updateRule(index, { type: e.target.value as PromotionRuleType })}
                        className="h-8 w-[180px] text-xs"
                      >
                        {RULE_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {PROMOTION_RULE_LABELS[t]}
                          </option>
                        ))}
                      </Select>
                    </div>
                    {rules.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setRules((prev) => prev.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {PROMOTION_RULE_DESCRIPTIONS[rule.type]}
                  </p>

                  <div className="mt-3 space-y-2">
                    {rule.type === "cart_subtotal" && (
                      <div className="space-y-1">
                        <Label className="text-[10px]">Minimum cart subtotal (৳)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={rule.minSubtotal ?? 0}
                          onChange={(e) =>
                            updateRule(index, { minSubtotal: Number(e.target.value) || 0 })
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    )}

                    {rule.type === "customer_group" && (
                      <div className="space-y-1">
                        <Label className="text-[10px]">Customer group</Label>
                        <Select
                          value={rule.customerGroup ?? "VIP"}
                          onChange={(e) => updateRule(index, { customerGroup: e.target.value })}
                          className="h-8 text-xs"
                        >
                          {CUSTOMER_GROUPS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}

                    {rule.type === "category" && (
                      <div className="space-y-1">
                        <Label className="text-[10px]">Category</Label>
                        <Select
                          value={rule.category ?? categoryOptions[0]}
                          onChange={(e) => updateRule(index, { category: e.target.value })}
                          className="h-8 text-xs"
                        >
                          {categoryOptions.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}

                    {rule.type === "product_in_cart" && (
                      <div className="space-y-2">
                        {rule.productId ? (
                          <div className="flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5">
                            <img
                              src={products.find((p) => p.id === rule.productId)?.thumbnail}
                              alt=""
                              className="h-8 w-8 rounded object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium">{rule.productName}</p>
                              <p className="text-[10px] text-muted-foreground">{rule.sku}</p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[10px]"
                              onClick={() => setProductPickerIndex(index)}
                            >
                              Change
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 w-full text-xs"
                            onClick={() => setProductPickerIndex(index)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            Select product
                          </Button>
                        )}
                        {productPickerIndex === index && (
                          <div className="rounded-lg border border-input bg-muted/20 p-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                value={productQuery}
                                onChange={(e) => setProductQuery(e.target.value)}
                                placeholder="Search products…"
                                className="h-8 pl-8 text-xs"
                              />
                            </div>
                            <div className="mt-1 max-h-28 space-y-0.5 overflow-y-auto">
                              {pickerProducts.map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    updateRule(index, {
                                      productId: p.id,
                                      productName: p.name,
                                      sku: p.sku,
                                    });
                                    setProductPickerIndex(null);
                                    setProductQuery("");
                                  }}
                                  className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs hover:bg-background"
                                >
                                  <img src={p.thumbnail} alt="" className="h-7 w-7 rounded object-cover" />
                                  <span className="truncate">{p.name}</span>
                                </button>
                              ))}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="mt-1 h-7 w-full text-[10px]"
                              onClick={() => setProductPickerIndex(null)}
                            >
                              <X className="mr-1 h-3 w-3" />
                              Close
                            </Button>
                          </div>
                        )}
                        <div className="space-y-1">
                          <Label className="text-[10px]">Minimum quantity</Label>
                          <Input
                            type="number"
                            min={1}
                            value={rule.minQuantity ?? 1}
                            onChange={(e) =>
                              updateRule(index, { minQuantity: Number(e.target.value) || 1 })
                            }
                            className="h-8 w-24 text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actions (THEN)
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-[10px]"
                onClick={() => setActions((prev) => [...prev, defaultAction("percent_off_cart")])}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add action
              </Button>
            </div>

            {actions.map((action, index) => (
              <div key={index} className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                <div className="flex items-start justify-between gap-2">
                  <Select
                    value={action.type}
                    onChange={(e) =>
                      updateAction(index, { type: e.target.value as PromotionActionType })
                    }
                    className="h-8 w-full text-xs"
                  >
                    {ACTION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {PROMOTION_ACTION_LABELS[t]}
                      </option>
                    ))}
                  </Select>
                  {actions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => setActions((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {PROMOTION_ACTION_DESCRIPTIONS[action.type]}
                </p>

                <div className="mt-3 space-y-2">
                  {(action.type === "percent_off_cart" ||
                    action.type === "percent_off_item" ||
                    action.type === "fixed_off_cart") && (
                    <div className="space-y-1">
                      <Label className="text-[10px]">
                        {action.type === "fixed_off_cart" ? "Amount (৳)" : "Percentage (%)"}
                      </Label>
                      <Input
                        type="number"
                        min={0}
                        value={action.value ?? 0}
                        onChange={(e) =>
                          updateAction(index, { value: Number(e.target.value) || 0 })
                        }
                        className="h-8 w-28 text-xs"
                      />
                    </div>
                  )}

                  {action.type === "percent_off_cart" && (
                    <div className="space-y-1">
                      <Label className="text-[10px]">Max discount cap (৳, optional)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={action.maxDiscount ?? ""}
                        onChange={(e) =>
                          updateAction(index, {
                            maxDiscount: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        className="h-8 w-28 text-xs"
                        placeholder="No cap"
                      />
                    </div>
                  )}

                  {action.type === "free_item" && (
                    <div className="space-y-2">
                      {action.productId ? (
                        <div className="flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5">
                          <img
                            src={products.find((p) => p.id === action.productId)?.thumbnail}
                            alt=""
                            className="h-8 w-8 rounded object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium">{action.productName}</p>
                            <p className="text-[10px] text-muted-foreground">{action.sku}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px]"
                            onClick={() => setFreeItemPickerOpen(true)}
                          >
                            Change
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 w-full text-xs"
                          onClick={() => setFreeItemPickerOpen(true)}
                        >
                          Select free product
                        </Button>
                      )}
                      {freeItemPickerOpen && (
                        <div className="rounded-lg border border-input bg-muted/20 p-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              value={freeItemQuery}
                              onChange={(e) => setFreeItemQuery(e.target.value)}
                              placeholder="Search products…"
                              className="h-8 pl-8 text-xs"
                            />
                          </div>
                          <div className="mt-1 max-h-28 space-y-0.5 overflow-y-auto">
                            {freeItemProducts.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  updateAction(index, {
                                    productId: p.id,
                                    productName: p.name,
                                    sku: p.sku,
                                  });
                                  setFreeItemPickerOpen(false);
                                  setFreeItemQuery("");
                                }}
                                className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs hover:bg-background"
                              >
                                <img src={p.thumbnail} alt="" className="h-7 w-7 rounded object-cover" />
                                <span className="truncate">{p.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              Schedule
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-[10px]">Starts</Label>
                <Input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Ends</Label>
                <Input
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px]">Status</Label>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as PromotionStatus)}
                className="h-8 text-xs"
              >
                {(Object.keys(PROMOTION_STATUS_LABELS) as PromotionStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {PROMOTION_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Store className="h-3.5 w-3.5" />
              Engine & storefront
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-[10px]">Priority (lower = first)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value) || 10)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px]">Stacking mode</Label>
                <Select
                  value={stackingMode}
                  onChange={(e) => setStackingMode(e.target.value as StackingMode)}
                  className="h-8 text-xs"
                >
                  {(Object.keys(STACKING_MODE_LABELS) as StackingMode[]).map((m) => (
                    <option key={m} value={m}>
                      {STACKING_MODE_LABELS[m]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-input bg-muted/10 p-3">
              {[
                {
                  id: "auto",
                  label: "Auto-apply at checkout",
                  hint: "No coupon code — cart engine applies when rules match",
                  checked: autoApply,
                  onChange: setAutoApply,
                },
                {
                  id: "cart",
                  label: "Show message in cart",
                  hint: "Display eligible promotion hint to shopper",
                  checked: showOnCart,
                  onChange: setShowOnCart,
                },
                {
                  id: "banner",
                  label: "Storefront announcement",
                  hint: "Site-wide banner while promotion is running",
                  checked: showAnnouncement,
                  onChange: setShowAnnouncement,
                },
              ].map((row) => (
                <div key={row.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium">{row.label}</p>
                    <p className="text-[10px] text-muted-foreground">{row.hint}</p>
                  </div>
                  <Switch checked={row.checked} onCheckedChange={row.onChange} />
                </div>
              ))}
            </div>
          </section>

          <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-3 text-[11px] leading-relaxed text-muted-foreground dark:border-indigo-900/50 dark:bg-indigo-950/20">
            <p className="font-medium text-foreground">How this differs from other modules</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong>Promotions</strong> — cart/category/customer rules, auto discount at checkout
              </li>
              <li>
                <strong>Flash Sales</strong> — scheduled product price sync to catalog
              </li>
              <li>
                <strong>Special Offers</strong> — BOGO, bundles, gifts (complex cart logic)
              </li>
              <li>
                <strong>Coupons</strong> — shopper enters a code manually
              </li>
            </ul>
          </div>
        </div>

        <div className="shrink-0 flex gap-2 border-t border-input bg-background px-4 py-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleSave(false)}
          >
            Save draft
          </Button>
          <Button type="button" size="sm" className="flex-1" onClick={() => handleSave(true)}>
            Activate promotion
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
