"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Archive,
  Eye,
  Filter,
  Globe,
  MoreHorizontal,
  MousePointerClick,
  Pencil,
  SlidersHorizontal,
  X,
  ChevronDown,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { archiveCatalogProducts, publishProductToApi, unpublishProductFromApi, updateCatalogProduct } from "@/lib/api/use-catalog-products";
import { type Product, type ProductStatus, type StockStatusLabel } from "@/lib/mock-data/products";
import type { Category } from "@/lib/mock-data/categories";
import { categoriesFlat as defaultCategoriesFlat } from "@/lib/mock-data/categories";
import { getProductCategoryDisplay } from "@/lib/category-utils";
import { cn, formatCurrency } from "@/lib/utils";
import { useIsDark } from "@/lib/use-is-dark";
import { useAdminCanWrite } from "@/lib/hooks/use-admin-can-write";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/native-select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SlugCellEditor } from "@/components/data-grid/slug-cell-editor";
import { slugCellClassRules } from "@/components/data-grid/slug-cell-rules";
import { slugHasError, validateSlug } from "@/lib/url-slug/validate-slug";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductMobileCards } from "@/components/products/product-mobile-cards";
import { PriceRangeFilter, DEFAULT_PRICE_CEILING } from "@/components/products/price-range-filter";
import { WebsiteBadge } from "@/components/products/website-badge";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";
import {
  isProductOnWebsite,
  publishProductToWebsite,
  removeProductFromWebsite,
} from "@/lib/catalog/website-visibility";

const PAGE_SIZE = 25;
const UPDATED_BY = ["Admin", "Sadia Rahman", "Rahim Uddin", "Manager"];
const STOCK_STATUSES: StockStatusLabel[] = ["In Stock", "Low Stock", "Out of Stock", "Pre-order"];

const COLUMN_KEYS = [
  "thumbnail",
  "productId",
  "sku",
  "slug",
  "price",
  "offerPrice",
  "stock",
  "stockStatus",
  "status",
  "onWeb",
  "seoTitle",
  "brand",
  "category",
  "updatedAt",
] as const;
type ColumnKey = (typeof COLUMN_KEYS)[number];

const COLUMN_LABELS: Record<ColumnKey, string> = {
  thumbnail: "Image",
  productId: "Product ID",
  sku: "SKU",
  slug: "Slug",
  price: "Price",
  offerPrice: "Offer price",
  stock: "Stock",
  stockStatus: "Stock Status",
  status: "Status",
  onWeb: "Web",
  seoTitle: "SEO Title",
  brand: "Brand",
  category: "Category",
  updatedAt: "Updated",
};

const DEFAULT_VISIBLE: Record<ColumnKey, boolean> = {
  thumbnail: true,
  productId: false,
  sku: true,
  slug: false,
  price: true,
  offerPrice: false,
  stock: true,
  stockStatus: false,
  status: true,
  onWeb: true,
  seoTitle: false,
  brand: true,
  category: true,
  updatedAt: true,
};

const FILTER_VISIBILITY_KEYS = [
  "search",
  "website",
  "status",
  "category",
  "brand",
  "stock",
  "stockStatus",
  "price",
] as const;
type FilterVisibilityKey = (typeof FILTER_VISIBILITY_KEYS)[number];

const FILTER_LABELS: Record<FilterVisibilityKey, string> = {
  search: "Search",
  website: "Website",
  status: "Status",
  category: "Category",
  brand: "Brand",
  stock: "Stock",
  stockStatus: "Stock Status",
  price: "Price range",
};

const FILTER_HINTS: Record<FilterVisibilityKey, string> = {
  search: "SKU, name search",
  website: "On website / Not on website",
  status: "Published / Draft / Archived",
  category: "Category search dropdown",
  brand: "Brand search dropdown",
  stock: "In stock / Low / Out of stock",
  stockStatus: "In Stock / Low Stock / Out of Stock / Pre-order",
  price: "Drag slider to set min–max",
};

const DEFAULT_VISIBLE_FILTERS: Record<FilterVisibilityKey, boolean> = {
  search: true,
  website: true,
  status: false,
  category: true,
  brand: true,
  stock: true,
  stockStatus: false,
  price: false,
};

const LIVE_EDIT_TOGGLES = [
  "category",
  "brand",
  "slug",
  "sku",
  "price",
  "offerPrice",
  "stock",
  "stockStatus",
  "status",
  "seoTitle",
] as const;
type LiveEditKey = (typeof LIVE_EDIT_TOGGLES)[number];

