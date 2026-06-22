"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Eye, MoreHorizontal, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  BILL_STATUS_LABELS,
  MATCH_STATUS_LABELS,
  billSupplierName,
  type BillStatus,
  type VendorBill,
} from "@/lib/mock-data/purchase-bills";
import {
  billStatusBadgeVariant,
  matchStatusBadgeVariant,
  usePurchaseBillStore,
} from "@/lib/store/purchase-bill-store";
import { cn, formatCurrency } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
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
import { SupplierNav } from "@/components/suppliers/supplier-nav";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";

const PAGE_SIZE = 25;
const STATUSES = Object.keys(BILL_STATUS_LABELS) as BillStatus[];

type FilterState = { search: string; status: string };

const DEFAULT_FILTERS: FilterState = { search: "", status: "all" };

type Props = { className?: string; initialStatus?: string };

export function BillGrid({ className, initialStatus = "all" }: Props) {
  const router = useRouter();
  const isDark = useIsDark();
  const bills = usePurchaseBillStore((s) => s.bills);
  const runAutoMatch = usePurchaseBillStore((s) => s.runAutoMatch);
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, status: initialStatus });
  const [selected, setSelected] = useState<VendorBill[]>([]);

  const rows = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return bills.filter((b) => {
      if (filters.status !== "all" && b.status !== filters.status) return false;
      if (
        q &&
        !b.number.toLowerCase().includes(q) &&
        !b.poNumber.toLowerCase().includes(q) &&
        !b.vendorInvoiceNumber.toLowerCase().includes(q) &&
        !billSupplierName(b.supplierId).toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [bills, filters]);

  const StatusCell = useCallback((p: ICellRendererParams<VendorBill>) => {
    if (!p.data) return null;
    return (
      <Badge variant={billStatusBadgeVariant(p.data.status)} className="text-[10px]">
        {BILL_STATUS_LABELS[p.data.status]}
      </Badge>
    );
  }, []);

  const MatchCell = useCallback((p: ICellRendererParams<VendorBill>) => {
    if (!p.data) return null;
    return (
      <Badge variant={matchStatusBadgeVariant(p.data.matchStatus)} className="text-[10px]">
        {MATCH_STATUS_LABELS[p.data.matchStatus]}
      </Badge>
    );
  }, []);

  const columnDefs = useMemo<ColDef<VendorBill>[]>(
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
        headerName: "Bill #",
        width: 130,
        pinned: "left",
        cellRenderer: (p: ICellRendererParams<VendorBill>) =>
          p.data ? (
            <Link
              href={`/suppliers/bills/${p.data.id}`}
              className="font-semibold text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {p.data.number}
            </Link>
          ) : null,
      },
      {
        field: "vendorInvoiceNumber",
        headerName: "Vendor inv.",
        width: 120,
        valueFormatter: (p) => p.value || "—",
      },
      {
        field: "poNumber",
        headerName: "PO",
        width: 130,
        cellRenderer: (p: ICellRendererParams<VendorBill>) =>
          p.data ? (
            <Link
              href={`/suppliers/purchase-orders/${p.data.purchaseOrderId}`}
              className="text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {p.data.poNumber}
            </Link>
          ) : null,
      },
      {
        colId: "vendor",
        headerName: "Vendor",
        width: 180,
        valueGetter: (p) => (p.data ? billSupplierName(p.data.supplierId) : ""),
      },
      { field: "billDate", headerName: "Bill date", width: 110 },
      { field: "dueDate", headerName: "Due", width: 110 },
      {
        field: "total",
        headerName: "Total",
        width: 120,
        valueFormatter: (p) => formatCurrency(p.value ?? 0),
      },
      {
        field: "matchStatus",
        headerName: "Match",
        width: 120,
        cellRenderer: MatchCell,
      },
      {
        field: "status",
        headerName: "Status",
        width: 110,
        cellRenderer: StatusCell,
      },
      {
        colId: "actions",
        headerName: "",
        width: 72,
        maxWidth: 72,
        pinned: "right",
        sortable: false,
        cellRenderer: (p: ICellRendererParams<VendorBill>) => {
          if (!p.data) return null;
          return (
            <div className="flex items-center justify-center gap-0">
              <ActivityTriggerButton
                entity={{
                  type: "purchase_bill",
                  id: p.data.id,
                  label: p.data.number,
                  subtitle: p.data.poNumber,
                }}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/suppliers/bills/${p.data!.id}`)}>
                    <Eye className="mr-2 h-3.5 w-3.5" /> View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => runAutoMatch(p.data!.id)}>
                    Run match
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [MatchCell, StatusCell, router, runAutoMatch],
  );

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}>
      <SupplierNav />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search bill #, vendor inv., PO…"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="h-8 max-w-[240px] text-xs"
        />
        <Select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="h-8 w-40 text-xs"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {BILL_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Button size="sm" className="ml-auto h-8" variant="outline" asChild>
          <Link href="/suppliers/purchase-orders">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create from PO
          </Link>
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-xs font-medium">{selected.length} selected</span>
          <Button
            size="sm"
            className="h-7"
            onClick={() => {
              selected.forEach((b) => runAutoMatch(b.id));
              toast.success("Match run on selected bills");
              setSelected([]);
            }}
          >
            Run match
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
          defaultColDef={{ sortable: true, resizable: true, minWidth: 72 }}
          rowSelection="multiple"
          suppressRowClickSelection
          animateRows
          onSelectionChanged={(e) => setSelected(e.api.getSelectedRows())}
          pagination
          paginationPageSize={PAGE_SIZE}
        />
      </div>

      <p className="text-xs text-muted-foreground">Showing {rows.length} of {bills.length} vendor bills</p>
    </div>
  );
}
