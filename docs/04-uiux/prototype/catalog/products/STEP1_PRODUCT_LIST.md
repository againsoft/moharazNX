# Step 1 — Product List (`/catalog/products`)

**Status:** Done  
**Spec reference:** AgainERP `docs/04-uiux/prototype/catalog/products/ProductList.md`

## Goal

Unify admin product catalog with storefront data and wire basic create flow into client-side store.

## Changes

| Area | What |
|------|------|
| **Unified catalog** | `getAdminCatalogProducts()` merges seeded `products` (120) + `computerStoreProducts` (24 tech SKUs, deduped by slug) |
| **Lookups** | `getProductById()` / `getProductBySlug()` use merged admin catalog |
| **Product grid** | AG Grid reads merged catalog + `useProductStore` extras; brand filter/editor derived from data |
| **Create flow** | `ProductForm` create → `product-store.addProduct()` (persisted in localStorage) |
| **Page count** | Header count reflects merged catalog + user-added products |

## Files touched

- `apps/web/src/lib/mock-data/products.ts` — `getAdminCatalogProducts`, `getAdminCatalogBrands`
- `apps/web/src/lib/store/product-store.ts` — extras on top of admin catalog
- `apps/web/src/components/products/product-grid.tsx`
- `apps/web/src/app/(admin)/catalog/products/page.tsx`
- `apps/web/src/components/products/product-form.tsx`

## Verify

1. Open `/catalog/products` — count should be **144+** (120 + 24 computer products, minus any slug overlap)
2. Filter by brand **ASUS**, **Dell**, **HP** — computer-store products appear
3. View/edit a computer product by ID (e.g. from grid row menu)
4. **+ Add Product** → save → new row appears in grid (persists on refresh)

## Next (Step 2)

Product Create/Edit — full form persistence, edit existing products, validation.
