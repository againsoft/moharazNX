# Step 2 — Categories (API + Admin List)

**Status:** Done  
**Route:** `/catalog/categories`  
**API:** `/api/v1/catalog/categories`

## Goal

Wire the category tree admin UI to PostgreSQL via FastAPI — same pattern as Step 1 (Products).

## Backend

| Item | Detail |
|------|--------|
| Table | `catalog_categories` — tree (`parent_id`, `path`, `depth`) |
| Seed | 11 computer-store categories (Computers → Laptops, Peripherals → Monitors, etc.) |
| Endpoints | `GET /categories`, `GET /categories/tree`, `GET /categories/{id}`, `POST`, `PATCH`, `PATCH /reorder`, `DELETE` |
| Product count | Computed from `catalog_products.category` name match |

## Frontend

| Item | Detail |
|------|--------|
| Hook | `useCatalogCategories` |
| Mapper | `catalog-categories.ts` — snake_case ↔ UI `Category` type |
| Page | Loads from API; create/edit/view via URL params |
| Grid | Drag reorder, inline toggle, bulk actions, delete → API |

## Daily test

```bash
docker compose up -d
cd apps/api && source .venv/bin/activate && python scripts/init_db.py
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
cd apps/web && npm run dev
# Open http://localhost:3000/catalog/categories
curl http://127.0.0.1:8000/api/v1/catalog/categories
curl http://127.0.0.1:8000/api/v1/catalog/categories/tree
```

## Next

**Step 3 — Brands** (`catalog_brands` + `/catalog/brands`)
