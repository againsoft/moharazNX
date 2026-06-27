# MoharazNX — Changelog

| **Fixed** | Control Center entry — sidebar + top nav + login links to `/center`; reserved `center` slug; admin path redirect from storefront `[slug]` |

| **Added** | Control Center UI Step 21 — collapsible sidebar (icon rail + persisted state); Notifications in nav; `UI_21_Collapsible_Sidebar.md` |

| **Added** | Control Center UI Step 20 — ⌘K command palette (nav, clients, quick actions); header search trigger; `UI_20_Command_Palette.md` |

| **Added** | Control Center UI Step 19 — platform notification bell in header + `/center/notifications` inbox; `UI_19_Notifications.md` |

| **Added** | Control Center UI Step 18 — shared loading skeletons, empty states, route `loading.tsx`; `UI_18_Loading_Empty_States.md` |

| **Added** | Control Center UI Step 17 — 24h CPU/RAM/API monitoring charts on fleet page + client detail sheet; `UI_17_Monitoring_Charts.md` |

| **Added** | Control Center UI Step 16 — offline sync queues + diagnostics tabs on Edge Agent console; client agent tab cross-links; `UI_16_Offline_Sync_Diagnostics.md` |

| **Added** | Control Center UI Step 15 — Edge Agent console (command queue, activation bundles); `UI_15_Edge_Agent_Console.md`; nav `/center/agents` |

| **Added** | Control Center UI Step 14 — Chief AI daily briefing card on dashboard; specialist agent insights with deep links; `UI_14_Chief_AI_Briefing.md` |

| **Added** | Control Center UI Step 13 — settings hub, operators RBAC, API keys; completes 13-step UI prototype; `UI_13_Settings.md` |

| **Added** | Control Center UI Step 12 — immutable audit log grid, state diff detail sheet; `UI_12_Audit.md` |

| **Added** | Control Center UI Step 11 — billing stats, invoice grid + detail sheet, fleet MRR tab; `UI_11_Billing.md` |

| **Added** | Control Center UI Step 10 — AI provisioning, credit usage, platform AI agents, recommendations; `UI_10_AI_Access.md` |

| **Added** | Control Center UI Step 09 — fleet backup status, recent runs, policy detail sheet (metadata only); `UI_09_Backups.md` |

| **Added** | Control Center UI Step 08 — version catalog, rollout banners, fleet update grid + detail sheet; `UI_08_Updates.md` |

| **Added** | Control Center UI Step 07 — agent heartbeat monitoring, alerts, metrics sheet; replaced legacy DB snapshots; `UI_07_Monitoring.md` |

| **Added** | Control Center UI Step 06 — module catalog with dependencies, filters, detail sheet; `UI_06_Module_Management.md` |

| **Added** | Control Center UI Step 05 — plan catalog, fleet subscriptions table, license grid + detail sheet; `UI_05_Subscriptions.md` |

| **Added** | Control Center UI Step 04 — registrations queue, review sheet, approve/reject prototype, onboarding pipeline; `UI_04_Registrations.md` |

| **Added** | Control Center UI Step 03 — client list filters, tabbed detail (overview/modules/agent/subscription); `UI_03_Clients.md` |

| **Added** | Control Center UI Step 02 — dashboard KPI grid, alerts, activity feed, fleet health; docs `UI_02_Dashboard.md` |

| **Added** | Control Center UI Step 01 — grouped sidebar nav, CenterPageHeader, placeholder routes; docs at `control/ControlCenter/UI/` |

| **Added** | Control Center architecture docs — standalone project at `control/ControlCenter/` (Steps 01–17 + MASTER_INDEX); Apache `.htaccess`; aligned with AgainERP hybrid licensed ERP model |

| **Fixed** | Local API startup — digital uploads path uses repo `uploads/` instead of Docker `/app/uploads`; Python 3.9 model/init_db compatibility |