const LIVE_EDIT_LABELS: Record<LiveEditKey, string> = {
  category: "Category",
  brand: "Brand",
  slug: "Slug",
  sku: "SKU",
  price: "Price",
  offerPrice: "Offer price",
  stock: "Stock",
  stockStatus: "Stock Status",
  status: "Status",
  seoTitle: "SEO Title",
};

const LIVE_EDIT_HINTS: Record<LiveEditKey, string> = {
  category: "Double-click Category · pick from list",
  brand: "Double-click Brand · pick from list",
  slug: "Double-click Slug column to edit in grid",
  sku: "Double-click cell to edit in grid",
  price: "Double-click cell to edit in grid",
  offerPrice: "Double-click cell to edit offer price in grid",
  stock: "Double-click cell to edit in grid",
  stockStatus: "Double-click cell · pick stock status",
  status: "Double-click cell · draft / published / archived",
  seoTitle: "Double-click SEO Title column to edit in grid",
};

const DEFAULT_LIVE_EDIT: Record<LiveEditKey, boolean> = {
  category: false,
  brand: false,
  slug: false,
  sku: true,
  price: true,
  offerPrice: false,
  stock: true,
  stockStatus: false,
  status: true,
  seoTitle: false,
};

const FORM_ONLY_FIELDS = [
  "Description & media",
  "SEO meta description",
  "Variants, attributes",
] as const;

function ProductCategoryLabel({ name, categories }: { name: string; categories: Category[] }) {
  const { label, parentPath } = getProductCategoryDisplay(name, categories);
  if (!parentPath) {
    return <span className="text-xs leading-tight">{label}</span>;
  }
  return (
    <div className="flex min-w-0 flex-col justify-center gap-0.5 py-0.5 leading-none">
      <span className="truncate text-[8px] text-muted-foreground/70">{parentPath}</span>
      <span className="text-[13px] font-medium leading-tight">{label}</span>
    </div>
  );
}

function ProductCategoryCell({ name, categories }: { name: string; categories: Category[] }) {
  return <ProductCategoryLabel name={name} categories={categories} />;
}

function FilterDropdownSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div
      className="border-b border-input p-1.5"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-7 pl-7 text-xs"
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

