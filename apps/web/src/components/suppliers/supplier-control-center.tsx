"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileText, Plus, Star, Truck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  PO_STATUS_LABELS,
  RFQ_STATUS_LABELS,
  formatBdt,
  purchaseOrdersSeed,
  rfqSeed,
  spendChart,
  stockFeedsSeed,
  supplierKpis,
  suppliersSeed,
  tabFromPath,
  type PoStatus,
  type RfqStatus,
  type Supplier,
  type SupplierStatus,
} from "@/lib/mock-data/suppliers";
import {
  partnerDirectoryUrlForSupplier,
  VENDOR_DIRECTORY_HREF,
} from "@/lib/mock-data/business-partners";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SupplierNav } from "@/components/suppliers/supplier-nav";

function supplierStatusVariant(status: SupplierStatus) {
  if (status === "preferred") return "success" as const;
  if (status === "active") return "secondary" as const;
  return "muted" as const;
}

function poStatusVariant(status: PoStatus) {
  if (status === "sent") return "secondary" as const;
  if (status === "partial") return "warning" as const;
  if (status === "received") return "success" as const;
  if (status === "cancelled") return "muted" as const;
  return "outline" as const;
}

function rfqStatusVariant(status: RfqStatus) {
  if (status === "sent") return "secondary" as const;
  if (status === "review") return "warning" as const;
  if (status === "awarded") return "success" as const;
  return "muted" as const;
}