| **Added** | Control Center UI at `/center` — platform dashboard, client list/detail, registrations, subscriptions, modules, AI access, remote DB (dummy data) |

| **Fixed** | Storefront dark flash — ThemeProvider removed from root; admin-only theme shell + 2s light guard |

| **Fixed** | Storefront — prevent flash to dark/navy background after load (theme lock + CSS override) |

| **Changed** | Storefront — pure white page background (`#ffffff`) |

| **Changed** | Storefront — light theme only (no dark mode on public website; admin panel keeps theme toggle) |

| **Changed** | Product add/edit form — removed Related Products section |

| **Added** | Comment @mentions — autocomplete in activity drawer, mention highlight, notifications for mentioned users; `GET /auth/users/mentionable` for all roles |

| **Added** | Mobile list cards — Activity trigger on products, orders, customers, brands, categories, attribute profiles; product edit form on mobile |

| **Changed** | Activity drawer — neutral theme redesign for dark mode (card/muted/border tokens, no sky tints) |

| **Changed** | Activity drawer — single compact timeline (activity + comments), mobile full-width with close button, fixed reply flow |

| **Changed** | Activity drawer — Activity tab merges changes + comments; Comments tab has threaded replies and bottom compose only (no top comment box) |

| **Changed** | Activity drawer — only Activity + Comments tabs; removed Files, Followers, Notes, AI, Overview; admin can filter all vs my activity, other roles see own activity only |

| **Fixed** | Local admin login on port 3003 — CORS now allows localhost/127.0.0.1 ports 3000–3003 |

| **Fixed** | Vercel admin login — `getApiBaseUrl()` falls back to Railway API when `NEXT_PUBLIC_API_URL` is unset on `.vercel.app` |

| **Fixed** | Live admin login 500 — `ensure_auth_user_columns()` migrates legacy `auth_users` (adds/backfills `username`) on API startup; auth seed includes username |

| **Changed** | `Connect with Cloudflare` button always visible — install screen, plugin header, Account section |

| **Changed** | Railway deploy config (`apps/api/railway.toml`) + auto `DATABASE_URL` psycopg conversion |

| **Fixed** | Remove Railway `preDeployCommand` — private DB host unavailable during pre-deploy; seed runs on app startup instead |

| **Added** | Docker full stack — `docker compose up` runs Postgres + API + Web locally |

## 2026-06-22 — Cloudflare Connect with OAuth

| Change | Detail |
|--------|--------|
| **Added** | `Connect with Cloudflare` OAuth flow — authorize URL, callback, auto account verify |
| **Added** | `CLOUDFLARE_OAUTH_*` env vars; manual API token fallback remains |

## 2026-06-22 — Cloudflare plugin (Settings → Plugins)

| Change | Detail |
|--------|--------|
| **Added** | `cloudflare_plugin` table + `/api/v1/plugins/cloudflare` install, verify, R2/Images config |
| **Added** | Settings → Plugins → Cloudflare — account verify, media storage local/R2, R2 + Images API panels |
| **Changed** | Media upload uses R2 when plugin installed, verified, and storage set to R2 |

## 2026-06-22 — AI chat reads catalog database

| Change | Detail |
|--------|--------|
| **Added** | `list_products` + `list_categories` tools — AI reads PostgreSQL for product list, stock, categories |
| **Changed** | Chat DB fallback handles “সব পণ্য / all products” before LLM; system prompt forbids “cannot show products” replies |

## 2026-06-22 — Chat stock cards + one-click cart add

| Change | Detail |
|--------|--------|
| **Added** | Product cards in chat with live stock count + **Cart e add** button; DB fallback search when LLM offline |
| **Changed** | Order intent shows real catalog stock instead of generic “tell me product name” reply |

## 2026-06-22 — AI chat can place orders

| Change | Detail |
|--------|--------|
| **Added** | OpenAI tool calling in chat — `search_products`, `add_to_cart`, `view_cart`, `place_order` |
| **Changed** | Chat widget passes cart token; order confirmation shows order number + track link |

