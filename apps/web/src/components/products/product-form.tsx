"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  ImagePlus,
  Layers,
  Package,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Warehouse,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductStatus, ProductVisibility } from "@/lib/mock-data/products";
import type { VariantMatrixRow } from "@/lib/mock-data/variants";
import {
  createCatalogProduct,
  checkCatalogProductSlug,
  replaceProductMedia,
  replaceProductVariants,
  updateCatalogProduct,
  upsertProductInventory,
  type VariantUpsertInput,
} from "@/lib/api/use-catalog-products";
import type { ProductSpecsDraft, CustomSpecGroup, CustomSpecAttr } from "@/components/specifications/product-spec-editor";
import { useCatalogProduct } from "@/lib/api/use-catalog-product";
import { useCatalogCategories, createCatalogCategory } from "@/lib/api/use-catalog-categories";
import { useCatalogBrands, createCatalogBrand } from "@/lib/api/use-catalog-brands";
import { CategoryFormDialog } from "@/components/categories/category-form-dialog";
import { CategoryCombobox } from "@/components/categories/category-combobox";
import { BrandFormDialog } from "@/components/brands/brand-form-dialog";
import { BrandCombobox } from "@/components/brands/brand-combobox";
import type { Category } from "@/lib/mock-data/categories";
import { useCatalogMedia, uploadCatalogMediaFiles, createCatalogMediaBatch } from "@/lib/api/use-catalog-media";
import { fetchProductStockLevels } from "@/lib/api/inventory";
import { updateInventoryStock, useInventoryWarehouses } from "@/lib/api/use-inventory";
import { useInventoryModuleEnabled } from "@/lib/hooks/use-inventory-module-enabled";
import { slugHasError } from "@/lib/url-slug/validate-slug";
import { PRODUCT_FIELD_LIMITS, truncateToLimit } from "@/lib/catalog/product-field-limits";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { SlugInput } from "@/components/ui/slug-input";
import { RichTextEditor } from "@/components/products/rich-text-editor";
import { AgaincartClassicEditor } from "@/components/products/againcart-classic-editor";
import { MediaLibraryModal } from "@/components/media/media-library-modal";
import type { MediaLibraryItem } from "@/lib/mock-data/media-library";
import { ProductSpecEditor } from "@/components/specifications/product-spec-editor";
import { ProductVariantEditor } from "@/components/products/product-variant-editor";
import { MediaGallery } from "@/components/products/media-gallery";
import { DigitalFilesSection, flushPendingDigitalFiles } from "@/components/products/digital-files-section";
import type { PendingFile } from "@/components/products/digital-files-section";
import type { DigitalFile } from "@/lib/api/catalog-products";
import { fetchDigitalFiles } from "@/lib/api/catalog-products";
import { ActivityTriggerButton } from "@/components/activity/activity-trigger-button";

const SECTIONS = [
  { id: "general", label: "General", icon: Package },
  { id: "media", label: "Media", icon: ImagePlus },
  { id: "pricing", label: "Pricing & Inventory", icon: Tag },
  { id: "variants", label: "Variants", icon: Layers },
  { id: "specifications", label: "Specifications", icon: SlidersHorizontal },
  { id: "digital", label: "Digital Files", icon: Download },
  { id: "seo", label: "SEO", icon: Search },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export type ProductFormValues = {
  name: string;
  sku: string;
  category: string;
  categoryId: string;
  brand: string;
  brandId: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  tags: string;
  shortDescription: string;
  description: string;
  price: string;
  compareAtPrice: string;
  cost: string;
  stock: string;
  trackInventory: boolean;
  warehouseId: string;
  lowStockAlert: string;
  productType: "simple" | "variable" | "digital";
  warranty: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
};

const DEFAULT_VALUES: ProductFormValues = {
  name: "",
  sku: "",
  category: "",
  categoryId: "",
  brand: "",
  brandId: "",
  status: "draft",
  visibility: "public",
  tags: "",
  shortDescription: "",
  description: "",
  price: "",
  compareAtPrice: "",
  cost: "",
  stock: "0",
  trackInventory: true,
  warehouseId: "",
  lowStockAlert: "10",
  productType: "simple",
  warranty: "",
  metaTitle: "",
  metaDescription: "",
  slug: "",
};


type Props = {
  mode?: "create" | "edit";
  initialProduct?: Product;
  compact?: boolean;
  inDialog?: boolean;
  onClose?: () => void;
  onSaved?: () => void;
};

function slugifyName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return truncateToLimit(slug, PRODUCT_FIELD_LIMITS.slug).replace(/-+$/g, "") || "product";
}

const FIELD_LABELS: Record<string, string> = {
  name: "Product name",
  slug: "URL slug",
  sku: "SKU",
  seo_title: "Meta title",
  brand: "Brand",
  category: "Category",
  thumbnail: "Thumbnail URL",
};

