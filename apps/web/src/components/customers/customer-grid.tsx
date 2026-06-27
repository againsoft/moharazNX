"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  Crown,
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
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_GROUP_LABELS,
  countCustomersByStatus,
  type Customer,
  type CustomerStatus,
} from "@/lib/mock-data/customers";
import { useCustomerStore } from "@/lib/store/customer-store";
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
import { CustomersNav } from "@/components/customers/customers-nav";
import { CustomerMobileCards } from "@/components/customers/customer-mobile-cards";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";

// ─── Status tabs ──────────────────────────────────────────────────────────────

const STATUS_TABS: { value: CustomerStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "vip", label: "VIP" },
  { value: "inactive", label: "Inactive" },
  { value: "blocked", label: "Blocked" },
];

// ─── Columns ──────────────────────────────────────────────────────────────────

const COLUMN_KEYS = [
  "customerId",
  "phone",
  "email",
  "city",
  "group",
  "totalOrders",
  "totalSpend",
  "walletBalance",
  "rewardPoints",
  "lastOrderDate",
  "assignedStaff",
  "riskScore",
] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];

const COLUMN_LABELS: Record<ColumnKey, string> = {
  customerId: "Customer ID",
  phone: "Phone",
  email: "Email",
  city: "City",
  group: "Group",
  totalOrders: "Orders",
  totalSpend: "Total Spend",
  walletBalance: "Wallet",
  rewardPoints: "Points",
  lastOrderDate: "Last Order",
  assignedStaff: "Assigned Staff",
  riskScore: "Risk Score",
};

const COLUMN_HINTS: Record<ColumnKey, string> = {
  customerId: "Unique customer identifier (C-10001 format)",
  phone: "Primary phone number",
  email: "Primary email address",
  city: "Customer city",
  group: "Retail / Wholesale / Dealer / Corporate etc.",
  totalOrders: "Lifetime order count",
  totalSpend: "Lifetime total spend in currency",
  walletBalance: "Current wallet credit balance",
  rewardPoints: "Accumulated loyalty reward points",
  lastOrderDate: "Date of most recent order",
  assignedStaff: "CRM owner — assigned staff member",
  riskScore: "AI-generated churn or fraud risk score",
};

const DEFAULT_VISIBLE_COLUMNS: Record<ColumnKey, boolean> = {
  customerId: true,
  phone: true,
  email: false,
  city: true,
  group: true,
  totalOrders: true,
  totalSpend: true,
  walletBalance: false,
  rewardPoints: false,
  lastOrderDate: true,
  assignedStaff: true,
  riskScore: true,
};

// ─── Filters ──────────────────────────────────────────────────────────────────

const FILTER_KEYS = ["search", "group", "city", "assignedStaff"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

const FILTER_LABELS: Record<FilterKey, string> = {
  search: "Search",
  group: "Customer Group",
  city: "City",
  assignedStaff: "Assigned Staff",
};

const FILTER_HINTS: Record<FilterKey, string> = {
  search: "Name, phone, email, Customer ID diye search korte parben",
  group: "Retail / Wholesale / Dealer / Corporate / VIP filter",
  city: "City / location diye filter",
  assignedStaff: "Assigned CRM staff diye filter",
};

const DEFAULT_VISIBLE_FILTERS: Record<FilterKey, boolean> = {
  search: true,
  group: true,
  city: false,
  assignedStaff: false,
};

type FilterState = {
  search: string;
  group: string;
  city: string;
  assignedStaff: string;
};

const DEFAULT_FILTERS: FilterState = {
  search: "",
  group: "all",
  city: "all",
  assignedStaff: "all",
};

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  className?: string;
  customers?: Customer[];
  loading?: boolean;
  onStatusChange?: (id: string, status: CustomerStatus) => void | Promise<void>;
};

