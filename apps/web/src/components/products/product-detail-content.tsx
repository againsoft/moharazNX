"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ExternalLink, X } from "lucide-react";
import {
  demoVariants,
  getAllVariantMedia,
  getDrawerVariantSpecGroups,
  getVariantFirstMediaIndex,
  type Product,
  type ProductMedia,
} from "@/lib/mock-data/products";
import type { ApiProductMediaLink, ProductSpecs } from "@/lib/api/catalog-products";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductMediaGallery } from "@/components/products/product-media-gallery";
import { ProductSupplierSourcing } from "@/components/products/product-supplier-sourcing";

type Props = {
  product: Product;
  compact?: boolean;
  inDialog?: boolean;
  /** API-backed catalog product — use product fields, not demo variants */
  simpleCatalog?: boolean;
  onBack?: () => void;
  onEdit?: (product: Product) => void;
  onOpenFullPage?: (product: Product) => void;
  onClose?: () => void;
};

type SimpleVariant = {
  id: string;
  price: number;
  stock: number;
  sku: string;
  color: string;
  storage?: string;
  ram?: string;
};

export function ProductDetailContent({
  product,
  compact,
  inDialog,
  simpleCatalog = false,
  onBack,
  onEdit,
  onOpenFullPage,
  onClose,
}: Props) {
  const simpleVariant: SimpleVariant = useMemo(
    () => ({
      id: "default",
      price: product.price,
      stock: product.stock,
      sku: product.sku,
      color: "Default",
    }),
    [product],
  );

  const [variantId, setVariantId] = useState(simpleCatalog ? "default" : demoVariants[0].id);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const allMedia = useMemo(() => {
    if (simpleCatalog) {
      const links: ApiProductMediaLink[] = (product as Product & { mediaLinks?: ApiProductMediaLink[] }).mediaLinks ?? [];
      if (links.length > 0) {
        return links
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((m): ProductMedia & { variantId: string } => ({
            id: m.media_id,
            type: m.media_type === "video" ? "video" : "image",
            url: m.url,
            isPrimary: m.is_primary,
            variantId: "default",
          }));
      }
      return [{ id: product.id, type: "image" as const, url: product.thumbnail, variantId: "default" }];
    }
    return getAllVariantMedia(product.id);
  }, [product, simpleCatalog]);
  const variantFirstIndex = useMemo(
    () => (simpleCatalog ? { default: 0 } : getVariantFirstMediaIndex(allMedia)),
    [allMedia, simpleCatalog],
  );
  const variantSpecGroups = useMemo(
    () => (simpleCatalog ? [] : getDrawerVariantSpecGroups(product)),
    [product, simpleCatalog],
  );

  useEffect(() => {
    setVariantId(simpleCatalog ? "default" : demoVariants[0].id);
    setGalleryIndex(0);
  }, [product.id, simpleCatalog]);

  const variant = useMemo(() => {
    if (simpleCatalog) return simpleVariant;
    return demoVariants.find((v) => v.id === variantId) ?? demoVariants[0];
  }, [simpleCatalog, simpleVariant, variantId]);

  const selectVariant = (nextVariantId: string) => {
    setVariantId(nextVariantId);
    const nextIndex = variantFirstIndex[nextVariantId];
    if (nextIndex !== undefined) setGalleryIndex(nextIndex);
  };

  const summaryStrip = (
    <div className="flex flex-wrap gap-x-2 gap-y-1 rounded-md border border-input bg-muted/40 px-2.5 py-1.5 text-xs">
      <span>
        <span className="text-muted-foreground">Price </span>
        <span className="font-semibold">{formatCurrency(variant.price)}</span>
      </span>
      <span className="text-muted-foreground">·</span>
      <span>
        <span className="text-muted-foreground">Stock </span>
        <span className={variant.stock === 0 ? "font-semibold text-red-500" : "font-semibold"}>
          {variant.stock}
        </span>
      </span>
      <span className="text-muted-foreground">·</span>
      <span>
        <span className="text-muted-foreground">Category </span>
        <span className="font-medium">{product.category}</span>
      </span>
      <span className="text-muted-foreground">·</span>
      <span>
        <span className="text-muted-foreground">Brand </span>
        <span className="font-medium">{product.brand}</span>
      </span>
    </div>
  );

  const variantSelector = simpleCatalog ? null : (
    <div className="flex flex-wrap gap-1.5">
      {demoVariants.map((v) => (
        <Button
          key={v.id}
          size="sm"
          variant={v.id === variantId ? "default" : "outline"}
          className={inDialog || compact ? "h-8 px-2.5 text-xs" : undefined}
          onClick={() => selectVariant(v.id)}
        >
          {v.color}
          {v.storage ? ` / ${v.storage}` : ""}
        </Button>
      ))}
    </div>
  );

  const variantQuickInfo = (
    <div className={cn("grid grid-cols-2 gap-3 rounded-lg border border-input p-3 sm:grid-cols-4", inDialog || compact ? "text-xs" : "text-sm")}>
      <div>
        <p className="text-muted-foreground">Price</p>
        <p className="font-semibold">{formatCurrency(variant.price)}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Stock</p>
        <p className={cn("font-semibold", variant.stock === 0 && "text-red-500")}>{variant.stock}</p>
      </div>
      <div>
        <p className="text-muted-foreground">SKU</p>
        <p className="font-mono text-[11px]">{variant.sku}</p>
      </div>
      <div>
        <p className="text-muted-foreground">{simpleCatalog ? "Slug" : "RAM"}</p>
        <p className={simpleCatalog ? "truncate font-mono text-[11px]" : undefined}>
          {simpleCatalog ? product.slug : (variant.ram ?? "—")}
        </p>
      </div>
    </div>
  );

  const dialogPricePanel = (
    <div className="flex min-h-0 flex-col gap-3 rounded-lg border border-input bg-card p-4">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Price</p>
        <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
          {formatCurrency(variant.price)}
        </p>
        {product.compareAtPrice != null && product.compareAtPrice > variant.price && (
          <p className="text-sm text-muted-foreground line-through">
            {formatCurrency(product.compareAtPrice)}
          </p>
        )}
        {product.offerPrice != null && (
          <p className="text-xs font-medium text-emerald-600">
            Offer {formatCurrency(product.offerPrice)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(!simpleCatalog || (product as Product & { hasInventory?: boolean }).hasInventory) && (
          <div className="rounded-md border border-input bg-muted/30 px-2.5 py-2">
            <p className="text-[10px] text-muted-foreground">Warehouse stock</p>
            <p className={cn("text-sm font-semibold", variant.stock === 0 && "text-red-500")}>
              {variant.stock}
            </p>
          </div>
        )}
        <div className="rounded-md border border-input bg-muted/30 px-2.5 py-2">
          <p className="text-[10px] text-muted-foreground">Status</p>
          <Badge variant="secondary" className="mt-0.5 text-[10px]">
            {product.stockStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-[10px] text-muted-foreground">Variant SKU</p>
          <p className="font-mono font-medium">{variant.sku}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">RAM / Storage</p>
          <p className="font-medium">
            {variant.ram ?? "—"}
            {variant.storage ? ` · ${variant.storage}` : ""}
          </p>
        </div>
      </div>

      {!simpleCatalog && (
        <div>
          <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Variants</p>
          {variantSelector}
        </div>
      )}

      {product.keyFeatures && product.keyFeatures.length > 0 && (
        <div className="border-t border-input pt-3">
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">Key features</p>
          <ul className="space-y-1.5">
            {product.keyFeatures.slice(0, 5).map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-[11px] leading-snug">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto border-t border-input pt-3 text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">{product.category}</span>
        <span> · {product.brand}</span>
      </div>
    </div>
  );

  if (inDialog) {
    return (
      <div className="h-full min-h-0 space-y-4 overflow-y-auto pr-1">
        <div className="space-y-3 border-b border-input pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className="capitalize">{product.status}</Badge>
                <p className="font-mono text-[11px] text-muted-foreground">{product.sku}</p>
              </div>
              <h2 className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                {product.name}
              </h2>
              {product.shortDescription && (
                <div
                  className="mt-1.5 max-w-prose text-sm leading-relaxed text-muted-foreground [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_p]:mb-1 [&_strong]:font-semibold [&_em]:italic"
                  dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                />
              )}
              {product.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] font-normal capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-wrap gap-1.5">
              {onOpenFullPage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs"
                  onClick={() => onOpenFullPage(product)}
                >
                  <ExternalLink className="h-3 w-3" />
                  Open page
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => onEdit(product)}
                >
                  Edit
                </Button>
              )}
              {onClose && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="Close product view"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {!simpleCatalog && (
            <ProductSupplierSourcing
              productId={product.id}
              variantId={variantId}
              compact
              embedded
            />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
          <ProductMediaGallery
            media={allMedia}
            productName={product.name}
            compact
            square
            activeIndex={galleryIndex}
            onActiveIndexChange={setGalleryIndex}
          />
          {dialogPricePanel}
        </div>

        <section className="rounded-lg border border-input p-4">
          <h3 className="text-sm font-semibold">Description</h3>
          <div
            className="mt-2 text-sm leading-relaxed text-muted-foreground [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_p]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold"
            dangerouslySetInnerHTML={{ __html: product.description ?? product.shortDescription ?? "No description provided." }}
          />
        </section>

        <section className="space-y-4 pb-1">
          <h3 className="text-sm font-semibold">Specifications</h3>
          {simpleCatalog ? (() => {
            const specs: ProductSpecs | undefined = (product as Product & { specs?: ProductSpecs }).specs;
            if (!specs || specs.values.length === 0) return <p className="text-sm text-muted-foreground">No specifications yet.</p>;
            return (
              <dl className="divide-y divide-border/60 rounded-lg border border-input text-sm">
                {specs.values.map((s) => (
                  <div key={s.attributeId} className="flex justify-between gap-3 px-4 py-2.5">
                    <dt className="text-muted-foreground">{s.attributeName}</dt>
                    <dd className="text-right font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            );
          })() : variantSpecGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No specifications yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {variantSpecGroups.map((group) => (
              <div key={group.variantId} className="rounded-lg border border-input">
                <div className="border-b border-input bg-muted/30 px-3 py-2">
                  <h4 className="text-xs font-semibold">{group.title}</h4>
                </div>
                <dl className="divide-y divide-border/60 text-xs">
                  {group.specs.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-3 px-3 py-2">
                      <dt className="text-muted-foreground">{spec.label}</dt>
                      <dd className="text-right font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
          )}
        </section>
      </div>
    );
  }

  const fullBody = (
    <div className="space-y-4">
      {summaryStrip}

      <div className="grid gap-4 lg:grid-cols-2">
        <ProductMediaGallery
          media={allMedia}
          productName={product.name}
          compact={compact}
          activeIndex={galleryIndex}
          onActiveIndexChange={setGalleryIndex}
        />

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            {!simpleCatalog && (
              <>
                <p className="text-xs text-muted-foreground">Variant</p>
                <div className="mt-1.5">{variantSelector}</div>
              </>
            )}
            <div className={simpleCatalog ? undefined : "mt-3"}>{variantQuickInfo}</div>
          </div>
          <div className="rounded-lg border p-4 text-sm">
            <h3 className="font-medium">Description</h3>
            <div
              className="mt-1.5 text-muted-foreground [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_p]:mb-1 [&_strong]:font-semibold [&_em]:italic [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold"
              dangerouslySetInnerHTML={{ __html: product.description ?? product.shortDescription ?? "No description provided." }}
            />
          </div>
        </div>
      </div>

      <section className="space-y-4 rounded-lg border p-4">
        <h3 className="text-sm font-medium">Specifications</h3>
        {simpleCatalog ? (() => {
          const specs: ProductSpecs | undefined = (product as Product & { specs?: ProductSpecs }).specs;
          if (!specs || specs.values.length === 0) return <p className="text-sm text-muted-foreground">No specifications yet.</p>;
          return (
            <dl className="divide-y divide-border/60 rounded-lg border border-input text-sm">
              {specs.values.map((s) => (
                <div key={s.attributeId} className="flex justify-between gap-3 px-4 py-2.5">
                  <dt className="text-muted-foreground">{s.attributeName}</dt>
                  <dd className="text-right font-medium">{s.value}</dd>
                </div>
              ))}
            </dl>
          );
        })() : variantSpecGroups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No specifications yet.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {variantSpecGroups.map((group) => (
              <div key={group.variantId} className="rounded-lg border border-input">
                <div className="border-b border-input bg-muted/30 px-3 py-2">
                  <h4 className="text-sm font-semibold">{group.title}</h4>
                </div>
                <dl className="divide-y divide-border/60 text-sm">
                  {group.specs.map((spec) => (
                    <div key={spec.label} className="flex justify-between gap-3 px-4 py-2.5">
                      <dt className="text-muted-foreground">{spec.label}</dt>
                      <dd className="text-right font-medium">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        )}
      </section>

      {!simpleCatalog && (
        <ProductSupplierSourcing productId={product.id} variantId={variantId} compact={compact} />
      )}
    </div>
  );

  return (
    <div className={compact ? "space-y-3" : "space-y-5"}>
      <div className="flex flex-wrap items-start gap-2">
        {!compact && onBack && (
          <Button variant="ghost" size="icon" className="shrink-0" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          {!compact && <p className="page-subtitle">MoharazNX › Ecommerce › Catalog › Products</p>}
          <h1 className={compact ? "text-sm font-semibold leading-snug" : "page-title"}>
            {product.name}
          </h1>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{product.sku}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {compact && onOpenFullPage && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-[11px]"
              onClick={() => onOpenFullPage(product)}
            >
              <ExternalLink className="h-3 w-3" />
              Open
            </Button>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              className={compact ? "h-7 px-2 text-xs" : undefined}
              onClick={() => onEdit(product)}
            >
              Edit
            </Button>
          )}
          <Badge className={cn("capitalize", compact && "text-[10px]")}>{product.status}</Badge>
        </div>
      </div>

      {fullBody}
    </div>
  );
}
