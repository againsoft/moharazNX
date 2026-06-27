"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Eye, MoreHorizontal, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  RETURN_REASON_LABELS,
  RETURN_STATUS_LABELS,
  returnSupplierName,
  type PurchaseReturn,
  type ReturnReason,
  type ReturnStatus,
} from "@/lib/mock-data/purchase-returns";
import {
  returnStatusBadgeVariant,
  usePurchaseReturnStore,
} from "@/lib/store/purchase-return-store";
import { cn, formatCurrency } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
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
import { SupplierNav } from "@/components/suppliers/supplier-nav";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";

const PAGE_SIZE = 25;
const STATUSES = Object.keys(RETURN_STATUS_LABELS) as ReturnStatus[];
const REASONS = Object.keys(RETURN_REASON_LABELS) as ReturnReason[];

type FilterState = { search: string; status: string; reason: string };

const DEFAULT_FILTERS: FilterState = { search: "", status: "all", reason: "all" };

type Props = { className?: string; initialStatus?: string };

export function ReturnGrid({ className, initialStatus = "all" }: Props) {
  const router = useRouter();
  const isDark = useIsDark();
  const returns = usePurchaseReturnStore((s) => s.returns);
  const approveReturn = usePurchaseReturnStore((s) => s.approveReturn);
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, status: initialStatus });
  const [selected, setSelected] = useState<PurchaseReturn[]>([]);

  const rows = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return returns.filter((r) => {
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (filters.reason !== "all" && r.reason !== filters.reason) return false;
      if (
        q &&
        !r.number.toLowerCase().includes(q) &&
        !r.poNumber.toLowerCase().includes(q) &&
        !returnSupplierName(r.supplierId).toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [returns, filters]);

  const StatusCell = useCallback((p: ICellRendererParams<PurchaseReturn>) => {
    if (!p.data) return null;
    return (
      <Badge variant={returnStatusBadgeVariant(p.data.status)} className="text-[10px]">
        {RETURN_STATUS_LABELS[p.data.status]}
      </Badge>
    );
  }, []);

  const columnDefs = useMemo<ColDef<PurchaseReturn>[]>(
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
        headerName: "Return #",
        width: 130,
        pinned: "left",
        cellRenderer: (p: ICellRendererParams<PurchaseReturn>) =>
          p.data ? (
            <Link
              href={`/suppliers/returns/${p.data.id}`}
              className="font-semibold text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {p.data.number}
            </Link>
          ) : null,
      },
      {
        field: "poNumber",
        headerName: "PO",
        width: 130,
        cellRenderer: (p: ICellRendererParams<PurchaseReturn>) =>
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
        valueGetter: (p) => (p.data ? returnSupplierName(p.data.supplierId) : ""),
      },
      { field: "requestDate", headerName: "Requested", width: 110 },
      {
        field: "reason",
        headerName: "Reason",
        width: 120,
        valueFormatter: (p) => RETURN_REASON_LABELS[p.value as ReturnReason] ?? p.value,
      },
      {
        field: "creditAmount",
        headerName: "Credit",
        width: 120,
        valueFormatter: (p) => formatCurrency(p.value ?? 0),
      },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        cellRenderer: StatusCell,
      },
      {
        colId: "actions",
        headerName: "",
        width: 72,
        maxWidth: 72,
        pinned: "right",
        sortable: false,
        cellRenderer: (p: ICellRendererParams<PurchaseReturn>) => {
          if (!p.data) return null;
          return (
            <div className="flex items-center justify-center gap-0">
              <ActivityTriggerButton
                entity={{
                  type: "purchase_return",
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
                  <DropdownMenuItem onClick={() => router.push(`/suppliers/returns/${p.data!.id}`)}>
                    <Eye className="mr-2 h-3.5 w-3.5" /> View
                  </DropdownMenuItem>
                  {p.data!.status === "requested" && (
                    <DropdownMenuItem onClick={() => approveReturn(p.data!.id)}>
                      Approve
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [StatusCell, approveReturn, router],
  );

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}>
      <SupplierNav />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search return #, PO, vendor…"
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
              {RETURN_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select
          value={filters.reason}
          onChange={(e) => setFilters((f) => ({ ...f, reason: e.target.value }))}
          className="h-8 w-36 text-xs"
        >
          <option value="all">All reasons</option>
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {RETURN_REASON_LABELS[r]}
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
              selected
                .filter((r) => r.status === "requested")
                .forEach((r) => approveReturn(r.id));
              toast.success("Approved selected returns");
              setSelected([]);
            }}
          >
            Approve
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

      <p className="text-xs text-muted-foreground">
        Showing {rows.length} of {returns.length} vendor returns
      </p>
    </div>
  );
}
