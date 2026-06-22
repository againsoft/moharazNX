# MoharazNX — Project Brief

> **Status:** Draft — Planning  
> **Version:** 1.0  
> **Date:** 2026-06-22  
> **Parent ecosystem:** [AgainERP](../againerp/)  
> **Reference site:** [Moharaz.com](https://www.moharaz.com)

---

## ১. আপনি কী চান (Summary)

**MoharazNX** হল AgainERP প্ল্যাটফর্মের **Ecommerce module**-এর standalone implementation — পুরো ERP নয়, শুধু ecommerce অংশ।

| চান | চান না |
|-----|--------|
| AgainERP-এর **structure, docs pattern, tech stack** follow করা | CRM, Accounting, HR, POS, Hospital ইত্যাদি ERP module |
| **Admin panel** — catalog, orders, customers, marketing, SEO, media, reports | Full multi-module SaaS control plane (প্রথম phase-এ) |
| **Customer storefront** — Moharaz-style flat URL (`/{slug}`) | AgainERP repo-তে code duplicate করা |
| Documentation-first approach — code লেখার আগে spec ready | Backend/API/database (প্রথম phase — UI prototype) |
| AgainERP `docs/03-business-modules/ecommerce/` থেকে guidance | AgainERP-এর সব 560+ doc copy করা |

**লক্ষ্য:** Moharaz.com-এর মতো modern e-commerce experience — AgainERP architecture অনুযায়ী, কিন্তু এই repo (`moharaznx`) শুধু ecommerce-এ focus করবে।

---

## ২. Project Identity

| Field | Value |
|-------|-------|
| **Project name** | MoharazNX |
| **Folder** | `/Applications/XAMPP/xamppfiles/htdocs/moharaznx` |
| **Type** | Ecommerce-only · Admin + Storefront |
| **Relation to AgainERP** | AgainERP-এর `ecommerce` module-এর **extracted product line** — same standards, smaller scope |
| **Phase 1** | UI/UX Prototype (mock data) — AgainERP [UI_PROTOTYPE_MODE](../againerp/docs/04-uiux/strategy/UI_PROTOTYPE_MODE.md) অনুযায়ী |
| **Phase 2+** | FastAPI backend + PostgreSQL + real APIs (AgainERP [TECHNOLOGY_CONSTITUTION](../againerp/docs/00-foundation/TECHNOLOGY_CONSTITUTION.md) অনুযায়ী) |

---

## ৩. Scope — Ecommerce Only

### ৩.১ In Scope (AgainERP Ecommerce module থেকে)

AgainERP [Ecommerce README](../againerp/docs/03-business-modules/ecommerce/README.md) এবং [MENU_STRUCTURE](../againerp/docs/03-business-modules/ecommerce/MENU_STRUCTURE.md) অনুযায়ী:

```
Ecommerce
├── Dashboard
├── Catalog        → Products, Categories, Brands, Attributes, Variants, Filters, Reviews, Collections, Bundles
├── Inventory      → Stock, Warehouses, Adjustments (ecommerce views)
├── Sales / Orders → Orders, Returns, Refunds, Abandoned Carts
├── Customers      → Customers, Groups, Wallet, Wishlists, Addresses
├── Marketing      → Coupons, Promotions, Flash Sales, Campaigns
├── Content        → Pages, Blog, FAQs
├── Builder        → Theme, Header/Footer, Homepage, Product/Category page builder
├── SEO            → Meta, Sitemap, Redirects, Schema
├── Media          → Media library
├── Reports        → Sales, Product, Customer reports
└── Storefront     → Customer-facing shop (Moharaz-style URLs)
```

**167 admin screens** — AgainERP doc-এ define করা; MoharazNX-এ priority অনুযায়ী phase-wise implement হবে, সব একসাথে নয়।

### ৩.২ Out of Scope (এই project-এ নেই)

- ERP modules: Finance, CRM (full), HR, Manufacturing, Hospital, School
- AgainERP Core platform admin (tenant billing, license sync, multi-tenant control plane)
- Marketplace multi-vendor (future — AgainERP `marketplace` module)
- Live AI/LLM integration (Phase 1-এ mock AI drawer only)

### ৩.৩ Moharaz-Specific Requirements

AgainERP [URL_SLUG_ARCHITECTURE](../againerp/docs/03-business-modules/ecommerce/URL_SLUG_ARCHITECTURE.md) — **Moharaz-style flat URLs**:

| Entity | URL pattern | Example |
|--------|-------------|---------|
| Category | `/{slug}` | `/accessories` |
| Product | `/{slug}` | `/amazon-fire-7-kids-tablet` |
| Brand | `/{slug}` | `/amazon` |
| CMS page | `/{slug}` | `/warranty-policy` |
| Blog post | `/blog/{slug}` | `/blog/intel-core-ultra-7-265kf-processor` |

**Rules:** Global slug registry · no nested category paths · reserved slugs for cart/checkout/account.

---

## ৪. AgainERP থেকে কী Follow করব

### ৪.১ Documentation Pattern

AgainERP [MODULE_STRUCTURE](../againerp/docs/00-foundation/MODULE_STRUCTURE.md) অনুযায়ী প্রতিটি module area-তে:

```
docs/
├── BRAIN.md                    # AI + developer entry (AgainERP style)
├── PROJECT_MAP.md              # Doc navigation
├── 00-foundation/
│   ├── README.md
│   ├── TECHNOLOGY_CONSTITUTION.md   # Same stack — link or slim copy
│   ├── DEVELOPMENT_STANDARDS.md
│   └── PRE_CODE_GATE.md
├── 03-business-modules/
│   └── ecommerce/              # Primary module — link to AgainERP or own slim docs
│       ├── README.md
│       ├── Architecture.md
│       ├── Database.md
│       ├── API.md
│       ├── UI.md
│       └── Menus/              # Screen specs (priority screens first)
└── 04-uiux/
    ├── strategy/
    │   └── UI_PROTOTYPE_MODE.md
    └── prototype/              # As-built notes per screen
```

**Rule:** AgainERP-এ যা already **Ready/Approved** — সেখান থেকে **reference** করব, blind copy নয়। MoharazNX-specific deviation এই file + `CHANGELOG.md`-তে log করব।

### ৪.২ Code Structure (AgainERP `apps/` pattern)

```
moharaznx/
├── PROJECT_BRIEF.md            # ← এই file (planning SSOT)
├── README.md
├── BRAIN.md                    # Cursor entry — slim
├── docs/                       # Project docs (§4.1)
└── apps/
    └── web/                    # Next.js — admin + storefront
        ├── src/
        │   ├── app/
        │   │   ├── (admin)/    # Admin panel routes
        │   │   └── (storefront)/  # Customer shop — Moharaz flat URLs
        │   ├── components/
        │   ├── lib/
        │   │   ├── mock-data/
        │   │   └── url-slug/   # Slug resolver (AgainERP pattern)
        │   └── ...
        └── package.json
```

**Future (Phase 2):**

```
apps/
├── web/          # Next.js frontend
└── api/          # FastAPI backend — /api/v1/commerce/, /api/v1/storefront/
```

### ৪.৩ Technology Stack (Mandatory — AgainERP Constitution)

AgainERP [TECHNOLOGY_CONSTITUTION](../againerp/docs/00-foundation/TECHNOLOGY_CONSTITUTION.md) — **no deviation without ADR**.

| Layer | Stack |
|-------|-------|
| Frontend | Next.js (App Router) · TypeScript · Tailwind · Shadcn UI |
| Data grids | AG Grid |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| State | Zustand |
| Icons | Lucide |
| Command palette | CMDK |
| Toasts | Sonner |
| Backend (Phase 2) | FastAPI · Python 3.11+ · PostgreSQL · Redis |
| Architecture | DDD · Service layer · API-first · Event-driven |

### ৪.৪ UI Standards

AgainERP references:

- [page-architecture.md](../againerp/docs/04-uiux/standards/page-architecture.md) — breadcrumb: `MoharazNX › Ecommerce › Catalog › Products`
- [module-ui-standard.md](../againerp/docs/04-uiux/standards/module-ui-standard.md)
- [ECOMMERCE_ADMIN_PROTOTYPE_PHASE1.md](../againerp/docs/04-uiux/strategy/ECOMMERCE_ADMIN_PROTOTYPE_PHASE1.md) — Phase 1 deliverables
- [ECOMMERCE_STOREFRONT_ARCHITECTURE.md](../againerp/docs/03-business-modules/ecommerce/ECOMMERCE_STOREFRONT_ARCHITECTURE.md) — storefront rules

### ৪.৫ AgainERP Code Reference (copy patterns, not whole repo)

Existing implementation in AgainERP `apps/web/` — use as **reference**:

| Area | AgainERP path |
|------|---------------|
| Admin shell + sidebar | `apps/web/src/lib/workspace/navigation-config.ts` |
| Catalog pages | `apps/web/src/app/(admin)/catalog/` |
| Storefront | `apps/web/src/app/(storefront)/` |
| Mock data | `apps/web/src/lib/mock-data/` |
| URL slug helpers | `apps/web/src/lib/url-slug/` |
| UI components | `apps/web/src/components/` |

---

## ৫. Development Phases

### Phase 0 — Planning ✅

- [x] Project brief define
- [x] Stakeholder review + priority confirm
- [x] Scaffold repo structure (`apps/web` copied from AgainERP)

### Phase 1 — UI Prototype (AgainERP ECOMMERCE_ADMIN_PROTOTYPE_PHASE1)

**Allowed:** Next.js UI · mock JSON · navigable all menus · no backend  
**Forbidden:** Real API · DB · Auth · Live LLM

| Priority | Deliverable | Route | AgainERP spec |
|----------|-------------|-------|---------------|
| P0 | Repo scaffold + admin shell | `/(admin)/*` | PROTOTYPE_SHELL |
| P0 | Sidebar (full ecommerce menu) | — | MENU_STRUCTURE |
| P0 | Dashboard | `/dashboard` | Dashboard menus |
| P1 | Product List (AG Grid) | `/catalog/products` | ProductList.md |
| P1 | Product Create/Edit | `/catalog/products/new` | AddProduct.md |
| P1 | Categories, Brands | `/catalog/categories`, `/catalog/brands` | Catalog menus |
| P2 | Orders list + detail | `/orders` | Orders ARCHITECTURE |
| P2 | Customers | `/customers` | Customers menus |
| P2 | Media library | `/media` | MediaLibrary.md |
| P3 | Storefront home + PDP | `/(storefront)/` | STOREFRONT_ARCHITECTURE |
| P3 | Moharaz flat URL resolver | `/{slug}` | URL_SLUG_ARCHITECTURE |
| P3 | Cart + Checkout (UI) | `/cart`, `/checkout` | Storefront §6–8 |
| P4 | Marketing, SEO, Reports, Builder | stubs → full | Remaining menus |

### Phase 2 — Backend Foundation

- FastAPI modular monolith under `apps/api/`
- PostgreSQL schema per [ecommerce/Database.md](../againerp/docs/03-business-modules/ecommerce/Database.md)
- REST: `/api/v1/commerce/*` (admin), `/api/v1/storefront/*` (public)
- Auth (JWT/session) · RBAC per [Permissions.md](../againerp/docs/03-business-modules/ecommerce/Permissions.md)

### Phase 3 — Production MoharazNX

- Payment gateway (BD: bKash, Nagad, SSLCommerz — per business need)
- Real inventory sync · order fulfillment
- SEO + performance (ISR, CDN)
- Deploy: Vercel (`apps/web`) + API host

---

## ৬. API & Data Boundaries

AgainERP principles — MoharazNX-এও apply:

| Rule | Detail |
|------|--------|
| Storefront ≠ Admin | Separate route groups, layouts, auth scope |
| API-only storefront | Storefront never hits DB directly |
| Single entity owner | One module owns each table |
| Mock first | Phase 1: `src/lib/mock-data/*.ts` |

**API prefix (Phase 2):**

```
/api/v1/commerce/     → Admin operations (catalog, orders, customers)
/api/v1/storefront/   → Public shop (products, cart, checkout)
```

---

## ৭. Reading Hierarchy (AI + Developers)

AgainERP [BRAIN.md](../againerp/BRAIN.md) pattern — MoharazNX:

```text
Level 1  moharaznx/BRAIN.md  (or PROJECT_BRIEF.md §7)
Level 2  docs/PROJECT_MAP.md
Level 3  docs/03-business-modules/ecommerce/README.md
Level 4  Architecture.md
Level 5  Database.md · API.md · UI.md · one Menus/{Screen}.md
```

**Cross-project:** Deep ecommerce spec → AgainERP `docs/03-business-modules/ecommerce/` (560+ docs ecosystem)

---

## ৮. Success Criteria

### Phase 1 Done When

- [ ] `cd apps/web && npm run dev` works at `http://localhost:3000`
- [ ] Admin: full ecommerce sidebar navigable (stubs OK for low priority)
- [ ] Catalog: Product List matches AgainERP AG Grid spec
- [ ] Storefront: Moharaz-style `/{slug}` resolves product/category/brand/page
- [ ] Blog at `/blog/{slug}`
- [ ] Mock data realistic (Bangladesh e-commerce context — BDT, local brands)
- [ ] Each P0/P1 screen has doc in `docs/04-uiux/prototype/` (tri-file optional)

### Long-term Done When

- Moharaz.com-level customer experience on AgainERP architecture
- Admin can run full catalog → order → fulfillment loop
- Ready to plug into AgainERP SaaS as `ecommerce` tenant module (optional future)

---

## ৯. Decisions (Confirmed — 2026-06-22)

| # | Question | Decision |
|---|----------|----------|
| 1 | **Brand name in UI** | **MoharazNX** |
| 2 | **Phase 1 focus** | **Admin first** (storefront Phase 3) |
| 3 | **Docs strategy** | **Slim docs** in moharaznx — always follow AgainERP for specs |
| 4 | **Scaffold source** | **Copy AgainERP `apps/web`** and rebrand |
| 5 | **Language** | **English only** |
| 6 | **Payment (Phase 3)** | **Later** (bKash, Nagad, SSLCommerz TBD) |

---

## ১০. Project Start Checklist

আপনি approve করলে পরের step:

```bash
# 1. Repo scaffold
cd /Applications/XAMPP/xamppfiles/htdocs/moharaznx

# 2. Create structure (docs + apps/web)
# 3. Init Next.js in apps/web (AgainERP same versions)
# 4. Copy/adapt: navigation-config, admin shell, url-slug from againerp/apps/web
# 5. BRAIN.md + README.md + docs/PROJECT_MAP.md
# 6. First screen: Dashboard + Product List
# 7. npm run dev → verify
```

---

## ১১. Reference Links (AgainERP)

| Document | Path |
|----------|------|
| AgainERP root | [../againerp/README.md](../againerp/README.md) |
| Ecommerce module | [../againerp/docs/03-business-modules/ecommerce/README.md](../againerp/docs/03-business-modules/ecommerce/README.md) |
| Ecommerce menu (167 screens) | [../againerp/docs/03-business-modules/ecommerce/MENU_STRUCTURE.md](../againerp/docs/03-business-modules/ecommerce/MENU_STRUCTURE.md) |
| Admin prototype Phase 1 | [../againerp/docs/04-uiux/strategy/ECOMMERCE_ADMIN_PROTOTYPE_PHASE1.md](../againerp/docs/04-uiux/strategy/ECOMMERCE_ADMIN_PROTOTYPE_PHASE1.md) |
| Storefront architecture | [../againerp/docs/03-business-modules/ecommerce/ECOMMERCE_STOREFRONT_ARCHITECTURE.md](../againerp/docs/03-business-modules/ecommerce/ECOMMERCE_STOREFRONT_ARCHITECTURE.md) |
| Moharaz URL slugs | [../againerp/docs/03-business-modules/ecommerce/URL_SLUG_ARCHITECTURE.md](../againerp/docs/03-business-modules/ecommerce/URL_SLUG_ARCHITECTURE.md) |
| Tech stack | [../againerp/docs/00-foundation/TECHNOLOGY_CONSTITUTION.md](../againerp/docs/00-foundation/TECHNOLOGY_CONSTITUTION.md) |
| UI prototype mode | [../againerp/docs/04-uiux/strategy/UI_PROTOTYPE_MODE.md](../againerp/docs/04-uiux/strategy/UI_PROTOTYPE_MODE.md) |
| Working code reference | [../againerp/apps/web/](../againerp/apps/web/) |

---

**Maintainer:** MoharazNX Team  
**Next step:** §9 Open Decisions confirm → Phase 0 checklist → scaffold `apps/web`