function validateProductFieldLengths(
  values: ProductFormValues,
  slug: string,
  variantRows: VariantMatrixRow[],
): { message: string; section: SectionId } | null {
  const checks: { key: keyof typeof FIELD_LABELS; value: string; section: SectionId; limit: number }[] = [
    { key: "name", value: values.name.trim(), section: "general", limit: PRODUCT_FIELD_LIMITS.name },
    { key: "slug", value: slug, section: "seo", limit: PRODUCT_FIELD_LIMITS.slug },
    { key: "sku", value: values.sku.trim(), section: "general", limit: PRODUCT_FIELD_LIMITS.sku },
    { key: "seo_title", value: values.metaTitle.trim(), section: "seo", limit: PRODUCT_FIELD_LIMITS.seoTitle },
    { key: "brand", value: values.brand.trim(), section: "general", limit: PRODUCT_FIELD_LIMITS.brand },
    { key: "category", value: values.category.trim(), section: "general", limit: PRODUCT_FIELD_LIMITS.category },
  ];

  for (const { key, value, section, limit } of checks) {
    if (!value) continue;
    if (value.length > limit) {
      return {
        message: `${FIELD_LABELS[key]} must be ${limit} characters or less (currently ${value.length})`,
        section,
      };
    }
  }

  for (const row of variantRows) {
    if (row.label.trim().length > PRODUCT_FIELD_LIMITS.variantName) {
      return {
        message: `Variant name must be ${PRODUCT_FIELD_LIMITS.variantName} characters or less`,
        section: "variants",
      };
    }
    if (row.sku.trim().length > PRODUCT_FIELD_LIMITS.variantSku) {
      return {
        message: `Variant SKU must be ${PRODUCT_FIELD_LIMITS.variantSku} characters or less`,
        section: "variants",
      };
    }
  }

  return null;
}

function variantsToRows(
  variants: {
    id: string;
    sku: string;
    name: string;
    price: string;
    stock: number;
    is_default: boolean;
    image_id?: string | null;
    image_url?: string | null;
  }[],
): VariantMatrixRow[] {
  return variants.map((v) => ({
    id: v.id,
    label: v.name,
    sku: v.sku,
    price: parseFloat(v.price) || 0,
    stock: v.stock,
    isDefault: v.is_default,
    dimensions: {},
    imageId: v.image_id ?? undefined,
    imageUrl: v.image_url ?? undefined,
  }));
}

function rowsToVariantUpserts(rows: VariantMatrixRow[]): VariantUpsertInput[] {
  return rows.map((row, idx) => ({
    id: row.id.startsWith("new_") ? undefined : row.id,
    sku: truncateToLimit(row.sku.trim(), PRODUCT_FIELD_LIMITS.variantSku),
    name: truncateToLimit(row.label.trim(), PRODUCT_FIELD_LIMITS.variantName),
    price: row.price,
    stock: row.stock,
    is_default: row.isDefault,
    sort_order: idx,
    image_id: row.imageId ?? null,
  }));
}

function buildProductPayload(
  values: ProductFormValues,
  publish: boolean,
  specProfileId?: string,
  thumbnail?: string,
  customSpecsJson?: string,
) {
  const name = truncateToLimit(values.name.trim(), PRODUCT_FIELD_LIMITS.name);
  const slug = truncateToLimit(
    values.slug.trim() || slugifyName(values.name),
    PRODUCT_FIELD_LIMITS.slug,
  ).replace(/-+$/g, "") || "product";
  const sku = truncateToLimit(values.sku.trim(), PRODUCT_FIELD_LIMITS.sku);

  return {
    name,
    slug,
    sku,
    price: parseFloat(values.price) || 0,
    compare_at_price: values.compareAtPrice ? parseFloat(values.compareAtPrice) : undefined,
    category: values.category
      ? truncateToLimit(values.category, PRODUCT_FIELD_LIMITS.category)
      : values.category,
    category_id: values.categoryId || null,
    brand: values.brand ? truncateToLimit(values.brand, PRODUCT_FIELD_LIMITS.brand) : values.brand,
    brand_id: values.brandId || null,
    attribute_profile_id: specProfileId || null,
    stock: parseInt(values.stock, 10) || 0,
    status: (publish ? "published" : values.status) as ProductStatus,
    product_type: values.productType,
    visibility: values.visibility,
    description: values.description.trim() || undefined,
    short_description: values.shortDescription.trim() || undefined,
    seo_title: values.metaTitle.trim()
      ? truncateToLimit(values.metaTitle.trim(), PRODUCT_FIELD_LIMITS.seoTitle)
      : undefined,
    seo_description: values.metaDescription.trim() || undefined,
    warranty: values.warranty.trim() || null,
    tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
    thumbnail: thumbnail ? truncateToLimit(thumbnail, PRODUCT_FIELD_LIMITS.thumbnail) : thumbnail,
    custom_specs_json: customSpecsJson ?? null,
  };
}

