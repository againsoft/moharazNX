"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  ClipboardList,
  Edit2,
  FileText,
  Globe,
  Link2,
  Mail,
  MapPin,
  MoreHorizontal,
  Package,
  Phone,
  Plus,
  Shield,
  Star,
  Truck,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  PO_STATUS_LABELS,
  SUPPLIER_DETAIL_TAB_LABELS,
  SUPPLIER_DETAIL_TABS,
  SUPPLIER_STATUS_LABELS,
  formatBdt,
  getPosBySupplierId,
  getSupplierDetail,
  type PoStatus,
  type SupplierDetail,
  type SupplierDetailTab,
  type SupplierStatus,
} from "@/lib/mock-data/suppliers";
import {
  SUPPLIER_STOCK_STATUS_LABELS,
  enrichMapping,
  getMappingsForSupplier,
  stockStatusVariant,
} from "@/lib/mock-data/vendor-product-mapping";
import {
  getPartnerBySupplierId,
  partnerDirectoryUrlForSupplier,
  VENDOR_DIRECTORY_HREF,
} from "@/lib/mock-data/business-partners";
import { useVendorMappingStore } from "@/lib/store/vendor-mapping-store";
import { getProductById, type Product } from "@/lib/mock-data/products";
import { ProductViewDialog } from "@/components/products/product-view-dialog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function statusVariant(status: SupplierStatus) {
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

