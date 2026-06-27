"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  Columns3,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
} from "@/lib/mock-data/orders";
import { useOrderStore } from "@/lib/store/order-store";
import { cn, formatCurrency } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrdersNav } from "@/components/orders/orders-nav";
import { OrderMobileCards } from "@/components/orders/order-mobile-cards";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";
import { OrderDetailWorkspace } from "@/components/orders/order-detail-workspace";

// ─── Columns ──────────────────────────────────────────────────────────────────

const COLUMN_KEYS = [
  "orderDate",
  "phone",
  "email",
  "branch",
  "items",
  "amount",
  "paymentStatus",
  "shipmentStatus",
  "assignedStaff",
  "tags",
] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];

const COLUMN_LABELS: Record<ColumnKey, string> = {
  orderDate: "Date",
  phone: "Phone",
  email: "Email",
  branch: "Branch",
  items: "Items",
  amount: "Amount",
  paymentStatus: "Payment",
  shipmentStatus: "Shipment",
  assignedStaff: "Assigned Staff",
  tags: "Tags",
};

const COLUMN_HINTS: Record<ColumnKey, string> = {
  orderDate: "Order creation date",
  phone: "Customer phone number",
  email: "Customer email address",
  branch: "Branch / channel",
  items: "Total quantity of items",
  amount: "Grand total (formatted)",
  paymentStatus: "Paid / Unpaid / Partial / Refunded",
  shipmentStatus: "Pending / Shipped / Delivered etc.",
  assignedStaff: "Staff member assigned to this order",
  tags: "Order tags / labels",
};

const DEFAULT_VISIBLE_COLUMNS: Record<ColumnKey, boolean> = {
  orderDate: true,
  phone: true,
  email: false,
  branch: true,
  items: true,
  amount: true,
  paymentStatus: true,
  shipmentStatus: true,
  assignedStaff: true,
  tags: false,
};

// ─── Filters ─────────────────────────────────────────────────────────────────

const FILTER_KEYS = [
  "search",
  "status",
  "paymentStatus",
  "branch",
] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

const FILTER_LABELS: Record<FilterKey, string> = {
  search: "Search",
  status: "Order Status",
  paymentStatus: "Payment Status",
  branch: "Branch",
};

const FILTER_HINTS: Record<FilterKey, string> = {
  search: "Order #, customer name, phone, email diye search korte parben",
  status: "Draft, Pending, Confirmed, Processing, Packed, Shipped, Delivered, Completed",
  paymentStatus: "Paid / Unpaid / Partial / Refunded filter",
  branch: "Branch ba channel diye filter",
};

const DEFAULT_VISIBLE_FILTERS: Record<FilterKey, boolean> = {
  search: true,
  status: true,
  paymentStatus: true,
  branch: false,
};

type FilterState = {
  search: string;
  status: string;
  paymentStatus: string;
  branch: string;
};

const DEFAULT_FILTERS: FilterState = {
  search: "",
  status: "all",
  paymentStatus: "all",
  branch: "all",
};

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  className?: string;
  /** Pre-select status from URL e.g. /orders/all?status=pending */
  initialStatus?: string;
  orders?: Order[];
  loading?: boolean;
  onStatusChange?: (id: string, status: OrderStatus) => void | Promise<void>;
};

