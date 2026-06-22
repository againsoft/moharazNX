"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Copy,
  Gift,
  Layers,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  describeOffer,
  formatBdt,
  formatScheduleRange,
  SPECIAL_OFFER_STATUS_LABELS,
  SPECIAL_OFFER_TYPE_LABELS,
  specialOfferKpis,
  type SpecialOffer,
  type SpecialOfferStatus,
  type SpecialOfferType,
} from "@/lib/mock-data/special-offers";
import { useSpecialOfferStore } from "@/lib/store/special-offer-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SpecialOfferFormSheet } from "@/components/marketing/special-offer-form-sheet";

function statusVariant(status: SpecialOfferStatus) {
  if (status === "running") return "success" as const;
  if (status === "scheduled") return "warning" as const;
  if (status === "draft") return "secondary" as const;
  if (status === "completed") return "muted" as const;
  return "outline" as const;
}

const TYPE_ICONS: Record<SpecialOfferType, typeof Gift> = {
  bogo: Layers,
  bundle: Package,
  gift_with_purchase: Gift,
  tiered: ShoppingCart,
};

type Props = {
  addTrigger?: number;
};

export function SpecialOffersList({ addTrigger = 0 }: Props) {
  const offers = useSpecialOfferStore((s) => s.offers);
  const deleteOffer = useSpecialOfferStore((s) => s.deleteOffer);
  const duplicateOffer = useSpecialOfferStore((s) => s.duplicateOffer);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<SpecialOffer | null>(null);
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
    return offers.filter((offer) => {
      if (statusFilter !== "all" && offer.status !== statusFilter) return false;
      if (typeFilter !== "all" && offer.offerType !== typeFilter) return false;
      if (!q) return true;
      return (
        offer.name.toLowerCase().includes(q) ||
        offer.code.toLowerCase().includes(q) ||
        describeOffer(offer).toLowerCase().includes(q)
      );
    });
  }, [offers, query, statusFilter, typeFilter]);

  const kpis = specialOfferKpis(offers);

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (offer: SpecialOffer) => {
    setEditing(offer);
    setSheetOpen(true);
  };

  return (
    <>
      <div className="rounded-lg border border-input bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">Special offer flow (cart engine)</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
          {[
            "1. Define BOGO/bundle/gift/tier",
            "2. Set schedule",
            "3. Cart evaluates rules",
            "4. PDP badge + checkout",
            "5. Auto expire",
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
          Price drops without complex rules? Use{" "}
          <Link href="/marketing/flash-sales" className="font-medium text-violet-600 hover:underline">
            Flash Sales
          </Link>{" "}
          instead.
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
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search offers, codes, products…"
          className="h-8 min-w-[200px] flex-1 text-xs"
        />
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-8 w-[150px] text-xs"
        >
          <option value="all">All types</option>
          {(Object.keys(SPECIAL_OFFER_TYPE_LABELS) as SpecialOfferType[]).map((t) => (
            <option key={t} value={t}>
              {SPECIAL_OFFER_TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 w-[130px] text-xs"
        >
          <option value="all">All status</option>
          {(Object.keys(SPECIAL_OFFER_STATUS_LABELS) as SpecialOfferStatus[]).map((s) => (
            <option key={s} value={s}>
              {SPECIAL_OFFER_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Button size="sm" className="ml-auto h-8" onClick={openCreate}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Create offer
        </Button>
      </div>

      <div className="mt-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-input px-6 py-12 text-center">
            <Gift className="mx-auto h-8 w-8 text-violet-500/70" />
            <p className="mt-2 text-sm font-medium">No special offers yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              BOGO, product bundles, free gifts, and buy-more-save-more tiers
            </p>
            <Button size="sm" className="mt-4" onClick={openCreate}>
              Create offer
            </Button>
          </div>
        ) : (
          filtered.map((offer) => {
            const TypeIcon = TYPE_ICONS[offer.offerType];
            return (
              <div key={offer.id} className="rounded-lg border border-input bg-card p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(offer)}
                        className="text-left text-base font-semibold hover:text-primary"
                      >
                        {offer.name}
                      </button>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {offer.code}
                      </Badge>
                      <Badge variant="secondary" className="gap-1 text-[10px]">
                        <TypeIcon className="h-3 w-3" />
                        {SPECIAL_OFFER_TYPE_LABELS[offer.offerType]}
                      </Badge>
                      <Badge variant={statusVariant(offer.status)} className="capitalize">
                        {SPECIAL_OFFER_STATUS_LABELS[offer.status]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs font-medium text-violet-700 dark:text-violet-300">
                      {describeOffer(offer)}
                    </p>
                    {offer.description && (
                      <p className="mt-1 text-xs text-muted-foreground">{offer.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatScheduleRange(offer.startsAt, offer.endsAt)}
                      </span>
                      <span>Priority {offer.priority}</span>
                      {offer.revenue > 0 && (
                        <span className="font-medium text-foreground">{formatBdt(offer.revenue)}</span>
                      )}
                      {offer.ordersCount > 0 && <span>{offer.ordersCount} orders</span>}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(offer)}>
                        <Pencil className="mr-2 h-3.5 w-3.5" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const id = duplicateOffer(offer.id);
                          if (id) toast.success("Duplicated as draft");
                        }}
                      >
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          deleteOffer(offer.id);
                          toast.success("Offer deleted");
                        }}
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-3 flex flex-wrap gap-1">
                  {offer.showOnPdp && (
                    <Badge variant="secondary" className="text-[10px]">
                      PDP badge
                    </Badge>
                  )}
                  {offer.showOnCart && (
                    <Badge variant="secondary" className="text-[10px]">
                      Cart auto-apply
                    </Badge>
                  )}
                  {offer.showBadge && (
                    <Badge variant="secondary" className="text-[10px]">
                      Listing label
                    </Badge>
                  )}
                  {offer.stackable && (
                    <Badge variant="outline" className="text-[10px]">
                      Stackable
                    </Badge>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <SpecialOfferFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={editing ? "edit" : "create"}
        offer={editing}
      />
    </>
  );
}