## 2026-06-22 — OpenAI env → DB auto-connect

| Change | Detail |
|--------|--------|
| **Added** | `sync_env_openai_connection` — copies `OPENAI_API_KEY` from `.env` into `conn-openai`, validates on API startup + `scripts/sync_openai_connection.py` |
| **Changed** | `init_db.py` runs OpenAI sync after seeding connections |

## 2026-06-22 — Storefront chat live LLM

| Change | Detail |
|--------|--------|
| **Added** | `POST /api/v1/storefront/chat` + `/chat/status` — OpenAI, Anthropic, Gemini, Ollama via `ai_api_connections` or `OPENAI_API_KEY` env |
| **Changed** | Customer chat widget calls live API; falls back to FAQ keyword matching when no provider connected |

## 2026-06-22 — Storefront customer support chat AI (frontend)

| Change | Detail |
|--------|--------|
| **Added** | Floating chat widget on storefront — FAQ knowledge base, Bengali/English quick prompts, intent-matched replies |
| **Changed** | `(storefront)/layout.tsx` mounts `CustomerSupportChatWidget` site-wide |

## 2026-06-22 — Step 32: AI API Connections (lean)

| Change | Detail |
|--------|--------|
| **Added** | `ai_api_connections` + `/api/v1/ai/connections` (list, get, PATCH save/connect) + `/connections/db` + 4 seed rows |
| **Changed** | `/settings/ai` API key save + Connect persists to PostgreSQL; `/ai-os` Dashboard shows DB + provider connection status |

## 2026-06-22 — Step 31: Marketing Journeys (lean)

| Change | Detail |
|--------|--------|
| **Added** | `marketing_journeys` + `/api/v1/marketing/journeys` (list, get, PATCH) + 4 seed rows |
| **Changed** | `/marketing/journeys` list + `/marketing/journeys/[id]` detail load from PostgreSQL via `useMarketingJourneys` |

## 2026-06-22 — Step 30: Marketing Audiences (lean)

| Change | Detail |
|--------|--------|
| **Added** | `marketing_audiences` + `/api/v1/marketing/audiences` (list, get, PATCH) + 5 seed rows |
| **Changed** | `/marketing/audiences` list + `/marketing/audiences/[id]` detail load from PostgreSQL via `useMarketingAudiences` |

## 2026-06-22 — Step 29: Marketing Campaigns (lean)

| Change | Detail |
|--------|--------|
| **Added** | `marketing_campaigns` + `/api/v1/marketing/campaigns` (list, get, PATCH) + 5 seed rows |
| **Changed** | `/marketing/campaigns` list + `/marketing/campaigns/[id]` detail load from PostgreSQL via `useMarketingCampaigns` |

## 2026-06-22 — Step 28: AI Dashboard KPIs (lean)

| Change | Detail |
|--------|--------|
| **Added** | `/api/v1/ai/dashboard` aggregates KPIs, token chart, agent activity from existing AI tables |
| **Changed** | `/ai-os` Dashboard tab loads KPIs, charts, provider health from PostgreSQL via `useAiDashboard` |
| **Added** | 7 audit log seed rows for recent 7-day token chart |

## 2026-06-22 — Step 27: AI Tools (lean)

| Change | Detail |
|--------|--------|
| **Added** | `ai_tools` + `/api/v1/ai/tools` (list, get) + 13 seed rows |
| **Changed** | `/ai-os` Tools tab loads from PostgreSQL via `useAiTools` |

## 2026-06-22 — Step 26: AI Agents (lean)

| Change | Detail |
|--------|--------|
| **Added** | `ai_agents` + `/api/v1/ai/agents` (list, get) + 10 seed rows |
| **Changed** | `/ai-os` Agents tab loads from PostgreSQL via `useAiAgents` |