function SummaryTab() {
  const openPos = purchaseOrdersSeed.filter((p) => p.status !== "received" && p.status !== "cancelled");
  const topSuppliers = [...suppliersSeed]
    .sort((a, b) => b.spendYtd - a.spendYtd)
    .slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {[
          { label: "New supplier", icon: UserPlus },
          { label: "Create PO", icon: FileText },
          { label: "New RFQ", icon: Plus },
          { label: "Receive goods", icon: Truck },
        ].map(({ label, icon: Icon }) => (
          <Button
            key={label}
            variant="outline"
            size="sm"
            onClick={() => toast.info(`${label} — prototype`)}
          >
            <Icon className="mr-1.5 h-3.5 w-3.5" />
            {label}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {supplierKpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-input bg-card p-3 shadow-sm">
            <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
            <p className="mt-0.5 text-xl font-semibold">{kpi.value}</p>
            <p
              className={cn(
                "text-xs",
                kpi.alert ? "text-amber-600" : kpi.up ? "text-emerald-600" : "text-muted-foreground",
              )}
            >
              {kpi.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-input bg-card p-4">
          <p className="text-sm font-medium">Procurement spend (6 mo)</p>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendChart}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v) => formatBdt(Number(v))} />
                <Bar dataKey="spend" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-input bg-card p-4">
            <p className="text-sm font-medium">Open purchase orders</p>
            <ul className="mt-2 space-y-2">
              {openPos.map((po) => (
                <li
                  key={po.id}
                  className="flex items-center justify-between rounded-md border border-input/60 px-2 py-1.5 text-xs"
                >
                  <div>
                    <p className="font-medium">{po.poNumber}</p>
                    <p className="text-muted-foreground">{po.supplierName}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={poStatusVariant(po.status)}>{PO_STATUS_LABELS[po.status]}</Badge>
                    <p className="mt-0.5 font-medium">{formatBdt(po.total)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-input bg-card p-4">
            <p className="text-sm font-medium">Top suppliers by spend</p>
            <ul className="mt-2 space-y-2">
              {topSuppliers.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-xs">
                  <Link
                    href={partnerDirectoryUrlForSupplier(s.id)}
                    className="text-primary hover:underline"
                  >
                    {s.name}
                  </Link>
                  <span className="font-medium">{formatBdt(s.spendYtd)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuppliersTab({ suppliers, loading }: { suppliers: Supplier[]; loading?: boolean }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SupplierStatus | "all">("all");

  const rows = useMemo(() => {
    return suppliers.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.vendorCode.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      const matchStatus = status === "all" || s.status === status;
      return matchSearch && matchStatus;
    });
  }, [search, status, suppliers]);

  if (loading && suppliers.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">Loading suppliers…</p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Vendor list from API when connected —{" "}
        <Link href={VENDOR_DIRECTORY_HREF} className="text-primary hover:underline">
          Business Partners directory
        </Link>{" "}
        for canonical partner records.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search suppliers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 max-w-xs text-xs"
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as SupplierStatus | "all")}
          className="h-8 w-36 text-xs"
        >
          <option value="all">All statuses</option>
          <option value="preferred">Preferred</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </Select>
        <Button size="sm" className="ml-auto" asChild>
          <Link href="/partners/directory?create=1&role=vendor">
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            New vendor
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-input">
        <table className="w-full min-w-[720px] text-xs">
          <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Vendor</th>
              <th className="px-3 py-2 font-medium">Contact</th>
              <th className="px-3 py-2 font-medium">Terms</th>
              <th className="px-3 py-2 font-medium">Lead time</th>
              <th className="px-3 py-2 font-medium">Rating</th>
              <th className="px-3 py-2 font-medium">Open POs</th>
              <th className="px-3 py-2 font-medium">Spend YTD</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-3 py-2">
                  <Link href={`/suppliers/${s.id}`} className="group block">
                    <p className="font-medium text-primary group-hover:underline">{s.name}</p>
                    <p className="text-muted-foreground">{s.vendorCode}</p>
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <p>{s.email}</p>
                  <p className="text-muted-foreground">{s.phone}</p>
                </td>
                <td className="px-3 py-2">{s.paymentTerms}</td>
                <td className="px-3 py-2">{s.leadTimeDays} days</td>
                <td className="px-3 py-2">
                  <span className="inline-flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {s.rating.toFixed(1)}
                  </span>
                </td>
                <td className="px-3 py-2">{s.openPos}</td>
                <td className="px-3 py-2 font-medium">{formatBdt(s.spendYtd)}</td>
                <td className="px-3 py-2">
                  <Badge variant={supplierStatusVariant(s.status)} className="capitalize">
                    {s.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PurchaseOrdersTab() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link href="/suppliers/purchase-orders">Open full list</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/suppliers/purchase-orders/create">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create PO
          </Link>
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-input">
        <table className="w-full min-w-[640px] text-xs">
          <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">PO #</th>
              <th className="px-3 py-2 font-medium">Supplier</th>
              <th className="px-3 py-2 font-medium">Items</th>
              <th className="px-3 py-2 font-medium">Total</th>
              <th className="px-3 py-2 font-medium">Expected</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrdersSeed.map((po) => (
              <tr key={po.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-3 py-2">
                  <Link
                    href={`/suppliers/purchase-orders/${po.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {po.poNumber}
                  </Link>
                </td>
                <td className="px-3 py-2">{po.supplierName}</td>
                <td className="px-3 py-2">{po.items}</td>
                <td className="px-3 py-2 font-medium">{formatBdt(po.total)}</td>
                <td className="px-3 py-2">{po.expectedAt}</td>
                <td className="px-3 py-2">
                  <Badge variant={poStatusVariant(po.status)}>{PO_STATUS_LABELS[po.status]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RfqTab() {
  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" asChild>
          <Link href="/suppliers/rfq">Open full list</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/suppliers/rfq/create">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New RFQ
          </Link>
        </Button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-input">
        <table className="w-full min-w-[560px] text-xs">
          <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">RFQ #</th>
              <th className="px-3 py-2 font-medium">Title</th>
              <th className="px-3 py-2 font-medium">Invited</th>
              <th className="px-3 py-2 font-medium">Responses</th>
              <th className="px-3 py-2 font-medium">Deadline</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rfqSeed.map((r) => (
              <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-3 py-2">
                  <Link
                    href={`/suppliers/rfq/${r.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {r.rfqNumber}
                  </Link>
                </td>
                <td className="px-3 py-2">{r.title}</td>
                <td className="px-3 py-2">{r.vendorsInvited}</td>
                <td className="px-3 py-2">{r.responses}</td>
                <td className="px-3 py-2">{r.deadline}</td>
                <td className="px-3 py-2">
                  <Badge variant={rfqStatusVariant(r.status)}>{RFQ_STATUS_LABELS[r.status]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockFeedTab() {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Supplier stock feeds sync availability from vendors into inventory — per{" "}
        <span className="font-medium">Supplier Stock Feed</span> architecture.
      </p>
      <div className="overflow-x-auto rounded-lg border border-input">
        <table className="w-full min-w-[520px] text-xs">
          <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Supplier</th>
              <th className="px-3 py-2 font-medium">Feed type</th>
              <th className="px-3 py-2 font-medium">Last sync</th>
              <th className="px-3 py-2 font-medium">Items</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {stockFeedsSeed.map((f) => (
              <tr key={f.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-3 py-2 font-medium">{f.supplierName}</td>
                <td className="px-3 py-2">{f.feedType}</td>
                <td className="px-3 py-2">{f.lastSync}</td>
                <td className="px-3 py-2">{f.itemsSynced}</td>
                <td className="px-3 py-2">
                  <Badge
                    variant={
                      f.status === "ok" ? "success" : f.status === "stale" ? "warning" : "muted"
                    }
                  >
                    {f.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type SupplierControlCenterProps = {
  suppliers?: Supplier[];
  loading?: boolean;
};

export function SupplierControlCenter({ suppliers, loading }: SupplierControlCenterProps = {}) {
  const pathname = usePathname();
  const tab = tabFromPath(pathname);
  const openPoCount = purchaseOrdersSeed.filter(
    (p) => p.status !== "received" && p.status !== "cancelled",
  ).length;
  const supplierRows = suppliers ?? suppliersSeed;
  const activeTab =
    pathname === "/suppliers" && suppliers && suppliers.length > 0 ? "suppliers" : tab;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <SupplierNav openPoCount={openPoCount} activeTab={activeTab} />
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        {activeTab === "summary" && <SummaryTab />}
        {activeTab === "suppliers" && <SuppliersTab suppliers={supplierRows} loading={loading} />}
        {activeTab === "purchase-orders" && <PurchaseOrdersTab />}
        {activeTab === "rfq" && <RfqTab />}
        {activeTab === "stock-feed" && <StockFeedTab />}
      </div>
    </div>
  );
}
