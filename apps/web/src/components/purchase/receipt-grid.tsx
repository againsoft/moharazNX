"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Eye, MoreHorizontal, Package, X } from "lucide-react";
import { toast } from "sonner";
import {
  RECEIPT_STATUS_LABELS,
  receiptLineQtyTotal,
  receiptSupplierName,
  type GoodsReceipt,
  type ReceiptStatus,
} from "@/lib/mock-data/purchase-receipts";
import {
  receiptStatusBadgeVariant,
  usePurchaseReceiptStore,
} from "@/lib/store/purchase-receipt-store";
import { cn } from "@/lib/utils";
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
const STATUSES = Object.keys(RECEIPT_STATUS_LABELS) as ReceiptStatus[];

type FilterState = { search: string; status: string; warehouse: string };

const DEFAULT_FILTERS: FilterState = { search: "", status: "all", warehouse: "all" };

type Props = { className?: string; initialStatus?: string };

export function ReceiptGrid({ className, initialStatus = "all" }: Props) {
  const router = useRouter();
  const isDark = useIsDark();
  const receipts = usePurchaseReceiptStore((s) => s.receipts);
  const updateStatus = usePurchaseReceiptStore((s) => s.updateStatus);
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, status: initialStatus });
  const [selected, setSelected] = useState<GoodsReceipt[]>([]);

  const rows = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return receipts.filter((r) => {
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (filters.warehouse !== "all" && r.warehouse !== filters.warehouse) return false;
      if (
        q &&
        !r.number.toLowerCase().includes(q) &&
        !r.poNumber.toLowerCase().includes(q) &&
        !receiptSupplierName(r.supplierId).toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [receipts, filters]);

  const StatusCell = useCallback((p: ICellRendererParams<GoodsReceipt>) => {
    if (!p.data) return null;
    return (
      <Badge variant={receiptStatusBadgeVariant(p.data.status)} className="text-[10px]">
        {RECEIPT_STATUS_LABELS[p.data.status]}
      </Badge>
    );
  }, []);

  const columnDefs = useMemo<ColDef<GoodsReceipt>[]>(
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
        headerName: "GR #",
        width: 130,
        pinned: "left",
        cellRenderer: (p: ICellRendererParams<GoodsReceipt>) =>
          p.data ? (
            <Link
              href={`/suppliers/receipts/${p.data.id}`}
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
        cellRenderer: (p: ICellRendererParams<GoodsReceipt>) =>
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
        valueGetter: (p) => (p.data ? receiptSupplierName(p.data.supplierId) : ""),
      },
      { field: "warehouse", headerName: "Warehouse", width: 100 },
      { field: "receivedDate", headerName: "Date", width: 110 },
      { field: "receivedBy", headerName: "Received by", width: 120 },
      {
        colId: "qty",
        headerName: "Qty",
        width: 72,
        valueGetter: (p) => (p.data ? receiptLineQtyTotal(p.data) : 0),
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
        cellRenderer: (p: ICellRendererParams<GoodsReceipt>) => {
          if (!p.data) return null;
          return (
            <div className="flex items-center justify-center gap-0">
              <ActivityTriggerButton
                entity={{
                  type: "purchase_receipt",
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
                  <DropdownMenuItem onClick={() => router.push(`/suppliers/receipts/${p.data!.id}`)}>
                    <Eye className="mr-2 h-3.5 w-3.5" /> View
                  </DropdownMenuItem>
                  {p.data.status === "draft" && (
                    <DropdownMenuItem onClick={() => updateStatus(p.data!.id, "receiving")}>
                      Start receiving
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
      <SupplierNav />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search GR #, PO, vendor…"
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
              {RECEIPT_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select
          value={filters.warehouse}
          onChange={(e) => setFilters((f) => ({ ...f, warehouse: e.target.value }))}
          className="h-8 w-32 text-xs"
        >
          <option value="all">All WH</option>
          <option value="WH-DHK">WH-DHK</option>
          <option value="WH-CTG">WH-CTG</option>
          <option value="WH-SYL">WH-SYL</option>
        </Select>
        <Button size="sm" className="ml-auto h-8" variant="outline" asChild>
          <Link href="/suppliers/purchase-orders">
            <Package className="mr-1.5 h-3.5 w-3.5" />
            Receive from PO
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
              selected.forEach((r) => updateStatus(r.id, "receiving"));
              toast.success("Started receiving");
              setSelected([]);
            }}
          >
            Start receiving
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

      <p className="text-xs text-muted-foreground">Showing {rows.length} of {receipts.length} goods receipts</p>
    </div>
  );
}