## 2026-06-22 — Step 25: AI Providers (lean)

| Change | Detail |
|--------|--------|
| **Added** | `ai_providers` + `/api/v1/ai/providers` (list, get) + 4 seed rows |
| **Changed** | `/ai-os` Providers tab loads from PostgreSQL via `useAiProviders` |

## 2026-06-22 — Step 24: AI Audit Logs (lean)

| Change | Detail |
|--------|--------|
| **Added** | `ai_audit_logs` + `/api/v1/ai/audit-logs` (list, get) + 6 seed rows |
| **Changed** | `/ai-os` Audit tab loads from PostgreSQL via `useAiAuditLogs` |

## 2026-06-22 — Step 23: AI OS Approvals (lean)

| Change | Detail |
|--------|--------|
| **Added** | `ai_approvals` + `/api/v1/ai/approvals` (list, get, PATCH approve/reject) + 4 seed rows |
| **Changed** | `/ai-os` Approvals tab + dashboard pending list load from PostgreSQL; Approve/Reject persists |

## 2026-06-22 — Step 22: Viewer read-only UI (lean)

| Change | Detail |
|--------|--------|
| **Added** | `useAdminCanWrite` hook + global viewer banner in admin shell |
| **Changed** | Wired admin pages/grids hide create/edit/status controls when role=viewer (matches API write guard) |

## 2026-06-22 — Step 21: Product reviews (lean)

| Change | Detail |
|--------|--------|
| **Added** | `catalog_product_reviews` + `/api/v1/catalog/reviews` (list, detail, PATCH) + 8 review seed |
| **Changed** | `/catalog/reviews/all` list + `/catalog/reviews/[id]` detail load from PostgreSQL |

## 2026-06-22 — Step 20: Order refunds (lean)

| Change | Detail |
|--------|--------|
| **Added** | `commerce_order_refunds` + `/api/v1/commerce/refunds` (list, detail, PATCH) + 5 refund seed |
| **Changed** | `/orders/refunds` list + `/orders/refunds/[id]` detail load from PostgreSQL |

## 2026-06-22 — Step 19: Order returns (lean)

| Change | Detail |
|--------|--------|
| **Added** | `commerce_order_returns` + `/api/v1/commerce/returns` (list, detail, PATCH) + 7 RMA seed |
| **Changed** | `/orders/returns` list + `/orders/returns/[id]` detail load from PostgreSQL |

## 2026-06-22 — Step 18: Suppliers (lean)

| Change | Detail |
|--------|--------|
| **Added** | `commerce_suppliers` + `/api/v1/commerce/suppliers` (list, detail, PATCH) + 5 vendor seed |
| **Changed** | `/suppliers` list tab + `/suppliers/[id]` detail load from PostgreSQL |

## 2026-06-22 — Step 17: Write guards on all admin routers (lean)

| Change | Detail |
|--------|--------|
| **Changed** | `require_write_access` on catalog, commerce, media, inventory, marketing, SEO write endpoints |
| **Changed** | Viewer role blocked from POST/PATCH/DELETE (403); staff/admin can write |

## 2026-06-22 — Step 16: Roles & permissions (lean)

| Change | Detail |
|--------|--------|
| **Added** | `/api/v1/auth/users` (admin-only) + staff/viewer seed users |
| **Changed** | Catalog product writes require staff/admin; `/system/users` role editor |

## 2026-06-22 — Step 15: Admin API Bearer auth (lean)

| Change | Detail |
|--------|--------|
| **Added** | `app/deps/auth.py` + `require_admin` on catalog/commerce/media/inventory/marketing/seo routers |
| **Changed** | `apiFetch` clears session and redirects to `/login` on 401 |

## 2026-06-22 — Step 14: Storefront checkout stub (lean)

| Change | Detail |
|--------|--------|
| **Added** | `POST /api/v1/storefront/checkout` creates `commerce_orders` from guest cart |
| **Changed** | `/checkout` submits to API when cart token connected; clears cart on success |