function billStatusVariant(status: string) {
  if (status === "paid") return "success" as const;
  if (status === "matched") return "secondary" as const;
  if (status === "overdue") return "warning" as const;
  return "muted" as const;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: React.ElementType;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-input bg-card">
      <div className="flex items-center gap-2 border-b border-input px-4 py-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
        {action && <div className="ml-auto">{action}</div>}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function SmartButton({
  label,
  count,
  onClick,
}: {
  label: string;
  count: number | string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-[88px] flex-col items-center rounded-lg border border-input bg-card px-3 py-2 transition-colors hover:bg-muted/40"
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-lg font-semibold">{count}</span>
    </button>
  );
}

type Props = {
  supplierId: string;
  supplier?: SupplierDetail | null;
  loading?: boolean;
};

export function SupplierDetailWorkspace({
  supplierId,
  supplier: supplierProp,
  loading: loadingProp = false,
}: Props) {
  const supplier = supplierProp ?? getSupplierDetail(supplierId);
  const loading = loadingProp && !supplier;
  const [tab, setTab] = useState<SupplierDetailTab>("general");
  const mappings = useVendorMappingStore((s) => s.mappings);
  const togglePublished = useVendorMappingStore((s) => s.togglePublished);
  const patchMapping = useVendorMappingStore((s) => s.patchMapping);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const openProductDrawer = (productId: string) => {
    const product = getProductById(productId);
    if (!product) {
      toast.error("Product not found");
      return;
    }
    setViewProduct(product);
    setViewOpen(true);
  };

  const { mappedCatalog, unmappedCatalog } = useMemo(() => {
    const rows = getMappingsForSupplier(mappings, supplierId).map(enrichMapping);
    return {
      mappedCatalog: rows.filter((r) => r.isMapped),
      unmappedCatalog: rows.filter((r) => !r.isMapped),
    };
  }, [mappings, supplierId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
        <p className="text-sm">Loading supplier…</p>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-muted-foreground">
        <p className="text-sm">Supplier not found.</p>
        <Link href={VENDOR_DIRECTORY_HREF} className="mt-2 text-xs text-primary hover:underline">
          ← Vendor directory (Business Partners)
        </Link>
      </div>
    );
  }

  const pos = getPosBySupplierId(supplierId);
  const initials = supplier.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const goToTab = (next: SupplierDetailTab) => {
    setTab(next);
    document.getElementById("supplier-detail-tabs")?.scrollIntoView({ behavior: "smooth" });
  };

  const partner = getPartnerBySupplierId(supplierId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href={partner ? partnerDirectoryUrlForSupplier(supplierId) : VENDOR_DIRECTORY_HREF}
            className="mb-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />{" "}
            {partner ? "Business Partners" : "Vendor directory"}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold">{supplier.name}</h1>
            <Badge variant={statusVariant(supplier.status)} className="capitalize text-xs">
              {SUPPLIER_STATUS_LABELS[supplier.status]}
            </Badge>
            {supplier.status === "preferred" && (
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {supplier.vendorCode} · {supplier.country}
            {supplier.buyerName && ` · Buyer: ${supplier.buyerName}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => toast.info("Create PO — prototype")}
          >
            <FileText className="h-3.5 w-3.5" /> Create PO
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => toast.info("Send RFQ — prototype")}
          >
            <ClipboardList className="h-3.5 w-3.5" /> Send RFQ
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => toast.info("Edit vendor — prototype")}>
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info("Block vendor — prototype")}>
                <Shield className="mr-2 h-3.5 w-3.5" />
                {supplier.status === "blocked" ? "Unblock vendor" : "Block vendor"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Add contract — prototype")}>
                <FileText className="mr-2 h-3.5 w-3.5" /> Add contract
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Sync stock feed — prototype")}>
                <Truck className="mr-2 h-3.5 w-3.5" /> Sync stock feed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg border border-input bg-muted/20 px-4 py-2 text-xs">
        <span>
          <span className="text-muted-foreground">Terms:</span> {supplier.paymentTerms}
        </span>
        <span>
          <span className="text-muted-foreground">Lead time:</span> {supplier.leadTimeDays} days
        </span>
        <span className="inline-flex items-center gap-0.5">
          <span className="text-muted-foreground">Rating:</span>
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          {supplier.rating.toFixed(1)}
        </span>
        <span>
          <span className="text-muted-foreground">Spend YTD:</span> {formatBdt(supplier.spendYtd)}
        </span>
        <span>
          <span className="text-muted-foreground">Open POs:</span> {supplier.openPos}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <SmartButton label="Open POs" count={supplier.openPos} onClick={() => goToTab("purchase-orders")} />
        <SmartButton
          label="Catalog"
          count={mappedCatalog.length}
          onClick={() => goToTab("catalog")}
        />
        <SmartButton
          label="Contracts"
          count={supplier.contracts.length}
          onClick={() => goToTab("contracts")}
        />
        <SmartButton label="RFQs" count={supplier.rfqCount} onClick={() => goToTab("activity")} />
        <SmartButton label="Bills" count={supplier.bills.length} onClick={() => goToTab("terms")} />
        <SmartButton label="Receipts" count={supplier.receiptCount} onClick={() => goToTab("activity")} />
        {supplier.hasStockFeed && (
          <SmartButton label="Stock Feed" count="Live" onClick={() => toast.info("Stock feed — prototype")} />
        )}
      </div>

      <div id="supplier-detail-tabs" className="flex flex-wrap gap-1 rounded-lg border border-input bg-muted/30 p-1">
        {SUPPLIER_DETAIL_TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            {SUPPLIER_DETAIL_TAB_LABELS[t]}
            {t === "purchase-orders" && supplier.openPos > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-semibold text-white">
                {supplier.openPos}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {tab === "general" && (
            <>
              <SectionCard title="Vendor Profile" icon={Building2}>
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1 divide-y divide-input">
                    <InfoRow
                      label="Vendor code"
                      value={<span className="font-mono text-primary">{supplier.vendorCode}</span>}
                    />
                    <InfoRow
                      label="Email"
                      value={
                        <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">
                          {supplier.email}
                        </a>
                      }
                    />
                    <InfoRow label="Phone" value={supplier.phone} />
                    {supplier.taxId && <InfoRow label="Tax ID" value={supplier.taxId} />}
                    {supplier.website && (
                      <InfoRow
                        label="Website"
                        value={
                          <a
                            href={supplier.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            {supplier.website.replace(/^https?:\/\//, "")}
                          </a>
                        }
                      />
                    )}
                    <InfoRow label="Assigned buyer" value={supplier.buyerName ?? "—"} />
                    <InfoRow label="Last updated" value={supplier.updatedAt} />
                  </div>
                </div>
              </SectionCard>

              {supplier.addresses.length > 0 && (
                <SectionCard title="Addresses" icon={MapPin}>
                  <div className="space-y-3">
                    {supplier.addresses.map((addr) => (
                      <div key={addr.id} className="rounded-lg border border-input p-3 text-xs">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{addr.label}</p>
                          <Badge variant="outline" className="capitalize text-[10px]">
                            {addr.type}
                          </Badge>
                        </div>
                        <p className="mt-1 text-muted-foreground">
                          {addr.line1}, {addr.city}, {addr.country}
                        </p>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}
            </>
          )}

          {tab === "contacts" && (
            <SectionCard
              title="Vendor Contacts"
              icon={Users}
              action={
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast.info("Add contact")}>
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              }
            >
              <div className="space-y-3">
                {supplier.contacts.map((c) => (
                  <div key={c.id} className="flex items-start justify-between rounded-lg border border-input p-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{c.name}</p>
                        {c.isPrimary && (
                          <Badge variant="secondary" className="text-[10px]">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{c.role}</p>
                      <div className="mt-2 space-y-0.5 text-xs">
                        <p className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {c.email}
                        </p>
                        <p className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {c.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {tab === "terms" && (
            <SectionCard title="Purchase Terms" icon={FileText}>
              <div className="divide-y divide-input">
                <InfoRow label="Payment terms" value={supplier.paymentTerms} />
                <InfoRow label="Currency" value={supplier.currency ?? "BDT"} />
                <InfoRow label="Default lead time" value={`${supplier.leadTimeDays} days`} />
                <InfoRow
                  label="Min order value"
                  value={supplier.minOrderValue ? formatBdt(supplier.minOrderValue) : "—"}
                />
                <InfoRow label="Incoterms" value={supplier.incoterms ?? "—"} />
                <InfoRow
                  label="Preferred vendor"
                  value={supplier.status === "preferred" ? "Yes" : "No"}
                />
                <InfoRow
                  label="Blocked for new POs"
                  value={supplier.status === "blocked" ? "Yes" : "No"}
                />
              </div>

              {supplier.bills.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold">Vendor bills</p>
                  <div className="overflow-x-auto rounded-lg border border-input">
                    <table className="w-full text-xs">
                      <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2">Bill #</th>
                          <th className="px-3 py-2">Amount</th>
                          <th className="px-3 py-2">Due</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplier.bills.map((b) => (
                          <tr key={b.id} className="border-b last:border-0">
                            <td className="px-3 py-2 font-medium">{b.billNumber}</td>
                            <td className="px-3 py-2">{formatBdt(b.amount)}</td>
                            <td className="px-3 py-2">{b.dueAt}</td>
                            <td className="px-3 py-2">
                              <Badge variant={billStatusVariant(b.status)} className="capitalize">
                                {b.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </SectionCard>
          )}

          {tab === "catalog" && (
            <div className="space-y-4">
              <SectionCard
                title="Mapped to our catalog"
                icon={Link2}
                action={
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast.info("Map item")}>
                    <Plus className="mr-1 h-3 w-3" /> Map item
                  </Button>
                }
              >
                <p className="mb-3 text-[11px] text-muted-foreground">
                  Products linked to your catalog. Price and stock updates sync to the product
                  drawer automatically.
                </p>
                {mappedCatalog.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No mapped products yet.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-input">
                    <table className="w-full min-w-[720px] text-xs">
                      <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2">Our product</th>
                          <th className="px-3 py-2">Vendor SKU</th>
                          <th className="px-3 py-2">Cost</th>
                          <th className="px-3 py-2">Supplier stock</th>
                          <th className="px-3 py-2">Lead</th>
                          <th className="px-3 py-2">Website</th>
                          <th className="px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mappedCatalog.map((item) => (
                          <tr key={item.id} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="px-3 py-2">
                              {item.productId ? (
                                <button
                                  type="button"
                                  className="font-medium text-primary hover:underline"
                                  onClick={() => openProductDrawer(item.productId!)}
                                >
                                  {item.productName ?? item.vendorTitle}
                                </button>
                              ) : (
                                <span className="font-medium">{item.vendorTitle}</span>
                              )}
                              {item.productSku && (
                                <p className="font-mono text-[10px] text-muted-foreground">
                                  {item.productSku}
                                  {item.variantId ? ` · ${item.variantId}` : ""}
                                </p>
                              )}
                            </td>
                            <td className="px-3 py-2 font-mono text-muted-foreground">{item.vendorSku}</td>
                            <td className="px-3 py-2 font-medium">{formatBdt(item.vendorPrice)}</td>
                            <td className="px-3 py-2">
                              <span className="font-medium">{item.supplierStock}</span>{" "}
                              <Badge variant={stockStatusVariant(item.stockStatus)} className="text-[10px]">
                                {SUPPLIER_STOCK_STATUS_LABELS[item.stockStatus]}
                              </Badge>
                            </td>
                            <td className="px-3 py-2">{item.leadTimeDays}d</td>
                            <td className="px-3 py-2">
                              {item.isPublishedOnWeb ? (
                                <Badge variant="success" className="gap-0.5 text-[10px]">
                                  <Globe className="h-2.5 w-2.5" />
                                  Live
                                </Badge>
                              ) : (
                                <Badge variant="muted" className="text-[10px]">
                                  Internal
                                </Badge>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-1.5 text-[10px]"
                                  onClick={() => togglePublished(item.id)}
                                >
                                  Toggle web
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-1.5 text-[10px]"
                                  onClick={() => {
                                    patchMapping(item.id, {
                                      vendorPrice: item.vendorPrice + 50,
                                    });
                                    toast.success("Cost updated — synced to product drawer");
                                  }}
                                >
                                  +৳50
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Vendor feed (not on website)" icon={Package}>
                <p className="mb-3 text-[11px] text-muted-foreground">
                  Supplier catalog SKUs from stock feed — not all vendor products are published on
                  our storefront. Map when ready.
                </p>
                {unmappedCatalog.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No unmapped feed items.</p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-input">
                    <table className="w-full min-w-[560px] text-xs">
                      <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2">Vendor title</th>
                          <th className="px-3 py-2">Vendor SKU</th>
                          <th className="px-3 py-2">Cost</th>
                          <th className="px-3 py-2">Stock</th>
                          <th className="px-3 py-2">Synced</th>
                          <th className="px-3 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {unmappedCatalog.map((item) => (
                          <tr key={item.id} className="border-b last:border-0 hover:bg-muted/20">
                            <td className="px-3 py-2 font-medium">{item.vendorTitle}</td>
                            <td className="px-3 py-2 font-mono text-muted-foreground">{item.vendorSku}</td>
                            <td className="px-3 py-2">{formatBdt(item.vendorPrice)}</td>
                            <td className="px-3 py-2">{item.supplierStock}</td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {item.lastSyncedAt
                                ? new Date(item.lastSyncedAt).toLocaleDateString()
                                : "—"}
                            </td>
                            <td className="px-3 py-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-[10px]"
                                onClick={() => toast.info("Link to catalog product — prototype")}
                              >
                                Map product
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

          {tab === "purchase-orders" && (
            <SectionCard title="Purchase Order History" icon={ClipboardList}>
              <div className="overflow-x-auto rounded-lg border border-input">
                <table className="w-full min-w-[560px] text-xs">
                  <thead className="border-b bg-muted/40 text-left text-[11px] text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">PO #</th>
                      <th className="px-3 py-2">Items</th>
                      <th className="px-3 py-2">Total</th>
                      <th className="px-3 py-2">Expected</th>
                      <th className="px-3 py-2">Created</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pos.map((po) => (
                      <tr key={po.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-3 py-2 font-medium">{po.poNumber}</td>
                        <td className="px-3 py-2">{po.items}</td>
                        <td className="px-3 py-2">{formatBdt(po.total)}</td>
                        <td className="px-3 py-2">{po.expectedAt}</td>
                        <td className="px-3 py-2">{po.createdAt}</td>
                        <td className="px-3 py-2">
                          <Badge variant={poStatusVariant(po.status)}>{PO_STATUS_LABELS[po.status]}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {tab === "contracts" && (
            <SectionCard
              title="Vendor Contracts"
              icon={FileText}
              action={
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toast.info("Add contract")}>
                  <Plus className="mr-1 h-3 w-3" /> Add
                </Button>
              }
            >
              {supplier.contracts.length === 0 ? (
                <p className="text-xs text-muted-foreground">No active contracts.</p>
              ) : (
                <div className="space-y-3">
                  {supplier.contracts.map((ct) => (
                    <div key={ct.id} className="rounded-lg border border-input p-3 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{ct.title}</p>
                          <p className="text-muted-foreground">{ct.contractNumber}</p>
                        </div>
                        <Badge variant={ct.status === "active" ? "success" : "muted"} className="capitalize">
                          {ct.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-muted-foreground">
                        <span>
                          {ct.validFrom} → {ct.validTo}
                        </span>
                        <span className="font-medium text-foreground">{formatBdt(ct.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {tab === "performance" && (
            <SectionCard title="Vendor Performance" icon={Star}>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "On-time delivery",
                    value: `${supplier.performance.onTimeDeliveryPct}%`,
                    good: supplier.performance.onTimeDeliveryPct >= 90,
                  },
                  {
                    label: "Quality reject rate",
                    value: `${supplier.performance.qualityRejectRatePct}%`,
                    good: supplier.performance.qualityRejectRatePct < 3,
                  },
                  {
                    label: "Price variance",
                    value: `${supplier.performance.priceVariancePct > 0 ? "+" : ""}${supplier.performance.priceVariancePct}%`,
                    good: supplier.performance.priceVariancePct <= 0,
                  },
                  {
                    label: "Avg lead time",
                    value: `${supplier.performance.avgLeadTimeDays} days`,
                    good: supplier.performance.avgLeadTimeDays <= supplier.leadTimeDays,
                  },
                ].map(({ label, value, good }) => (
                  <div
                    key={label}
                    className={cn(
                      "rounded-lg border p-3",
                      good ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20" : "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20",
                    )}
                  >
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className="mt-0.5 text-lg font-bold">{value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Aggregated from PO receipts, QC rejects, and quote variance — per purchase_vendor_ratings.
              </p>
            </SectionCard>
          )}

          {tab === "activity" && (
            <SectionCard title="Procurement Activity" icon={User}>
              <div className="space-y-3">
                {supplier.timeline.map((entry) => (
                  <div key={entry.id} className="flex gap-3 border-b border-input pb-3 last:border-0 last:pb-0">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold uppercase">
                      {entry.type.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium">{entry.title}</p>
                      <p className="text-[11px] text-muted-foreground">{entry.description}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {new Date(entry.at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        <div className="space-y-4">
          <SectionCard title="Quick Stats" icon={Truck}>
            <div className="space-y-2 text-xs">
              <InfoRow label="Total POs" value={supplier.totalPos} />
              <InfoRow label="Open POs" value={supplier.openPos} />
              <InfoRow label="Mapped products" value={mappedCatalog.length} />
              <InfoRow label="Feed only (unmapped)" value={unmappedCatalog.length} />
              <InfoRow label="RFQs involved" value={supplier.rfqCount} />
              <InfoRow label="Goods receipts" value={supplier.receiptCount} />
              <InfoRow
                label="Stock feed"
                value={
                  supplier.hasStockFeed ? (
                    <Badge variant="success">Connected</Badge>
                  ) : (
                    <Badge variant="muted">None</Badge>
                  )
                }
              />
            </div>
          </SectionCard>

          <SectionCard title="Notes" icon={FileText}>
            <p className="text-xs text-muted-foreground">
              Internal procurement notes and @mentions appear here — activity drawer per record-view
              architecture.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full text-xs"
              onClick={() => toast.info("Add note — prototype")}
            >
              Add internal note
            </Button>
          </SectionCard>
        </div>
      </div>

      <ProductViewDialog
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open);
          if (!open) setViewProduct(null);
        }}
        product={viewProduct}
        onEdit={(product) => {
          setViewOpen(false);
          setViewProduct(null);
          toast.info(`Edit ${product.name} — open from Catalog › Products`);
        }}
      />
    </div>
  );
}
