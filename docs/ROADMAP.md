# MoharazNX — Admin API Roadmap (lean)

**Pattern (every step):** model → schema → router → seed in `init_db.py` → `lib/api/*.ts` + `use-*.ts` → wire **one list page + one detail page** → 1-line CHANGELOG entry.

**API prefix:** `/api/v1/...` · **DB:** PostgreSQL 5433 · **Seed:** `PYTHONPATH=. python scripts/init_db.py`

## Done

| Step | Domain | Tables | API | Wired routes |
|------|--------|--------|-----|--------------|
| 0 | Foundation | — | health | — |
| 1 | Products | `catalog_products` | `/catalog/products` | `/catalog/products` |
| 2 | Categories | `catalog_categories` | `/catalog/categories` | `/catalog/categories` |
| 3 | Brands | `catalog_brands` | `/catalog/brands` | `/catalog/brands` |
| 4 | Attributes | `catalog_attribute_*`, `catalog_product_variants` | `/catalog/attribute-profiles`, `/variants` | `/catalog/attributes`, `/variants` |
| 5 | Media | `media` | `/media` | `/media` |
| 6 | Inventory | `inventory_warehouses`, `inventory_stock_levels` | `/inventory/*` | `/inventory/stock`, `/inventory/warehouses` |
| 7 | Orders | `commerce_orders`, `commerce_order_items` | `/commerce/orders` | `/orders`, `/orders/all`, `/orders/[id]` |
| 8 | Customers | `commerce_customers` | `/commerce/customers` | `/customers`, `/customers/all`, `/customers/[id]` |
| 9 | Marketing | `marketing_coupons` | `/marketing/coupons` | `/marketing/coupons` |
| 10 | SEO | `seo_meta_records` | `/seo/meta` | `/seo/meta` |
| 11 | Auth | `auth_users`, `auth_sessions` | `/auth/login`, `/auth/me`, `/auth/logout` | `/login` + admin session gate |
| 12 | Storefront | `storefront_carts`, `storefront_cart_items` | `/storefront/products`, `/storefront/cart` | `/products`, `/cart` |
| 13 | Storefront PDP | — | `/storefront/products/by-slug`, `/storefront/cart/items` | `/[slug]` PDP + add-to-cart |
| 14 | Storefront checkout | — | `/storefront/checkout` | `/checkout` guest order stub |
| 15 | Admin API auth | — | Bearer on `/catalog`, `/commerce`, `/media`, etc. | `apiFetch` 401 → `/login` |
| 16 | Roles | — | `/auth/users`, write guard on catalog products | `/system/users` |
| 17 | Write guards | — | `require_write_access` on all admin POST/PATCH/DELETE | — |
| 18 | Suppliers | `commerce_suppliers` | `/commerce/suppliers` | `/suppliers`, `/suppliers/[id]` |
| 19 | Order returns | `commerce_order_returns` | `/commerce/returns` | `/orders/returns`, `/orders/returns/[id]` |
| 20 | Order refunds | `commerce_order_refunds` | `/commerce/refunds` | `/orders/refunds`, `/orders/refunds/[id]` |
| 21 | Product reviews | `catalog_product_reviews` | `/catalog/reviews` | `/catalog/reviews/all`, `/catalog/reviews/[id]` |
| 22 | Viewer read-only UI | — | — | hide write controls when role=viewer |
| 23 | AI Approvals | `ai_approvals` | `/ai/approvals` | `/ai-os` Approvals tab |
| 24 | AI Audit Logs | `ai_audit_logs` | `/ai/audit-logs` | `/ai-os` Audit tab |
| 25 | AI Providers | `ai_providers` | `/ai/providers` | `/ai-os` Providers tab |
| 26 | AI Agents | `ai_agents` | `/ai/agents` | `/ai-os` Agents tab |
| 27 | AI Tools | `ai_tools` | `/ai/tools` | `/ai-os` Tools tab |
| 28 | AI Dashboard KPIs | — (aggregates) | `/ai/dashboard` | `/ai-os` Dashboard tab |
| 29 | Marketing Campaigns | `marketing_campaigns` | `/marketing/campaigns` | `/marketing/campaigns`, `/marketing/campaigns/[id]` |
| 30 | Marketing Audiences | `marketing_audiences` | `/marketing/audiences` | `/marketing/audiences`, `/marketing/audiences/[id]` |
| 31 | Marketing Journeys | `marketing_journeys` | `/marketing/journeys` | `/marketing/journeys`, `/marketing/journeys/[id]` |
| 32 | AI API Connections | `ai_api_connections` | `/ai/connections` | `/settings/ai` save+connect, `/ai-os` DB + API status |

## Next (pick one per chat)

| Step | Scope (MVP only) | Skip for now |
|------|-------------------|--------------|
| 33 | TBD — next commerce or platform module | OpenAI live calls |

## Lean rules (save tokens)

1. **New Cursor chat per step** — first message: `Step 9 — Marketing (lean). Follow docs/ROADMAP.md`
2. Do **not** read `apps/web/src/lib/mock-data/*` whole files — grep types + target component only
3. Do **not** read `../againerp/` unless blocked · **No OpenCart** — architecture follows AgainERP only
4. Do **not** run `npm run build` unless user asks — use `tsc --noEmit` or lint changed files
5. Do **not** write `STEPn_*.md` — CHANGELOG one block only
6. Dashboard pages stay mock until user asks
7. Copy nearest step: inventory/orders/customers file names as template

## Key paths

```
apps/api/app/models/
apps/api/app/schemas/
apps/api/app/routers/
apps/api/scripts/init_db.py
apps/api/main.py
apps/web/src/lib/api/
apps/web/src/app/(admin)/
```