## 2026-06-22 — Step 13: Storefront PDP + add-to-cart (lean)

| Change | Detail |
|--------|--------|
| **Added** | `fetchStorefrontProductBySlug` + `use-storefront-product` + PDP wired to API with mock fallback |
| **Changed** | Add to cart on PDP posts to `/api/v1/storefront/cart/items` when API connected |

## 2026-06-22 — Step 12: Storefront API (lean)

| Change | Detail |
|--------|--------|
| **Added** | Public `/api/v1/storefront/products` + guest cart stub + `/products` and `/cart` wired |

## 2026-06-22 — Step 11: Auth (lean)

| Change | Detail |
|--------|--------|
| **Added** | `auth_users`, `auth_sessions` + `/api/v1/auth/*` + `/login` with Bearer session on admin routes |

## 2026-06-22 — Step 10: SEO Meta (lean)

| Change | Detail |
|--------|--------|
| **Added** | `seo_meta_records` + `/api/v1/seo/meta` + `/seo/meta` wired |

## 2026-06-22 — Step 9: Marketing Coupons (lean)

| Change | Detail |
|--------|--------|
| **Added** | `marketing_coupons` + `/api/v1/marketing/coupons` + `/marketing/coupons` |

## 2026-06-22 — Step 8: Customers (API + Admin)

| Change | Detail |
|--------|--------|
| **Added** | `commerce_customers` table + seed (5 customers) |
| **Added** | `/api/v1/commerce/customers` — list, detail, PATCH |
| **Changed** | `/customers`, `/customers/all`, `/customers/[id]` load from PostgreSQL |

## 2026-06-22 — Step 7: Orders (API + Admin)

| Change | Detail |
|--------|--------|
| **Added** | `commerce_orders`, `commerce_order_items` tables + seed (12 orders) |
| **Added** | `/api/v1/commerce/orders` — list, detail, PATCH (status + fields) |
| **Changed** | `/orders`, `/orders/all`, `/orders/[id]` load from PostgreSQL |

## 2026-06-22 — Step 6: Inventory (API + Admin)

| Change | Detail |
|--------|--------|
| **Added** | `inventory_warehouses`, `inventory_stock_levels` tables + seed |
| **Added** | `/api/v1/inventory/warehouses` — list, CRUD |
| **Added** | `/api/v1/inventory/stock` — list with filters, PATCH adjustments |
| **Changed** | `/inventory/stock` and `/inventory/warehouses` load from PostgreSQL |

## 2026-06-22 — Step 5: Media Library (API + Admin)

| Change | Detail |
|--------|--------|
| **Added** | `media` table + seed (24 assets) |
| **Added** | `/api/v1/media` — list, CRUD, batch import, multipart upload |
| **Added** | Static file serving at `/uploads/media/` |
| **Changed** | `/media` loads from PostgreSQL; uploads persist to disk + DB |

## 2026-06-22 — Step 4: Attributes & Variants (API + Admin)

| Change | Detail |
|--------|--------|
| **Added** | `catalog_attribute_profiles`, `catalog_attribute_groups`, `catalog_attributes` tables + seed |
| **Added** | `catalog_product_variants` — default variant per product |
| **Added** | `/api/v1/catalog/attribute-profiles` — CRUD, reorder, bulk save (groups + fields) |
| **Added** | `/api/v1/catalog/variants` — global SKU list joined with products |
| **Changed** | `/catalog/attributes` and `/catalog/variants` load from PostgreSQL |

## 2026-06-22 — Step 3: Brands (API + Admin)

| Change | Detail |
|--------|--------|
| **Added** | `catalog_brands` table + seed (18 computer-store brands) |
| **Added** | `/api/v1/catalog/brands` — list, CRUD, reorder, delete |
| **Changed** | `/catalog/brands` loads from PostgreSQL via FastAPI |
| **Added** | `useCatalogBrands` hook + brand API mappers |

