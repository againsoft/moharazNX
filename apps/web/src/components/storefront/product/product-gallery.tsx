"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  productName: string;
  variantId?: string;
  variantGalleries?: Record<string, string[]>;
  variantStartIndex?: Record<string, number>;
};

export function ProductGallery({
  images,
  productName,
  variantId,
  variantGalleries = {},
  variantStartIndex = {},
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  const activeVariantImages = useMemo(
    () => (variantId ? variantGalleries[variantId] ?? [] : []),
    [variantId, variantGalleries],
  );

  const activeVariantIndexSet = useMemo(
    () => new Set(activeVariantImages),
    [activeVariantImages],
  );

  useEffect(() => {
    if (!variantId) return;
    const start = variantStartIndex[variantId];
    if (start !== undefined && start >= 0) {
      setActive(start);
    }
  }, [variantId, variantStartIndex]);

  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted">
        <Image
          src={images[active] ?? images[0]}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((src, i) => {
            const isVariantThumb = variantId ? activeVariantIndexSet.has(src) : false;
            return (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition sm:h-16 sm:w-16",
                  i === active
                    ? "border-primary ring-1 ring-primary/30"
                    : isVariantThumb
                      ? "border-primary/40 opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100",
                )}
                aria-label={`View image ${i + 1}`}
                aria-current={i === active}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
