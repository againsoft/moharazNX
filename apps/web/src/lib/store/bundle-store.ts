import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  bundlesSeed,
  recalcBundle,
  type ProductBundle,
} from "@/lib/mock-data/bundles";

type BundleState = {
  bundles: ProductBundle[];
  patchBundle: (id: string, patch: Partial<ProductBundle>) => void;
  upsertBundle: (data: Partial<ProductBundle> & { id?: string }) => void;
  deleteBundles: (ids: string[]) => void;
};

export const useBundleStore = create<BundleState>()(
  persist(
    (set) => ({
      bundles: bundlesSeed,

      patchBundle: (id, patch) => {
        set((state) => ({
          bundles: state.bundles.map((b) => {
            if (b.id !== id) return b;
            const merged = {
              ...b,
              ...patch,
              updatedAt: new Date().toISOString().slice(0, 10),
            };
            if (patch.components) {
              return { ...merged, ...recalcBundle(merged) };
            }
            if (patch.pricingMode || patch.discountPercent !== undefined || patch.bundlePrice !== undefined) {
              return { ...merged, ...recalcBundle(merged) };
            }
            return merged;
          }),
        }));
      },

      upsertBundle: (data) => {
        set((state) => {
          if (data.id) {
            return {
              bundles: state.bundles.map((b) => {
                if (b.id !== data.id) return b;
                const merged = {
                  ...b,
                  ...data,
                  updatedAt: new Date().toISOString().slice(0, 10),
                };
                return { ...merged, ...recalcBundle(merged) };
              }),
            };
          }
          const id = `bnd_${Date.now()}`;
          const components = data.components ?? [];
          const base: ProductBundle = {
            id,
            name: data.name ?? "New Bundle",
            slug: data.slug ?? "new-bundle",
            sku: data.sku ?? `BND-${Date.now().toString().slice(-6)}`,
            status: data.status ?? "draft",
            pricingMode: data.pricingMode ?? "sum_discount",
            bundlePrice: data.bundlePrice ?? 0,
            discountPercent: data.discountPercent ?? 10,
            retailTotal: 0,
            componentCount: 0,
            componentsSummary: "0 items",
            stock: 0,
            category: data.category ?? "General",
            updatedAt: new Date().toISOString().slice(0, 10),
            description: data.description,
            thumbnail: data.thumbnail,
            components,
          };
          return { bundles: [...state.bundles, { ...base, ...recalcBundle(base) }] };
        });
      },

      deleteBundles: (ids) => {
        const toDelete = new Set(ids);
        set((state) => ({
          bundles: state.bundles.filter((b) => !toDelete.has(b.id)),
        }));
      },
    }),
    { name: "againerp-bundles" },
  ),
);
