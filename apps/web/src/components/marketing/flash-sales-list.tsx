"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  FLASH_SALE_STATUS_LABELS,
  flashSaleKpis,
  formatBdt,
  formatScheduleRange,
  type FlashSale,
  type FlashSaleStatus,
} from "@/lib/mock-data/flash-sales";
import { useFlashSaleStore } from "@/lib/store/flash-sale-store";
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
import { FlashSaleFormSheet } from "@/components/marketing/flash-sale-form-sheet";

function statusVariant(status: FlashSaleStatus) {
  if (status === "running") return "success" as const;
  if (status === "scheduled") return "warning" as const;
  if (status === "draft") return "secondary" as const;
  if (status === "completed") return "muted" as const;
  return "outline" as const;
}

type Props = {
  addTrigger?: number;
};

export function FlashSalesList({ addTrigger = 0 }: Props) {
  const sales = useFlashSaleStore((s) => s.sales);
  const deleteSale = useFlashSaleStore((s) => s.deleteSale);
  const duplicateSale = useFlashSaleStore((s) => s.duplicateSale);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<FlashSale | null>(null);
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
    return sales.filter((sale) => {
      if (statusFilter !== "all" && sale.status !== statusFilter) return false;
      if (!q) return true;
      return (
        sale.name.toLowerCase().includes(q) ||
        sale.slug.toLowerCase().includes(q) ||
        sale.items.some((i) => i.productName.toLowerCase().includes(q))
      );
    });
  }, [query, sales, statusFilter]);

  const kpis = flashSaleKpis(sales);

  const openCreate = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (sale: FlashSale) => {
    setEditing(sale);
    setSheetOpen(true);
  };

  return (
    <>
      <div className="rounded-lg border border-input bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">Scheduled offer flow</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
          {[
            "1. Create offer + products",
            "2. Schedule start/end",
            "3. Auto price sync",
            "4. Storefront /deals",
            "5. Auto revert",
          ].map((step, i) => (
            <span key={step} className="flex items-center gap-2">
              <span className="rounded-full bg-background px-2 py-0.5 font-medium text-foreground shadow-sm">
                {step}
              </span>
              {i < 4 && <span className="text-muted-foreground">→</span>}
            </span>
          ))}
        </div>
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
            placeholder="Search sales or products…"
            className="h-8 text-xs"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 w-[140px] text-xs"
        >
          <option value="all">All status</option>
          {(Object.keys(FLASH_SALE_STATUS_LABELS) as FlashSaleStatus[]).map((s) => (
            <option key={s} value={s}>
              {FLASH_SALE_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Button size="sm" className="ml-auto h-8" onClick={openCreate}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Create flash sale
        </Button>
      </div>

      <div className="mt-3 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-input px-6 py-12 text-center">
            <Zap className="mx-auto h-8 w-8 text-amber-500/70" />
            <p className="mt-2 text-sm font-medium">No flash sales yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create a scheduled offer for one product or hundreds at once
            </p>
            <Button size="sm" className="mt-4" onClick={openCreate}>
              Create flash sale
            </Button>
          </div>
        ) : (
          filtered.map((sale) => (
            <div key={sale.id} className="rounded-lg border border-input bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(sale)}
                      className="text-left text-base font-semibold hover:text-primary"
                    >
                      {sale.name}
                    </button>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      /deals/{sale.slug}
                    </Badge>
                    <Badge variant={statusVariant(sale.status)} className="capitalize">
                      {FLASH_SALE_STATUS_LABELS[sale.status]}
                    </Badge>
                  </div>
                  {sale.description && (
                    <p className="mt-1 text-xs text-muted-foreground">{sale.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {formatScheduleRange(sale.startsAt, sale.endsAt)}
                    </span>
                    <span>{sale.items.length} product{sale.items.length === 1 ? "" : "s"}</span>
                    {sale.revenue > 0 && (
                      <span className="font-medium text-foreground">{formatBdt(sale.revenue)}</span>
                    )}
                    {sale.ordersCount > 0 && <span>{sale.ordersCount} orders</span>}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(sale)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const id = duplicateSale(sale.id);
                        if (id) toast.success("Duplicated as draft");
                      }}
                    >
                      <Copy className="mr-2 h-3.5 w-3.5" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/deals`} target="_blank">
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        Preview deals page
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        deleteSale(sale.id);
                        toast.success("Flash sale deleted");
                      }}
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {sale.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex shrink-0 items-center gap-2 rounded-md border border-input bg-muted/20 px-2 py-1.5"
                  >
                    <img src={item.thumbnail} alt="" className="h-8 w-8 rounded object-cover" />
                    <div className="min-w-0">
                      <p className="max-w-[120px] truncate text-[11px] font-medium">
                        {item.productName}
                      </p>
                      <p className="text-[10px]">
                        <span className="text-muted-foreground line-through">৳{item.originalPrice}</span>
                        <span className="ml-1 font-semibold text-emerald-600">৳{item.salePrice}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {sale.showOnHomepage && (
                  <Badge variant="secondary" className="text-[10px]">
                    Homepage
                  </Badge>
                )}
                {sale.showOnDealsPage && (
                  <Badge variant="secondary" className="text-[10px]">
                    Deals page
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <FlashSaleFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={editing ? "edit" : "create"}
        sale={editing}
      />
    </>
  );
}