export function CustomerGrid({
  className,
  customers: customersProp,
  loading = false,
  onStatusChange,
}: Props) {
  const router = useRouter();
  const isDark = useIsDark();
  const canWrite = useAdminCanWrite();
  const storeCustomers = useCustomerStore((s) => s.customers);
  const storeUpdateStatus = useCustomerStore((s) => s.updateStatus);
  const customers = customersProp ?? storeCustomers;
  const updateStatus = useCallback(
    (id: string, status: CustomerStatus) => {
      if (onStatusChange) {
        void onStatusChange(id, status);
        return;
      }
      storeUpdateStatus(id, status);
    },
    [onStatusChange, storeUpdateStatus],
  );

  const [activeTab, setActiveTab] = useState<CustomerStatus | "all">("all");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [visibleFilters, setVisibleFilters] = useState(DEFAULT_VISIBLE_FILTERS);
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE_COLUMNS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Customer[]>([]);

  const counts = useMemo(() => countCustomersByStatus(customers), [customers]);
  const cities = useMemo(() => [...new Set(customers.map((c) => c.city))].sort(), [customers]);
  const staff = useMemo(
    () => [...new Set(customers.map((c) => c.assignedStaff).filter(Boolean))].sort() as string[],
    [customers],
  );

  const rows = useMemo(() => {
    return customers.filter((c) => {
      if (activeTab !== "all" && c.status !== activeTab) return false;
      const q = filters.search.toLowerCase().trim();
      if (
        q &&
        !c.name.toLowerCase().includes(q) &&
        !c.phone.includes(q) &&
        !c.email.toLowerCase().includes(q) &&
        !c.customerId.toLowerCase().includes(q)
      )
        return false;
      if (filters.group !== "all" && c.group !== filters.group) return false;
      if (filters.city !== "all" && c.city !== filters.city) return false;
      if (filters.assignedStaff !== "all" && c.assignedStaff !== filters.assignedStaff)
        return false;
      return true;
    });
  }, [customers, activeTab, filters]);

  const activeFilterCount = [
    filters.search !== "",
    filters.group !== "all",
    filters.city !== "all",
    filters.assignedStaff !== "all",
  ].filter(Boolean).length;

  const toggleVisibleFilter = (key: FilterKey, enabled: boolean) => {
    setVisibleFilters((v) => ({ ...v, [key]: enabled }));
    if (!enabled) {
      setFilters((f) => ({
        ...f,
        ...(key === "search" ? { search: "" } : {}),
        ...(key === "group" ? { group: "all" } : {}),
        ...(key === "city" ? { city: "all" } : {}),
        ...(key === "assignedStaff" ? { assignedStaff: "all" } : {}),
      }));
    }
  };

  const resetAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    setActiveTab("all");
  };

  // ── Cell renderers ────────────────────────────────────────────────────────

  const StatusCell = useCallback(
    ({ data }: ICellRendererParams<Customer>) => {
      if (!data) return null;
      if (!canWrite) {
        return (
          <span className="text-[11px] font-medium capitalize">
            {CUSTOMER_STATUS_LABELS[data.status]}
          </span>
        );
      }
      return (
        <Select
          className="h-7 min-w-[100px] border-0 bg-transparent text-[11px] shadow-none"
          value={data.status}
          onChange={(e) => {
            updateStatus(data.id, e.target.value as CustomerStatus);
            toast.success(`${data.name} → ${CUSTOMER_STATUS_LABELS[e.target.value as CustomerStatus]}`);
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {Object.entries(CUSTOMER_STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      );
    },
    [updateStatus, canWrite],
  );

  const RiskCell = useCallback(({ data }: ICellRendererParams<Customer>) => {
    if (!data) return null;
    const color =
      data.riskLevel === "high"
        ? "bg-destructive/10 text-destructive"
        : data.riskLevel === "medium"
        ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
        : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    return (
      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${color}`}>
        {data.riskScore}%
      </span>
    );
  }, []);

  // ── Column definitions ────────────────────────────────────────────────────

  const columnDefs = useMemo<ColDef<Customer>[]>(() => {
    const cols: ColDef<Customer>[] = [
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
        field: "name",
        headerName: "Name",
        width: 170,
        pinned: "left",
        cellRenderer: (p: ICellRendererParams<Customer>) =>
          p.data ? (
            <div className="flex items-center gap-2">
              {p.data.status === "vip" && (
                <Crown className="h-3 w-3 shrink-0 text-yellow-500" />
              )}
              <button
                type="button"
                className="truncate font-medium text-primary hover:underline"
                onClick={() => router.push(`/customers/${p.data!.id}`)}
              >
                {p.data.name}
              </button>
            </div>
          ) : null,
      },
    ];

    if (visibleColumns.customerId)
      cols.push({ field: "customerId", headerName: "ID", width: 88 });

    if (visibleColumns.phone)
      cols.push({ field: "phone", headerName: "Phone", width: 128 });

    if (visibleColumns.email)
      cols.push({ field: "email", headerName: "Email", width: 170 });

    if (visibleColumns.city)
      cols.push({ field: "city", headerName: "City", width: 96 });

    if (visibleColumns.group)
      cols.push({
        field: "group",
        headerName: "Group",
        width: 96,
        cellRenderer: (p: ICellRendererParams<Customer>) =>
          p.data ? (
            <span className="text-[11px] capitalize">{CUSTOMER_GROUP_LABELS[p.data.group]}</span>
          ) : null,
      });

    if (visibleColumns.totalOrders)
      cols.push({ field: "totalOrders", headerName: "Orders", width: 72 });

    if (visibleColumns.totalSpend)
      cols.push({
        colId: "totalSpend",
        headerName: "Total Spend",
        width: 110,
        valueGetter: (p) => (p.data ? formatCurrency(p.data.totalSpend) : ""),
      });

    if (visibleColumns.walletBalance)
      cols.push({
        colId: "walletBalance",
        headerName: "Wallet",
        width: 88,
        valueGetter: (p) => (p.data ? formatCurrency(p.data.walletBalance) : ""),
      });

    if (visibleColumns.rewardPoints)
      cols.push({ field: "rewardPoints", headerName: "Points", width: 80 });

    if (visibleColumns.lastOrderDate)
      cols.push({
        colId: "lastOrderDate",
        headerName: "Last Order",
        width: 100,
        valueGetter: (p) =>
          p.data?.lastOrderDate
            ? new Date(p.data.lastOrderDate).toLocaleDateString()
            : "—",
      });

    cols.push({
      colId: "status",
      field: "status",
      headerName: "Status",
      width: 120,
      cellRenderer: StatusCell,
    });

    if (visibleColumns.assignedStaff)
      cols.push({ field: "assignedStaff", headerName: "Assigned", width: 120 });

    if (visibleColumns.riskScore)
      cols.push({
        colId: "riskScore",
        headerName: "Risk",
        width: 72,
        cellRenderer: RiskCell,
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
      cellRenderer: (p: ICellRendererParams<Customer>) =>
        p.data ? (
          <ActivityTriggerButton
            entity={{
              type: "customer",
              id: p.data.id,
              label: p.data.name,
              subtitle: p.data.customerId,
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
      cellRenderer: (p: ICellRendererParams<Customer>) =>
        p.data ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/customers/${p.data!.id}`)}>
                <Eye className="mr-2 h-3.5 w-3.5" /> Open 360 view
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null,
    });

    return cols;
  }, [StatusCell, RiskCell, router, visibleColumns]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}>
      <CustomersNav />

      {/* ── Status tabs ── */}
      <div className="flex flex-wrap gap-0.5 overflow-x-auto rounded-lg border border-input bg-muted/30 p-1">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === "all" ? counts.all : (counts[tab.value] ?? 0);
          const active = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "ml-1.5 tabular-nums",
                  active ? "text-foreground" : "text-muted-foreground/70",
                )}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {visibleFilters.search && (
          <Input
            placeholder="Search name, phone, email, ID…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="max-w-[220px]"
          />
        )}
        {visibleFilters.group && (
          <Select
            value={filters.group}
            onChange={(e) => setFilters((f) => ({ ...f, group: e.target.value }))}
            className="w-[140px]"
          >
            <option value="all">All groups</option>
            {Object.entries(CUSTOMER_GROUP_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        )}
        {visibleFilters.city && (
          <Select
            value={filters.city}
            onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
            className="w-[130px]"
          >
            <option value="all">All cities</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        )}
        {visibleFilters.assignedStaff && (
          <Select
            value={filters.assignedStaff}
            onChange={(e) => setFilters((f) => ({ ...f, assignedStaff: e.target.value }))}
            className="w-[148px]"
          >
            <option value="all">All staff</option>
            {staff.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        )}
        {(activeFilterCount > 0 || activeTab !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={resetAllFilters}
          >
            <X className="mr-1 h-3.5 w-3.5" /> Clear
          </Button>
        )}

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
            <Button size="sm" onClick={() => toast.info("Add customer — prototype")}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Customer
            </Button>
          )}
        </div>
      </div>

      {/* ── Bulk bar ── */}
      {selected.length > 0 && canWrite && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-xs font-medium">{selected.length} selected</span>
          <Button size="sm" variant="outline" className="h-7" onClick={() => toast.info("Bulk tag")}>
            Add tag
          </Button>
          <Button size="sm" variant="outline" className="h-7" onClick={() => toast.info("Bulk assign")}>
            Assign staff
          </Button>
          <Button size="sm" variant="outline" className="h-7" onClick={() => toast.success("Export")}>
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
      <CustomerMobileCards customers={rows} />

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
          onRowDoubleClicked={(e) => e.data && router.push(`/customers/${e.data.id}`)}
          defaultColDef={{ resizable: true, sortable: true }}
          headerHeight={36}
          rowHeight={44}
          animateRows
          loading={loading}
        />
      </div>
      {rows.length > 0 && (
        <p className="shrink-0 text-xs text-muted-foreground">
          Showing {rows.length} of {customers.length} customers · double-click row to open 360 view
        </p>
      )}

      {/* ── Filters Sheet ── */}
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

      {/* ── Columns Sheet ── */}
      <Sheet open={columnSheetOpen} onOpenChange={setColumnSheetOpen}>
        <SheetContent side="right" className="w-full max-w-xs">
          <h2 className="pr-8 text-base font-semibold">Columns</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose which columns show in the list. Name and Status always stay visible.
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
    </div>
  );
}
