# Step 1b — Product Edit & Archive

**Status:** Done  
**Spec:** AgainERP `EditProduct.md` · `catalog/ARCHITECTURE.md` (PATCH/DELETE)

## API

| Method | Endpoint | Purpose |
|--------|----------|---------|
| PATCH | `/api/v1/catalog/products/{id}` | Update product fields |
| DELETE | `/api/v1/catalog/products/{id}` | Hard delete (optional) |
| PATCH | `status: archived` | Archive via bulk/grid |

## Admin UI

- **Edit** dialog → `PATCH` → PostgreSQL → grid refresh
- **Bulk archive** → `PATCH status=archived` → refresh

## Verify

1. `/catalog/products` → ⋮ Edit → change price → Save → refresh persists
2. Select rows → Bulk archive → status `archived` in DB

## Next — Step 1c

Product Detail page `/catalog/products/[id]` wired to `GET /products/{id}`
