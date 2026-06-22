"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Eye, MoreHorizontal, Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  RFQ_STATUS_LABELS,
  type PurchaseRfq,
  type RfqStatus,
} from "@/lib/mock-data/purchase-rfq";
import {
  rfqStatusBadgeVariant,
  usePurchaseRfqStore,
} from "@/lib/store/purchase-rfq-store";
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
const STATUSES = Object.keys(RFQ_STATUS_LABELS) as RfqStatus[];

type FilterState = { search: string; status: string };

const DEFAULT_FILTERS: FilterState = { search: "", status: "all" };

type Props = { className?: string; initialStatus?: string };

export function RfqGrid({ className, initialStatus = "all" }: Props) {
  const router = useRouter();
  const isDark = useIsDark();
  const rfqs = usePurchaseRfqStore((s) => s.rfqs);
  const updateStatus = usePurchaseRfqStore((s) => s.updateStatus);
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS, status: initialStatus });
  const [selected, setSelected] = useState<PurchaseRfq[]>([]);

  const openRfqCount = rfqs.filter(
    (r) => !["closed", "cancelled", "po_created"].includes(r.status),
  ).length;

  const rows = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    return rfqs.filter((r) => {
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (q && !r.number.toLowerCase().includes(q) && !r.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rfqs, filters]);

  const bulkSend = () => {
    selected.forEach((r) => {
      if (r.status === "draft") updateStatus(r.id, "sent");
    });
    toast.success(`Sent ${selected.length} RFQ(s) to vendors`);
    setSelected([]);
  };

  const StatusCell = useCallback((p: ICellRendererParams<PurchaseRfq>) => {
    if (!p.data) return null;
    return (
      <Badge variant={rfqStatusBadgeVariant(p.data.status)} className="text-[10px]">
        {RFQ_STATUS_LABELS[p.data.status]}
      </Badge>
    );
  }, []);

  const columnDefs = useMemo<ColDef<PurchaseRfq>[]>(
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
        headerName: "RFQ #",
        width: 130,
        pinned: "left",
        cellRenderer: (p: ICellRendererParams<PurchaseRfq>) =>
          p.data ? (
            <Link
              href={`/suppliers/rfq/${p.data.id}`}
              className="font-semibold text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {p.data.number}
            </Link>
          ) : null,
      },
      {
        field: "title",
        headerName: "Title",
        width: 240,
        minWidth: 160,
      },
      {
        colId: "invited",
        headerName: "Invited",
        width: 80,
        valueGetter: (p) => p.data?.invitedSupplierIds.length ?? 0,
      },
      {
        colId: "responses",
        headerName: "Quotes",
        width: 80,
        valueGetter: (p) =>
          p.data?.quotes.filter((q) => q.status === "submitted" || q.status === "accepted").length ?? 0,
      },
      { field: "deadline", headerName: "Deadline", width: 110 },
      { field: "buyer", headerName: "Buyer", width: 120 },
      { field: "createdAt", headerName: "Created", width: 110 },
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
        cellRenderer: (p: ICellRendererParams<PurchaseRfq>) => {
          if (!p.data) return null;
          return (
            <div className="flex items-center justify-center gap-0">
              <ActivityTriggerButton
                entity={{
                  type: "purchase_rfq",
                  id: p.data.id,
                  label: p.data.number,
                  subtitle: p.data.title,
                }}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/suppliers/rfq/${p.data!.id}`)}>
                    <Eye className="mr-2 h-3.5 w-3.5" /> View
                  </DropdownMenuItem>
                  {p.data.status === "draft" && (
                    <DropdownMenuItem onClick={() => updateStatus(p.data!.id, "sent")}>
                      Send to vendors
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
      <SupplierNav openPoCount={openRfqCount} />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search RFQ #, title…"
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="h-8 max-w-[220px] text-xs"
        />
        <Select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="h-8 w-44 text-xs"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {RFQ_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Button size="sm" className="ml-auto h-8" asChild>
          <Link href="/suppliers/rfq/create">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New RFQ
          </Link>
        </Button>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-xs font-medium">{selected.length} selected</span>
          <Button size="sm" className="h-7" onClick={bulkSend}>
            Send to vendors
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
        Showing {rows.length} of {rfqs.length} RFQs ·{" "}
        <Link href="/suppliers/quotations" className="text-primary hover:underline">
          View all quotations
        </Link>
      </p>
    </div>
  );
}
