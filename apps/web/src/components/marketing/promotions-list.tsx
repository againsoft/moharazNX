"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Copy,
  MoreHorizontal,
  Pencil,
  Plus,
  Scale,
  ShoppingCart,
  Tag,
  Trash2,
  Truck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  describePromotion,
  formatBdt,
  formatScheduleRange,
  PROMOTION_ACTION_LABELS,
  PROMOTION_RULE_LABELS,
  PROMOTION_STATUS_LABELS,
  promotionKpis,
  STACKING_MODE_LABELS,
  type Promotion,
  type PromotionRuleType,
  type PromotionStatus,
} from "@/lib/mock-data/promotions";
import { usePromotionStore } from "@/lib/store/promotion-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PromotionFormSheet } from "@/components/marketing/promotion-form-sheet";

function statusVariant(status: PromotionStatus) {
  if (status === "running") return "success" as const;
  if (status === "scheduled") return "warning" as const;
  if (status === "draft") return "secondary" as const;
  if (status === "completed") return "muted" as const;
  return "outline" as const;
}

const RULE_ICONS: Record<PromotionRuleType, typeof ShoppingCart> = {
  cart_subtotal: Scale,
  product_in_cart: ShoppingCart,
  customer_group: Users,
  category: Tag,
};

type Props = {
  addTrigger?: number;
};

export function PromotionsList({ addTrigger = 0 }: Props) {
  const promotions = usePromotionStore((s) => s.promotions);
  const deletePromotion = usePromotionStore((s) => s.deletePromotion);
  const duplicatePromotion = usePromotionStore((s) => s.duplicatePromotion);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [lastAddTrigger, setLastAddTrigger] = useState(addTrigger);

  useEffect(() => {
    if (addTrigger !== lastAddTrigger) {
      setLastAddTrigger(addTrigger);
      setEditing(null);
      setSheetOpen(true);
    }
  }, [addTrigger, lastAddTrigger]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return promotions.filter((promo) => {
      if (statusFilter !== "all" && promo.status !== statusFilter) return false;
      if (!q) return true;
      return (
        promo.name.toLowerCase().includes(q) ||
        promo.slug.toLowerCase().includes(q) ||
        describePromotion(promo).toLowerCase().includes(q)
      );
    });
  }, [promotions, query, statusFilter]);

  const kpis = promotionKpis(promotions);

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (promo: Promotion) => {
    setEditing(promo);
    setSheetOpen(true);
  };

  return (
    <>
      <div className="rounded-lg border border-input bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">Rule engine flow</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
          {[
            "1. Define conditions",
            "2. Set discount action",
            "3. Schedule + priority",
            "4. Auto-apply at checkout",
            "5. Measure attribution",
          ].map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span className="rounded-full bg-background px-2 py-0.5 font-medium text-foreground shadow-sm">
                {step}
              </span>
              {i < 4 && <span className="text-muted-foreground">→</span>}
            </span>
          ))}
        </div>
        <p className="mt-2 text-[11px]">
          Evaluation order at checkout: promotions (auto) → coupon code → loyalty → wallet. Use{" "}
          <Link href="/marketing/flash-sales" className="text-primary hover:underline">
            Flash Sales
          </Link>{" "}
          for scheduled product price sync, not this page.
        </p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-input bg-card p-3 shadow-sm">
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <p className="mt-0.5 text-xl font-semibold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search promotions or rules…"
            className="h-8 text-xs"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 w-[140px] text-xs"
        >
          <option value="all">All status</option>
          {(Object.keys(PROMOTION_STATUS_LABELS) as PromotionStatus[]).map((s) => (
            <option key={s} value={s}>
              {PROMOTION_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Button size="sm" className="ml-auto h-8" onClick={openCreate}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Create promotion
        </Button>
      </div>

      <div className="mt-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-input px-6 py-12 text-center">
            <Tag className="mx-auto h-8 w-8 text-indigo-500/70" />
            <p className="mt-2 text-sm font-medium">No promotions yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cart subtotal, category, customer group, and product-in-cart rules with auto discounts
            </p>
            <Button size="sm" className="mt-4" onClick={openCreate}>
              Create promotion
            </Button>
          </div>
        ) : (
          filtered.map((promo) => {
            const hasFreeShipping = promo.actions.some((a) => a.type === "free_shipping");

            return (
              <div key={promo.id} className="rounded-lg border border-input bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(promo)}
                        className="text-left text-base font-semibold hover:text-primary"
                      >
                        {promo.name}
                      </button>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        priority {promo.priority}
                      </Badge>
                      <Badge variant={statusVariant(promo.status)} className="capitalize">
                        {PROMOTION_STATUS_LABELS[promo.status]}
                      </Badge>
                      {promo.autoApply && (
                        <Badge variant="secondary" className="text-[10px]">
                          Auto-apply
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-foreground/80">{describePromotion(promo)}</p>
                    {promo.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{promo.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatScheduleRange(promo.startsAt, promo.endsAt)}
                      </span>
                      <span>{STACKING_MODE_LABELS[promo.stackingMode]}</span>
                      {promo.revenue > 0 && (
                        <span className="font-medium text-foreground">{formatBdt(promo.revenue)}</span>
                      )}
                      {promo.ordersCount > 0 && <span>{promo.ordersCount} orders</span>}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(promo)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const id = duplicatePromotion(promo.id);
                          if (id) toast.success("Duplicated as draft");
                        }}
                      >
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          deletePromotion(promo.id);
                          toast.success("Promotion deleted");
                        }}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {promo.rules.map((rule, i) => {
                    const Icon = RULE_ICONS[rule.type];
                    return (
                      <div
                        key={`${rule.type}-${i}`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-input bg-muted/20 px-2 py-1 text-[11px]"
                      >
                        <Icon className="h-3 w-3 text-indigo-600" />
                        <span className="font-medium">{PROMOTION_RULE_LABELS[rule.type]}</span>
                      </div>
                    );
                  })}
                  <span className="self-center text-muted-foreground">→</span>
                  {promo.actions.map((action, i) => (
                    <div
                      key={`${action.type}-${i}`}
                      className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50/50 px-2 py-1 text-[11px] dark:border-emerald-900/50 dark:bg-emerald-950/20"
                    >
                      {action.type === "free_shipping" ? (
                        <Truck className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Tag className="h-3 w-3 text-emerald-600" />
                      )}
                      <span className="font-medium">{PROMOTION_ACTION_LABELS[action.type]}</span>
                      {action.value != null && action.type !== "free_shipping" && (
                        <span className="text-muted-foreground">
                          {action.type.includes("percent") ? `${action.value}%` : formatBdt(action.value)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {promo.showOnCart && (
                    <Badge variant="secondary" className="text-[10px]">
                      Cart message
                    </Badge>
                  )}
                  {promo.showAnnouncement && (
                    <Badge variant="secondary" className="text-[10px]">
                      Storefront banner
                    </Badge>
                  )}
                  {hasFreeShipping && (
                    <Badge variant="secondary" className="text-[10px]">
                      Shipping
                    </Badge>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <PromotionFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={editing ? "edit" : "create"}
        promotion={editing}
      />
    </>
  );
}
