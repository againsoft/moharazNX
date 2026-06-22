# MoharazNX

Ecommerce platform built on **AgainERP** architecture — admin + storefront, documentation-first.

| Path | Description |
|------|-------------|
| [PROJECT_BRIEF.md](./PROJECT_BRIEF.md) | Planning & scope |
| [BRAIN.md](./BRAIN.md) | AI + developer entry |
| [docs/PROJECT_MAP.md](./docs/PROJECT_MAP.md) | Doc navigation |
| `apps/web/` | Next.js admin + storefront UI |
| `apps/api/` | FastAPI backend + PostgreSQL (Phase 2) |
| [AgainERP](../againerp/) | Parent ecosystem — full ecommerce specs |

## Local development

```bash
cd apps/web
npm install
npm run dev
```

Open http://localhost:3000 → admin dashboard.

### API (FastAPI + PostgreSQL)

Per AgainERP [ADR-001](../againerp/docs/01-architecture/decisions/ADR-001-postgresql.md):

```bash
# Start PostgreSQL (Docker)
docker compose up -d

cd apps/api
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
PYTHONPATH=. python scripts/init_db.py
PYTHONPATH=. python scripts/test_connection.py
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

- Health: http://127.0.0.1:8000/health  
- Products: http://127.0.0.1:8000/api/v1/catalog/products  
- Swagger: http://127.0.0.1:8000/docs  

See [apps/api/README.md](./apps/api/README.md).

## Stack

Next.js · TypeScript · Tailwind · Shadcn UI · AG Grid · Recharts · CMDK · Sonner  
**Backend:** FastAPI · SQLAlchemy · **PostgreSQL** (Docker local)

Same as [AgainERP Technology Constitution](../againerp/docs/00-foundation/TECHNOLOGY_CONSTITUTION.md).

## Deploy (Vercel)

Set **Root Directory** to `apps/web`.