export function ProductForm({ mode = "create", initialProduct, compact, inDialog, onClose, onSaved }: Props) {
  const router = useRouter();
  const inventoryModuleEnabled = useInventoryModuleEnabled();
  const visibleSections = SECTIONS;
  const { categories, refetch: refetchCategories } = useCatalogCategories();
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const { brands, refetch: refetchBrands } = useCatalogBrands();
  const [addBrandOpen, setAddBrandOpen] = useState(false);
  const { warehouses } = useInventoryWarehouses(inventoryModuleEnabled);
  const { items: mediaItems, refetch: refetchMedia } = useCatalogMedia();
  const editId = mode === "edit" ? initialProduct?.id : undefined;
  const { product: productDetail, loading: detailLoading } = useCatalogProduct(editId);
  const [saving, setSaving] = useState(false);
  const [inventoryStockId, setInventoryStockId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState<SectionId>("general");
  const [autosave, setAutosave] = useState("All changes saved");
  const [productMedia, setProductMedia] = useState<MediaLibraryItem[]>([]);
  const [variantRows, setVariantRows] = useState<VariantMatrixRow[]>([]);
  const [specDraft, setSpecDraft] = useState<ProductSpecsDraft>({ profileId: "", valuesByAttributeId: {} });
  const [initialCustomGroups, setInitialCustomGroups] = useState<CustomSpecGroup[]>([]);
  const [initialCustomAttrs, setInitialCustomAttrs] = useState<CustomSpecAttr[]>([]);
  const [digitalFiles, setDigitalFiles] = useState<DigitalFile[]>([]);
  const [pendingDigitalFiles, setPendingDigitalFiles] = useState<PendingFile[]>([]);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [slugApiTaken, setSlugApiTaken] = useState(false);
  const [slugApiMessage, setSlugApiMessage] = useState<string | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  /* true once the user manually edits the slug field */
  const slugManuallyEdited = useRef(!!initialProduct?.slug);
  const [values, setValues] = useState<ProductFormValues>(() => ({
    ...DEFAULT_VALUES,
    ...(initialProduct
      ? {
          name: initialProduct.name,
          sku: initialProduct.sku,
          category: initialProduct.category,
          brand: initialProduct.brand,
          status: initialProduct.status,
          tags: initialProduct.tags.join(", "),
          description: initialProduct.description ?? "",
          price: String(initialProduct.price),
          compareAtPrice: initialProduct.compareAtPrice ? String(initialProduct.compareAtPrice) : "",
          stock: String(initialProduct.stock),
          metaTitle: initialProduct.name,
          slug: initialProduct.slug,
        }
      : {}),
  }));

  const isDigital = values.productType === "digital";
  const visibleSectionsFiltered = visibleSections.filter((s) => {
    if (s.id === "variants" && isDigital) return false;
    if (s.id === "digital" && !isDigital) return false;
    if ((s.id as string) === "inventory") return false; // merged into pricing
    return true;
  });

  const set = useCallback(<K extends keyof ProductFormValues>(key: K, val: ProductFormValues[K]) => {
    setValues((v) => {
      const next = { ...v, [key]: val };
      /* auto-generate slug from name as long as user hasn't manually edited it */
      if (key === "name" && !slugManuallyEdited.current) {
        next.slug = slugifyName(String(val));
      }
      return next;
    });
    setAutosave("Saving draft…");
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setAutosave("Ready to save"), 800);
    return () => clearTimeout(t);
  }, [values]);

  useEffect(() => {
    if (!values.slug.trim()) {
      setSlugApiTaken(false);
      setSlugApiMessage(null);
      return;
    }
    const timer = setTimeout(() => {
      setSlugChecking(true);
      void checkCatalogProductSlug(values.slug, initialProduct?.id)
        .then((res) => {
          setSlugApiTaken(!res.available);
          setSlugApiMessage(res.message ?? null);
        })
        .catch(() => {
          setSlugApiTaken(false);
          setSlugApiMessage(null);
        })
        .finally(() => setSlugChecking(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [values.slug, initialProduct?.id]);

  useEffect(() => {
    if (values.warehouseId || warehouses.length === 0) return;
    const first = warehouses.find((w) => w.active) ?? warehouses[0];
    if (first) setValues((v) => ({ ...v, warehouseId: first.id }));
  }, [warehouses, values.warehouseId]);

  // Scroll content to top after editors mount (they may autofocus causing scroll)
  useEffect(() => {
    const scroll = () => {
      const container = contentRef.current;
      if (!container) return;
      if (document.activeElement instanceof HTMLElement && container.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      container.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    const t1 = setTimeout(scroll, 150);
    const t2 = setTimeout(scroll, 500);
    const t3 = setTimeout(scroll, 1000);
    const t4 = setTimeout(scroll, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, []);

  const selectSection = useCallback((id: SectionId) => {
    setSection(id);
    const container = contentRef.current;
    const el = container?.querySelector<HTMLElement>(`[data-section="${id}"]`);
    if (container && el) {
      // Snap to current position first to cancel any in-progress smooth scroll
      container.scrollTo({ top: container.scrollTop, behavior: "instant" as ScrollBehavior });
      requestAnimationFrame(() => {
        const elTop = el.getBoundingClientRect().top;
        const cTop = container.getBoundingClientRect().top;
        container.scrollTo({ top: container.scrollTop + elTop - cTop - 8, behavior: "smooth" });
      });
    }
  }, []);

  // Scrollspy: update active section based on scroll position
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top that is intersecting
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.getAttribute("data-section") as SectionId;
          if (id) setSection(id);
        }
      },
      { root: container, rootMargin: "-10% 0px -60% 0px", threshold: 0 },
    );
    const sections = container.querySelectorAll("[data-section]");
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [visibleSectionsFiltered]);

  useEffect(() => {
    if (!productDetail || mode !== "edit") return;
    setValues({
      ...DEFAULT_VALUES,
      name: productDetail.name,
      sku: productDetail.sku,
      category: productDetail.category,
      categoryId: productDetail.categoryId ?? "",
      brand: productDetail.brand,
      brandId: productDetail.brandId ?? "",
      status: productDetail.status,
      visibility: productDetail.visibility ?? "public",
      tags: productDetail.tags.join(", "),
      shortDescription: productDetail.shortDescription ?? "",
      description: productDetail.description ?? "",
      price: String(productDetail.price),
      compareAtPrice: productDetail.compareAtPrice ? String(productDetail.compareAtPrice) : "",
      stock: String(productDetail.stock),
      metaTitle: productDetail.metaTitle || productDetail.name,
      metaDescription: productDetail.metaDescription ?? "",
      slug: productDetail.slug,
      productType: productDetail.productType,
      warranty: productDetail.warranty ?? "",
    });
    setVariantRows(variantsToRows(productDetail.variants));
    if (productDetail.productType === "digital" && productDetail.id) {
      void fetchDigitalFiles(productDetail.id).then(setDigitalFiles).catch(() => {});
    }
    setProductMedia(
      productDetail.mediaLinks.map((m) => ({
        id: m.media_id,
        name: m.name,
        title: m.name,
        folder: "Products",
        url: m.url,
        type: m.media_type === "video" ? "video" : "image",
        mimeType: m.media_type === "video" ? "video/mp4" : "image/jpeg",
        sizeKb: 0,
        alt: m.name,
        uploadedAt: new Date().toISOString(),
        uploadedBy: "API",
        provider: "direct" as const,
      })),
    );
  }, [productDetail, mode]);

  useEffect(() => {
    if (!inventoryModuleEnabled || !productDetail?.id || mode !== "edit") return;
    void fetchProductStockLevels(productDetail.id).then((rows) => {
      const inv = rows[0];
      if (!inv) return;
      setInventoryStockId(inv.id);
      setValues((v) => ({
        ...v,
        warehouseId: inv.warehouse_id,
        stock: String(inv.on_hand),
        lowStockAlert: String(inv.min_qty),
        cost: parseFloat(inv.unit_cost) > 0 ? inv.unit_cost : v.cost,
        trackInventory: true,
      }));
    });
  }, [productDetail, mode, inventoryModuleEnabled]);

  useEffect(() => {
    if (!productDetail?.id || mode !== "edit") return;
    /* load custom specs from product */
    let parsedCustomGroups: CustomSpecGroup[] = [];
    let parsedCustomAttrs: CustomSpecAttr[] = [];
    try {
      const raw = productDetail.customSpecsJson;
      if (raw) {
        const parsed = JSON.parse(raw) as { customGroups?: CustomSpecGroup[]; customAttrs?: CustomSpecAttr[] };
        parsedCustomGroups = parsed.customGroups ?? [];
        parsedCustomAttrs = parsed.customAttrs ?? [];
        setInitialCustomGroups(parsedCustomGroups);
        setInitialCustomAttrs(parsedCustomAttrs);
      }
    } catch { /* ignore */ }
    void import("@/lib/api/catalog-products").then(({ fetchProductSpecs }) =>
      fetchProductSpecs(productDetail.id).then((specs) => {
        const vmap: Record<string, string> = {};
        for (const item of specs.values) vmap[item.attributeId] = item.value;
        setSpecDraft({
          profileId: specs.attributeProfileId ?? productDetail.attributeProfileId ?? "",
          valuesByAttributeId: vmap,
          customGroups: parsedCustomGroups,
          customAttrs: parsedCustomAttrs,
        });
      }),
    );
  }, [productDetail, mode]);

  const handleSpecChange = useCallback((draft: ProductSpecsDraft) => {
    setSpecDraft(draft);
  }, []);

  async function persistInventory(productId: string) {
    if (!inventoryModuleEnabled || !values.trackInventory || !values.warehouseId) return;
    const onHand = parseInt(values.stock, 10) || 0;
    const minQty = parseInt(values.lowStockAlert, 10) || 10;
    const unitCost = values.cost ? parseFloat(values.cost) : undefined;

    if (inventoryStockId) {
      await updateInventoryStock(inventoryStockId, { onHand, minQty, unitCost });
      return;
    }

    const created = await upsertProductInventory(productId, {
      warehouse_id: values.warehouseId,
      on_hand: onHand,
      min_qty: minQty,
      unit_cost: unitCost,
    });
    setInventoryStockId(created.id);
  }

  async function persistSpecs(productId: string) {
    const { replaceProductSpecs } = await import("@/lib/api/catalog-products");
    const vals = Object.entries(specDraft.valuesByAttributeId)
      .filter(([id, v]) => v.trim() && !id.startsWith("custom-") && !id.startsWith("cgroup-"))
      .map(([attributeId, value]) => ({ attributeId, value: value.trim() }));
    await replaceProductSpecs(productId, {
      attributeProfileId: specDraft.profileId || null,
      values: vals,
    });
  }

  const handleSave = async (publish = false) => {
    if (!values.name.trim()) {
      toast.error("Product name is required");
      setSection("general");
      return;
    }
    const slug = values.slug.trim() || slugifyName(values.name);
    const lengthError = validateProductFieldLengths(values, slug, variantRows);
    if (lengthError) {
      toast.error(lengthError.message);
      setSection(lengthError.section);
      return;
    }
    if (slugHasError(slug, initialProduct?.id ? { id: initialProduct.id } : undefined)) {
      toast.error(slugApiMessage ?? "Fix URL slug before saving");
      setSection("seo");
      return;
    }
    /* if slug is taken, find the next free variant: slug-1, slug-2 … */
    let finalSlug = slug;
    if (slugApiTaken) {
      let found = false;
      for (let i = 1; i <= 99; i++) {
        const candidate = `${slug}-${i}`;
        const res = await checkCatalogProductSlug(candidate, initialProduct?.id).catch(() => null);
        if (res?.available) { finalSlug = candidate; found = true; break; }
      }
      if (!found) { toast.error("Could not find a free URL slug"); return; }
      set("slug", finalSlug);
      toast.info(`URL slug changed to "${finalSlug}"`);
    }
    // Featured = first item in gallery; fall back to first image if first item is video
    const thumbnail = productMedia.find((m) => m.type === "image")?.url ?? undefined;
    const customSpecsJson = (specDraft.customGroups?.length || specDraft.customAttrs?.length)
      ? JSON.stringify({ customGroups: specDraft.customGroups ?? [], customAttrs: specDraft.customAttrs ?? [] })
      : null;
    const payload = buildProductPayload(values, publish, specDraft.profileId, thumbnail, customSpecsJson ?? undefined);
    setSaving(true);
    try {
      if (mode === "create") {
        const sku = payload.sku || `SKU-${Date.now().toString().slice(-6)}`;
        const created = await createCatalogProduct({ ...payload, slug: finalSlug, sku });
        if (values.productType === "variable" && variantRows.length > 0) {
          await replaceProductVariants(created.id, rowsToVariantUpserts(variantRows));
        }
        if (productMedia.length > 0) {
          await replaceProductMedia(created.id, productMedia.map((m) => m.id));
        }
        if (specDraft.profileId || Object.values(specDraft.valuesByAttributeId).some((v) => v.trim())) {
          await persistSpecs(created.id);
        }
        await persistInventory(created.id).catch(() => {});
        if (values.productType === "digital" && pendingDigitalFiles.length > 0) {
          await flushPendingDigitalFiles(created.id, pendingDigitalFiles);
          setPendingDigitalFiles([]);
        }
        toast.success(publish ? "Product published" : "Product saved as draft");
        onSaved?.();
        if (onClose) onClose();
        else router.push("/catalog/products");
        return;
      }

      if (mode === "edit" && initialProduct) {
        await updateCatalogProduct(initialProduct.id, { ...payload, slug: finalSlug });
        if (values.productType === "variable") {
          await replaceProductVariants(initialProduct.id, rowsToVariantUpserts(variantRows));
        }
        await replaceProductMedia(initialProduct.id, productMedia.map((m) => m.id));
        await persistSpecs(initialProduct.id);
        await persistInventory(initialProduct.id).catch(() => {});
        toast.success(publish ? "Product published" : "Product updated");
        onSaved?.();
        if (onClose) onClose();
        else router.push("/catalog/products");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const title = mode === "create" ? "Add Product" : "Edit Product";

  const actionButtons = (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex-1 sm:flex-none"
        onClick={() => (onClose ? onClose() : router.push("/catalog/products"))}
      >
        Discard
      </Button>
      <Button variant="secondary" size="sm" className="flex-1 sm:flex-none" onClick={() => void handleSave(false)} disabled={saving || detailLoading}>
        {saving ? "Saving…" : "Save draft"}
      </Button>
      <Button size="sm" className="flex-1 sm:flex-none" onClick={() => void handleSave(true)} disabled={saving || detailLoading}>
        {saving ? "Publishing…" : "Publish"}
      </Button>
    </>
  );

  return (
    <>
    <div
      className={
        inDialog
          ? "flex h-full min-h-0 flex-col"
          : compact
            ? "flex min-h-0 flex-col"
            : "flex min-h-0 flex-col pb-20 sm:min-h-[calc(100vh-2.75rem-1.5rem)] sm:pb-0 lg:min-h-[calc(100vh-2.75rem-2rem)]"
      }
    >
      {/* Header */}
      <div className={inDialog ? "shrink-0 border-b border-input pb-3" : "shrink-0 border-b border-input pb-3"}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            {!compact && !inDialog && (
              <Button variant="ghost" size="icon" className="mt-0.5 shrink-0" asChild>
                <Link href="/catalog/products">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <div className="min-w-0 flex-1">
              {!inDialog && (
                <>
                  <p className="page-subtitle hidden truncate sm:block">
                    MoharazNX › Ecommerce › Catalog › Products › {title}
                  </p>
                  <p className="page-subtitle sm:hidden">
                    Catalog › Products › {mode === "create" ? "Add" : "Edit"}
                  </p>
                </>
              )}
              {inDialog ? (
                <>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        values.status === "published" ? "success" : values.status === "draft" ? "warning" : "muted"
                      }
                      className="capitalize"
                    >
                      {values.status}
                    </Badge>
                    {values.sku && (
                      <p className="font-mono text-[11px] text-muted-foreground">{values.sku}</p>
                    )}
                  </div>
                  <h2 className="text-base font-semibold leading-snug text-foreground">
                    {mode === "create" ? "Add Product" : values.name || "Edit Product"}
                  </h2>
                </>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="page-title">{title}</h1>
                  <Badge
                    variant={
                      values.status === "published" ? "success" : values.status === "draft" ? "warning" : "muted"
                    }
                    className="capitalize"
                  >
                    {values.status}
                  </Badge>
                </div>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">{autosave}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {mode === "edit" && initialProduct?.id ? (
              <ActivityTriggerButton
                entity={{
                  type: "product",
                  id: initialProduct.id,
                  label: values.name || initialProduct.name,
                  subtitle: values.sku ? `SKU ${values.sku}` : undefined,
                }}
                className="h-8 w-8 sm:hidden"
              />
            ) : null}
            <div className={`flex flex-wrap gap-1.5 ${compact || inDialog ? "flex" : "hidden sm:flex"}`}>
            {inDialog ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => void handleSave(false)}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save draft"}
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => void handleSave(true)}
                  disabled={saving}
                >
                  {saving ? "Publishing…" : "Publish"}
                </Button>
                {onClose && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    aria-label="Close editor"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </>
            ) : (
              actionButtons
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Section pills — mobile only (not in dialog) */}
      <div
        className={`sticky top-0 z-10 shrink-0 border-b border-input bg-background py-1.5 ${inDialog ? "hidden" : "md:hidden"}`}
      >
        <div className="flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visibleSectionsFiltered.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              title={label}
              aria-label={label}
              onClick={() => selectSection(id)}
              className={`flex shrink-0 items-center justify-center rounded-full border p-2 transition-colors ${
                section === id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-input text-muted-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      <div
        className={`flex min-h-0 flex-1 gap-3 ${inDialog ? "flex-row overflow-hidden pt-2" : "flex-col pt-2 md:flex-row md:pt-4"}`}
      >
        {/* Left section nav — icons only */}
        <nav
          className={`shrink-0 border-r border-input pr-2 ${inDialog ? "block w-11 overflow-hidden" : "hidden w-12 md:block"}`}
        >
          {visibleSectionsFiltered.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              title={label}
              aria-label={label}
              onClick={() => selectSection(id)}
              className={`mb-0.5 flex w-full items-center justify-center rounded-md p-2 transition-colors ${
                section === id
                  ? "bg-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
            </button>
          ))}
        </nav>

        {/* Content — only this area scrolls in dialog */}
        <div
          ref={contentRef}
          data-product-form-content
          className={`min-h-0 min-w-0 flex-1 ${inDialog ? "overflow-y-auto pr-1" : "overflow-y-auto pb-4 md:pb-8"}`}
        >
          <div className="divide-y divide-border">
          <div data-section="general" className="py-6 first:pt-0">
            <Section title="General">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Product name" required className="sm:col-span-2">
                  <InputWithAi
                    value={values.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Premium Cotton T-Shirt"
                    maxLength={PRODUCT_FIELD_LIMITS.name}
                  />
                </Field>
                <Field label="URL slug" className="sm:col-span-2">
                  <SlugInput
                    value={values.slug}
                    onChange={(v) => { slugManuallyEdited.current = true; set("slug", v); }}
                    excludeId={initialProduct?.id}
                    apiTaken={slugApiTaken}
                    apiMessage={slugApiMessage}
                    apiChecking={slugChecking}
                    className="pr-9"
                    urlPrefix={<span className="shrink-0 text-sm text-muted-foreground">/</span>}
                    suffix={<AiSparkleButton />}
                  />
                </Field>
                <Field label="SKU" required>
                  <InputWithAi
                    value={values.sku}
                    onChange={(e) => set("sku", e.target.value)}
                    placeholder="TSH-BLK-M"
                    maxLength={PRODUCT_FIELD_LIMITS.sku}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {values.sku.length}/{PRODUCT_FIELD_LIMITS.sku}
                  </p>
                </Field>
                <Field label="Category">
                  <CategoryCombobox
                    categories={categories}
                    value={values.categoryId}
                    onChange={(id, name) => { set("categoryId", id); set("category", name); }}
                    onAdd={() => setAddCategoryOpen(true)}
                    className="w-full"
                  />
                </Field>
                <Field label="Brand">
                  <BrandCombobox
                    brands={brands}
                    value={values.brandId}
                    onChange={(id, name) => { set("brandId", id); set("brand", name); }}
                    onAdd={() => setAddBrandOpen(true)}
                    className="w-full"
                  />
                </Field>
                <Field label="Status">
                  <Select
                    value={values.status}
                    onChange={(e) => set("status", e.target.value as ProductStatus)}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </Select>
                </Field>
                <Field label="Storefront visibility">
                  <Select
                    value={values.visibility}
                    onChange={(e) => set("visibility", e.target.value as ProductVisibility)}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </Select>
                </Field>
                <Field label="Tags" hint="Comma separated">
                  <InputWithAi
                    value={values.tags}
                    onChange={(e) => set("tags", e.target.value)}
                    placeholder="featured, bestseller"
                  />
                </Field>
              </div>
              <div className="mt-4">
                <RichTextEditor
                  value={values.shortDescription}
                  onChange={(v) => set("shortDescription", v)}
                  placeholder="Brief summary for listings and SEO…"
                  minRows={3}
                  fieldLabel="Short description"
                  aiVariables={{
                    product_name: values.name,
                    category: values.category,
                    brand: values.brand,
                  }}
                />
              </div>
              <div className="mt-4">
                <AgaincartClassicEditor
                  value={values.description}
                  onChange={(v) => set("description", v)}
                  placeholder="Full product description…"
                  fieldLabel="Description"
                  aiContext="product.description"
                  aiVariables={{
                    product_name: values.name,
                    category: values.category,
                    brand: values.brand,
                  }}
                />
              </div>
            </Section>
          </div>

          <div data-section="media" className="py-6">
            <Section title="Media">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setMediaLibraryOpen(true)}
                >
                  <ImagePlus className="mr-1.5 h-3.5 w-3.5" />
                  Add Media
                </Button>
              </div>

              {productMedia.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setMediaLibraryOpen(true)}
                  className="mb-4 w-full rounded-lg border border-dashed border-input bg-muted/20 p-6 text-center text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground sm:p-8"
                >
                  Click to open Media Library — select existing files or upload new ones
                </button>
              ) : (
                <>
                  <MediaGallery
                    items={productMedia}
                    onReorder={setProductMedia}
                    onRemove={(id) => setProductMedia((prev) => prev.filter((m) => m.id !== id))}
                    onAddMore={() => setMediaLibraryOpen(true)}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {productMedia.length} file{productMedia.length === 1 ? "" : "s"} · Drag to reorder · First image is featured
                  </p>
                </>
              )}
            </Section>
          </div>

          <div data-section="pricing" className="py-6">
              <Section title="Pricing">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Price (BDT)" required>
                    <InputWithAi
                      type="number"
                      value={values.price}
                      onChange={(e) => set("price", e.target.value)}
                      placeholder="899"
                    />
                  </Field>
                  <Field label="Compare at price">
                    <InputWithAi
                      type="number"
                      value={values.compareAtPrice}
                      onChange={(e) => set("compareAtPrice", e.target.value)}
                      placeholder="1299"
                    />
                  </Field>
                  </div>
                {values.price && (
                  <p className="mt-4 rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
                    Preview: <strong>{formatCurrency(Number(values.price) || 0)}</strong>
                    {values.compareAtPrice && (
                      <span className="ml-2 text-muted-foreground line-through">
                        {formatCurrency(Number(values.compareAtPrice))}
                      </span>
                    )}
                  </p>
                )}
              </Section>

              {inventoryModuleEnabled && (
                <Section title="Inventory">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Quantity" required>
                      <Input
                        type="number"
                        value={values.stock}
                        onChange={(e) => set("stock", e.target.value)}
                        disabled={!values.trackInventory}
                      />
                    </Field>
                    <Field label="Unit cost (BDT)">
                      <Input
                        type="number"
                        value={values.cost}
                        onChange={(e) => set("cost", e.target.value)}
                        placeholder="450"
                        disabled={!values.trackInventory}
                      />
                    </Field>
                    <Field label="Warehouse">
                      <Select
                        value={values.warehouseId}
                        onChange={(e) => set("warehouseId", e.target.value)}
                        disabled={!values.trackInventory || warehouses.length === 0}
                      >
                        <option value="">Select warehouse</option>
                        {warehouses.filter((w) => w.active).map((w) => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Warranty">
                      <Input
                        value={values.warranty}
                        onChange={(e) => set("warranty", e.target.value)}
                        placeholder="e.g. 1 Year, 6 Months, Lifetime"
                      />
                    </Field>
                    <Field label="Track inventory">
                      <label className="mt-2 flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={values.trackInventory}
                          onChange={(e) => set("trackInventory", e.target.checked)}
                          className="rounded border-input"
                        />
                        Sync quantity to inventory
                      </label>
                    </Field>
                  </div>
                </Section>
              )}
          </div>

          {!isDigital && (
            <div data-section="variants">
              <Section title="Variants">
                <ProductVariantEditor
                  productType={values.productType}
                  onProductTypeChange={(t) => set("productType", t)}
                  baseSku={values.sku}
                  basePrice={values.price}
                  category={values.category}
                  rows={variantRows}
                  onRowsChange={setVariantRows}
                  galleryMedia={productMedia.filter((m) => m.type === "image")}
                />
              </Section>
            </div>
          )}

          <div data-section="specifications" className="py-6">
            <Section title="Specifications">
              <ProductSpecEditor
                productId={initialProduct?.id}
                initialProfileId={specDraft.profileId}
                initialValues={specDraft.valuesByAttributeId}
                initialCustomGroups={initialCustomGroups}
                initialCustomAttrs={initialCustomAttrs}
                onChange={handleSpecChange}
              />
            </Section>
          </div>

          {isDigital && (
            <div data-section="digital" className="py-6">
              <Section title="Digital Files">
                <div className="mb-4 space-y-1.5">
                  <p className="text-xs text-muted-foreground">Product type</p>
                  <div className="flex flex-wrap gap-2">
                    {(["simple", "variable", "digital"] as const).map((t) => (
                      <Button
                        key={t}
                        type="button"
                        size="sm"
                        variant={values.productType === t ? "default" : "outline"}
                        onClick={() => set("productType", t)}
                        className="capitalize"
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Switch to Simple or Variable to move this product to a different type.
                  </p>
                </div>
                <DigitalFilesSection
                  productId={initialProduct?.id ?? null}
                  files={digitalFiles}
                  onFilesChange={setDigitalFiles}
                  pendingFiles={pendingDigitalFiles}
                  onPendingFilesChange={setPendingDigitalFiles}
                />
              </Section>
            </div>
          )}

          <div data-section="seo" className="py-6">
            <Section title="SEO">
              <div className="mb-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    set("metaTitle", values.name || "Product title");
                    set("metaDescription", values.shortDescription.replace(/<[^>]+>/g, "").slice(0, 160) || values.name);
                    if (!values.slug.trim()) {
                      set("slug", slugifyName(values.name || values.sku || "product"));
                    }
                    toast.success("SEO fields filled from product data");
                  }}
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                  Generate SEO
                </Button>
              </div>
              <div className="grid gap-4">
                <Field label="URL slug">
                  <SlugInput
                    value={values.slug}
                    onChange={(v) => set("slug", v)}
                    excludeId={initialProduct?.id}
                    apiTaken={slugApiTaken}
                    apiMessage={slugApiMessage}
                    apiChecking={slugChecking}
                    className="pr-9"
                    urlPrefix={<span className="shrink-0 text-sm text-muted-foreground">/</span>}
                    suffix={<AiSparkleButton />}
                  />
                </Field>
                <Field label="Meta title">
                  <InputWithAi
                    value={values.metaTitle}
                    onChange={(e) => set("metaTitle", e.target.value)}
                    maxLength={PRODUCT_FIELD_LIMITS.seoTitle}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {values.metaTitle.length}/{PRODUCT_FIELD_LIMITS.seoTitle}
                  </p>
                </Field>
                <Field label="Meta description">
                  <TextareaWithAi
                    value={values.metaDescription}
                    onChange={(e) => set("metaDescription", e.target.value)}
                    rows={3}
                    maxLength={160}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">{values.metaDescription.length}/160</p>
                </Field>
                <div className="rounded-md border border-input bg-muted/20 p-3">
                  <p className="text-sm font-medium text-primary">{values.metaTitle || values.name || "Product title"}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    moharaznx.com/{values.slug || "product-slug"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {values.metaDescription || "Meta description preview…"}
                  </p>
                </div>
              </div>
            </Section>
          </div>

          </div>{/* end divide-y wrapper */}
        </div>
      </div>

      {/* Mobile sticky action bar — full page only */}
      {!compact && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-input bg-background/95 p-3 backdrop-blur sm:hidden">
          <div className="flex gap-2">{actionButtons}</div>
        </div>
      )}
    </div>

      <MediaLibraryModal
        open={mediaLibraryOpen}
        onOpenChange={(open) => {
          setMediaLibraryOpen(open);
          if (open) void refetchMedia();
        }}
        items={mediaItems}
        mode="multiple"
        title="Add Media"
        accept={["image", "video"]}
        initialSelectedIds={productMedia.map((item) => item.id)}
        onSelect={(items) => {
          setProductMedia((prev) => {
            const map = new Map(prev.map((item) => [item.id, item]));
            for (const item of items) map.set(item.id, item);
            return Array.from(map.values());
          });
        }}
        onUploadFiles={async (files) => {
          const uploaded = await uploadCatalogMediaFiles(files);
          await refetchMedia();
          return uploaded;
        }}
        onImportItems={async (items) => {
          const saved = await createCatalogMediaBatch(items);
          await refetchMedia();
          return saved;
        }}
      />

      <CategoryFormDialog
        open={addCategoryOpen}
        onOpenChange={setAddCategoryOpen}
        mode="create"
        parentOptions={categories.map((c) => ({ id: c.id, label: c.name }))}
        onSave={async (data) => {
          try {
            const created = await createCatalogCategory({
              name: data.name ?? "",
              caption: data.caption ?? data.name ?? "",
              slug: data.slug ?? "",
              parentId: data.parentId ?? null,
              active: data.active ?? true,
              showInTopMenu: data.showInTopMenu ?? false,
              description: data.description,
              metaTitle: data.metaTitle,
              metaDescription: data.metaDescription,
              metaKeywords: data.metaKeywords,
              iconUrl: data.iconUrl,
              bannerUrl: data.bannerUrl,
              iconMediaId: data.iconMediaId,
              bannerMediaId: data.bannerMediaId,
            });
            await refetchCategories();
            set("categoryId", created.id);
            set("category", created.name);
            toast.success("Category created");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create category");
          }
        }}
      />
      <BrandFormDialog
        open={addBrandOpen}
        onOpenChange={setAddBrandOpen}
        mode="create"
        onSave={async (data) => {
          try {
            const created = await createCatalogBrand({
              name: data.name ?? "",
              slug: data.slug ?? "",
              active: data.active ?? true,
              description: data.description,
              websiteUrl: data.websiteUrl,
              logoUrl: data.logoUrl,
              bannerUrl: data.bannerUrl,
              logoMediaId: data.logoMediaId,
              bannerMediaId: data.bannerMediaId,
            });
            await refetchBrands();
            set("brandId", created.id);
            set("brand", created.name);
            toast.success("Brand created");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to create brand");
          }
        }}
      />
    </>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-3xl">
      <h2 className="mb-0.5 text-base font-semibold">{title}</h2>
      {description ? <p className="mb-4 text-xs text-muted-foreground">{description}</p> : null}
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
        {hint && <span className="ml-1 font-normal text-muted-foreground">({hint})</span>}
      </Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function AiSparkleButton({
  className,
  title = "Generate with AI",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "absolute right-2 text-muted-foreground transition-colors hover:text-primary",
        className ?? "top-1/2 -translate-y-1/2",
      )}
      title={title}
      aria-label={title}
    >
      <Sparkles className="h-4 w-4" />
    </button>
  );
}

function InputWithAi({ className, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <Input className={cn("pr-9", className)} {...props} />
      <AiSparkleButton />
    </div>
  );
}

function TextareaWithAi({ className, ...props }: React.ComponentProps<typeof Textarea>) {
  return (
    <div className="relative">
      <Textarea className={cn("pr-9", className)} {...props} />
      <AiSparkleButton className="top-2" />
    </div>
  );
}
