# MoharazNX — Project Map

> **Status:** Active  
> **Parent:** [AgainERP PROJECT_MAP](../againerp/docs/PROJECT_MAP.md)

## Purpose

Slim navigation for MoharazNX. **Deep specs live in AgainERP** — always follow that repo for architecture, screens, and APIs.

## When To Read

After [BRAIN.md](../BRAIN.md) when you need to locate a document.

---

## MoharazNX Docs (local)

| Document | Role |
|----------|------|
| [PROJECT_BRIEF.md](../PROJECT_BRIEF.md) | Scope, phases, decisions |
| [BRAIN.md](../BRAIN.md) | Entry point |
| [PROJECT_MAP.md](./PROJECT_MAP.md) | This file |
| [CHANGELOG.md](./CHANGELOG.md) | MoharazNX-specific changes |

## Code

| Path | Role |
|------|------|
| `apps/web/` | Next.js UI (copied from AgainERP, rebranded) |
| `apps/web/src/app/(admin)/` | Admin panel — **Phase 1 priority** |
| `apps/web/src/app/(storefront)/` | Customer shop — Phase 3 |
| `apps/web/src/lib/mock-data/` | Mock fixtures |
| `apps/web/src/lib/url-slug/` | Moharaz-style flat URLs |

## AgainERP References (always follow)

| Task | AgainERP path |
|------|---------------|
| Ecommerce module | [docs/03-business-modules/ecommerce/README.md](../againerp/docs/03-business-modules/ecommerce/README.md) |
| Admin Phase 1 | [docs/04-uiux/strategy/ECOMMERCE_ADMIN_PROTOTYPE_PHASE1.md](../againerp/docs/04-uiux/strategy/ECOMMERCE_ADMIN_PROTOTYPE_PHASE1.md) |
| Menu tree (167 screens) | [docs/03-business-modules/ecommerce/MENU_STRUCTURE.md](../againerp/docs/03-business-modules/ecommerce/MENU_STRUCTURE.md) |
| Storefront (later) | [docs/03-business-modules/ecommerce/ECOMMERCE_STOREFRONT_ARCHITECTURE.md](../againerp/docs/03-business-modules/ecommerce/ECOMMERCE_STOREFRONT_ARCHITECTURE.md) |
| Moharaz URLs | [docs/03-business-modules/ecommerce/URL_SLUG_ARCHITECTURE.md](../againerp/docs/03-business-modules/ecommerce/URL_SLUG_ARCHITECTURE.md) |
| UI standards | [docs/04-uiux/standards/](../againerp/docs/04-uiux/standards/) |
| Tech stack | [docs/00-foundation/TECHNOLOGY_CONSTITUTION.md](../againerp/docs/00-foundation/TECHNOLOGY_CONSTITUTION.md) |
| Working reference code | [../againerp/apps/web/](../againerp/apps/web/) |

## Phase 1 Admin Routes (priority)

| Route | Screen |
|-------|--------|
| `/dashboard` | Dashboard |
| `/catalog/products` | Product List |
| `/catalog/products/new` | Add Product |
| `/catalog/categories` | Categories |
| `/catalog/brands` | Brands |
| `/orders` | Orders |
| `/customers` | Customers |
| `/media` | Media Library |

Full menu: AgainERP [MENU_STRUCTURE](../againerp/docs/03-business-modules/ecommerce/MENU_STRUCTURE.md).
