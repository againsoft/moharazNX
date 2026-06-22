# Step 1c — Product Detail Page

**Status:** Done  
**Spec:** AgainERP `ProductDetails.md`

## Routes

| Route | Source |
|-------|--------|
| `/catalog/products/[id]` | Full page — `GET /api/v1/catalog/products/{id}` |
| `/catalog/products?view={id}` | Quick view drawer — same API |

## UI

- `ProductDetailPageClient` — loads product from PostgreSQL via API
- `simpleCatalog` mode — real price, stock, SKU, slug (no demo variants)
- **Open page** from drawer → `/catalog/products/{id}`

## Verify

1. List → click product name → drawer loads from DB
2. **Open page** → full detail at `/catalog/products/{uuid}`
3. **Edit** → opens edit dialog with same product id

## Next — Step 2

Categories — `catalog_categories` table + `/catalog/categories`
