# Step 6 — Inventory (API + Admin)

**Date:** 2026-06-22  
**Scope:** Warehouses + stock levels wired to PostgreSQL

## Backend

| Item | Detail |
|------|--------|
| Tables | `inventory_warehouses`, `inventory_stock_levels` |
| Seed | 3 warehouses (Dhaka HQ, Chittagong, Online FC) + stock row per catalog variant |
| API | `GET/PATCH /api/v1/inventory/warehouses`, `GET/PATCH /api/v1/inventory/stock` |

Stock levels link to `catalog_product_variants` and aggregate `total_units` per warehouse.

## Frontend

| Route | Hook | Component |
|-------|------|-----------|
| `/inventory/stock` | `useInventoryStock` + `useInventoryWarehouses` | `StockManagement` |
| `/inventory/warehouses` | `useInventoryWarehouses` | `WarehouseManager` |

Zone matrix on warehouses page remains mock data (prototype).

## Verify

```bash
docker compose up -d
cd apps/api && source .venv/bin/activate && PYTHONPATH=. python scripts/init_db.py
curl http://127.0.0.1:8000/api/v1/inventory/warehouses
curl http://127.0.0.1:8000/api/v1/inventory/stock
cd apps/web && npm run dev
```

Open `/inventory/stock` and `/inventory/warehouses` — data from API badge should show live counts.
