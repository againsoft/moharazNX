"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import {
  QUOTATION_STATUS_LABELS,
  quoteTotalFromLines,
  rfqSupplierName,
  type QuotationStatus,
} from "@/lib/mock-data/purchase-rfq";
import {
  allQuotationsFromStore,
  quotationStatusBadgeVariant,
  usePurchaseRfqStore,
} from "@/lib/store/purchase-rfq-store";
import { suppliersSeed } from "@/lib/mock-data/suppliers";
import { cn, formatCurrency } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import { SupplierNav } from "@/components/suppliers/supplier-nav";

const PAGE_SIZE = 25;

type Row = ReturnType<typeof allQuotationsFromStore>[number];

type Props = { className?: string };

export function QuotationGrid({ className }: Props) {
  const isDark = useIsDark();
  const rfqs = usePurchaseRfqStore((s) => s.rfqs);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [supplierId, setSupplierId] = useState("all");
  const [rfqFilter, setRfqFilter] = useState("all");

  const allRows = useMemo(() => allQuotationsFromStore(rfqs), [rfqs]);

  const rows = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allRows.filter((row) => {
      if (status !== "all" && row.status !== status) return false;
      if (supplierId !== "all" && row.supplierId !== supplierId) return false;
      if (rfqFilter !== "all" && row.rfqId !== rfqFilter) return false;
      if (
        q &&
        !row.quoteNumber.toLowerCase().includes(q) &&
        !row.rfqNumber.toLowerCase().includes(q) &&
        !rfqSupplierName(row.supplierId).toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [allRows, search, status, supplierId, rfqFilter]);

  const rfqOptions = useMemo(
    () => rfqs.map((r) => ({ id: r.id, number: r.number })),
    [rfqs],
  );

  const columnDefs = useMemo<ColDef<Row>[]>(() => {
    const rfqById = new Map(rfqs.map((r) => [r.id, r]));
    return [
      {
        field: "quoteNumber",
        headerName: "Quote #",
        width: 120,
        pinned: "left",
      },
      {
        field: "rfqNumber",
        headerName: "RFQ",
        width: 130,
        cellRenderer: (p: ICellRendererParams<Row>) =>
          p.data ? (
            <Link href={`/suppliers/rfq/${p.data.rfqId}`} className="text-primary hover:underline">
              {p.data.rfqNumber}
            </Link>
          ) : null,
      },
      {
        colId: "vendor",
        headerName: "Vendor",
        width: 200,
        valueGetter: (p) => (p.data ? rfqSupplierName(p.data.supplierId) : ""),
        cellRenderer: (p: ICellRendererParams<Row>) =>
          p.data ? (
            <Link href={`/suppliers/${p.data.supplierId}`} className="text-primary hover:underline">
              {rfqSupplierName(p.data.supplierId)}
            </Link>
          ) : null,
      },
      {
        colId: "total",
        headerName: "Total",
        width: 120,
        valueGetter: (p) => {
          const rfq = p.data ? rfqById.get(p.data.rfqId) : undefined;
          return rfq && p.data ? quoteTotalFromLines(rfq, p.data) : 0;
        },
        valueFormatter: (p) => formatCurrency(p.value ?? 0),
      },
      { field: "leadTimeDays", headerName: "Lead (days)", width: 100 },
      { field: "moq", headerName: "MOQ", width: 80 },
      { field: "validUntil", headerName: "Valid until", width: 110 },
      { field: "submittedAt", headerName: "Submitted", width: 110 },
      {
        field: "status",
        headerName: "Status",
        width: 120,
        cellRenderer: (p: ICellRendererParams<Row>) =>
          p.data ? (
            <Badge variant={quotationStatusBadgeVariant(p.data.status)} className="text-[10px]">
              {QUOTATION_STATUS_LABELS[p.data.status]}
            </Badge>
          ) : null,
      },
    ];
  }, [rfqs]);

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-3", className)}>
      <SupplierNav />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search quote #, RFQ, vendor…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 max-w-[220px] text-xs"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-8 w-36 text-xs"
        >
          <option value="all">All statuses</option>
          {(Object.keys(QUOTATION_STATUS_LABELS) as QuotationStatus[]).map((s) => (
            <option key={s} value={s}>
              {QUOTATION_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select
          value={supplierId}
          onChange={(e) => setSupplierId(e.target.value)}
          className="h-8 w-44 text-xs"
        >
          <option value="all">All vendors</option>
          {suppliersSeed.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select
          value={rfqFilter}
          onChange={(e) => setRfqFilter(e.target.value)}
          className="h-8 w-40 text-xs"
        >
          <option value="all">All RFQs</option>
          {rfqOptions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.number}
            </option>
          ))}
        </Select>
      </div>

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
          animateRows
          pagination
          paginationPageSize={PAGE_SIZE}
        />
      </div>

      <p className="text-xs text-muted-foreground">Showing {rows.length} vendor quotations</p>
    </div>
  );
}
