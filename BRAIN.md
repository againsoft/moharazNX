# MoharazNX — AI Brain (Entry)

> **Cursor:** Read this file first. Always follow [AgainERP](../againerp/docs/BRAIN.md) for deep ecommerce specs.

## Project

| Field | Value |
|-------|-------|
| **Product** | MoharazNX — Ecommerce-only (AgainERP `ecommerce` module) |
| **Phase** | 1 — Admin UI prototype · mock data · no backend |
| **Language** | English only |
| **Code** | `apps/web/` |

## Reading Hierarchy

| Level | File |
|-------|------|
| **1** | `BRAIN.md` (this file) |
| **2** | [docs/PROJECT_MAP.md](./docs/PROJECT_MAP.md) |
| **3** | [AgainERP ecommerce README](../againerp/docs/03-business-modules/ecommerce/README.md) |
| **4** | AgainERP `Architecture.md` / `UI.md` (one file for your task) |
| **5** | AgainERP `Menus/{Screen}.md` (one screen only) |

**Planning SSOT:** [PROJECT_BRIEF.md](./PROJECT_BRIEF.md)

## Rules

1. **Slim docs here** — link to AgainERP for full specs; do not duplicate 560+ docs.
2. **Same stack** as AgainERP [TECHNOLOGY_CONSTITUTION](../againerp/docs/00-foundation/TECHNOLOGY_CONSTITUTION.md).
3. **Phase 1:** UI only — no API, DB, auth, live LLM.
4. **Priority:** Admin first → storefront later.
5. **Before code:** check AgainERP [PRE_CODE_GATE](../againerp/docs/00-foundation/PRE_CODE_GATE.md).

## Run

```bash
cd apps/web
npm install
npm run dev
```

Open http://localhost:3000 → `/dashboard`
