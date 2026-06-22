# Step 3 — Brands (API + Admin List)

**Status:** Done  
**Route:** `/catalog/brands`  
**API:** `/api/v1/catalog/brands`

## Goal

Wire the brand admin UI to PostgreSQL via FastAPI — same pattern as Products and Categories.

## Backend

| Item | Detail |
|------|--------|
| Table | `catalog_brands` — name, slug, sort_order, is_active, website, SEO, logo/banner |
| Seed | 18 computer-store brands (ASUS, Dell, HP, Apple, …) |
| Endpoints | `GET /brands`, `GET /brands/{id}`, `POST`, `PATCH`, `PATCH /reorder`, `DELETE` |
| Product count | Computed from `catalog_products.brand` name match |

## Frontend

| Item | Detail |
|------|--------|
| Hook | `useCatalogBrands` |
| Mapper | `catalog-brands.ts` |
| Page | Loads from API; create/edit/view via URL params |
| Grid | Drag reorder, inline toggle, bulk actions, delete → API |

## Daily test

```bash
docker compose up -d
cd apps/api && source .venv/bin/activate && PYTHONPATH=. python scripts/init_db.py
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
cd apps/web && npm run dev
# Open http://localhost:3000/catalog/brands
curl http://127.0.0.1:8000/api/v1/catalog/brands
```

## Next

**Step 4 — Attributes & Variants**