## 2026-06-22 — Step 2: Categories (API + Admin)

| Change | Detail |
|--------|--------|
| **Added** | `catalog_categories` table + seed (11 computer-store categories) |
| **Added** | `/api/v1/catalog/categories` — list, tree, CRUD, reorder, delete (with children) |
| **Changed** | `/catalog/categories` loads from PostgreSQL via FastAPI |
| **Added** | `useCatalogCategories` hook + category API mappers |

## 2026-06-22 — Step 1c: Product Detail page

| Change | Detail |
|--------|--------|
| **Added** | `/catalog/products/[id]` — full page from `GET /products/{id}` |
| **Changed** | View drawer fetches fresh product from API |
| **Added** | `simpleCatalog` detail mode for DB-backed products |

## 2026-06-22 — Step 1b: Product Edit & Archive

| Change | Detail |
|--------|--------|
| **Added** | `PATCH /api/v1/catalog/products/{id}` — update product |
| **Added** | `DELETE /api/v1/catalog/products/{id}` — hard delete |
| **Changed** | Edit dialog saves to PostgreSQL via API |
| **Changed** | Bulk archive persists `status=archived` in DB |

## 2026-06-22 — PostgreSQL migration (AgainERP ADR-001)

| Change | Detail |
|--------|--------|
| **Changed** | Database: MariaDB/XAMPP → **PostgreSQL 16** (Docker Compose) |
| **Changed** | Driver: PyMySQL → **psycopg3** (`postgresql+psycopg://`) |
| **Added** | `docker-compose.yml` — local Postgres per AgainERP constitution |
| **Removed** | MySQL/MariaDB as dev database (forbidden in production per ADR-001) |

## 2026-06-22 — Frontend ↔ API connection (Product List)

| Change | Detail |
|--------|--------|
| **Added** | `apps/web/src/lib/api/` — client, catalog products mapper, `useCatalogProducts` hook |
| **Changed** | `/catalog/products` loads from FastAPI (`GET /api/v1/catalog/products`) |
| **Changed** | Create product → `POST /api/v1/catalog/products` + grid refresh |
| **Added** | `apps/web/.env.local.example` — `NEXT_PUBLIC_API_URL` |

## 2026-06-22 — Backend foundation (FastAPI + MariaDB)

| Change | Detail |
|--------|--------|
| **Added** | `apps/api/` — FastAPI backend with SQLAlchemy |
| **Added** | MariaDB database `moharaznx` + `catalog_products` table |
| **Added** | Endpoints: `/health`, `/api/v1/catalog/products` (GET/POST) |
| **Added** | Scripts: `scripts/init_db.py`, `scripts/test_connection.py` |
| **Verified** | DB connection + API curl tests passed |

## 2026-06-22 — Step 1: Product List

| Change | Detail |
|--------|--------|
| **Added** | `getAdminCatalogProducts()` — merges seeded products + computer-store SKUs |
| **Added** | Dynamic brand filters from catalog data (ASUS, Dell, HP, etc.) |
| **Changed** | Product grid uses unified catalog + `product-store` extras |
| **Changed** | Create product persists via `addProduct()` (localStorage) |
| **Doc** | `docs/04-uiux/prototype/catalog/products/STEP1_PRODUCT_LIST.md` |

## 2026-06-22 — Storefront design (MoharazNX)

| Change | Detail |
|--------|--------|
| **Added** | MoharazNX storefront theme (orange `#eb6626`), promo bar, trust features |
| **Added** | `storefront-moharaz.ts` — home data from AgainERP catalog (products, categories, brands) |
| **Changed** | `/` now serves customer storefront (admin stays at `/dashboard`) |
| **Data** | Computer catalog + admin `products.ts` + `categories.ts` + `brands.ts` |

## 2026-06-22 — Ecommerce-only cleanup

