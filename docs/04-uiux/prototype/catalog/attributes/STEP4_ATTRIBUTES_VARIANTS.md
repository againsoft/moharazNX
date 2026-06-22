# Step 4 — Attributes & Variants (API + Admin)

**Status:** Done  
**Routes:** `/catalog/attributes`, `/catalog/variants`  
**API:** `/api/v1/catalog/attribute-profiles`, `/api/v1/catalog/variants`

## Goal

Wire attribute profiles (groups + fields) and the global variant SKU list to PostgreSQL via FastAPI.

## Backend

| Item | Detail |
|------|--------|
| Tables | `catalog_attribute_profiles`, `catalog_attribute_groups`, `catalog_attributes`, `catalog_product_variants` |
| Seed | 4 profiles (Laptop, Mobile Phone, Monitor, Camera) + nested groups/fields; 20 default variants (1 per product) |
| Profile API | list (with flat groups/attributes), get, create, patch, delete, reorder, bulk save |
| Variants API | `GET /variants` — joined with products, filter by category/search |

## Frontend

| Item | Detail |
|------|--------|
| Hook | `useCatalogAttributeProfiles`, `useCatalogVariants` |
| Attributes page | Profile grid + bulk form saves to API |
| Variants page | Global SKU list from database |

## Daily test

```bash
docker compose up -d
cd apps/api && source .venv/bin/activate && PYTHONPATH=. python scripts/init_db.py
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
cd apps/web && npm run dev
curl http://127.0.0.1:8000/api/v1/catalog/attribute-profiles
curl http://127.0.0.1:8000/api/v1/catalog/variants
```

## Next

**Step 5 — Media Library**
