# MoharazNX — Ecommerce Admin UI

> **Phase 1** · Admin first · Frontend only · Mock data · No backend

**Specs:** [AgainERP ECOMMERCE_ADMIN_PROTOTYPE_PHASE1](../../againerp/docs/04-uiux/strategy/ECOMMERCE_ADMIN_PROTOTYPE_PHASE1.md)

## Run

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to `/dashboard`.

## Stack

Next.js · TypeScript · Tailwind · Shadcn UI · AG Grid · Recharts · CMDK · Sonner

## Phase 1 Admin Priority

| Route | Screen |
|-------|--------|
| `/dashboard` | Dashboard |
| `/catalog/products` | Product List |
| `/catalog/categories` | Categories |
| `/catalog/brands` | Brands |
| `/orders` | Orders |
| `/customers` | Customers |
| `/media` | Media Library |

## Mock data

`src/lib/mock-data/` — products, dashboard charts, orders, customers.