function categoryMatchesSearch(name: string, query: string, categories: Category[]) {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const category = categories.find((c) => c.name === name);
  if (!category) return name.toLowerCase().includes(q);

  const { label, parentPath } = getProductCategoryDisplay(category.name, categories);
  const haystack = [category.name, category.caption, label, parentPath ?? "", category.slug]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

function CategoryFilterDropdown({
  value,
  onChange,
  categories,
}: {
  value: string;
  onChange: (value: string) => void;
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(
    () => categories.filter((category) => categoryMatchesSearch(category.name, search, categories)),
    [categories, search],
  );

  const selectValue = (next: string) => {
    onChange(next);
    setOpen(false);
    setSearch("");
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-8 w-[172px] justify-between gap-1 px-2.5 text-left font-normal"
        >
          <span className="min-w-0 flex-1 overflow-hidden">
            {value === "all" ? (
              <span className="text-xs">All categories</span>
            ) : (
              <ProductCategoryLabel name={value} categories={categories} />
            )}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px] overflow-hidden p-0">
        <FilterDropdownSearch
          value={search}
          onChange={setSearch}
          placeholder="Search category…"
        />
        <div className="max-h-60 overflow-y-auto p-1">
          <DropdownMenuItem
            className={cn("items-start rounded-sm py-2", value === "all" && "bg-accent")}
            onClick={() => selectValue("all")}
          >
            <span className="text-xs">All categories</span>
          </DropdownMenuItem>
          {filteredCategories.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">No categories found</p>
          ) : (
            filteredCategories.map((category) => (
              <DropdownMenuItem
                key={category.id}
                className={cn("items-start rounded-sm py-2", value === category.name && "bg-accent")}
                onClick={() => selectValue(category.name)}
              >
                <ProductCategoryLabel name={category.name} categories={categories} />
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BrandFilterDropdown({
  value,
  onChange,
  brands,
}: {
  value: string;
  onChange: (value: string) => void;
  brands: string[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredBrands = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((brand) => brand.toLowerCase().includes(q));
  }, [search, brands]);

  const selectValue = (next: string) => {
    onChange(next);
    setOpen(false);
    setSearch("");
  };

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-8 w-[148px] justify-between gap-1 px-2.5 text-left font-normal"
        >
          <span className="min-w-0 flex-1 truncate text-xs">
            {value === "all" ? "All brands" : value}
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[180px] overflow-hidden p-0">
        <FilterDropdownSearch
          value={search}
          onChange={setSearch}
          placeholder="Search brand…"
        />
        <div className="max-h-60 overflow-y-auto p-1">
          <DropdownMenuItem
            className={cn("rounded-sm", value === "all" && "bg-accent")}
            onClick={() => selectValue("all")}
          >
            <span className="text-xs">All brands</span>
          </DropdownMenuItem>
          {filteredBrands.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">No brands found</p>
          ) : (
            filteredBrands.map((brand) => (
              <DropdownMenuItem
                key={brand}
                className={cn("rounded-sm", value === brand && "bg-accent")}
                onClick={() => selectValue(brand)}
              >
                <span className="text-xs">{brand}</span>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const variant =
    status === "published" ? "success" : status === "draft" ? "warning" : "muted";
  return <Badge variant={variant} className="capitalize">{status}</Badge>;
}

function StockStatusBadge({ status }: { status: StockStatusLabel }) {
  const variant =
    status === "In Stock"
      ? "success"
      : status === "Low Stock"
        ? "warning"
        : status === "Pre-order"
          ? "default"
          : "muted";
  return <Badge variant={variant}>{status}</Badge>;
}

type FilterState = {
  search: string;
  website: string;
  status: string;
  category: string;
  brand: string;
  stock: string;
  stockStatus: string;
  priceMin: string;
  priceMax: string;
};

const DEFAULT_FILTERS: FilterState = {
  search: "",
  website: "all",
  status: "all",
  category: "all",
  brand: "all",
  stock: "all",
  stockStatus: "all",
  priceMin: "",
  priceMax: "",
};

function countAdvancedFilters(f: FilterState) {
  let n = 0;
  if (f.category !== "all") n++;
  if (f.brand !== "all") n++;
  if (f.stock !== "all") n++;
  if (f.stockStatus !== "all") n++;
  if (f.priceMin) n++;
  if (f.priceMax) n++;
  return n;
}

function applyFilters(rows: Product[], f: FilterState, categories: Category[]) {
  const q = f.search.toLowerCase();
  const min = f.priceMin ? Number(f.priceMin) : null;
  const max = f.priceMax ? Number(f.priceMax) : null;

  return rows.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q) && !p.sku.toLowerCase().includes(q)) return false;
    if (f.website === "on" && !isProductOnWebsite(p, categories)) return false;
    if (f.website === "off" && isProductOnWebsite(p, categories)) return false;
    if (f.status !== "all" && p.status !== f.status) return false;
    if (f.category !== "all" && p.category !== f.category) return false;
    if (f.brand !== "all" && p.brand !== f.brand) return false;
    if (f.stock === "low" && (p.stock > 20 || p.stock === 0)) return false;
    if (f.stock === "out" && p.stock !== 0) return false;
    if (f.stock === "in" && p.stock === 0) return false;
    if (f.stockStatus !== "all" && p.stockStatus !== f.stockStatus) return false;
    if (min !== null && p.price < min) return false;
    if (max !== null && p.price > max) return false;
    return true;
  });
}

type Props = {
  onEdit: (product: Product) => void;
  onView: (product: Product) => void;
  products: Product[];
  categories?: Category[];
  loading?: boolean;
  onProductsChanged?: () => void;
  className?: string;
};

export function ProductGrid({
  onEdit,
  onView,
  products,
  categories = defaultCategoriesFlat,
  loading = false,
  onProductsChanged,
  className,
}: Props) {
  const isDark = useIsDark();
  const canWrite = useAdminCanWrite();
  const filterCategories = useMemo(
    () => categories.filter((c) => c.active).sort((a, b) => a.name.localeCompare(b.name)),
    [categories],
  );
  const categoryNames = useMemo(() => filterCategories.map((c) => c.name), [filterCategories]);
  const priceCeiling = useMemo(() => {
    if (products.length === 0) return DEFAULT_PRICE_CEILING;
    return Math.ceil(Math.max(...products.map((p) => p.price)) / 1000) * 1000;
  }, [products]);
  const brands = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.brand) set.add(p.brand);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [products]);
  const [rowData, setRowData] = useState(products);

  useEffect(() => {
    setRowData((prev) => {
      const prevMap = new Map(prev.map((p) => [p.id, p]));
      return products.map((p) => prevMap.get(p.id) ?? p);
    });
  }, [products]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [columnSheetOpen, setColumnSheetOpen] = useState(false);
  const [liveEditSheetOpen, setLiveEditSheetOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE);
  const [visibleFilters, setVisibleFilters] = useState(DEFAULT_VISIBLE_FILTERS);
  const [liveEdit, setLiveEdit] = useState(DEFAULT_LIVE_EDIT);
  const [selected, setSelected] = useState<Product[]>([]);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveTargets, setArchiveTargets] = useState<Product[]>([]);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => applyFilters(rowData, filters, categories), [rowData, filters, categories]);
  const advancedCount = countAdvancedFilters(filters);

  const archiveProducts = useCallback(
    async (targets: Product[]) => {
      try {
        await archiveCatalogProducts(targets.map((t) => t.id));
        setRowData((rows) =>
          rows.map((r) =>
            targets.some((t) => t.id === r.id) ? { ...r, status: "archived" as ProductStatus } : r,
          ),
        );
        toast.success(`Archived ${targets.length} product${targets.length > 1 ? "s" : ""}`);
        onProductsChanged?.();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to archive products");
      } finally {
        setArchiveOpen(false);
        setArchiveTargets([]);
        setSelected([]);
      }
    },
    [onProductsChanged],
  );

  const openArchiveConfirm = useCallback((targets: Product[]) => {
    setArchiveTargets(targets);
    setArchiveOpen(true);
  }, []);

  const ProductRowMenu = useCallback(
    ({ data }: { data: Product }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onView(data)}>
            <Eye className="mr-2 h-3.5 w-3.5" /> View
          </DropdownMenuItem>
          {canWrite && (
            <>
              <DropdownMenuItem onClick={() => onEdit(data)}>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              {!isProductOnWebsite(data, categories) && data.status !== "archived" && (
                <DropdownMenuItem
                  onClick={() => {
                    void (async () => {
                      try {
                        const updated = await publishProductToApi(data.id);
                        setRowData((rows) =>
                          rows.map((r) => (r.id === data.id ? { ...r, ...updated } : r)),
                        );
                        toast.success(`"${data.name}" published to website`);
                        onProductsChanged?.();
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Publish failed");
                      }
                    })();
                  }}
                >
                  <Globe className="mr-2 h-3.5 w-3.5" /> Publish to website
                </DropdownMenuItem>
              )}
              {isProductOnWebsite(data, categories) && (
                <DropdownMenuItem
                  onClick={() => {
                    void (async () => {
                      try {
                        const updated = await unpublishProductFromApi(data.id);
                        setRowData((rows) =>
                          rows.map((r) => (r.id === data.id ? { ...r, ...updated } : r)),
                        );
                        toast.success(`"${data.name}" removed from website`);
                        onProductsChanged?.();
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Unpublish failed");
                      }
                    })();
                  }}
                >
                  <Globe className="mr-2 h-3.5 w-3.5" /> Remove from website
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => openArchiveConfirm([data])}
                className="text-destructive"
              >
                <Archive className="mr-2 h-3.5 w-3.5" /> Archive
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    [onView, onEdit, openArchiveConfirm, canWrite, categories, onProductsChanged],
  );

  const ProductActionCell = useCallback(
    (p: ICellRendererParams<Product>) => {
      if (!p.data) return null;
      return (
        <div className="flex items-center justify-center gap-0">
          <ActivityTriggerButton
            entity={{
              type: "product",
              id: p.data.id,
              label: p.data.name,
              subtitle: `SKU ${p.data.sku}`,
            }}
          />
          <ProductRowMenu data={p.data} />
        </div>
      );
    },
    [ProductRowMenu],
  );

  const columnDefs = useMemo<ColDef<Product>[]>(
    () => [
      {
        headerCheckboxSelection: canWrite,
        checkboxSelection: canWrite,
        width: 32,
        maxWidth: 32,
        headerClass: "product-grid-select-col",
        cellClass: "product-grid-select-col",
        pinned: "left",
        resizable: false,
        suppressMovable: true,
        suppressHeaderMenuButton: true,
        sortable: false,
      },
      {
        colId: "productId",
        field: "id",
        headerName: "Product ID",
        hide: !visibleCols.productId,
        pinned: "left",
        width: 100,
        minWidth: 88,
        resizable: true,
        suppressMovable: true,
        sortable: false,
        suppressHeaderMenuButton: true,
      },
      {
        colId: "thumbnail",
        field: "thumbnail",
        headerName: "",
        width: 36,
        maxWidth: 36,
        hide: !visibleCols.thumbnail,
        resizable: false,
        suppressMovable: true,
        sortable: false,
        suppressHeaderMenuButton: true,
        cellClass: "product-grid-icon-col",
        cellRenderer: (p: ICellRendererParams<Product>) =>
          p.data ? (
            <img src={p.data.thumbnail} alt="" className="h-7 w-7 rounded object-cover" />
          ) : null,
      },
      {
        field: "name",
        headerName: "Name",
        width: 280,
        minWidth: 120,
        maxWidth: 720,
        resizable: true,
        suppressMovable: false,
        editable: false,
        tooltipField: "name",
        cellRenderer: (p: ICellRendererParams<Product>) =>
          p.data ? (
            <button
              type="button"
              className="block w-full truncate text-left font-semibold text-foreground hover:underline focus-visible:outline-none"
              title={p.data.name}
              onClick={(e) => {
                e.stopPropagation();
                onView(p.data!);
              }}
            >
              {p.data.name}
            </button>
          ) : null,
      },
      {
        field: "sku",
        headerName: "SKU",
        hide: !visibleCols.sku,
        editable: canWrite && liveEdit.sku,
        width: 110,
        minWidth: 80,
      },
      {
        field: "slug",
        headerName: "Slug",
        hide: !visibleCols.slug,
        editable: canWrite && liveEdit.slug,
        width: 180,
        minWidth: 120,
        cellEditor: liveEdit.slug ? SlugCellEditor : undefined,
        cellClassRules: slugCellClassRules,
      },
      {
        field: "price",
        headerName: "Price",
        hide: !visibleCols.price,
        editable: canWrite && liveEdit.price,
        width: 100,
        valueFormatter: (p) => formatCurrency(p.value ?? 0),
      },
      {
        field: "offerPrice",
        headerName: "Offer price",
        hide: !visibleCols.offerPrice,
        editable: canWrite && liveEdit.offerPrice,
        width: 110,
        valueFormatter: (p) =>
          p.value != null && p.value !== "" ? formatCurrency(Number(p.value)) : "—",
      },
      {
        field: "stock",
        headerName: "Stock",
        hide: !visibleCols.stock,
        editable: canWrite && liveEdit.stock,
        width: 80,
      },
      {
        field: "stockStatus",
        headerName: "Stock Status",
        hide: !visibleCols.stockStatus,
        editable: canWrite && liveEdit.stockStatus,
        cellEditor: liveEdit.stockStatus ? "agSelectCellEditor" : undefined,
        cellEditorParams: liveEdit.stockStatus ? { values: STOCK_STATUSES } : undefined,
        cellRenderer: (p: ICellRendererParams<Product>) =>
          p.data ? <StockStatusBadge status={p.data.stockStatus} /> : null,
        width: 120,
      },
      {
        field: "status",
        headerName: "Status",
        hide: !visibleCols.status,
        editable: canWrite && liveEdit.status,
        cellEditor: liveEdit.status ? "agSelectCellEditor" : undefined,
        cellEditorParams: liveEdit.status
          ? { values: ["draft", "published", "archived"] }
          : undefined,
        cellRenderer: (p: ICellRendererParams<Product>) =>
          p.data ? <StatusBadge status={p.data.status} /> : null,
        width: 110,
      },
      {
        colId: "onWeb",
        headerName: "Web",
        hide: !visibleCols.onWeb,
        width: 64,
        maxWidth: 72,
        sortable: true,
        valueGetter: (p) => (p.data && isProductOnWebsite(p.data, categories) ? 1 : 0),
        cellRenderer: (p: ICellRendererParams<Product>) =>
          p.data ? <WebsiteBadge product={p.data} /> : null,
        cellClass: "product-grid-icon-col",
      },
      {
        field: "seoTitle",
        headerName: "SEO Title",
        hide: !visibleCols.seoTitle,
        editable: canWrite && liveEdit.seoTitle,
        width: 220,
        minWidth: 140,
        tooltipField: "seoTitle",
      },
      {
        field: "category",
        headerName: "Category",
        width: 140,
        hide: !visibleCols.category,
        editable: canWrite && liveEdit.category,
        cellEditor: liveEdit.category ? "agSelectCellEditor" : undefined,
        cellEditorParams: liveEdit.category ? { values: categoryNames } : undefined,
        cellRenderer: (p: ICellRendererParams<Product>) =>
          p.data ? <ProductCategoryCell name={p.data.category} categories={categories} /> : null,
        autoHeight: true,
      },
      {
        field: "brand",
        headerName: "Brand",
        width: 100,
        hide: !visibleCols.brand,
        editable: canWrite && liveEdit.brand,
        cellEditor: liveEdit.brand ? "agSelectCellEditor" : undefined,
        cellEditorParams: liveEdit.brand ? { values: brands } : undefined,
      },
      {
        field: "updatedAt",
        headerName: "Updated",
        width: 100,
        hide: !visibleCols.updatedAt,
        valueFormatter: (p) => (p.value ? String(p.value).slice(0, 10) : ""),
      },
      {
        colId: "updatedBy",
        headerName: "Updated By",
        width: 110,
        valueGetter: (p) => {
          if (!p.data) return "";
          const n = parseInt(p.data.id.replace(/\D/g, ""), 10) || 0;
          return UPDATED_BY[n % UPDATED_BY.length];
        },
      },
      {
        colId: "actions",
        headerName: "Action",
        width: 72,
        maxWidth: 72,
        pinned: "right",
        resizable: false,
        suppressMovable: true,
        sortable: false,
        suppressHeaderMenuButton: true,
        cellClass: "product-grid-icon-col",
        cellRenderer: ProductActionCell,
      },
    ],
    [onView, visibleCols, liveEdit, ProductActionCell, brands, canWrite, categories, categoryNames],
  );

  const onCellValueChanged = useCallback(
    (e: { data: Product; colDef: { field?: string } }) => {
      setRowData((rows) =>
        rows.map((r) => (r.id === e.data.id ? { ...e.data } : r)),
      );
      const field = e.colDef.field;
      if (field === "slug" && slugHasError(e.data.slug, { id: e.data.id })) {
        const validation = validateSlug(e.data.slug, { id: e.data.id });
        toast.error(validation.message ?? "Slug already in use");
        return;
      }
      if (!canWrite || !field) return;
      void (async () => {
        try {
          const patch: Record<string, unknown> = {};
          if (field === "slug") patch.slug = e.data.slug;
          if (field === "sku") patch.sku = e.data.sku;
          if (field === "price") patch.price = e.data.price;
          if (field === "stock") patch.stock = e.data.stock;
          if (field === "status") patch.status = e.data.status;
          if (field === "category") patch.category = e.data.category;
          if (field === "brand") patch.brand = e.data.brand;
          if (field === "seoTitle") patch.seo_title = e.data.seoTitle;
          if (Object.keys(patch).length === 0) return;
          await updateCatalogProduct(e.data.id, patch);
          toast.success(`Updated ${field} for ${e.data.sku}`);
          onProductsChanged?.();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Update failed");
        }
      })();
    },
    [canWrite, onProductsChanged],
  );

  const pageStart = page * PAGE_SIZE + 1;
  const pageEnd = Math.min((page + 1) * PAGE_SIZE, filtered.length);

  const toggleVisibleFilter = (key: FilterVisibilityKey, enabled: boolean) => {
    setVisibleFilters((v) => ({ ...v, [key]: enabled }));
    if (!enabled) {
      setFilters((f) => ({
        ...f,
        ...(key === "search" ? { search: "" } : {}),
        ...(key === "website" ? { website: "all" } : {}),
        ...(key === "status" ? { status: "all" } : {}),
        ...(key === "category" ? { category: "all" } : {}),
        ...(key === "brand" ? { brand: "all" } : {}),
        ...(key === "stock" ? { stock: "all" } : {}),
        ...(key === "stockStatus" ? { stockStatus: "all" } : {}),
        ...(key === "price" ? { priceMin: "", priceMax: "" } : {}),
      }));
    }
  };

  const resetAllFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
  };

  return (
    <div className={cn("relative flex min-h-0 flex-col gap-3", className)}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/60">
          <p className="text-sm text-muted-foreground">Loading products from API…</p>
        </div>
      )}
      {/* Filter bar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {visibleFilters.search && (
          <Input
            placeholder="Search SKU, name…"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="max-w-[220px]"
          />
        )}
        {visibleFilters.website && (
          <Select
            value={filters.website}
            onChange={(e) => setFilters((f) => ({ ...f, website: e.target.value }))}
            className="w-[152px]"
            aria-label="Website visibility"
          >
            <option value="all">All products</option>
            <option value="on">On website</option>
            <option value="off">Not on website</option>
          </Select>
        )}
        {visibleFilters.status && (
          <Select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="w-[128px]"
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </Select>
        )}
        {visibleFilters.category && (
          <CategoryFilterDropdown
            value={filters.category}
            onChange={(category) => setFilters((f) => ({ ...f, category }))}
            categories={filterCategories}
          />
        )}
        {visibleFilters.brand && (
          <BrandFilterDropdown
            value={filters.brand}
            onChange={(brand) => setFilters((f) => ({ ...f, brand }))}
            brands={brands}
          />
        )}
        {visibleFilters.stock && (
          <Select
            value={filters.stock}
            onChange={(e) => setFilters((f) => ({ ...f, stock: e.target.value }))}
            className="w-[148px]"
          >
            <option value="all">Any stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </Select>
        )}
        {visibleFilters.stockStatus && (
          <Select
            value={filters.stockStatus}
            onChange={(e) => setFilters((f) => ({ ...f, stockStatus: e.target.value }))}
            className="w-[148px]"
          >
            <option value="all">All stock statuses</option>
            {STOCK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        )}
        {visibleFilters.price && (
          <PriceRangeFilter
            valueMin={filters.priceMin}
            valueMax={filters.priceMax}
            priceCeiling={priceCeiling}
            onChange={(priceMin, priceMax) =>
              setFilters((f) => ({ ...f, priceMin, priceMax }))
            }
          />
        )}
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => setFilterSheetOpen(true)}
        >
          <Filter className="mr-1.5 h-3.5 w-3.5" />
          Filters
          {advancedCount > 0 && (
            <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
              {advancedCount}
            </span>
          )}
        </Button>
        {canWrite && (
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => setLiveEditSheetOpen(true)}
          >
            <MousePointerClick className="mr-1.5 h-3.5 w-3.5" />
            Live edit
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => setColumnSheetOpen(true)}
        >
          <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
          Columns
        </Button>
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && canWrite && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-xs font-medium">{selected.length} selected</span>
          <Button
            size="sm"
            onClick={() => {
              void (async () => {
                try {
                  await Promise.all(selected.map((p) => publishProductToApi(p.id)));
                  setRowData((rows) =>
                    rows.map((r) =>
                      selected.some((s) => s.id === r.id)
                        ? publishProductToWebsite(r)
                        : r,
                    ),
                  );
                  toast.success(`Published ${selected.length} product${selected.length > 1 ? "s" : ""} to website`);
                  setSelected([]);
                  onProductsChanged?.();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Bulk publish failed");
                }
              })();
            }}
          >
            <Globe className="mr-1.5 h-3.5 w-3.5" />
            Publish to website
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void (async () => {
                try {
                  await Promise.all(selected.map((p) => unpublishProductFromApi(p.id)));
                  setRowData((rows) =>
                    rows.map((r) =>
                      selected.some((s) => s.id === r.id)
                        ? removeProductFromWebsite(r)
                        : r,
                    ),
                  );
                  toast.success(`Removed ${selected.length} product${selected.length > 1 ? "s" : ""} from website`);
                  setSelected([]);
                  onProductsChanged?.();
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Bulk unpublish failed");
                }
              })();
            }}
          >
            Remove from website
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => openArchiveConfirm(selected)}
          >
            Bulk archive
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Export started (mock CSV)")}
          >
            Export selected
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

      {/* Desktop grid — fills remaining viewport */}
      <div className="hidden min-h-0 flex-1 flex-col md:flex">
        {filtered.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-input bg-card">
            <p className="text-sm font-medium">No products match your filters</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create your first product or clear filters
            </p>
            <Button
              size="sm"
              className="mt-4"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "ag-theme-quartz control-border h-0 min-h-0 flex-1 overflow-hidden rounded-md bg-card [&_.ag-root-wrapper]:h-full",
              isDark && "ag-theme-quartz-dark",
            )}
          >
            <AgGridReact
             theme="legacy"
              rowData={filtered}
              columnDefs={columnDefs}
              defaultColDef={{
                sortable: true,
                resizable: true,
                filter: false,
                suppressHeaderMenuButton: true,
                suppressMovable: false,
                minWidth: 72,
              }}
              rowSelection="multiple"
              suppressRowClickSelection
              animateRows
              enableBrowserTooltips
              tooltipShowDelay={400}
              colResizeDefault="shift"
              onCellValueChanged={onCellValueChanged}
              onSelectionChanged={(e) => setSelected(e.api.getSelectedRows())}
              pagination
              paginationPageSize={PAGE_SIZE}
              onPaginationChanged={(e) => setPage(e.api.paginationGetCurrentPage())}
            />
          </div>
        )}
        {filtered.length > 0 && (
          <p className="shrink-0 pt-1 text-xs text-muted-foreground">
            Showing {pageStart}–{pageEnd} of {filtered.length}
            {filtered.length !== rowData.length && ` (filtered from ${rowData.length})`}
            {" · "}drag column edges to resize · drag headers to reorder
          </p>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        <ProductMobileCards
          products={filtered.slice(0, 50)}
          onView={onView}
          onEdit={onEdit}
          onArchive={(p) => openArchiveConfirm([p])}
        />
        {filtered.length > 50 && (
          <p className="text-center text-xs text-muted-foreground">
            Showing 50 of {filtered.length} — use desktop for full list
          </p>
        )}
      </div>

      {/* Filters sheet — show/hide toolbar filters */}
      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
          <h2 className="pr-8 text-base font-semibold">Filters</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose which filters show in the toolbar above the list.
          </p>
          <div className="mt-4 space-y-2">
            {FILTER_VISIBILITY_KEYS.map((key) => (
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
          <Button variant="outline" size="sm" className="mt-4" onClick={resetAllFilters}>
            Reset all filters
          </Button>
        </SheetContent>
      </Sheet>

      {/* Live edit sheet */}
      <Sheet open={liveEditSheetOpen} onOpenChange={setLiveEditSheetOpen}>
        <SheetContent side="right" className="w-full max-w-sm">
          <h2 className="pr-8 text-base font-semibold">Live edit</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose which fields you can edit directly in the grid without opening the form.
          </p>
          <div className="mt-4 space-y-3">
            {LIVE_EDIT_TOGGLES.map((key) => (
              <label key={key} className="flex cursor-pointer gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={liveEdit[key]}
                  onChange={(e) =>
                    setLiveEdit((v) => ({ ...v, [key]: e.target.checked }))
                  }
                  className="mt-0.5 rounded border-input"
                />
                <span>
                  <span className="font-medium">{LIVE_EDIT_LABELS[key]}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {LIVE_EDIT_HINTS[key]}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-5 border-t border-input pt-4">
            <p className="text-xs font-medium text-muted-foreground">Edit form only</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {FORM_ONLY_FIELDS.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setLiveEdit(DEFAULT_LIVE_EDIT)}
          >
            Reset live edit
          </Button>
        </SheetContent>
      </Sheet>

      {/* Column visibility sheet */}
      <Sheet open={columnSheetOpen} onOpenChange={setColumnSheetOpen}>
        <SheetContent side="right" className="w-full max-w-xs">
          <h2 className="pr-8 text-base font-semibold">Columns</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose which columns show in the list. Name and actions always stay visible.
          </p>
          <div className="mt-4 space-y-2">
            {COLUMN_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={visibleCols[key]}
                  onChange={(e) =>
                    setVisibleCols((v) => ({ ...v, [key]: e.target.checked }))
                  }
                  className="rounded border-input"
                />
                {COLUMN_LABELS[key]}
              </label>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setVisibleCols(DEFAULT_VISIBLE)}
          >
            Reset columns
          </Button>
        </SheetContent>
      </Sheet>

      {/* Archive confirm */}
      <Dialog.Root open={archiveOpen} onOpenChange={setArchiveOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(400px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-input bg-background p-6 shadow-xl">
            <Dialog.Title className="text-base font-semibold">Archive products?</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              {archiveTargets.length === 1
                ? `"${archiveTargets[0]?.name}" will be archived.`
                : `${archiveTargets.length} products will be archived.`}
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setArchiveOpen(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => void archiveProducts(archiveTargets)}
              >
                Archive
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