export function OrderGrid({
  className,
  initialStatus = "all",
  orders: ordersProp,
  loading = false,
  onStatusChange,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewOrderId = searchParams.get("view");
  const isDark = useIsDark();
  const canWrite = useAdminCanWrite();

  function openOrder(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", id);
    router.push(`${pathname}?${params.toString()}`);
  }

  function closeOrder() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    router.push(`${pathname}?${params.toString()}`);
  }
  const storeOrders = useOrderStore((s) => s.orders);
  const storeUpdateStatus = useOrderStore((s) => s.updateStatus);
  const orders = ordersProp ?? storeOrders;
  const updateStatus = useCallback(
    (id: string, status: OrderStatus) => {
      if (onStatusChange) {
        void onStatusChange(id, status);
        return;
      }
      storeUpdateStatus(id, status);
    },
    [onStatusChange, storeUpdateStatus],
  );

  // Filter values
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    status: initialStatus,
  });

  // Which filter widgets are visible in toolbar
  const [visibleFilters, setVisibleFilters] = useState(DEFAULT_VISIBLE_FILTERS);

  // Which columns are visible
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);

  // Sheets
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);

  // Selection
  const [selected, setSelected] = useState<Order[]>([]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const branches = useMemo(
    () => [...new Set(orders.map((o) => o.branch))].sort(),
    [orders],
  );

  const rows = useMemo(() => {
    return orders.filter((o) => {
      if (filters.status !== "all" && o.status !== filters.status) return false;
      const q = filters.search.toLowerCase().trim();
      if (
        q &&
        !o.orderNumber.toLowerCase().includes(q) &&
        !o.customer.name.toLowerCase().includes(q) &&
        !o.customer.phone.includes(q) &&
        !o.customer.email.toLowerCase().includes(q)
      )
        return false;
      if (filters.paymentStatus !== "all" && o.paymentStatus !== filters.paymentStatus)
        return false;
      if (filters.branch !== "all" && o.branch !== filters.branch) return false;
      return true;
    });
  }, [orders, filters]);

  const activeFilterCount = [
    filters.search !== "",
    filters.status !== "all",
    filters.paymentStatus !== "all",
    filters.branch !== "all",
  ].filter(Boolean).length;

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toggleVisibleFilter = (key: FilterKey, enabled: boolean) => {
    setVisibleFilters((v) => ({ ...v, [key]: enabled }));
    if (!enabled) {
      setFilters((f) => ({
        ...f,
        ...(key === "search" ? { search: "" } : {}),
        ...(key === "status" ? { status: "all" } : {}),
        ...(key === "paymentStatus" ? { paymentStatus: "all" } : {}),
        ...(key === "branch" ? { branch: "all" } : {}),
      }));
    }
  };

  const resetAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
  };

  // ── Cell renderers ────────────────────────────────────────────────────────
  const StatusCell = useCallback(
    ({ data }: ICellRendererParams<Order>) => {
      if (!data) return null;
      if (!canWrite) {
        return (
          <span className="text-[11px] font-medium capitalize">
            {ORDER_STATUS_LABELS[data.status]}
          </span>
        );
      }
      return (
        <Select
          className="h-7 min-w-[110px] border-0 bg-transparent text-[11px] shadow-none"
          value={data.status}
          onChange={(e) => {
            updateStatus(data.id, e.target.value as OrderStatus);
            toast.success(
              `${data.orderNumber} → ${ORDER_STATUS_LABELS[e.target.value as OrderStatus]}`,
            );
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      );
    },
    [updateStatus, canWrite],
  );

  // ── Column definitions ────────────────────────────────────────────────────
  const columnDefs = useMemo<ColDef<Order>[]>(() => {
    const cols: ColDef<Order>[] = [
      {
        headerCheckboxSelection: canWrite,
        checkboxSelection: canWrite,
        width: 44,
        pinned: "left",
        resizable: false,
        suppressMovable: true,
        suppressHeaderMenuButton: true,
      },
      {
        field: "orderNumber",
        headerName: "Order #",
        width: 118,
        pinned: "left",
        cellRenderer: (p: ICellRendererParams<Order>) =>
          p.data ? (
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => openOrder(p.data!.id)}
            >
              {p.data.orderNumber}
            </button>
          ) : null,
      },
      {
        colId: "customer",
        headerName: "Customer",
        width: 150,
        valueGetter: (p) => p.data?.customer.name,
      },
    ];

    if (visibleColumns.orderDate)
      cols.push({
        colId: "orderDate",
        headerName: "Date",
        width: 96,
        valueGetter: (p) =>
          p.data ? new Date(p.data.orderDate).toLocaleDateString() : "",
      });

    if (visibleColumns.phone)
      cols.push({
        colId: "phone",
        headerName: "Phone",
        width: 128,
        valueGetter: (p) => p.data?.customer.phone,
      });

    if (visibleColumns.email)
      cols.push({
        colId: "email",
        headerName: "Email",
        width: 170,
        valueGetter: (p) => p.data?.customer.email,
      });

    if (visibleColumns.branch)
      cols.push({ field: "branch", headerName: "Branch", width: 100 });

    if (visibleColumns.items)
      cols.push({
        colId: "items",
        headerName: "Items",
        width: 64,
        valueGetter: (p) => p.data?.items.reduce((s, i) => s + i.quantity, 0) ?? 0,
      });

    if (visibleColumns.amount)
      cols.push({
        colId: "amount",
        headerName: "Amount",
        width: 104,
        valueGetter: (p) => (p.data ? formatCurrency(p.data.grandTotal) : ""),
      });

    if (visibleColumns.paymentStatus)
      cols.push({
        field: "paymentStatus",
        headerName: "Payment",
        width: 88,
        cellRenderer: (p: ICellRendererParams<Order>) =>
          p.data ? (
            <Badge
              variant={p.data.paymentStatus === "paid" ? "success" : "outline"}
              className="text-[9px] capitalize"
            >
              {p.data.paymentStatus}
            </Badge>
          ) : null,
      });

    if (visibleColumns.shipmentStatus)
      cols.push({
        field: "shipmentStatus",
        headerName: "Shipment",
        width: 96,
        cellRenderer: (p: ICellRendererParams<Order>) =>
          p.data ? (
            <span className="text-[11px] capitalize">{p.data.shipmentStatus}</span>
          ) : null,
      });

    cols.push({
      colId: "status",
      field: "status",
      headerName: "Status",
      width: 130,
      cellRenderer: StatusCell,
    });

    if (visibleColumns.assignedStaff)
      cols.push({
        field: "assignedStaff",
        headerName: "Assigned",
        width: 110,
      });

    if (visibleColumns.tags)
      cols.push({
        colId: "tags",
        headerName: "Tags",
        width: 88,
        cellRenderer: (p: ICellRendererParams<Order>) =>
          p.data?.tags.length ? (
            <Badge variant="outline" className="text-[9px]">
              {p.data.tags[0]}
            </Badge>
          ) : null,
      });

    cols.push({
      colId: "activity",
      headerName: "Activity",
      width: 72,
      pinned: "right",
      sortable: false,
      resizable: false,
      suppressMovable: true,
      suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<Order>) =>
        p.data ? (
          <ActivityTriggerButton
            entity={{
              type: "order",
              id: p.data.id,
              label: p.data.orderNumber,
              subtitle: p.data.customer.name,
            }}
          />
        ) : null,
    });

    cols.push({
      width: 44,
      pinned: "right",
      sortable: false,
      resizable: false,
      suppressMovable: true,
      suppressHeaderMenuButton: true,
      cellRenderer: (p: ICellRendererParams<Order>) =>
        p.data ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openOrder(p.data!.id)}>
                <Eye className="mr-2 h-3.5 w-3.5" /> View order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null,
    });

    return cols;
  }, [StatusCell, router, visibleColumns]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}>
      <OrdersNav />

      {/* ── Toolbar (visible filter widgets + action buttons) ── */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {visibleFilters.search && (
          <Input
            placeholder="Search order #, customer…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="max-w-[220px]"
          />
        )}
        {visibleFilters.status && (
          <Select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="w-[148px]"
          >
            <option value="all">All statuses</option>
            {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        )}
        {visibleFilters.paymentStatus && (
          <Select
            value={filters.paymentStatus}
            onChange={(e) => setFilters((f) => ({ ...f, paymentStatus: e.target.value }))}
            className="w-[138px]"
          >
            <option value="all">All payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="refunded">Refunded</option>
          </Select>
        )}
        {visibleFilters.branch && (
          <Select
            value={filters.branch}
            onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))}
            className="w-[138px]"
          >
            <option value="all">All branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </Select>
        )}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={resetAllFilters}
          >
            <X className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
        )}

        {/* Right-side action buttons */}
        <div className="ml-auto flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => setFilterSheetOpen(true)}
          >
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => setColumnSheetOpen(true)}
          >
            <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
            Columns
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => toast.success("Export started")}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>
          {canWrite && (
            <Button size="sm" asChild>
              <Link href="/orders/create">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create Order
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── Bulk action bar ── */}
      {selected.length > 0 && canWrite && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-xs font-medium">{selected.length} selected</span>
          <Button size="sm" variant="outline" className="h-7" onClick={() => toast.info("Bulk status update")}>
            Update status
          </Button>
          <Button size="sm" variant="outline" className="h-7" onClick={() => toast.info("Bulk assign")}>
            Assign staff
          </Button>
          <Button size="sm" variant="outline" className="h-7" onClick={() => toast.success("Export selected")}>
            Export
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 w-7 p-0"
            onClick={() => setSelected([])}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* ── Mobile cards ── */}
      <OrderMobileCards orders={rows} />

      {/* ── AG Grid ── */}
      <div
        className={cn(
          "ag-theme-quartz hidden min-h-[420px] flex-1 lg:block",
          isDark && "ag-theme-quartz-dark",
        )}
      >
        <AgGridReact
          theme="legacy"
          rowData={rows}
          columnDefs={columnDefs}
          rowSelection="multiple"
          suppressRowClickSelection
          onSelectionChanged={(e) => setSelected(e.api.getSelectedRows())}
          onRowClicked={(e) => e.data && openOrder(e.data.id)}
          defaultColDef={{ resizable: true, sortable: true }}
          headerHeight={36}
          rowHeight={42}
          animateRows
          loading={loading}
        />
      </div>
      {rows.length > 0 && (
        <p className="shrink-0 text-xs text-muted-foreground">
          Showing {rows.length} of {orders.length} orders
        </p>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          Filters Sheet — choose which filters appear in the toolbar
      ──────────────────────────────────────────────────────────────────────── */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="w-full max-w-sm">
          <h2 className="pr-8 text-base font-semibold">Filters</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose which filters appear in the toolbar above the list.
          </p>
          <div className="mt-4 space-y-3">
            {FILTER_KEYS.map((key) => (
              <label key={key} className="flex cursor-pointer gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={visibleFilters[key]}
                  onChange={(e) => toggleVisibleFilter(key, e.target.checked)}
                  className="mt-0.5 rounded border-input"
                />
                <span>
                  <span className="font-medium">{FILTER_LABELS[key]}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {FILTER_HINTS[key]}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
              setFilters(DEFAULT_FILTERS);
            }}
          >
            Reset filters
          </Button>
        </SheetContent>
      </Sheet>

      {/* ─────────────────────────────────────────────────────────────────────
          Columns Sheet — choose which columns appear in the grid
      ──────────────────────────────────────────────────────────────────────── */}
      <Sheet open={columnSheetOpen} onOpenChange={setColumnSheetOpen}>
        <SheetContent side="right" className="w-full max-w-xs">
          <h2 className="pr-8 text-base font-semibold">Columns</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose which columns show in the list. Order #, Customer, and Status always stay visible.
          </p>
          <div className="mt-4 space-y-3">
            {COLUMN_KEYS.map((key) => (
              <label key={key} className="flex cursor-pointer gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={visibleColumns[key]}
                  onChange={(e) =>
                    setVisibleColumns((v) => ({ ...v, [key]: e.target.checked }))
                  }
                  className="mt-0.5 rounded border-input"
                />
                <span>
                  <span className="font-medium">{COLUMN_LABELS[key]}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {COLUMN_HINTS[key]}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setVisibleColumns(DEFAULT_VISIBLE_COLUMNS)}
          >
            Reset columns
          </Button>
        </SheetContent>
      </Sheet>

      {/* ─── Order Detail Sheet ──────────────────────────────────────────── */}
      <Sheet open={!!viewOrderId} onOpenChange={(open) => !open && closeOrder()}>
        <SheetContent side="right" className="w-full max-w-3xl gap-0 overflow-y-auto p-0 sm:max-w-3xl [&>button.absolute]:hidden">
          {viewOrderId && <OrderDetailWorkspace orderId={viewOrderId} isDrawer onClose={closeOrder} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