| Change | Detail |
|--------|--------|
| **Removed** | Non-ecommerce admin modules: Finance, CRM, HR, Manufacturing, Partners UI, Service, POS, Executive, Workspace hub, etc. |
| **Removed** | ESS portal, ERP API routes, non-ecommerce component folders |
| **Kept** | Ecommerce admin: Catalog, Inventory, Orders, Customers, Suppliers, Marketing, Content, Builder, SEO, Media, Reports, Settings, AI OS |
| **Kept** | Customer storefront `(storefront)/` |
| **Updated** | Navigation, breadcrumbs, dashboard mock data — ecommerce only |

## 2026-06-23 — Products full DB/API wiring (AgainERP catalog)

| Change | Detail |
|--------|--------|
| **Backend** | Extended `catalog_products` (product_type, visibility, category_id, brand_id, SEO, tags); added `catalog_product_media`; nested `PUT /products/{id}/variants` and `/media` |
| **Frontend** | Product form: categories/brands/media/variants from API; grid filters + website publish + live edit persist to API |

## 2026-06-23 — Attributes edit + product specifications (Step 33)

| Change | Detail |
|--------|--------|
| **Backend** | `catalog_product_attribute_values` table; `attribute_profile_id` on products; `GET/PUT /products/{id}/specs` |
| **Frontend** | Attributes add/edit pages use API; product Specifications tab loads/saves spec values via API |

## 2026-06-23 — Collections API (Step 34)

| Change | Detail |
|--------|--------|
| **Backend** | `catalog_collections` table; CRUD + reorder at `/catalog/collections` |
| **Frontend** | Collections list/grid wired to API (create, edit, live edit, reorder, delete) |

## 2026-06-23 — Catalog filters API (Step 35)

| Change | Detail |
|--------|--------|
| **Backend** | `catalog_filters` table; CRUD + reorder at `/catalog/filters` |
| **Frontend** | Filters page wired to API; suggested attributes from attribute profiles API |

## 2026-06-23 — Configurator profiles API (Step 36)

| Change | Detail |
|--------|--------|
| **Backend** | `configurator_profiles` table; CRUD + bulk status + duplicate at `/configurator/profiles` |
| **Frontend** | Profiles list/detail wired to API; hub + sibling pages use profile hook for dropdowns |

## 2026-06-23 — Configurator categories API (Step 37)

| Change | Detail |
|--------|--------|
| **Backend** | `configurator_categories` table; CRUD + bulk status at `/configurator/categories`; seed PC + laptop slots |
| **Frontend** | Categories list wired to API; form sheet + hub count use category hook |

## 2026-06-23 — Configurator templates API (Step 38)

| Change | Detail |
|--------|--------|
| **Backend** | `configurator_templates` table; CRUD + bulk status + duplicate at `/configurator/templates`; seed PC starter builds |
| **Frontend** | Templates list wired to API; form sheet + hub count use template hook |

## 2026-06-23 — Product create full DB wiring

| Change | Detail |
|--------|--------|
| **Backend** | `GET /catalog/products/slug/check`, `GET/PUT /catalog/products/{id}/inventory`; stock list filters by `product_id` |
| **Frontend** | Product form saves all DB tables: products, variants, media, specs, inventory_stock_levels; API slug check; media upload to `/media/upload` |
| **UI** | Removed mock tax/AI tabs; warehouse dropdown from `inventory_warehouses`; cost → `unit_cost` |

## 2026-06-23 — Storefront light theme fix (Docker + FOUC)

| Change | Detail |
|--------|--------|
| **Docker** | `docker-compose.run.yml` builds baked `moharaznx-web` image (no volume mounts); web container restarted on port 3002 |
| **Theme** | Storefront init script forces white `backgroundColor` on html/body before paint; dark tokens scoped to `html.admin-site.dark` only |
| **UI** | Promo top bar + PC builder CTA switched from navy to light/orange brand styling |
