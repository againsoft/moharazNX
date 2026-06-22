# Step 8 — Customers (API + Admin)

**Date:** 2026-06-22  
**Scope:** Customer 360 list, detail, status updates wired to PostgreSQL

## Backend

| Item | Detail |
|------|--------|
| Table | `commerce_customers` |
| Seed | 5 customers (C-10001 … C-10005) |
| API | `GET/PATCH /api/v1/commerce/customers` |

Recent orders on detail view are joined live from `commerce_orders` by customer id, email, or phone.

## Frontend

| Route | Hook | Component |
|-------|------|-----------|
| `/customers` | `useCommerceCustomers` | `CustomersDashboard` |
| `/customers/all` | `useCommerceCustomers` | `CustomerGrid` |
| `/customers/[id]` | `useCommerceCustomer` | `CustomerDetailWorkspace` |

Groups, loyalty, wallet, and segments sub-pages remain mock for now.

## Verify

```bash
docker compose up -d
cd apps/api && source .venv/bin/activate && PYTHONPATH=. python scripts/init_db.py
curl http://127.0.0.1:8000/api/v1/commerce/customers
cd apps/web && npm run dev
```

Open `/customers/all` and click a customer for the 360 view.
