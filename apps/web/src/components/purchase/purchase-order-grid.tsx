"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Eye, Filter, MoreHorizontal, Plus, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import {
  PURCHASE_ORDER_STATUS_LABELS,
  PURCHASE_ORDER_WAREHOUSES,
  formatPurchaseOrderVendor,
  purchaseOrderReceivedPct,
  type PurchaseOrder,
  type PurchaseOrderStatus,
} from "@/lib/mock-data/purchase-orders";
import { suppliersSeed } from "@/lib/mock-data/suppliers";
import {
  poStatusBadgeVariant,
  usePurchaseOrderStore,
} from "@/lib/store/purchase-order-store";
import { cn, formatCurrency } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SupplierNav } from "@/components/suppliers/supplier-nav";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";

const PAGE_SIZE = 25;

const STATUSES = Object.keys(PURCHASE_ORDER_STATUS_LABELS) as PurchaseOrderStatus[];

type FilterState = {
  search: string;
  status: string;
  supplierId: string;
  warehouse: string;
};

const DEFAULT_FILTERS: FilterState = {
  search: "",
  status: "all",
  supplierId: "all",
  warehouse: "all",
};

type Props = {
  className?: string;
  initialStatus?: string;
};

export function PurchaseOrderGrid({ className, initialStatus = "all" }: Props) {
  const router = useRouter();
  const isDark = useIsDark();
  const orders = usePurchaseOrderStore((s) => s.orders);
  const updateStatus = usePurchaseOrderStore((s) => s.updateStatus);

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    status: initialStatus,
  });
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [selected, setSelected] = useState<PurchaseOrder[]>([]);

  const openPoCount = orders.filter(
    (o) => !["received", "closed", "cancelled", "rejected"].includes(o.status),
  ).length;

  const rows = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return orders.filter((po) => {
      if (filters.status !== "all" && po.status !== filters.status) return false;
      if (filters.supplierId !== "all" && po.supplierId !== filters.supplierId) return false;
      if (filters.warehouse !== "all" && po.warehouse !== filters.warehouse) return false;
      if (
        q &&
        !po.number.toLowerCase().includes(q) &&
        !formatPurchaseOrderVendor(po).toLowerCase().includes(q) &&
        !po.buyer.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [orders, filters]);

  const activeFilterCount = [
    filters.search,
    filters.status !== "all",
    filters.supplierId !== "all",
    filters.warehouse !== "all",
  ].filter(Boolean).length;

  const bulkUpdate = (status: PurchaseOrderStatus, label: string) => {
    const ids = new Set(selected.map((s) => s.id));
    ids.forEach((id) => updateStatus(id, status));
    toast.success(`${label} — ${selected.length} PO(s)`);
    setSelected([]);
  };

  const StatusCell = useCallback((p: ICellRendererParams<PurchaseOrder>) => {
    if (!p.data) return null;
    return (
      <Badge variant={poStatusBadgeVariant(p.data.status)} className="text-[10px]">
        {PURCHASE_ORDER_STATUS_LABELS[p.data.status]}
      </Badge>
    );
  }, []);

  const columnDefs = useMemo<ColDef<PurchaseOrder>[]>(
    () => [
      {
        headerCheckboxSelection: true,
        checkboxSelection: true,
        width: 36,
        maxWidth: 36,
        pinned: "left",
        sortable: false,
        resizable: false,
      },
      {
        field: "number",
        headerName: "PO #",
        width: 130,
        pinned: "left",
        cellRenderer: (p: ICellRendererParams<PurchaseOrder>) =>
          p.data ? (
            <Link
              href={`/suppliers/purchase-orders/${p.data.id}`}
              className="font-semibold text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {p.data.number}
            </Link>
          ) : null,
      },
      {
        colId: "vendor",
        headerName: "Vendor",
        width: 200,
        valueGetter: (p) => (p.data ? formatPurchaseOrderVendor(p.data) : ""),
        cellRenderer: (p: ICellRendererParams<PurchaseOrder>) =>
          p.data ? (
            <Link
              href={`/suppliers/${p.data.supplierId}`}
              className="truncate text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {formatPurchaseOrderVendor(p.data)}
            </Link>
          ) : null,
      },
      {
        field: "orderDate",
        headerName: "Order date",
        width: 110,
      },
      {
        field: "expectedDate",
        headerName: "Expected",
        width: 110,
      },
      {
        field: "warehouse",
        headerName: "Warehouse",
        width: 100,
      },
      {
        field: "buyer",
        headerName: "Buyer",
        width: 120,
      },
      {
        field: "total",
        headerName: "Total",
        width: 120,
        valueFormatter: (p) => formatCurrency(p.value ?? 0),
      },
      {
        colId: "received",
        headerName: "Received",
        width: 90,
        valueGetter: (p) => (p.data ? purchaseOrderReceivedPct(p.data) : 0),
        cellRenderer: (p: ICellRendererParams<PurchaseOrder>) =>
          p.data ? (
            <span className="text-xs tabular-nums">{purchaseOrderReceivedPct(p.data)}%</span>
          ) : null,
      },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        cellRenderer: StatusCell,
      },
      {
        colId: "actions",
        headerName: "",
        width: 72,
        maxWidth: 72,
        pinned: "right",
        sortable: false,
        cellRenderer: (p: ICellRendererParams<PurchaseOrder>) => {
          if (!p.data) return null;
          return (
            <div className="flex items-center justify-center gap-0">
              <ActivityTriggerButton
                entity={{
                  type: "purchase_order",
                  id: p.data.id,
                  label: p.data.number,
                  subtitle: formatPurchaseOrderVendor(p.data),
                }}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/suppliers/purchase-orders/${p.data!.id}`)}>
                    <Eye className="mr-2 h-3.5 w-3.5" /> View
                  </DropdownMenuItem>
                  {p.data.status === "draft" && (
                    <DropdownMenuItem onClick={() => updateStatus(p.data!.id, "pending_approval")}>
                      Submit for approval
                    </DropdownMenuItem>
                  )}
                  {p.data.status === "approved" && (
                    <DropdownMenuItem onClick={() => updateStatus(p.data!.id, "ordered")}>
                      Send to vendor
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [StatusCell, router, updateStatus],
  );

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}>
      <SupplierNav openPoCount={openPoCount} />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search PO #, vendor, buyer…"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="h-8 max-w-[220px] text-xs"
        />
        <Select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="h-8 w-40 text-xs"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {PURCHASE_ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select
          value={filters.supplierId}
          onChange={(e) => setFilters((f) => ({ ...f, supplierId: e.target.value }))}
          className="h-8 w-44 text-xs"
        >
          <option value="all">All vendors</option>
          {suppliersSeed.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Button variant="outline" size="sm" className="h-8" onClick={() => setFilterSheetOpen(true)}>
          <Filter className="mr-1.5 h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
        <Button size="sm" className="ml-auto h-8" asChild>
          <Link href="/suppliers/purchase-orders/create">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create PO
          </Link>
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-xs font-medium">{selected.length} selected</span>
          <Button size="sm" className="h-7" onClick={() => bulkUpdate("pending_approval", "Submitted")}>
            Submit
          </Button>
          <Button size="sm" variant="secondary" className="h-7" onClick={() => bulkUpdate("approved", "Approved")}>
            Approve
          </Button>
          <Button size="sm" variant="secondary" className="h-7" onClick={() => bulkUpdate("ordered", "Sent to vendor")}>
            Send
          </Button>
          <Button size="sm" variant="outline" className="h-7" onClick={() => bulkUpdate("cancelled", "Cancelled")}>
            Cancel
          </Button>
          <Button variant="ghost" size="sm" className="ml-auto h-7 w-7 p-0" onClick={() => setSelected([])}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div
        className={cn(
          "ag-theme-quartz control-border min-h-[360px] flex-1 overflow-hidden rounded-md bg-card [&_.ag-root-wrapper]:h-full",
          isDark && "ag-theme-quartz-dark",
        )}
      >
        <AgGridReact
         theme="legacy"
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, resizable: true, filter: false, minWidth: 72 }}
          rowSelection="multiple"
          suppressRowClickSelection
          animateRows
          onSelectionChanged={(e) => setSelected(e.api.getSelectedRows())}
          pagination
          paginationPageSize={PAGE_SIZE}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {rows.length} of {orders.length} purchase orders
      </p>

      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="w-full max-w-sm">
          <h2 className="text-base font-semibold">Filters</h2>
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="font-medium">Warehouse</span>
              <Select
                value={filters.warehouse}
                onChange={(e) => setFilters((f) => ({ ...f, warehouse: e.target.value }))}
                className="mt-1 w-full text-xs"
              >
                <option value="all">All warehouses</option>
                {PURCHASE_ORDER_WAREHOUSES.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </Select>
            </label>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setFilters(DEFAULT_FILTERS)}
          >
            Reset filters
          </Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
