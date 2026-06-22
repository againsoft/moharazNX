# Step 7 — Orders (API + Admin)

**Date:** 2026-06-22  
**Scope:** Commerce orders list, detail, status updates wired to PostgreSQL

## Backend

| Item | Detail |
|------|--------|
| Tables | `commerce_orders`, `commerce_order_items` |
| Seed | 12 orders (ORD-1001 … ORD-1012) with line items from catalog products |
| API | `GET/PATCH /api/v1/commerce/orders` |

Nested data (timeline, AI insights, etc.) stored as JSON columns for MVP.

## Frontend

| Route | Hook | Component |
|-------|------|-----------|
| `/orders` | `useCommerceOrders` | `OrdersDashboard` |
| `/orders/all` | `useCommerceOrders` | `OrderGrid` |
| `/orders/[id]` | `useCommerceOrder` | `OrderDetailWorkspace` |

Returns, refunds, shipments sub-pages remain mock for now.

## Verify

```bash
docker compose up -d
cd apps/api && source .venv/bin/activate && PYTHONPATH=. python scripts/init_db.py
curl http://127.0.0.1:8000/api/v1/commerce/orders
cd apps/web && npm run dev
```

Open `/orders/all` and click an order — detail and inline status changes persist via API.
